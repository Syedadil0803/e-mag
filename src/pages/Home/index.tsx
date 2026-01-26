import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Message, PageHeader, Tag } from "@arco-design/web-react";
import { useQuery } from "@demo/hooks/useQuery";
import { useDispatch, useSelector } from "react-redux";
import { cloneDeep, set } from "lodash";
import { Loading } from "@demo/components/loading";
import mjml from "mjml-browser";
import { copy } from "@demo/utils/clipboard";
import services from "@demo/services";
import {
  createEMag,
  getEMagsByContentVersion,
  updateEMag,
  createPage,
  updatePage,
  getPagesByEMag
} from "@demo/services/editor";
import {
  submitForReview,
  approveVersion,
  publishVersion,
  getContentVersions,
  ContentVersion
} from "@demo/services/content";
import { getCurrentUser } from "@demo/services/auth";
import { usePermissions } from "@demo/hooks/usePermissions";
import {
  IconMoonFill,
  IconSunFill,
  IconPlus,
  IconClose,
  IconApps,
} from "@arco-design/web-react/icon";
import { Modal } from "@arco-design/web-react";
import { Liquid } from "liquidjs";
import {
  EmailEditor,
  EmailEditorProvider,
  EmailEditorProviderProps,
  IEmailTemplate,
} from "easy-email-editor";

import { FormApi } from "final-form";

import { Stack } from "@demo/components/Stack";
import { generateFlipBookHtml } from "./components/FlipBookExport";

import { useCollection } from "./components/useCollection";
import { JsonToMjml } from "easy-email-core";
import { ITemplate } from "@demo/services/template";
import { BlockMarketManager, StandardLayout } from "easy-email-extensions";
import { AutoSaveAndRestoreEmail } from "@demo/components/AutoSaveAndRestoreEmail";

import "./components/CustomBlocks";

import "easy-email-editor/lib/style.css";
import "easy-email-extensions/lib/style.css";
import "antd/dist/antd.css";
import appTheme from "@demo/styles/theme.css?inline";

const hidePreviewTabsCSS = `
  .easy-email-editor-tabWrapper .icon-desktop,
  .easy-email-editor-tabWrapper .icon-mobile {
    display: none !important;
  }
  .easy-email-editor-tabWrapper .easy-email-editor-tabItem:has(.icon-desktop),
  .easy-email-editor-tabWrapper .easy-email-editor-tabItem:has(.icon-mobile) {
    display: none !important;
  }
`;

if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = hidePreviewTabsCSS;
  document.head.appendChild(style);
}
import { testMergeTags } from "./testMergeTags";
import { useMergeTagsModal } from "./components/useMergeTagsModal";

import { useWindowSize } from "react-use";
import { FONT_LIST, DEFAULT_CATEGORIES } from "@demo/constants";
import { RootState } from "@demo/store/reducers";
import {
  addPage,
  deletePage,
  setCurrentPageIndex,
  updateCurrentPageContent,
  initializeFromTemplate,
  setPages,
  resetPages,
} from "@demo/store/pages";
const imageCompression = import("browser-image-compression");

