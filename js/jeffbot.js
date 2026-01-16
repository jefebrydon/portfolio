// JeffBot Sidebar Functionality
(function() {
  'use strict';

  // Initialize when DOM is ready
  function initJeffBot() {
    const sidebar = document.getElementById('jeffbot-sidebar');
    const sparkleButton = document.querySelector('.sparkle-button');
    const sparkleIcon = document.querySelector('.sparkle-icon');
    const closeButton = document.querySelector('.jeffbot-sidebar-close');
    const mobileHeaderCloseButton = document.querySelector('.jeffbot-mobile-header-close');
    const menuTrigger = document.getElementById('jeffbot-menu-trigger');
    const body = document.body;
    
    if (!sidebar || !sparkleButton) return;
    
    let isOpen = false;
    let isAnimating = false;

    // Spring animation helper (approximated with cubic-bezier)
    function springEasing(t) {
      // Spring physics approximation: stiffness = 180, damping = 14, mass = 1
      // Using cubic-bezier(0.34, 1.56, 0.64, 1) for spring feel
      return t;
    }

    // Rotate icon with spring animation (unidirectional - no oscillation)
    function rotateIcon(startRotation, endRotation, duration, callback) {
      if (!sparkleIcon) return;
      
      const rotationDiff = endRotation - startRotation;
      const isClockwise = rotationDiff > 0;
      const startTime = performance.now();
      let lastRotation = startRotation;
      
      function animate(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Spring easing function - smooth acceleration with slight overshoot, then settle
        // This creates a spring feel without oscillation
        let springProgress;
        if (progress < 1) {
          const t = progress;
          // Use cubic ease-out with slight overshoot, then settle
          // This gives spring feel without going backwards
          if (t < 0.85) {
            // Accelerate with slight overshoot
            springProgress = 1 - Math.pow(1 - t / 0.85, 3);
            springProgress = springProgress * 1.08; // 8% overshoot
          } else {
            // Settle back to final position smoothly
            const settleT = (t - 0.85) / 0.15;
            const overshootAmount = 0.08;
            springProgress = 1 + overshootAmount * (1 - settleT);
          }
          springProgress = Math.min(springProgress, 1.08);
        } else {
          springProgress = 1;
        }
        
        let currentRotation = startRotation + (rotationDiff * springProgress);
        
        // CRITICAL: Ensure rotation only moves in the correct direction
        // This prevents any backwards movement during overshoot/settle
        if (isClockwise) {
          // For clockwise, rotation should never decrease
          currentRotation = Math.max(currentRotation, lastRotation);
        } else {
          // For counterclockwise, rotation should never increase
          currentRotation = Math.min(currentRotation, lastRotation);
        }
        
        lastRotation = currentRotation;
        sparkleIcon.style.transform = `rotate(${currentRotation}deg)`;
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          if (callback) callback();
        }
      }
      
      requestAnimationFrame(animate);
    }

    function openSidebar() {
      if (isAnimating || isOpen) return;
      isAnimating = true;
      isOpen = true;

      // Add classes
      sidebar.classList.add('is-open');
      body.classList.add('sidebar-open');
      body.classList.remove('sidebar-closing');
      sparkleButton.classList.add('is-open');
      sparkleButton.classList.remove('is-closing');

      // Rotate icon +765° clockwise (spring animation, 0.8s)
      // Keep it at 765° (which visually equals 45°) - don't normalize!
      rotateIcon(0, 765, 800, function() {
        // Keep the full rotation value, don't normalize to 45°
        // The browser will display 765° as 45° visually anyway
        sparkleIcon.style.transform = 'rotate(765deg)';
        isAnimating = false;
      });

      // Show close button on mobile (CSS handles visibility)
      if (window.innerWidth <= 767 && closeButton) {
        closeButton.style.display = 'flex';
      }

      // Auto-focus input field when sidebar opens to show Selected state
      const jeffbotInput = document.getElementById('jeffbot-input');
      if (jeffbotInput) {
        // Small delay to ensure sidebar animation has started
        setTimeout(function() {
          jeffbotInput.focus();
        }, 100);
      }
    }

    function closeSidebar() {
      if (isAnimating || !isOpen) return;
      isAnimating = true;
      isOpen = false;

      // Remove is-open class IMMEDIATELY so sidebar starts sliding out right away
      sidebar.classList.remove('is-open');
      
      // Add closing classes
      body.classList.remove('sidebar-open');
      body.classList.add('sidebar-closing');
      sparkleButton.classList.remove('is-open');
      sparkleButton.classList.add('is-closing');

      // Rotate icon -765° counterclockwise (spring animation, 0.8s)
      // Start from current rotation (765°) and go to 0°
      // This runs in parallel with the sidebar slide-out
      rotateIcon(765, 0, 800, function() {
        // Keep it at 0°
        sparkleIcon.style.transform = 'rotate(0deg)';
        sparkleButton.classList.remove('is-closing');
        isAnimating = false;
      });

      // Hide close button on mobile
      if (closeButton) {
        closeButton.style.display = 'none';
      }
    }

    function toggleSidebar() {
      if (isOpen) {
        closeSidebar();
      } else {
        openSidebar();
      }
    }

    // Event listeners
    if (sparkleButton) {
      sparkleButton.addEventListener('click', function(e) {
        e.preventDefault();
        toggleSidebar();
      });
    }

    if (closeButton) {
      closeButton.addEventListener('click', function(e) {
        e.preventDefault();
        closeSidebar();
      });
    }

    if (mobileHeaderCloseButton) {
      mobileHeaderCloseButton.addEventListener('click', function(e) {
        e.preventDefault();
        closeSidebar();
      });
    }

    if (menuTrigger) {
      menuTrigger.addEventListener('click', function(e) {
        e.preventDefault();
        toggleSidebar();
        // Close hamburger menu if open
        const menuButton = document.querySelector('.menu-button-2');
        if (menuButton && menuButton.classList.contains('w--open')) {
          menuButton.click();
        }
      });
    }

    // Handle hover state - maintain rotation when open
    if (sparkleButton && sparkleIcon) {
      const defaultSrc = 'images/JeffBot_button.svg';
      const hoverSrc = 'images/JeffBot_button_hover.svg';
      
      sparkleButton.addEventListener('mouseenter', function() {
        if (isOpen) {
          // When open, maintain 765° rotation (visually 45°)
          sparkleIcon.src = hoverSrc;
          sparkleIcon.style.transform = 'rotate(765deg)';
        } else {
          sparkleIcon.src = hoverSrc;
        }
      });
      
      sparkleButton.addEventListener('mouseleave', function() {
        if (isOpen) {
          // When open, maintain 765° rotation (visually 45°)
          sparkleIcon.src = defaultSrc;
          sparkleIcon.style.transform = 'rotate(765deg)';
        } else {
          sparkleIcon.src = defaultSrc;
          sparkleIcon.style.transform = 'rotate(0deg)';
        }
      });
    }

    // Prevent main page scroll when hovering over sidebar (desktop) or when sidebar is open (mobile)
    if (sidebar) {
      // Desktop: handle hover to prevent scroll only when hovering over sidebar
      sidebar.addEventListener('mouseenter', function() {
        if (window.innerWidth >= 768) {
          body.classList.add('sidebar-hovered');
        }
      });
      
      sidebar.addEventListener('mouseleave', function() {
        body.classList.remove('sidebar-hovered');
      });
      
      // Handle window resize - remove hover class if switching to mobile
      window.addEventListener('resize', function() {
        if (window.innerWidth < 768) {
          body.classList.remove('sidebar-hovered');
        }
      });
      
      // Mobile: prevent scroll when sidebar is open (handled by CSS with body.sidebar-open)
      // The openSidebar() and closeSidebar() functions already add/remove 'sidebar-open' class
    }

    // ============================================
    // JeffBot Chat Functionality
    // ============================================

    // Configuration
    const config = window.JEFFBOT_CONFIG || {};
    const assistantId = config.assistantId;
    const apiBaseUrl = config.apiBaseUrl || 'http://localhost:3001/api';
    
    // Chat state
    let currentThreadId = null;
    let isLoading = false;
    let errorTimeout = null;
    
    // DOM elements
    const jeffbotInput = document.getElementById('jeffbot-input');
    const submitButton = document.querySelector('.jeffbot-input-submit');
    const suggestionButtons = document.querySelectorAll('.jeffbot-suggestion-button');
    const chatThread = document.getElementById('jeffbot-chat-thread');
    const contentWrapper = document.querySelector('.jeffbot-content-wrapper');
    const ariaLive = document.getElementById('jeffbot-aria-live') || createAriaLiveRegion();
    
    // Suggestion button to question mapping
    const suggestionMap = {
      "🧩  Jeff's designer shape": "What is Jeff's designer shape?",
      "🤖  AI in his design process": "How does Jeff use AI in his design process?",
      "🧪  His design philosophy": "What is his design philosophy?"
    };
    
    // Load conversation from sessionStorage
    function loadConversation() {
      try {
        const saved = sessionStorage.getItem('jeffbot_conversation');
        if (saved) {
          const data = JSON.parse(saved);
          currentThreadId = data.threadId;
          
          // Restore messages if any
          if (data.messages && data.messages.length > 0) {
            showChatThread();
            data.messages.forEach(msg => {
              addMessageToThread(msg.text, msg.isUser, false);
            });
          }
        }
      } catch (error) {
        console.error('Error loading conversation:', error);
      }
    }
    
    // Save conversation to sessionStorage
    function saveConversation() {
      try {
        const messages = Array.from(chatThread.querySelectorAll('.jeffbot-message')).map(msgEl => {
          const isUser = msgEl.classList.contains('user');
          const text = msgEl.querySelector('.jeffbot-message-content').textContent;
          return { text, isUser };
        });
        
        sessionStorage.setItem('jeffbot_conversation', JSON.stringify({
          threadId: currentThreadId,
          messages: messages
        }));
      } catch (error) {
        console.error('Error saving conversation:', error);
      }
    }
    
    // Create ARIA live region for screen readers
    function createAriaLiveRegion() {
      const region = document.createElement('div');
      region.id = 'jeffbot-aria-live';
      region.className = 'jeffbot-aria-live';
      region.setAttribute('role', 'status');
      region.setAttribute('aria-live', 'polite');
      region.setAttribute('aria-atomic', 'true');
      document.body.appendChild(region);
      return region;
    }
    
    // Show chat thread and hide welcome message
    function showChatThread() {
      if (chatThread) {
        chatThread.classList.remove('hidden');
      }
      if (contentWrapper) {
        contentWrapper.classList.add('has-messages');
      }
    }
    
    // Create message element
    function createMessageElement(text, isUser) {
      const messageDiv = document.createElement('div');
      messageDiv.className = 'jeffbot-message ' + (isUser ? 'user' : 'jeffbot');
      messageDiv.setAttribute('role', 'listitem');
      
      const contentDiv = document.createElement('div');
      contentDiv.className = 'jeffbot-message-content';
      contentDiv.textContent = text;
      
      messageDiv.appendChild(contentDiv);
      return messageDiv;
    }
    
    // Create loader element
    function createLoaderElement() {
      const loaderDiv = document.createElement('div');
      loaderDiv.className = 'jeffbot-loader';
      loaderDiv.setAttribute('role', 'status');
      loaderDiv.setAttribute('aria-label', 'Loading response');
      
      for (let i = 0; i < 3; i++) {
        const dot = document.createElement('div');
        dot.className = 'jeffbot-loader-dot';
        loaderDiv.appendChild(dot);
      }
      
      return loaderDiv;
    }
    
    // Create error message element
    function createErrorMessage(text) {
      const errorDiv = document.createElement('div');
      errorDiv.className = 'jeffbot-error-message';
      errorDiv.setAttribute('role', 'alert');
      
      const contentDiv = document.createElement('div');
      contentDiv.className = 'jeffbot-message-content';
      contentDiv.textContent = 'Error: ' + text;
      
      errorDiv.appendChild(contentDiv);
      return errorDiv;
    }
    
    // Remove loader from chat thread
    function removeLoader() {
      const loader = chatThread.querySelector('.jeffbot-loader');
      if (loader) {
        loader.remove();
      }
    }
    
    // Remove error messages
    function removeErrors() {
      const errors = chatThread.querySelectorAll('.jeffbot-error-message');
      errors.forEach(err => err.remove());
      if (errorTimeout) {
        clearTimeout(errorTimeout);
        errorTimeout = null;
      }
    }
    
    // Scroll chat to bottom
    function scrollToBottom() {
      if (chatThread && chatThread.parentElement) {
        const scrollableArea = chatThread.closest('.jeffbot-scrollable-area');
        if (scrollableArea) {
          scrollableArea.scrollTop = scrollableArea.scrollHeight;
        }
      }
    }
    
    // Disable suggestion buttons (change color to gray-200)
    function disableSuggestionButtons() {
      const buttons = document.querySelectorAll('.jeffbot-suggestion-button');
      buttons.forEach(function(button) {
        button.disabled = true;
        button.style.color = 'var(--grey-200)';
      });
    }
    
    // Enable suggestion buttons (restore original color)
    function enableSuggestionButtons() {
      const buttons = document.querySelectorAll('.jeffbot-suggestion-button');
      buttons.forEach(function(button) {
        button.disabled = false;
        button.style.color = ''; // Reset to default CSS color
      });
    }

    // Sanitize message text (e.g., remove citation/source markers like )
    function sanitizeMessageText(text) {
      if (!text) return '';
      // Remove any content inside full-width brackets 【...】
      return text.replace(/【[^】]*】/g, '');
    }
    
    // Add message to chat thread
    function addMessageToThread(text, isUser, shouldSave = true) {
      if (!chatThread) return;
      
      const cleanText = sanitizeMessageText(text);
      
      showChatThread();
      removeLoader();
      removeErrors();
      
      const messageEl = createMessageElement(cleanText, isUser);
      chatThread.appendChild(messageEl);
      
      // Announce to screen readers
      if (ariaLive) {
        ariaLive.textContent = (isUser ? 'You said: ' : 'JeffBot said: ') + cleanText;
        setTimeout(() => {
          ariaLive.textContent = '';
        }, 1000);
      }
      
      if (shouldSave) {
        saveConversation();
      }
      
      scrollToBottom();
    }
    
    // Validate input
    function validateInput(text) {
      const trimmed = text.trim();
      if (!trimmed) {
        return { valid: false, error: 'Please enter a message' };
      }
      if (trimmed.length > 2000) {
        return { valid: false, error: 'Message is too long (max 2000 characters)' };
      }
      return { valid: true, text: trimmed };
    }
    
    // Send message to assistant
    async function sendMessageToAssistant(messageText) {
      if (isLoading) return;
      if (!assistantId) {
        addMessageToThread('Error: Assistant ID not configured. Please check your configuration.', false);
        return;
      }
      
      const validation = validateInput(messageText);
      if (!validation.valid) {
        // Show validation error briefly
        const errorEl = createErrorMessage(validation.error);
        if (chatThread) {
          chatThread.appendChild(errorEl);
          errorTimeout = setTimeout(() => {
            errorEl.remove();
          }, 3000);
        }
        return;
      }
      
      isLoading = true;
      
      // Disable input and submit button
      if (jeffbotInput) {
        jeffbotInput.disabled = true;
      }
      if (submitButton) {
        submitButton.disabled = true;
      }
      
      // Disable suggestion buttons
      disableSuggestionButtons();
      
      // Show loader
      if (chatThread) {
        showChatThread();
        const loader = createLoaderElement();
        chatThread.appendChild(loader);
        scrollToBottom();
      }
      
      // Prepare request
      const requestBody = {
        message: validation.text,
        assistantId: assistantId
      };
      
      if (currentThreadId) {
        requestBody.threadId = currentThreadId;
      }
      
      // Make API call with timeout and retry
      let retries = 1;
      let lastError = null;
      
      while (retries >= 0) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 60000);
          
          const response = await fetch(apiBaseUrl + '/chat', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody),
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
          }
          
          const data = await response.json();
          
          // Success
          removeLoader();
          currentThreadId = data.threadId;
          
          if (data.response) {
            addMessageToThread(data.response, false);
          } else {
            addMessageToThread('Sorry, I didn\'t receive a response. Please try again.', false);
          }
          
          // Re-enable input
          if (jeffbotInput) {
            jeffbotInput.disabled = false;
            jeffbotInput.focus();
          }
          if (submitButton) {
            submitButton.disabled = false;
          }
          
          // Re-enable suggestion buttons
          enableSuggestionButtons();
          
          isLoading = false;
          return;
          
        } catch (error) {
          lastError = error;
          
          // Retry on network errors only
          if (retries > 0 && (error.name === 'TypeError' || error.name === 'AbortError')) {
            retries--;
            await new Promise(resolve => setTimeout(resolve, 1000));
            continue;
          }
          
          break;
        }
      }
      
      // Error handling
      removeLoader();
      const errorMessage = lastError.message || 'Failed to get response. Please try again.';
      addMessageToThread(errorMessage, false);
      
      // Re-enable input
      if (jeffbotInput) {
        jeffbotInput.disabled = false;
        jeffbotInput.focus();
      }
      if (submitButton) {
        submitButton.disabled = false;
      }
      
      // Re-enable suggestion buttons
      enableSuggestionButtons();
      
      isLoading = false;
    }
    
    // Handle suggestion button clicks
    if (suggestionButtons.length > 0) {
      suggestionButtons.forEach(function(button) {
        button.addEventListener('click', function() {
          const buttonText = button.textContent.trim();
          const fullQuestion = suggestionMap[buttonText] || buttonText;
          
          // Disable remaining suggestion buttons before removing clicked one
          disableSuggestionButtons();
          
          // Remove only this clicked button immediately
          button.remove();
          
          // Hide suggestions container if no buttons remain
          const suggestionsContainer = document.querySelector('.jeffbot-suggestions');
          if (suggestionsContainer) {
            const remainingButtons = suggestionsContainer.querySelectorAll('.jeffbot-suggestion-button');
            if (remainingButtons.length === 0) {
              suggestionsContainer.style.display = 'none';
            }
          }
          
          // Immediately display user message
          addMessageToThread(fullQuestion, true);
          
          // Send to assistant
          sendMessageToAssistant(fullQuestion);
        });
      });
    }
    
    // Handle input field submission
    function handleInputSubmit() {
      if (!jeffbotInput || isLoading) return;
      
      const message = jeffbotInput.value;
      if (!message.trim()) return;
      
      // Display user message immediately
      addMessageToThread(message, true);
      
      // Clear input
      jeffbotInput.value = '';
      jeffbotInput.dispatchEvent(new Event('input', { bubbles: true }));
      
      // Send to assistant (will disable buttons inside if processing starts)
      sendMessageToAssistant(message);
    }
    
    // Handle Enter key in input field
    if (jeffbotInput) {
      jeffbotInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleInputSubmit();
        }
      });
    }
    
    // Handle submit button click
    if (submitButton) {
      submitButton.addEventListener('click', function(e) {
        e.preventDefault();
        handleInputSubmit();
      });
    }
    
    // Load conversation on init
    loadConversation();
  }

  // Header slide-down animation on page load
  function initHeaderAnimation() {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
      // Trigger animation after a brief delay to ensure smooth rendering
      requestAnimationFrame(function() {
        navbar.classList.add('header-loaded');
      });
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      initHeaderAnimation();
      initJeffBot();
    });
  } else {
    // DOM already loaded
    initHeaderAnimation();
    initJeffBot();
  }
})();




