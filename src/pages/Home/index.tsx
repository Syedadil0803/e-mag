/* eslint-disable react/jsx-wrap-multilines */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Message, PageHeader } from '@arco-design/web-react';
import { useQuery } from '@demo/hooks/useQuery';
import { useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { cloneDeep, set } from 'lodash';
import { Loading } from '@demo/components/loading';
import mjml from 'mjml-browser';
import { copy } from '@demo/utils/clipboard';
import services from '@demo/services';
import { IconMoonFill, IconSunFill } from '@arco-design/web-react/icon';
import { Liquid } from 'liquidjs';
import {
  EmailEditor,
  EmailEditorProvider,
  EmailEditorProviderProps,
  IEmailTemplate,
} from 'easy-email-editor';

import { FormApi } from 'final-form';

import { Stack } from '@demo/components/Stack';
import { PageNavigator } from '@demo/components/PageNavigator';

import { useCollection } from './components/useCollection';
import { AdvancedType, BasicType, IBlockData, JsonToMjml } from 'easy-email-core';
import { ITemplate } from '@demo/services/template';
import {
  BlockMarketManager,
  StandardLayout,
} from 'easy-email-extensions';
import { AutoSaveAndRestoreEmail } from '@demo/components/AutoSaveAndRestoreEmail';

import './components/CustomBlocks';

import 'easy-email-editor/lib/style.css';
import 'easy-email-extensions/lib/style.css';
import 'antd/dist/antd.css';
import appTheme from '@demo/styles/theme.css?inline';
import { testMergeTags } from './testMergeTags';
import { useMergeTagsModal } from './components/useMergeTagsModal';

import { useWindowSize } from 'react-use';
import { FONT_LIST, DEFAULT_CATEGORIES } from '@demo/constants';
import { RootState } from '@demo/store/reducers';
import {
  addPage,
  deletePage,
  setCurrentPageIndex,
  updateCurrentPageContent,
  initializeFromTemplate,
  setPages,
} from '@demo/store/pages';
const imageCompression = import('browser-image-compression');

export default function Editor() {
  const dispatch = useDispatch();
  const { pages, currentPageIndex } = useSelector((state: RootState) => state.pages);

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [templateData, setTemplateData] = useState(services.template.fetchDefaultTemplate());
  const [templateOriginalData, setTemplateOriginalData] = useState<ITemplate>();
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const history = useHistory();
  const { collectionCategory } = useCollection();

  const { width } = useWindowSize();

  const smallScene = width < 1200;

  const { template_id, token } = useQuery();
  const {
    mergeTags,
    setMergeTags,
  } = useMergeTagsModal(testMergeTags);

  useEffect(() => {
    if (collectionCategory) {
      BlockMarketManager.addCategories([collectionCategory]);
      return () => {
        BlockMarketManager.removeCategories([collectionCategory]);
      };
    }
  }, [collectionCategory]);

  // Replace "Email Setting" with "Template Setting" (comes from easy-email-extensions library)
  useEffect(() => {
    const replaceText = () => {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let node;
      while (node = walker.nextNode()) {
        if (node.textContent?.trim() === 'Email Setting') {
          node.textContent = 'Template Setting';
        }
      }
    };
    replaceText();
    const interval = setInterval(replaceText, 500);
    return () => clearInterval(interval);
  }, []);


  useEffect(() => {
    if (template_id) {
      setLoading(true);
      services.template.getTemplate(template_id, token).then((res: any) => {
        if (res.templateName) {
          setLoading(false);
          setTemplateOriginalData({ ...res });
          if (res.helperJson) {
            if (typeof res.helperJson === 'string') {
              const obj = JSON.parse(res.helperJson);

              // Check if it's multi-page format
              if (obj.pages && Array.isArray(obj.pages)) {
                // Multi-page template
                dispatch(initializeFromTemplate({ content: obj.pages[0].content, pages: obj.pages }));
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
                    content: typeof res.helperJson === 'string' ? obj : res.helperJson,
                  })
                }
              }
            }

          }
        }
      }).catch(() => {
        setLoading(false);
      })
    }
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.body.setAttribute('arco-theme', 'dark');
    } else {
      document.body.removeAttribute('arco-theme');
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
    setMergeTags(old => {
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

    console.log('Exporting pages:', allPages.length);
    console.log('Pages data:', allPages.map(p => ({ name: p.name, hasContent: !!p.content })));

    // Convert all pages to HTML slides
    const slides = allPages.map((page, index) => {
      console.log(`Converting ${page.name} to HTML...`);

      const fullHtml = mjml(
        JsonToMjml({
          data: page.content,
          mode: 'production',
          context: page.content,
          dataSource: mergeTags,
        }),
        {
          beautify: true,
          validationLevel: 'soft',
        },
      ).html;

      // Extract ONLY the body content (not the full HTML document)
      const bodyMatch = fullHtml.match(/<body[^>]*>([\s\S]*)<\/body>/i);
      const bodyContent = bodyMatch ? bodyMatch[1] : fullHtml;

      return `
      <!-- ${page.name} -->
      <div class="page">
        <div class="page-content">
          ${bodyContent}
        </div>
        <div class="page-footer">
          ${index + 1}
        </div>
      </div>`;
    }).join('\n');

    // Create complete FlipBook HTML
    const flipBookHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${templateOriginalData?.subject || 'Magazine'}</title>
  <style>
    :root {
      --sidebar-width: 280px;
      --bg-color: #2b2b2b;
      --accent: #e3d0b5;
    }

    body {
      margin: 0;
      padding: 0;
      background: var(--bg-color);
      display: flex;
      height: 100vh;
      overflow: hidden;
      font-family: 'Helvetica Neue', Arial, sans-serif;
    }

    /* --- SIDEBAR UI --- */
    .sidebar {
      width: var(--sidebar-width);
      background: #1a1a1a;
      color: white;
      display: flex;
      flex-direction: column;
      border-right: 1px solid #333;
      padding: 20px;
      box-sizing: border-box;
      z-index: 100;
      transition: transform 0.3s;
    }

    .search-box {
      margin-bottom: 20px;
    }

    input {
      width: 100%;
      padding: 10px;
      border-radius: 4px;
      border: 1px solid #444;
      background: #333;
      color: white;
      margin-bottom: 10px;
      box-sizing: border-box;
    }

    .nav-controls {
      display: flex;
      gap: 10px;
      align-items: center;
      margin-bottom: 20px;
      padding-bottom: 20px;
      border-bottom: 1px solid #333;
    }

    .nav-input {
      width: 60px;
      text-align: center;
    }

    button {
      background: var(--accent);
      border: none;
      padding: 8px 15px;
      border-radius: 4px;
      cursor: pointer;
      font-weight: bold;
      color: #3e2c12;
    }
    
    button:hover { opacity: 0.9; }

    .results-list {
      flex: 1;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .result-item {
      background: #333;
      padding: 10px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 13px;
      border-left: 3px solid transparent;
      transition: background 0.2s;
    }

    .result-item:hover {
      background: #444;
      border-left-color: var(--accent);
    }
    
    .result-snippet {
      color: #aaa;
      margin-top: 4px;
      font-style: italic;
    }
    
    .result-page-num {
      font-weight: bold;
      color: var(--accent);
    }

    /* --- BOOK STAGE --- */
    .stage {
      flex: 1;
      display: flex;
      justify-content: center;
      align-items: center;
      position: relative;
    }

    .flip-book {
      display: none;
      max-height: 85vh;
      max-width: calc(95vw - var(--sidebar-width));
      box-shadow: none; /* Shadow handled by pages */
    }

    .page {
      padding: 0;
      background-color: #fdfdfd;
      color: #333;
      border: solid 1px #c2c2c2;
      overflow: hidden;
      position: relative; /* Essential for footer positioning */
      box-shadow: 0 5px 15px rgba(0,0,0,0.15);
    }

    .page.--cover {
      background-color: #e3d0b5;
      color: #785e3a;
      border: solid 1px #997f5d;
      box-shadow: 0 20px 40px rgba(0,0,0,0.4);
    }

    .page-content {
      width: 100%;
      height: 100%;
      position: relative;
      background: white;
      display: block; /* Respect internal layout */
      overflow: hidden;
    }
    
    .page-content > div {
       background: transparent !important;
       height: 100%;
    }
    
    .page-footer {
      position: absolute;
      bottom: 15px;
      width: 100%;
      text-align: center;
      font-size: 12px;
      color: #555;
      font-weight: bold;
      pointer-events: none;
      z-index: 10;
    }

    .loader {
      color: white;
      font-size: 20px;
      position: absolute;
      font-family: sans-serif;
      animation: pulse 1s infinite;
    }
    
    /* Responsive Sidebar Toggle for mobile could be added here */
    @media (max-width: 768px) {
      .sidebar { position: absolute; left: -280px; height: 100%; }
      .sidebar.open { left: 0; }
      .flip-book { max-width: 95vw; }
    }

    @keyframes pulse { 0% { opacity: 0.5; } 100% { opacity: 1; } }
  </style>
</head>
<body>

  <!-- Controls Sidebar -->
  <div class="sidebar">
    <div style="margin-bottom: 20px; font-weight: bold; font-size: 18px; color: var(--accent);">
      Editor Tools
    </div>

    <!-- Page Nav -->
    <div class="nav-controls">
      <input type="number" id="pageInput" class="nav-input" placeholder="#" min="1">
      <button onclick="goToPage()">Go</button>
      <span id="pageDisplay" style="margin-left: auto; font-size: 12px; color: #888;">Page 1</span>
    </div>

    <!-- Search -->
    <div class="search-box">
      <div style="font-size: 12px; margin-bottom: 5px; color: #888;">SEARCH CONTENT</div>
      <input type="text" id="searchInput" placeholder="Type to search..." onkeyup="performSearch()">
    </div>

    <div class="results-list" id="resultsList">
      <!-- Results will appear here -->
      <div style="text-align:center; color: #555; margin-top: 20px; font-size: 14px;">
        Enter text to find pages
      </div>
    </div>
  </div>

  <div class="stage">
    <div class="loader">Loading Magazine...</div>

    <div id="book" class="flip-book">
      <!-- Cover -->
      <div class="page --cover" data-density="hard">
          <div style="height:100%; display:flex; justify-content:center; align-items:center; text-align:center; flex-direction:column; padding: 20px;">
              <h1 style="font-size: 32px; margin-bottom: 20px;">${templateOriginalData?.subject || 'Magazine'}</h1>
              <p style="font-size: 14px; opacity: 0.8;">Click corners to flip</p>
          </div>
      </div>

      <!-- Content Pages -->
${slides}

      <!-- Back Cover -->
      <div class="page --cover" data-density="hard">
          <div style="height:100%; display:flex; justify-content:center; align-items:center;">
              <h3>The End</h3>
          </div>
      </div>
    </div>
  </div>

  <script src="https://cdn.jsdelivr.net/npm/page-flip/dist/js/page-flip.browser.js"></script>
  <script>
    let pageFlip;
    let totalPages = 0;

    document.addEventListener('DOMContentLoaded', function() {
        const sidebarWidth = 280;
        const availableWidth = window.innerWidth - sidebarWidth;
        const availableHeight = window.innerHeight;
        
        // Logic: Try to fit 2 pages side-by-side
        // Single Page Ratio: 0.707
        // Spread Ratio: 1.414 (Width/Height)
        
        // 1. Calculate based on height preference (max 85vh or 800px)
        let maxHeight = Math.min(availableHeight * 0.85, 800);
        let bookHeight = maxHeight;
        let bookWidth = bookHeight * 0.707;
        
        // 2. Check if spread (2 * bookWidth) fits in availableWidth with margin
        if ((bookWidth * 2) > (availableWidth * 0.95)) {
            // If not, scale down based on width constraint
            const maxSpreadWidth = availableWidth * 0.95;
            bookWidth = maxSpreadWidth / 2;
            bookHeight = bookWidth / 0.707;
        }

        pageFlip = new St.PageFlip(document.getElementById('book'), {
            width: bookWidth, 
            height: bookHeight,
            size: "fixed",
            minWidth: 200,
            maxWidth: 1600,
            minHeight: 300,
            maxHeight: 2000,
            maxShadowOpacity: 0.5,
            showCover: true,
            usePortrait: false, // FORCE SPREAD VIEW
            startPage: 0,
            mobileScrollSupport: false
        });

        const pages = document.querySelectorAll('.page');
        totalPages = pages.length;
        pageFlip.loadFromHTML(pages);
        
        document.querySelector('.loader').style.display = 'none';
        document.getElementById('book').style.display = 'block';

        // Event: Page Change
        pageFlip.on('flip', (e) => {
           // e.data is the page index (0-based)
           // Cover is 0. Page 1 is 1.
           updatePageDisplay(e.data);
        });
        
        // Initial Display
        updatePageDisplay(0);
    });

    function updatePageDisplay(index) {
       document.getElementById('pageDisplay').innerText = 'Page ' + (index) + ' / ' + (totalPages - 1);
       document.getElementById('pageInput').value = index === 0 ? '' : index;
    }

    function goToPage() {
       const input = document.getElementById('pageInput');
       const pageNum = parseInt(input.value);
       if(pageNum >= 0 && pageNum < totalPages) {
           pageFlip.flip(pageNum);
       } else {
           alert('Invalid page number');
       }
    }

    function performSearch() {
       const query = document.getElementById('searchInput').value.toLowerCase();
       const list = document.getElementById('resultsList');
       list.innerHTML = '';
       
       if(query.length < 2) {
          list.innerHTML = '<div style="text-align:center; color: #555; margin-top: 20px; font-size: 14px;">Enter at least 2 characters</div>';
          return;
       }

       const pages = document.querySelectorAll('.page');
       let found = 0;

       pages.forEach((page, index) => {
           // Skip Covers? Maybe search titles on covers too.
           const text = page.innerText || "";
           if(text.toLowerCase().includes(query)) {
               found++;
               
               // Create Context Snippet
               const regex = new RegExp("(.{0,20})(" + query + ")(.{0,20})", "gi");
               const match = regex.exec(text);
               const snippet = match ? '...' + match[0] + '...' : text.substring(0, 40) + '...';

               const item = document.createElement('div');
               item.className = 'result-item';
               item.innerHTML = \`
                 <div class="result-page-num">Page \${index === 0 ? 'Cover' : index}</div>
                 <div class="result-snippet">\${snippet}</div>
               \`;
               item.onclick = () => { pageFlip.flip(index); };
               list.appendChild(item);
           }
       });

       if(found === 0) {
           list.innerHTML = '<div style="text-align:center; color: #555; margin-top: 20px;">No matches found</div>';
       }
    }
  </script>
</body>
</html>`;

    console.log('Total HTML length:', flipBookHtml.length);
    copy(flipBookHtml);
    Message.success('Copied to clipboard!');
  };

  const initialValues: IEmailTemplate | null = useMemo(() => {
    const currentPage = pages[currentPageIndex];
    if (!currentPage) return null;

    return {
      subject: templateOriginalData?.subject || templateData.subject || 'Welcome to E-Magazine',
      subTitle: templateOriginalData?.text || templateData.subTitle || 'Nice to meet you!',
      content: currentPage.content,
    };
  }, [pages, currentPageIndex, templateOriginalData, templateData]);

  const onSubmit = useCallback(
    async (
      values: IEmailTemplate,
      form: FormApi<IEmailTemplate, Partial<IEmailTemplate>>,
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
          mode: 'production',
          context: values.content,
          dataSource: mergeTags,
        }),
        {
          beautify: true,
          validationLevel: 'soft',
        },
      ).html;

      setIsSubmitting(true);

      // Save with multi-page structure
      const multiPageData = {
        pages: allPages,
      };

      services.template.updateArticle(
        template_id,
        templateOriginalData?.subject,
        html,
        templateOriginalData?.text,
        templateOriginalData?.id,
        multiPageData).then((res: any) => {
          setIsSubmitting(false)
          if (res && res.status && res.status === '200') {
            // Update Redux state
            dispatch(updateCurrentPageContent(values.content));
            form.restart(values)
            Message.success('Magazine saved successfully!');
          }
        }).catch(() => {
          setIsSubmitting(false)
        })
    },
    [pages, currentPageIndex, template_id, templateOriginalData, mergeTags, dispatch],
  );

  const onBeforePreview: EmailEditorProviderProps['onBeforePreview'] = useCallback(
    (html: string, mergeTags) => {
      const engine = new Liquid();
      const tpl = engine.parse(html);
      return engine.renderSync(tpl, mergeTags);
    },
    [],
  );

  // Page navigation handlers
  const handlePageSelect = useCallback((index: number, currentValues?: IEmailTemplate) => {
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
  }, [currentPageIndex, pages, dispatch]);

  const handleAddPage = useCallback((currentValues?: IEmailTemplate) => {
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
    Message.success('New page added!');
  }, [currentPageIndex, pages, dispatch]);

  const handleDeletePage = useCallback((index: number) => {
    dispatch(deletePage(index));
  }, [dispatch]);


  if (loading) {
    return (
      <Loading loading={loading}>
        <div style={{ height: '100vh' }} />
      </Loading>
    );
  }

  if (!initialValues) return null;

  return (
    <div>
      <style>{appTheme}</style>
      <EmailEditorProvider
        key={`${template_id} -${currentPageIndex} `}
        height={'calc(100vh - 116px)'}
        data={initialValues}
        onUploadImage={onUploadImage}
        fontList={FONT_LIST}
        onSubmit={onSubmit}
        onChangeMergeTag={onChangeMergeTag}
        autoComplete
        enabledLogic
        dashed={false}
        mergeTagGenerate={tag => `{ {${tag} } } `}
        onBeforePreview={onBeforePreview}
        socialIcons={[]}
      >
        {({ values }, { submit }) => {
          return (
            <>
              <PageHeader
                style={{ background: 'var(--color-bg-2)' }}
                extra={
                  <Stack alignment='center'>
                    <Button
                      onClick={() => setIsDarkMode(v => !v)}
                      shape='circle'
                      type='text'
                      icon={isDarkMode ? <IconMoonFill /> : <IconSunFill />}
                    ></Button>

                    <Button onClick={() => onExportHtml(values)}>Export html</Button>
                    <Button
                      loading={isSubmitting}
                      type='primary'
                      onClick={() => submit()}
                    >
                      Save
                    </Button>
                  </Stack>
                }
              />
              <PageNavigator
                pages={pages}
                currentPageIndex={currentPageIndex}
                onPageSelect={(index) => handlePageSelect(index, values)}
                onAddPage={() => handleAddPage(values)}
                onDeletePage={handleDeletePage}
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
        
        /* --- MAGAZINE EDITOR CONSTRAINTS --- */
        
        /* 1. Darker background for contrast */
        .easy-email-editor-layout, 
        .arco-layout-content {
          background-color: #f0f2f5 !important;
          background-image: radial-gradient(#e1e4e8 1px, transparent 1px);
          background-size: 20px 20px;
        }

        /* 2. The "Paper" Container */
        /* We target the main editor area. Note: We use attribution selectors for robustness */
        div[class*="editor-container"], 
        div[class*="visual-editor"] {
           max-width: 800px !important;  /* ~A4 Width */
           margin: 40px auto !important;
           background-color: white !important;
           box-shadow: 0 10px 30px rgba(0,0,0,0.15) !important;
           border: 1px solid #e8e8e8;
           min-height: 1123px !important; /* ~A4 Height */
           position: relative;
           /* Create a "Page" look */
        }

        /* 3. The "Page End" Marker - Visual Guide */
        div[class*="editor-container"]::after,
        div[class*="visual-editor"]::after {
           content: "PAGE END LIMIT (Content below this may be cut)";
           position: absolute;
           top: 1123px; /* Exact A4 pixel height */
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
        
        /* 4. Fix sidebar height */
        .arco-layout-sider {
          height: calc(100vh - 65px) !important;
        }
      `}</style>
    </div>
  );
}

function replaceStandardBlockToAdvancedBlock(blockData: IBlockData) {
  const map = {
    [BasicType.TEXT]: AdvancedType.TEXT,
    [BasicType.BUTTON]: AdvancedType.BUTTON,
    [BasicType.IMAGE]: AdvancedType.IMAGE,
    [BasicType.DIVIDER]: AdvancedType.DIVIDER,
    [BasicType.SPACER]: AdvancedType.SPACER,
    [BasicType.SOCIAL]: AdvancedType.SOCIAL,
    [BasicType.ACCORDION]: AdvancedType.ACCORDION,
    [BasicType.CAROUSEL]: AdvancedType.CAROUSEL,
    [BasicType.NAVBAR]: AdvancedType.NAVBAR,
    [BasicType.WRAPPER]: AdvancedType.WRAPPER,
    [BasicType.SECTION]: AdvancedType.SECTION,
    [BasicType.GROUP]: AdvancedType.GROUP,
    [BasicType.COLUMN]: AdvancedType.COLUMN,
  };

  if (map[blockData.type]) {
    blockData.type = map[blockData.type];
  }
  blockData.children.forEach(replaceStandardBlockToAdvancedBlock);
  return blockData;
}
