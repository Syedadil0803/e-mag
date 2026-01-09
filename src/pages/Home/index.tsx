/* eslint-disable react/jsx-wrap-multilines */
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Button, Message, PageHeader } from "@arco-design/web-react";
import { useQuery } from "@demo/hooks/useQuery";
import { useHistory } from "react-router-dom";
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

import { useCollection } from "./components/useCollection";
import {
  AdvancedType,
  BasicType,
  IBlockData,
  JsonToMjml,
} from "easy-email-core";
import { ITemplate } from "@demo/services/template";
import { BlockMarketManager, StandardLayout } from "easy-email-extensions";
import { AutoSaveAndRestoreEmail } from "@demo/components/AutoSaveAndRestoreEmail";

import "./components/CustomBlocks";

import "easy-email-editor/lib/style.css";
import "easy-email-extensions/lib/style.css";
import "antd/dist/antd.css";
import appTheme from "@demo/styles/theme.css?inline";
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
  const history = useHistory();
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

  const onExportHtml = (values: IEmailTemplate) => {
    // Update current page content first
    const allPages = [...pages];
    allPages[currentPageIndex] = {
      ...allPages[currentPageIndex],
      content: values.content,
    };

    // Convert all pages to HTML slides
    const slides = allPages
      .map((page, index) => {
        const isCover = page.type === "cover" || page.type === "back_cover";

        const fullHtml = mjml(
          JsonToMjml({
            data: page.content,
            mode: "production",
            context: page.content,
            dataSource: mergeTags,
          }),
          {
            beautify: true,
            validationLevel: "soft",
          }
        ).html;

        // Extract ONLY the body content (not the full HTML document)
        const bodyMatch = fullHtml.match(/<body[^>]*>([\s\S]*)<\/body>/i);
        const bodyContent = bodyMatch ? bodyMatch[1] : fullHtml;

        return `
      <!-- ${page.name} -->
      <div class="page ${isCover ? "--cover" : ""}" ${
          isCover ? 'data-density="hard"' : ""
        }>
        <div class="page-content">
          ${bodyContent}
        </div>
        <div class="page-footer">
          ${index + 1}
        </div>
      </div>`;
      })
      .join("\n");

    // Create complete FlipBook HTML with PDF-viewer-style interface
    const flipBookHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${templateOriginalData?.subject || "Magazine"}</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      background: #525659;
      color: #fff;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      height: 100vh;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .toolbar {
      height: 50px;
      background: rgba(82, 86, 89, 0.95);
      backdrop-filter: blur(10px);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
      padding: 0 20px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    }

    .toolbar-btn {
      background: transparent;
      border: none;
      color: #e8eaed;
      width: 36px;
      height: 36px;
      border-radius: 4px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
      font-size: 18px;
    }

    .toolbar-btn:hover {
      background: rgba(255,255,255,0.1);
    }

    .zoom-slider {
      width: 120px;
      height: 4px;
      -webkit-appearance: none;
      background: rgba(255,255,255,0.3);
      border-radius: 2px;
      outline: none;
    }

    .zoom-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 14px;
      height: 14px;
      background: #fff;
      border-radius: 50%;
      cursor: pointer;
    }

    .zoom-slider::-moz-range-thumb {
      width: 14px;
      height: 14px;
      background: #fff;
      border-radius: 50%;
      cursor: pointer;
      border: none;
    }

    .page-controls {
      display: flex;
      align-items: center;
      gap: 8px;
      background: rgba(255,255,255,0.1);
      padding: 4px 12px;
      border-radius: 20px;
    }

    .page-input {
      width: 60px;
      background: rgba(255,255,255,0.15);
      border: 1px solid rgba(255,255,255,0.2);
      border-radius: 4px;
      color: #fff;
      text-align: center;
      padding: 4px 8px;
      font-size: 14px;
    }

    .page-input:focus {
      outline: none;
      background: rgba(255,255,255,0.2);
    }

    .page-total {
      color: #e8eaed;
      font-size: 14px;
    }

    .search-input {
      width: 140px;
      background: rgba(255,255,255,0.15);
      border: 1px solid rgba(255,255,255,0.2);
      border-radius: 4px;
      color: #fff;
      padding: 6px 32px 6px 12px;
      font-size: 14px;
    }

    .search-input:focus {
      outline: none;
      background: rgba(255,255,255,0.2);
    }

    .search-wrapper {
      position: relative;
    }

    .search-icon {
      position: absolute;
      right: 10px;
      top: 50%;
      transform: translateY(-50%);
      color: #e8eaed;
      cursor: pointer;
      font-size: 14px;
      padding: 5px;
      z-index: 5;
    }

    .search-sidebar {
      position: fixed;
      top: 50px;
      left: -320px;
      width: 300px;
      height: calc(100vh - 50px);
      background: rgba(40, 44, 47, 0.95);
      backdrop-filter: blur(15px);
      border-right: 1px solid rgba(255, 255, 255, 0.1);
      z-index: 1000;
      transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      overflow-y: auto;
      padding: 20px;
      box-shadow: 10px 0 30px rgba(0,0,0,0.3);
    }

    .search-sidebar.active {
      left: 0;
    }

    .close-search {
      display: inline-block;
      cursor: pointer;
      color: #999;
      font-size: 13px;
      margin-bottom: 20px;
      padding: 6px 0;
      transition: color 0.2s;
    }

    .close-search:hover {
      color: #fff;
    }

    .search-result-item {
      padding: 12px;
      border-radius: 8px;
      margin-bottom: 10px;
      cursor: pointer;
      transition: background 0.2s;
      border: 1px solid transparent;
    }

    .search-result-item:hover {
      background: rgba(255, 255, 255, 0.05);
      border-color: rgba(255, 255, 255, 0.1);
    }

    .result-page {
      font-weight: 600;
      font-size: 13px;
      color: #e8eaed;
      margin-bottom: 4px;
    }

    .result-snippet {
      font-size: 12px;
      color: #abb2bf;
      line-height: 1.5;
    }

    .result-snippet mark {
      background: rgba(227, 208, 181, 0.4);
      color: #fff;
      padding: 0 2px;
      border-radius: 2px;
    }

    .no-results {
      text-align: center;
      color: #888;
      font-size: 14px;
      margin-top: 40px;
    }

    /* Magazine Highlight */
    .mag-highlight {
      background: rgba(255, 255, 0, 0.4);
      box-shadow: 0 0 5px yellow;
      border-radius: 2px;
      color: inherit;
    }

    body.search-open .stage {
      margin-left: 300px;
    }

    .stage {
      flex: 1;
      display: block;
      position: relative;
      overflow: auto;
      padding: 0;
      transition: margin-left 0.3s ease;
      text-align: center;
    }

    .zoom-wrapper {
      display: inline-block;
      padding: 20px 0;
      min-width: 100%;
    }

    .flip-book {
      display: none;
      transition: transform 0.3s ease;
      transform-origin: top center;
      margin: 0 auto;
    }

    .page {
      background: #fff;
      color: #333;
      border: 1px solid #ddd;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    }

    .page.--cover {
      background: #e3d0b5;
      color: #785e3a;
      border: 1px solid #997f5d;
    }

    .page-content {
      width: 100%;
      height: 100%;
      overflow: hidden;
    }

    .page-footer {
      position: absolute;
      bottom: 15px;
      width: 100%;
      text-align: center;
      font-size: 12px;
      color: #666;
      font-weight: 600;
    }

    .loader {
      font-size: 32px;
      color: #e8eaed;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      100% { transform: rotate(360deg); }
    }

    .divider {
      width: 1px;
      height: 24px;
      background: rgba(255,255,255,0.2);
    }
  </style>
</head>
<body id="bodyRoot">

  <div class="toolbar">
    <button class="toolbar-btn" onclick="shareMagazine()" title="Share">
      <i class="fas fa-share-alt"></i>
    </button>
    
    <div class="divider"></div>
    
    <input type="range" class="zoom-slider" id="zoomSlider" min="50" max="150" value="100" oninput="updateZoom(this.value)">
    
    <div class="divider"></div>
    
    <button class="toolbar-btn" onclick="pageFlip.flipPrev()" title="Previous page">
      <i class="fas fa-chevron-left"></i>
    </button>
    
    <div class="page-controls">
      <span class="page-total" id="pageDisplay">1</span>
      <span class="page-total">/ <span id="totalPages">0</span></span>
    </div>
    
    <button class="toolbar-btn" onclick="pageFlip.flipNext()" title="Next page">
      <i class="fas fa-chevron-right"></i>
    </button>
    
    <div class="divider"></div>
    
    <button class="toolbar-btn" onclick="toggleFullscreen()" title="Fullscreen">
      <i class="fas fa-expand"></i>
    </button>
    
    <div class="divider"></div>
    
    <div class="search-wrapper">
      <input type="text" class="search-input" id="searchInput" placeholder="Search" onkeyup="if(event.key === 'Enter') performSearch()">
      <i class="fas fa-search search-icon" onclick="performSearch()"></i>
    </div>
  </div>

  <div class="search-sidebar" id="searchSidebar">
    <div class="close-search" onclick="toggleSearch(false)">
      ← Close
    </div>
    <div id="searchResults">
      <div class="no-results">Results will appear here</div>
    </div>
  </div>

  <div class="stage">
    <div id="loading">
      <div class="loader"><i class="fas fa-spinner"></i></div>
    </div>

    <div class="zoom-wrapper" id="zoomWrapper">
      <div id="book" class="flip-book">
${slides}
      </div>
    </div>
  </div>

  <script src="https://cdn.jsdelivr.net/npm/page-flip/dist/js/page-flip.browser.js"></script>
  <script>
    let pageFlip;
    let totalPages = 0;
    let currentScale = 1;
    let initialBookWidth = 0;
    let initialBookHeight = 0;

    document.addEventListener('DOMContentLoaded', function() {
        const availableWidth = window.innerWidth;
        const availableHeight = window.innerHeight - 50;
        
        let maxHeight = Math.min(availableHeight * 0.85, 800);
        initialBookHeight = maxHeight;
        initialBookWidth = initialBookHeight * 0.707;
        
        if ((initialBookWidth * 2) > (availableWidth * 0.9)) {
            const maxSpreadWidth = availableWidth * 0.9;
            initialBookWidth = maxSpreadWidth / 2;
            initialBookHeight = initialBookWidth / 0.707;
        }

        pageFlip = new St.PageFlip(document.getElementById('book'), {
            width: initialBookWidth, 
            height: initialBookHeight,
            size: "fixed",
            minWidth: 200,
            maxWidth: 1600,
            minHeight: 300,
            maxHeight: 2000,
            maxShadowOpacity: 0.5,
            showCover: true,
            usePortrait: false,
            startPage: 0,
            mobileScrollSupport: false
        });

        const pages = document.querySelectorAll('.page');
        totalPages = pages.length;
        pageFlip.loadFromHTML(pages);
        
        document.getElementById('loading').style.display = 'none';
        document.getElementById('book').style.display = 'block';

        pageFlip.on('flip', (e) => {
           updatePageDisplay(e.data);
        });
        
        updatePageDisplay(0);
    });

    function updatePageDisplay(index) {
       document.getElementById('totalPages').innerText = totalPages;
       
       let displayText;
       if (index === 0) {
           displayText = '1';
       } else if (index === totalPages - 1) {
           displayText = totalPages;
       } else {
           const leftPage = index + 1;
           const rightPage = index + 2;
           if (rightPage <= totalPages) {
               displayText = leftPage + '-' + rightPage;
           } else {
               displayText = leftPage;
           }
       }
       
       document.getElementById('pageDisplay').innerText = displayText;
    }

    function toggleSearch(show) {
      const sidebar = document.getElementById('searchSidebar');
      const body = document.getElementById('bodyRoot');
      if (show) {
        sidebar.classList.add('active');
        body.classList.add('search-open');
      } else {
        sidebar.classList.remove('active');
        body.classList.remove('search-open');
        clearHighlights();
      }
    }

    function clearHighlights() {
      const highlights = document.querySelectorAll('.mag-highlight');
      highlights.forEach(h => {
        h.outerHTML = h.innerHTML;
      });
    }

    function highlightTextInElement(element, query) {
      if (!query) return;
      const nodes = Array.from(element.childNodes);
      nodes.forEach(node => {
        if (node.nodeType === 3) {
          const text = node.nodeValue;
          const pos = text.toLowerCase().indexOf(query.toLowerCase());
          if (pos !== -1) {
            const span = document.createElement('span');
            span.className = 'mag-highlight';
            
            const before = text.substring(0, pos);
            const mid = text.substring(pos, pos + query.length);
            const after = text.substring(pos + query.length);
            
            node.nodeValue = before;
            span.innerText = mid;
            node.parentNode.insertBefore(span, node.nextSibling);
            const afterNode = document.createTextNode(after);
            span.parentNode.insertBefore(afterNode, span.nextSibling);
          }
        } else if (node.nodeType === 1 && node.childNodes.length > 0) {
          highlightTextInElement(node, query);
        }
      });
    }

    function performSearch() {
      const query = document.getElementById('searchInput').value.trim().toLowerCase();
      const resultsContainer = document.getElementById('searchResults');
      
      if (!query) return;
      
      toggleSearch(true);
      clearHighlights();
      resultsContainer.innerHTML = '';
      
      const pages = document.querySelectorAll('.page');
      let matches = 0;
      
      pages.forEach((page, index) => {
        const text = page.innerText || "";
        const pos = text.toLowerCase().indexOf(query);
        
        if (pos !== -1) {
          matches++;
          
          const start = Math.max(0, pos - 40);
          const end = Math.min(text.length, pos + query.length + 80);
          let snippet = text.substring(start, end);
          
          const regex = new RegExp("(" + query + ")", "gi");
          snippet = snippet.replace(regex, '<mark>$1</mark>');
          
          const resultItem = document.createElement('div');
          resultItem.className = 'search-result-item';
          resultItem.innerHTML = \`
            \u003cdiv class="result-page"\u003ep.\${index + 1}\u003c/div\u003e
            \u003cdiv class="result-snippet"\u003e...\${snippet}...\u003c/div\u003e
          \`;
          resultItem.onclick = () => {
            pageFlip.flip(index);
            setTimeout(() => {
              clearHighlights();
              const targetPage = document.querySelectorAll('.page')[index];
              highlightTextInElement(targetPage, query);
            }, 600);
          };
          resultsContainer.appendChild(resultItem);
        }
      });
      
      if (matches === 0) {
        resultsContainer.innerHTML = '<div class="no-results">No matches found for "' + query + '"</div>';
      }
    }

    function updateZoom(value) {
       currentScale = value / 100;
       document.getElementById('book').style.transform = 'scale(' + currentScale + ')';
    }

    function toggleFullscreen() {
       if (!document.fullscreenElement) {
           document.documentElement.requestFullscreen();
       } else {
           document.exitFullscreen();
       }
    }

    function shareMagazine() {
       if (navigator.share) {
           navigator.share({
               title: document.title,
               url: window.location.href
           }).catch(console.error);
       } else {
           const dummy = document.createElement('input');
           document.body.appendChild(dummy);
           dummy.value = window.location.href;
           dummy.select();
           document.execCommand('copy');
           document.body.removeChild(dummy);
           alert("Link copied to clipboard!");
       }
    }
  </script>
</body>
</html>`;

    copy(flipBookHtml);
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
                            className={`page-tab ${
                              index === currentPageIndex ? "active" : ""
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
                          className={`page-tab special-page ${
                            pages.findIndex((p) => p.type === "back_cover") ===
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

        /* Paper Container */
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

