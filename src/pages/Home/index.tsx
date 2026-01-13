/* eslint-disable react/jsx-wrap-multilines */
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Message, PageHeader } from "@arco-design/web-react";
import { useQuery } from "@demo/hooks/useQuery";
import { useDispatch, useSelector } from "react-redux";
import { cloneDeep, set } from "lodash";
import { Loading } from "@demo/components/loading";
import mjml from "mjml-browser";
import { copy } from "@demo/utils/clipboard";
import services from "@demo/services";
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

// Hide desktop and mobile preview tabs
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

  const { template_id, token } = useQuery();
  const { mergeTags, setMergeTags } = useMergeTagsModal(testMergeTags);

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

                // Check if it's multi-page format
                if (obj.pages && Array.isArray(obj.pages)) {
                  // Multi-page template
                  dispatch(
                    initializeFromTemplate({
                      content: obj.pages[0].content,
                      pages: obj.pages,
                    })
                  );
                } else {
                  // Single page template (backward compatibility)
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
    }
  }, []);

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
        templateOriginalData?.subject ||
        templateData.subject ||
        "Welcome to E-Magazine",
      subTitle:
        templateOriginalData?.text ||
        templateData.subTitle ||
        "Nice to meet you!",
      content: currentPage.content,
    };
  }, [pages, currentPageIndex, templateOriginalData, templateData]);

  const onSubmit = useCallback(
    async (
      values: IEmailTemplate,
      form: FormApi<IEmailTemplate, Partial<IEmailTemplate>>
    ) => {
      // Update current page content
      const allPages = [...pages];
      allPages[currentPageIndex] = {
        ...allPages[currentPageIndex],
        content: values.content,
      };

      // Generate HTML for all pages combined
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

      setIsSubmitting(true);

      // Save with multi-page structure
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
          setIsSubmitting(false);
          if (res && res.status && res.status === "200") {
            // Update Redux state
            dispatch(updateCurrentPageContent(values.content));
            form.restart(values);
            Message.success("Magazine saved successfully!");
          }
        })
        .catch(() => {
          setIsSubmitting(false);
        });
    },
    [
      pages,
      currentPageIndex,
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

  // Page navigation handlers
  const handlePageSelect = useCallback(
    (index: number, currentValues?: IEmailTemplate) => {
      if (index === currentPageIndex) return;

      // Save current page content before switching
      if (currentValues) {
        const updatedPages = [...pages];
        updatedPages[currentPageIndex] = {
          ...updatedPages[currentPageIndex],
          content: currentValues.content,
        };
        dispatch(setPages(updatedPages));
      }

      // Switch to new page
      dispatch(setCurrentPageIndex(index));
    },
    [currentPageIndex, pages, dispatch]
  );

  const handleAddPage = useCallback(
    (currentValues?: IEmailTemplate) => {
      // Save current page content before adding new page
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

  if (loading) {
    return (
      <Loading loading={loading}>
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
                    <Button
                      onClick={() => setIsDarkMode((v) => !v)}
                      shape="circle"
                      type="text"
                      icon={isDarkMode ? <IconMoonFill /> : <IconSunFill />}
                    ></Button>

                    <Button onClick={() => onPreviewHtml(values)}>View</Button>
                    <Button onClick={() => onExportHtml(values)}>
                      Export html
                    </Button>
                    <Button
                      loading={isSubmitting}
                      type="primary"
                      onClick={() => submit()}
                    >
                      Save
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
        
        /* Magazine Editor Styles */
        .easy-email-editor-layout, 
        .arco-layout-content {
          background-color: #f0f2f5 !important;
          background-image: radial-gradient(#e1e4e8 1px, transparent 1px);
          background-size: 20px 20px;
        }

        /* Paper Container - A4 Size (794px × 1123px) */
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

        /* Page End Marker */
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
        
        /* Sidebar height */
        .arco-layout-sider {
          height: calc(100vh - 65px) !important;
        }

        /* PageNavigator styles */
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
