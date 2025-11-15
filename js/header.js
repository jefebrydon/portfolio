// Header Component - Reusable header with JeffBot sidebar
(function() {
  'use strict';

  // Get current page filename
  function getCurrentPage() {
    const path = window.location.pathname;
    const page = path.split('/').pop() || 'index.html';
    return page;
  }

  // Check if current page is index.html
  function isIndexPage() {
    const currentPage = getCurrentPage();
    return currentPage === 'index.html' || currentPage === '' || currentPage === '/';
  }

  // Generate navigation links based on current page
  function getNavLinks() {
    const isIndex = isIndexPage();
    const currentPage = getCurrentPage();
    
    // Check if we're on a page that uses full URLs (like out-alive.html)
    const useFullUrl = currentPage === 'out-alive.html';
    const baseUrl = useFullUrl ? 'https://www.jeffbrydon.com/' : (isIndex ? '' : 'index.html');
    
    return {
      work: baseUrl + '#Case-Studies',
      about: baseUrl + '#About',
      contact: baseUrl + '#Contact'
    };
  }

  // Generate header HTML
  function generateHeaderHTML() {
    const currentPage = getCurrentPage();
    const isIndex = isIndexPage();
    const navLinks = getNavLinks();
    
    // Determine if brand link should have w--current class
    const brandCurrentClass = isIndex ? ' w--current' : '';
    const brandAriaCurrent = isIndex ? ' aria-current="page"' : '';
    
    return `
  <div data-animation="default" class="navbar w-nav" data-easing2="ease-in-out" data-easing="ease-in-out"
    data-collapse="tiny"
    role="banner">
    <div class="menu-button-2 w-nav-button"><img src="images/Hamburger.png" alt=""></div>
    <a href="index.html"${brandAriaCurrent} class="brand w-clearfix w-nav-brand${brandCurrentClass}"><img src="images/J_big.png"
        alt="" class="img-clickable"></a>
    <nav role="navigation" class="nav-menu-2 w-clearfix w-nav-menu">
      <div class="div-block-12">
        <div class="div-block-34">
          <a href="${navLinks.work}" class="navigation work w-nav-link">Work</a>
          <a href="${navLinks.about}" class="navigation w-nav-link">About</a>
          <a href="${navLinks.contact}" class="navigation contact w-nav-link">Contact</a>
          <a href="#" class="navigation jeffbot-menu-item w-nav-link" id="jeffbot-menu-trigger">JeffBot 3000</a>
        </div>
        <div data-w-id="ad52a0ad-1789-8cad-1432-6fa8ea9894a7" class="gradient-div tab-highlight"></div>
      </div>
    </nav>
    <button class="sparkle-button" aria-label="Open JeffBot">
      <img src="images/JeffBot_button.svg" alt="" class="sparkle-icon">
    </button>
    <div class="shadow-div"></div>
  </div>
  
  <!-- JeffBot 3000 Sidebar -->
  <div id="jeffbot-sidebar" class="jeffbot-sidebar">
    <button class="jeffbot-sidebar-close" aria-label="Close JeffBot" style="display: none;">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18 6L6 18M6 6L18 18" stroke="#666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
    
    <div class="jeffbot-sidebar-content">
      <div class="jeffbot-content-wrapper">
        <!-- Response Message -->
        <div class="jeffbot-response-message">
          <p class="jeffbot-response-text">JeffBot 3000 here.<br>Ask me about Jeff!</p>
        </div>
        
        <!-- Suggestion Buttons -->
        <div class="jeffbot-suggestions">
          <button class="jeffbot-suggestion-button" type="button">Jeff's designer shape</button>
          <button class="jeffbot-suggestion-button" type="button">AI in his design process</button>
          <button class="jeffbot-suggestion-button" type="button">His design philosophy</button>
          <button class="jeffbot-suggestion-button" type="button">His approach to prototyping</button>
        </div>
        
        <!-- Chat Thread Container -->
        <div class="jeffbot-chat-thread hidden" id="jeffbot-chat-thread" role="log" aria-live="polite" aria-label="Chat conversation"></div>
      </div>
      
      <!-- Input Field -->
      <div class="jeffbot-input-container">
        <input type="text" class="jeffbot-input" id="jeffbot-input" placeholder="Ask about Jeff" autocomplete="off">
        <button type="button" class="button-icon button-icon-primary jeffbot-input-submit" aria-label="Submit">
          <svg
            class="button-icon-svg button-icon-primary-svg"
            width="15"
            height="16"
            viewBox="0 0 15 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M6.25 16V4.67692L1.75 9.10769L0 7.38462L7.5 0L15 7.38462L13.25 9.10769L8.75 4.67692V16H6.25Z"
              fill="currentColor"
            />
          </svg>
        </button>
      </div>
    </div>
  </div>
`;
  }

  // Initialize header component
  function initHeader() {
    const body = document.body;
    if (!body) return;

    // Check if header already exists
    const existingHeader = document.querySelector('.navbar.w-nav');
    const existingSidebar = document.getElementById('jeffbot-sidebar');
    
    const headerHTML = generateHeaderHTML();
    const headerPart = headerHTML.split('<!-- JeffBot 3000 Sidebar -->')[0];
    const sidebarPart = '<!-- JeffBot 3000 Sidebar -->' + headerHTML.split('<!-- JeffBot 3000 Sidebar -->')[1];

    if (existingHeader) {
      // Replace existing header
      existingHeader.outerHTML = headerPart.trim();
      
      // Replace or add sidebar
      if (existingSidebar) {
        existingSidebar.outerHTML = sidebarPart.trim();
      } else {
        // Find where to insert sidebar (after header)
        const newHeader = document.querySelector('.navbar.w-nav');
        if (newHeader && newHeader.nextSibling) {
          newHeader.insertAdjacentHTML('afterend', sidebarPart);
        } else {
          body.insertAdjacentHTML('beforeend', sidebarPart);
        }
      }
    } else {
      // No existing header, insert both
      body.insertAdjacentHTML('afterbegin', headerHTML);
    }
    
    // Initialize gradient bar scroll after header is ready
    if (isIndexPage()) {
      setTimeout(initGradientBarScroll, 50);
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHeader);
  } else {
    // DOM already loaded
    initHeader();
  }
  
  // Fallback: ensure header is initialized even if DOMContentLoaded already fired
  // This handles cases where scripts load after DOM is ready
  if (document.readyState === 'complete') {
    setTimeout(initHeader, 100);
  }

  // Handle gradient bar sliding based on scroll position
  let gradientBarScrollInitialized = false;
  function initGradientBarScroll() {
    // Only run on index.html
    if (!isIndexPage() || gradientBarScrollInitialized) return;

    const aboutSection = document.getElementById('About');
    const contactSection = document.getElementById('Contact');
    const gradientBar = document.querySelector('.gradient-div.tab-highlight');
    
    if (!aboutSection || !contactSection || !gradientBar) {
      // Retry if elements aren't ready yet
      setTimeout(initGradientBarScroll, 100);
      return;
    }

    gradientBarScrollInitialized = true;

    function updateGradientBar() {
      const aboutRect = aboutSection.getBoundingClientRect();
      const contactRect = contactSection.getBoundingClientRect();
      const windowHeight = window.innerHeight || document.documentElement.clientHeight;
      
      // Remove all state classes first
      gradientBar.classList.remove('about', 'contact');
      
      // Check sections from bottom to top (most specific first)
      // If Contact section is in view, show Contact highlight
      if (contactRect.top <= windowHeight * 0.5) {
        gradientBar.classList.add('contact');
      }
      // Else if About section is in view, show About highlight
      else if (aboutRect.top <= windowHeight * 0.5) {
        gradientBar.classList.add('about');
      }
      // Otherwise, default to Work (no class needed)
    }

    // Update on scroll
    let ticking = false;
    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(function() {
          updateGradientBar();
          ticking = false;
        });
        ticking = true;
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    
    // Initial check
    updateGradientBar();
  }
})();