export default function Editor() {
  const dispatch = useDispatch();
  const { pages, currentPageIndex } = useSelector(
    (state: RootState) => state.pages
  );

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [templateData, setTemplateData] = useState(
    services.template.fetchDefaultTemplate()
  );
  const [templateOriginalData, setTemplateOriginalData] = useState<ITemplate>();
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { collectionCategory } = useCollection();

  const { width } = useWindowSize();

  const smallScene = width < 1200;

  const { template_id, token, subject, content_id, content_version_id } = useQuery();
  const { mergeTags, setMergeTags } = useMergeTagsModal(testMergeTags);

  // EMag state
  const [currentEMagId, setCurrentEMagId] = useState<string | null>(null);
  const [loadingEMag, setLoadingEMag] = useState(false);
  const [existingPages, setExistingPages] = useState<any[]>([]); // Track pages from backend

  // Workflow state
  const [currentVersion, setCurrentVersion] = useState<ContentVersion | null>(null);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const currentUser = getCurrentUser();
  const { canPerformAction, canAccessPage } = usePermissions();

  // Map backend role to simplified role for workflow logic
  const getUserRole = () => {
    if (!currentUser?.role) return 'author';
    const role = currentUser.role.toLowerCase();
    if (role.includes('admin')) return 'admin';
    if (role.includes('approver') || role.includes('reviewer')) return 'reviewer';
    if (role.includes('editor')) return 'editor';
    return 'author';
  };

  const userRole = getUserRole();

  // Check workflow permissions from RBAC
  // Users with Approve_Content access can approve
  const canApprove = canAccessPage('Approve');
  // Users with Publish_Content access can publish
  const canPublish = canAccessPage('Publish');

  useEffect(() => {
    if (collectionCategory) {
      BlockMarketManager.addCategories([collectionCategory]);
      return () => {
        BlockMarketManager.removeCategories([collectionCategory]);
      };
    }
  }, [collectionCategory]);

  useEffect(() => {
    if (template_id) {
      setLoading(true);
      services.template
        .getTemplate(template_id, token)
        .then((res: any) => {
          if (res.templateName) {
            setLoading(false);
            setTemplateOriginalData({ ...res });
            if (res.helperJson) {
              if (typeof res.helperJson === "string") {
                const obj = JSON.parse(res.helperJson);

                if (obj.pages && Array.isArray(obj.pages)) {
                  dispatch(
                    initializeFromTemplate({
                      content: obj.pages[0].content,
                      pages: obj.pages,
                    })
                  );
                } else {
                  const footer = JSON.parse(res.footerJson);
                  if (footer) {
                    const json = JSON.parse(footer.helperJson);
                    if (json && json.children && json.children.length > 0) {
                      obj.children.push(json.children[0]);
                    }
                  }
                  if (Object.keys(obj).length > 0) {
                    dispatch(initializeFromTemplate({ content: obj }));
                    setTemplateData({
                      ...templateData,
                      content:
                        typeof res.helperJson === "string"
                          ? obj
                          : res.helperJson,
                    });
                  }
                }
              }
            }
          }
        })
        .catch(() => {
          setLoading(false);
        });
    } else {
      // If no template is provided, start with a fresh blank magazine
      dispatch(resetPages());
    }
  }, []);

  // Load or create EMag when content_version_id is present
  useEffect(() => {
    const loadOrCreateEMag = async () => {
      if (!content_version_id) return;

      setLoadingEMag(true);
      try {
        // Try to fetch existing EMags for this content version
        const emags = await getEMagsByContentVersion(content_version_id);

        if (emags && emags.length > 0) {
          // Load existing EMag data
          const latestEMag = emags[0];
          setCurrentEMagId(latestEMag._id!);

          // Fetch existing pages for this EMag
          try {
            const backendPages = await getPagesByEMag(latestEMag._id!);
            setExistingPages(backendPages || []);
          } catch (error) {
            console.error('Error fetching pages:', error);
            setExistingPages([]);
          }

          // Parse and load the htmlData (which contains pages data)
          if (latestEMag.htmlData) {
            try {
              const savedData = JSON.parse(latestEMag.htmlData);

              if (savedData.pages && Array.isArray(savedData.pages)) {
                // Load the saved pages into Redux store
                dispatch(
                  initializeFromTemplate({
                    content: savedData.pages[0].content,
                    pages: savedData.pages,
                  })
                );
                Message.success('Magazine loaded successfully!');
              }
            } catch (parseError) {
              console.error('Error parsing EMag data:', parseError);
              Message.warning('Could not load saved data, starting fresh');
            }
          }
        } else {
          // No EMag exists, create a new one
          const initialData = {
            pages: pages.length > 0 ? pages : [{
              id: '1',
              name: 'Page 1',
              type: 'cover',
              content: templateData.content
            }]
          };

          const result = await createEMag({
            content_version_id: content_version_id,
            htmlData: JSON.stringify(initialData)
          });

          if (result.success) {
            setCurrentEMagId(result.data._id!);
            Message.success('New magazine created!');
          } else {
            Message.error('Failed to create magazine');
          }
        }
      } catch (error) {
        console.error('Error loading/creating EMag:', error);
        Message.error('Failed to load magazine data');
      } finally {
        setLoadingEMag(false);
      }
    };

    loadOrCreateEMag();
  }, [content_version_id]);

  // Load content version state for workflow
  useEffect(() => {
    const loadVersionState = async () => {
      console.log('📦 Loading version state...', { content_version_id, content_id });

      if (!content_version_id || !content_id) {
        console.log('⚠️ Missing IDs:', { content_version_id, content_id });
        return;
      }

      try {
        const versions = await getContentVersions(content_id);
        console.log('📋 Loaded versions:', versions);

        const version = versions.find(v => v._id === content_version_id);
        console.log('🎯 Found matching version:', version);

        if (version) {
          setCurrentVersion(version);
          console.log('✅ Set currentVersion:', version);

          // Determine if editor should be read-only
          // Authors can't edit when under_review, approved, or published
          // Reviewers and Admins can always edit
          const canEdit =
            userRole === 'admin' ||
            userRole === 'reviewer' ||
            (userRole === 'author' && version.state === 'draft');

          console.log('🔒 Edit permissions:', { userRole, state: version.state, canEdit });
          setIsReadOnly(!canEdit);
        } else {
          console.log('❌ No matching version found');
        }
      } catch (error) {
        console.error('❌ Error loading version state:', error);
      }
    };

    loadVersionState();
  }, [content_version_id, content_id, userRole]);

  // Workflow action handlers
  const handleSubmitForReview = async () => {
    if (!content_version_id) return;

    Modal.confirm({
      title: 'Submit for Review',
      content: 'Are you sure you want to submit this magazine for review? You won\'t be able to edit it until it\'s returned.',
      onOk: async () => {
        const result = await submitForReview(content_version_id);
        if (result.success) {
          Message.success(result.message);
          setCurrentVersion(result.data);
          setIsReadOnly(true);
        } else {
          Message.error(result.message);
        }
      }
    });
  };

  const handleApprove = async () => {
    if (!content_version_id || !currentUser?.id) return;

    Modal.confirm({
      title: 'Approve Content',
      content: 'Are you sure you want to approve this magazine?',
      onOk: async () => {
        const result = await approveVersion(content_version_id, currentUser.id);
        if (result.success) {
          Message.success(result.message);
          setCurrentVersion(result.data);
        } else {
          Message.error(result.message);
        }
      }
    });
  };

  const handlePublish = async () => {
    if (!content_version_id || !content_id) return;

    Modal.confirm({
      title: 'Publish Magazine',
      content: 'Are you sure you want to publish this magazine? It will be set as the live version.',
      onOk: async () => {
        const result = await publishVersion(content_version_id, content_id);
        if (result.success) {
          Message.success(result.message);
          setCurrentVersion(result.data);
          setIsReadOnly(true);
        } else {
          Message.error(result.message);
        }
      }
    });
  };

  // Get available workflow actions based on state and role
  const getWorkflowActions = (): Array<{
    label: string;
    onClick: () => Promise<void>;
    type: 'primary';
    status: 'warning' | 'success';
  }> => {
    console.log('🔍 Workflow Debug:', {
      currentVersion,
      userRole,
      currentUser,
      hasVersion: !!currentVersion,
      state: currentVersion?.state
    });

    if (!currentVersion) {
      console.log('⚠️ No currentVersion - returning empty actions');
      return [];
    }

    const actions: Array<{
      label: string;
      onClick: () => Promise<void>;
      type: 'primary';
      status: 'warning' | 'success';
    }> = [];
    const state = currentVersion.state;

    // Author actions - allow anyone with content in draft to submit
    if (state === 'draft') {
      console.log('✅ Adding Submit for Review button');
      actions.push({
        label: 'Submit for Review',
        onClick: handleSubmitForReview,
        type: 'primary' as const,
        status: 'warning' as const
      });
    }

    return actions;
  };

  const workflowActions = getWorkflowActions();

  // Get state badge color and text
  const getStateBadge = () => {
    if (!currentVersion) return null;

    const stateConfig: Record<string, { color: string; text: string }> = {
      draft: { color: '#86909c', text: 'Draft' },
      under_review: { color: '#ff7d00', text: 'Under Review' },
      approved: { color: '#00b42a', text: 'Approved' },
      published: { color: '#165dff', text: 'Published' },
      archived: { color: '#4e5969', text: 'Archived' }
    };

    const config = stateConfig[currentVersion.state] || stateConfig.draft;
    return (
      <Tag color={config.color} style={{ marginRight: 8, fontWeight: 600 }}>
        {config.text}
      </Tag>
    );
  };

  // Show read-only warning if applicable
  useEffect(() => {
    if (isReadOnly && currentVersion) {
      const stateMessages: Record<string, string> = {
        under_review: 'This magazine is currently under review. You cannot make changes.',
        approved: 'This magazine has been approved. Only admins can make changes.',
        published: 'This magazine is published. Only admins can make changes.',
        archived: 'This magazine is archived and cannot be edited.'
      };

      const message = stateMessages[currentVersion.state];
      if (message && userRole === 'author') {
        Message.info({
          content: message,
          duration: 5000
        });
      }
    }
  }, [isReadOnly, currentVersion, userRole]);


  useEffect(() => {
    if (isDarkMode) {
      document.body.setAttribute("arco-theme", "dark");
    } else {
      document.body.removeAttribute("arco-theme");
    }
  }, [isDarkMode]);

  const onUploadImage = async (blob: Blob) => {
    const compressionFile = await (
      await imageCompression
    ).default(blob as File, {
      maxWidthOrHeight: 1440,
    });
    return services.common.uploadByQiniu(compressionFile);
  };

  const onChangeMergeTag = useCallback((path: string, val: any) => {
    setMergeTags((old) => {
      const newObj = cloneDeep(old);
      set(newObj, path, val);
      return newObj;
    });
  }, []);

  const getFlipBookHtml = (values: IEmailTemplate) => {
    return generateFlipBookHtml({
      pages,
      currentPageIndex,
      currentValues: values,
      templateSubject: templateOriginalData?.subject,
      mergeTags
    });
  };


  const onPreviewHtml = (values: IEmailTemplate) => {
    const html = getFlipBookHtml(values);
    const win = window.open("", "_blank");
    if (win) {
      win.document.write(html);
      win.document.close();
    }
  };

  const onExportHtml = (values: IEmailTemplate) => {
    const html = getFlipBookHtml(values);
    copy(html);
    Message.success("Copied to clipboard!");
  };

  const initialValues: IEmailTemplate | null = useMemo(() => {
    const currentPage = pages[currentPageIndex];
    if (!currentPage) return null;

    return {
      subject:
        subject ||
        templateOriginalData?.subject ||
        templateData.subject ||
        "Welcome to E-Magazine",
      subTitle:
        templateOriginalData?.text ||
        templateData.subTitle ||
        "Nice to meet you!",
      content: currentPage.content,
    };
  }, [pages, currentPageIndex, templateOriginalData, templateData, subject]);

  const onSubmit = useCallback(
    async (
      values: IEmailTemplate,
      form: FormApi<IEmailTemplate, Partial<IEmailTemplate>>
    ) => {
      const allPages = [...pages];
      allPages[currentPageIndex] = {
        ...allPages[currentPageIndex],
        content: values.content,
      };

      setIsSubmitting(true);

      try {
        // Save to EMag backend if we have content_version_id
        if (content_version_id && currentEMagId) {
          const multiPageData = {
            pages: allPages,
          };

          // 1. Update EMag with all pages data
          const result = await updateEMag(currentEMagId, {
            htmlData: JSON.stringify(multiPageData)
          });

          if (result.success) {
            // 2. Save/Update individual pages for commenting feature
            const pagePromises = allPages.map(async (page, index) => {
              // Check if this page already exists in backend
              const existingPage = existingPages.find(
                (p) => p.page_number === index + 1
              );

              const pageData = {
                eMag_id: currentEMagId,
                page_number: index + 1,
                page_type: page.type || 'content',
                page_data: JSON.stringify(page.content) // Save page content as JSON
              };

              if (existingPage) {
                // Update existing page
                return updatePage(existingPage._id, pageData);
              } else {
                // Create new page
                return createPage(pageData);
              }
            });

            // Wait for all pages to be saved
            await Promise.all(pagePromises);

            // Refresh existing pages list
            const updatedPages = await getPagesByEMag(currentEMagId);
            setExistingPages(updatedPages || []);

            dispatch(updateCurrentPageContent(values.content));
            form.restart(values);
            Message.success("Magazine saved successfully!");
          } else {
            Message.error(result.message || "Failed to save magazine");
          }
        } else {
          // Fallback to old template service if no content_version_id
          const html = mjml(
            JsonToMjml({
              data: values.content,
              mode: "production",
              context: values.content,
              dataSource: mergeTags,
            }),
            {
              beautify: true,
              validationLevel: "soft",
            }
          ).html;

          const multiPageData = {
            pages: allPages,
          };

          services.template
            .updateArticle(
              template_id,
              templateOriginalData?.subject,
              html,
              templateOriginalData?.text,
              templateOriginalData?.id,
              multiPageData
            )
            .then((res: any) => {
              if (res && res.status && res.status === "200") {
                dispatch(updateCurrentPageContent(values.content));
                form.restart(values);
                Message.success("Magazine saved successfully!");
              }
            })
            .catch(() => {
              Message.error("Failed to save magazine");
            });
        }
      } catch (error) {
        console.error("Error saving magazine:", error);
        Message.error("Failed to save magazine");
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      pages,
      currentPageIndex,
      content_version_id,
      currentEMagId,
      template_id,
      templateOriginalData,
      mergeTags,
      dispatch,
    ]
  );

  const onBeforePreview: EmailEditorProviderProps["onBeforePreview"] =
    useCallback((html: string, mergeTags) => {
      const engine = new Liquid();
      const tpl = engine.parse(html);
      return engine.renderSync(tpl, mergeTags);
    }, []);

  const handlePageSelect = useCallback(
    (index: number, currentValues?: IEmailTemplate) => {
      if (index === currentPageIndex) return;

      if (currentValues) {
        const updatedPages = [...pages];
        updatedPages[currentPageIndex] = {
          ...updatedPages[currentPageIndex],
          content: currentValues.content,
        };
        dispatch(setPages(updatedPages));
      }

      dispatch(setCurrentPageIndex(index));
    },
    [currentPageIndex, pages, dispatch]
  );

  const handleAddPage = useCallback(
    (currentValues?: IEmailTemplate) => {
      if (currentValues) {
        const updatedPages = [...pages];
        updatedPages[currentPageIndex] = {
          ...updatedPages[currentPageIndex],
          content: currentValues.content,
        };
        dispatch(setPages(updatedPages));
      }

      dispatch(addPage());
      Message.success("New page added!");
    },
    [currentPageIndex, pages, dispatch]
  );

  const handleDeletePage = useCallback(
    (index: number) => {
      dispatch(deletePage(index));
    },
    [dispatch]
  );

  if (loading || loadingEMag) {
    return (
      <Loading loading={loading || loadingEMag}>
        <div style={{ height: "100vh" }} />
      </Loading>
    );
  }

  if (!initialValues) return null;

  return (
    <div>
      <style>{appTheme}</style>
      <EmailEditorProvider
        key={`${template_id} -${currentPageIndex} `}
        height={"calc(100vh - 116px)"}
        data={initialValues}
        onUploadImage={onUploadImage}
        fontList={FONT_LIST}
        onSubmit={onSubmit}
        onChangeMergeTag={onChangeMergeTag}
        autoComplete
        enabledLogic
        dashed={false}
        mergeTagGenerate={(tag) => `{ {${tag} } } `}
        onBeforePreview={onBeforePreview}
        socialIcons={[]}
      >
        {({ values }, { submit }) => {
          return (
            <>
              <PageHeader
                style={{ background: "var(--color-bg-2)" }}
                title={
                  <div
                    className="page-navigator"
                    style={{ maxWidth: "70vw", overflow: "hidden" }}
                  >
                    <div className="page-navigator-left-info">
                      <IconApps
                        style={{ fontSize: 16, color: "var(--color-text-3)" }}
                      />
                      <div className="info-text-wrapper">
                        <span className="info-label">Page</span>
                        <span className="info-value">
                          {currentPageIndex + 1}{" "}
                          <span className="divider">/</span> {pages.length}
                        </span>
                      </div>
                      <button
                        className="add-page-btn-left"
                        onClick={() => handleAddPage(values)}
                        aria-label="Add new page"
                      >
                        <IconPlus style={{ fontSize: 12 }} />
                        <span>Add Page</span>
                      </button>
                    </div>
                    <div
                      className="page-navigator-scroll"
                      style={{ overflowX: "auto" }}
                    >
                      {pages
                        .filter((p) => p.type !== "back_cover")
                        .map((page, index) => (
                          <div
                            key={page.id}
                            className={`page-tab ${index === currentPageIndex ? "active" : ""
                              } ${page.type !== "content" ? "special-page" : ""}`}
                            onClick={() => handlePageSelect(index, values)}
                          >
                            <span className="page-tab-name">
                              {page.type === "cover" ? `Cover (1)` : index + 1}
                            </span>
                            {page.type === "content" && (
                              <button
                                className="page-tab-delete"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (pages.length <= 1) {
                                    Message.warning(
                                      "Cannot delete the last page"
                                    );
                                    return;
                                  }
                                  Modal.confirm({
                                    title: "Delete Page",
                                    content: `Are you sure you want to delete ${pages[index].name}?`,
                                    okText: "Delete",
                                    cancelText: "Cancel",
                                    onOk: () => {
                                      handleDeletePage(index);
                                      Message.success(
                                        "Page deleted successfully"
                                      );
                                    },
                                  });
                                }}
                                aria-label="Delete page"
                              >
                                <IconClose />
                              </button>
                            )}
                          </div>
                        ))}
                      {pages.find((p) => p.type === "back_cover") && (
                        <div
                          key={pages.find((p) => p.type === "back_cover")?.id}
                          className={`page-tab special-page ${pages.findIndex((p) => p.type === "back_cover") ===
                            currentPageIndex
                            ? "active"
                            : ""
                            }`}
                          onClick={() =>
                            handlePageSelect(
                              pages.findIndex((p) => p.type === "back_cover"),
                              values
                            )
                          }
                        >
                          <span className="page-tab-name">
                            Closing (
                            {pages.findIndex((p) => p.type === "back_cover") +
                              1}
                            )
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                }
                extra={
                  <Stack alignment="center">
                    {getStateBadge()}

                    <Button
                      onClick={() => setIsDarkMode((v) => !v)}
                      shape="circle"
                      type="text"
                      icon={isDarkMode ? <IconMoonFill /> : <IconSunFill />}
                    ></Button>

                    <Button onClick={() => onPreviewHtml(values)}>View</Button>

                    {/* Workflow action buttons */}
                    {workflowActions.map((action, index) => (
                      <Button
                        key={index}
                        type={action.type}
                        status={action.status}
                        onClick={action.onClick}
                      >
                        {action.label}
                      </Button>
                    ))}

                    <Button
                      loading={isSubmitting}
                      type="primary"
                      onClick={() => submit()}
                      disabled={isReadOnly}
                    >
                      Save as Draft
                    </Button>
                    <Button
                      onClick={() => {
                        Modal.confirm({
                          title: 'Logout',
                          content: 'Are you sure you want to logout?',
                          onOk: () => {
                            window.location.href = '/';
                          },
                        });
                      }}
                    >
                      Logout
                    </Button>
                  </Stack>
                }
              />


              <StandardLayout
                compact={!smallScene}
                categories={DEFAULT_CATEGORIES}
              >
                <EmailEditor />
              </StandardLayout>
              <AutoSaveAndRestoreEmail />
            </>
          );
        }}
      </EmailEditorProvider>
      <style>{`
        #bmc-wbtn { display: none !important; }
        
        .easy-email-editor-layout, 
        .arco-layout-content {
          background-color: #f0f2f5 !important;
          background-image: radial-gradient(#e1e4e8 1px, transparent 1px);
          background-size: 20px 20px;
        }

        div[class*="editor-container"], 
        div[class*="visual-editor"] {
           max-width: 800px !important;
           margin: 40px auto !important;
           background-color: white !important;
           box-shadow: 0 10px 30px rgba(0,0,0,0.15) !important;
           border: 1px solid #e8e8e8;
           min-height: 1123px !important;
           position: relative;
        }

        div[class*="editor-container"]::after,
        div[class*="visual-editor"]::after {
           content: "PAGE END LIMIT (Content below this may be cut)";
           position: absolute;
           top: 1123px;
           left: 0;
           right: 0;
           height: 2px;
           background-color: transparent;
           border-top: 2px dashed #ff4d4f;
           color: #ff4d4f;
           font-weight: bold;
           font-size: 11px;
           pointer-events: none;
           z-index: 9999;
           text-align: right;
           padding-right: 10px;
           padding-top: 2px;
           opacity: 0.7;
        }
        
        .arco-layout-sider {
          height: calc(100vh - 65px) !important;
        }
        .page-navigator {
          background: var(--color-bg-2);
          padding: 4px 8px;
          display: flex;
          align-items: center;
        }

        .page-navigator-left-info {
          flex-shrink: 0;
          min-width: 130px;
          margin-right: 16px;
          padding-right: 16px;
          border-right: 1px solid var(--color-border);
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .info-text-wrapper {
          display: flex;
          align-items: baseline;
          gap: 6px;
        }

        .info-label {
          color: var(--color-text-3);
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-weight: 600;
        }

        .info-value {
          font-weight: 600;
          color: var(--color-text-1);
          font-feature-settings: "tnum";
          font-size: 13px;
        }

        .info-value .divider {
          color: var(--color-text-4);
          margin: 0 3px;
          font-weight: 400;
        }

        .add-page-btn-left {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          height: 28px;
          padding: 0 12px;
          background: transparent;
          border: 1.5px solid var(--color-border);
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
          color: var(--color-text-2);
          font-size: 12px;
          font-weight: 500;
          flex-shrink: 0;
          margin-left: 12px;
          white-space: nowrap;
        }

        .add-page-btn-left:hover {
          border-color: #69c0ff;
          color: #1890ff;
          background: #e6f7ff;
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(24, 144, 255, 0.15);
        }

        .page-navigator-scroll {
          flex: 1;
          overflow-x: auto;
          overflow-y: hidden;
          display: flex;
          gap: 8px;
          align-items: center;
          min-height: 36px;
          padding: 2px 4px;
        }

        .page-navigator-scroll::-webkit-scrollbar {
          height: 4px;
        }

        .page-navigator-scroll::-webkit-scrollbar-track {
          background: transparent;
        }

        .page-navigator-scroll::-webkit-scrollbar-thumb {
          background: var(--color-border);
          border-radius: 2px;
        }

        .page-navigator-scroll::-webkit-scrollbar-thumb:hover {
          background: var(--color-text-4);
        }

        .page-tab {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 32px;
          height: 32px;
          padding: 0 4px;
          background: var(--color-bg-3);
          border: 1px solid var(--color-border);
          border-radius: 50%;
          cursor: pointer;
          transition: all 0.2s ease;
          user-select: none;
          overflow: visible;
        }

        .page-tab.special-page {
          border-radius: 16px;
          padding: 0 12px;
          min-width: auto;
          width: auto;
        }

        .page-tab:hover {
          background: var(--color-bg-4);
          border-color: #69c0ff;
          transform: translateY(-1px);
          z-index: 10;
        }

        .page-tab.active {
          background: #e6f7ff;
          border-color: #69c0ff;
          color: #1890ff;
          font-weight: 600;
          box-shadow: 0 2px 8px rgba(24, 144, 255, 0.15);
        }

        .page-tab-name {
          font-size: 12px;
          color: var(--color-text-1);
          white-space: nowrap;
        }

        .page-tab.active .page-tab-name {
          color: #1890ff;
        }

        .page-tab-delete {
          position: absolute;
          top: -6px;
          right: -6px;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 16px;
          height: 16px;
          padding: 0;
          background: #999;
          border: 2px solid white;
          border-radius: 50%;
          cursor: pointer;
          color: white;
          opacity: 0;
          transform: scale(0.5);
          pointer-events: none;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 20;
        }

        .page-tab-delete:hover {
          background: #000;
          transform: scale(1.1);
        }

        .page-tab:hover .page-tab-delete {
          opacity: 1;
          transform: scale(1);
          pointer-events: auto;
        }
      `}</style>
    </div>
  );
}
