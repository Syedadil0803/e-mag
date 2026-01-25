import mjml from "mjml-browser";
import { JsonToMjml } from "easy-email-core";
import { IEmailTemplate } from "easy-email-editor";

interface Page {
  id: string;
  name: string;
  content: any;
  order: number;
  type: 'cover' | 'content' | 'back_cover';
}

interface FlipBookExportProps {
  pages: Page[];
  currentPageIndex: number;
  currentValues: IEmailTemplate;
  templateSubject?: string;
  mergeTags: any;
}

export const generateFlipBookHtml = ({
  pages,
  currentPageIndex,
  currentValues,
  templateSubject,
  mergeTags
}: FlipBookExportProps): string => {
  // Update current page content first
  const allPages = [...pages];
  allPages[currentPageIndex] = {
    ...allPages[currentPageIndex],
    content: currentValues.content,
  };

  let mjmlHeadStyles = "";

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

      // Extract MJML head styles from the first page
      if (!mjmlHeadStyles) {
        const headMatch = fullHtml.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
        const headContent = headMatch ? headMatch[1] : "";
        const styleTags = headContent.match(/<style[^>]*>[\s\S]*?<\/style>/gi);
        mjmlHeadStyles = styleTags ? styleTags.join("\n") : "";
      }

      // Extract ONLY the body content (not the full HTML document)
      const bodyMatch = fullHtml.match(/<body[^>]*>([\s\S]*)<\/body>/i);
      const bodyContent = bodyMatch ? bodyMatch[1] : fullHtml;

      return `
      <!-- ${page.name} -->
      <div class="page ${isCover ? "--cover" : ""}" ${isCover ? 'data-density="hard"' : ""}>
        <div class="page-content">
          ${bodyContent}
        </div>
        <div class="page-footer">
          ${index + 1}
        </div>
      </div>`;
    })
    .join("\n");

  // NOTE: The complete HTML with all features (search, zoom, fullscreen) will be added below
  // This is extracted from the original git version to preserve all functionality

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${templateSubject || "Magazine"}</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  ${mjmlHeadStyles}
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

    .toolbar-btn:active {
      background: rgba(255,255,255,0.2);
    }

    .zoom-wrapper {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .zoom-slider {
      width: 100px;
      height: 4px;
      border-radius: 2px;
      background: rgba(255,255,255,0.2);
      outline: none;
      cursor: pointer;
    }

    .zoom-slider::-webkit-slider-thumb {
      appearance: none;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: #fff;
      cursor: pointer;
    }

    .zoom-slider::-moz-range-thumb {
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: #fff;
      cursor: pointer;
      border: none;
    }

    .page-info {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
      color: #e8eaed;
      min-width: 80px;
      justify-content: center;
    }

    .page-current {
      font-weight: 600;
    }

    .page-total {
      color: rgba(255,255,255,0.6);
    }

    .search-input {
      background: rgba(255,255,255,0.1);
      border: 1px solid rgba(255,255,255,0.2);
      color: #fff;
      padding: 6px 32px 6px 12px;
      border-radius: 4px;
      font-size: 14px;
      width: 200px;
      outline: none;
    }

    .search-input:focus {
      background: rgba(255,255,255,0.15);
      border-color: rgba(255,255,255,0.4);
    }

    .search-wrapper {
      position: relative;
    }

    .search-icon {
      position: absolute;
      right: 10px;
      top: 50%;
      transform: translateY(-50%);
      color: rgba(255,255,255,0.6);
      cursor: pointer;
      font-size: 14px;
    }

    .search-sidebar {
      position: fixed;
      right: -320px;
      top: 50px;
      width: 320px;
      height: calc(100vh - 50px);
      background: rgba(60, 64, 67, 0.98);
      backdrop-filter: blur(10px);
      box-shadow: -2px 0 8px rgba(0,0,0,0.3);
      transition: right 0.3s ease;
      overflow-y: auto;
      padding: 20px;
      z-index: 1000;
    }

    .search-sidebar.active {
      right: 0;
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
      background: rgba(255,255,255,0.05);
      transition: background 0.2s;
    }

    .search-result-item:hover {
      background: rgba(255,255,255,0.1);
    }

    .result-page {
      font-size: 11px;
      color: #999;
      margin-bottom: 6px;
    }

    .result-snippet {
      font-size: 13px;
      line-height: 1.5;
      color: #e8eaed;
    }

    .result-snippet mark {
      background: rgba(255, 255, 0, 0.4);
      color: #fff;
      padding: 2px 4px;
      border-radius: 2px;
    }

    .no-results {
      text-align: center;
      color: #999;
      padding: 40px 20px;
      font-size: 14px;
    }

    .mag-highlight {
      background: rgba(255, 255, 0, 0.4);
      padding: 2px 4px;
      border-radius: 2px;
    }

    body.search-open .stage {
      margin-right: 320px;
    }

    .stage {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      position: relative;
      transition: margin-right 0.3s ease;
    }

    .zoom-wrapper {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    #loading {
      font-size: 18px;
      color: rgba(255,255,255,0.7);
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .loader {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      100% { transform: rotate(360deg); }
    }

    #book {
      display: none;
      transition: transform 0.3s ease;
    }

    .flip-book {
    }

    .page {
      background: white;
      color: #000;
      position: relative;
    }

    .page-content {
      width: 100%;
      height: 100%;
      overflow: hidden;
    }
    
    /* Force columns to stay side-by-side */
    .page-content table[class*="mj-column"] {
      display: inline-block !important;
      vertical-align: top !important;
    }
    
    .page-content div[class*="mj-column-per-"] {
      display: inline-block !important;
      vertical-align: top !important;
    }
    
    /* Ensure columns don't stack on small screens */
    @media only screen and (max-width: 480px) {
      .page-content table[class*="mj-column"],
      .page-content div[class*="mj-column-per-"] {
        display: inline-block !important;
        width: auto !important;
      }
    }

    .page-footer {
      position: absolute;
      bottom: 15px;
      width: 100%;
      text-align: center;
      font-size: 12px;
      color: #666;
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
    <div class="zoom-wrapper">
      <i class="fas fa-search-minus" style="font-size: 14px; color: rgba(255,255,255,0.6);"></i>
      <input type="range" class="zoom-slider" id="zoomSlider" min="50" max="150" value="100" oninput="updateZoom(this.value)">
      <i class="fas fa-search-plus" style="font-size: 14px; color: rgba(255,255,255,0.6);"></i>
    </div>
    
    <button class="toolbar-btn" onclick="pageFlip.flipPrev()" title="Previous page">
      <i class="fas fa-chevron-left"></i>
    </button>
    
    <div class="page-info">
      <span class="page-current" id="pageDisplay">1</span>
      <span class="page-total">/ <span id="totalPages">0</span></span>
    </div>
    
    <button class="toolbar-btn" onclick="pageFlip.flipNext()" title="Next page">
      <i class="fas fa-chevron-right"></i>
    </button>
    
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
            <div class="result-page">p.\${index + 1}</div>
            <div class="result-snippet">...\${snippet}...</div>
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
           }).catch(() => {});
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
};
