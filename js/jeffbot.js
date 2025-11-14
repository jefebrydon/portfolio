// JeffBot Sidebar Functionality
(function() {
  'use strict';

  // Initialize when DOM is ready
  function initJeffBot() {
    const sidebar = document.getElementById('jeffbot-sidebar');
    const sparkleButton = document.querySelector('.sparkle-button');
    const sparkleIcon = document.querySelector('.sparkle-icon');
    const closeButton = document.querySelector('.jeffbot-sidebar-close');
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

      // Rotate icon +765° clockwise (spring animation, 1.6s)
      // Keep it at 765° (which visually equals 45°) - don't normalize!
      rotateIcon(0, 765, 1600, function() {
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

      // Rotate icon -765° counterclockwise (spring animation, 1.6s)
      // Start from current rotation (765°) and go to 0°
      // This runs in parallel with the sidebar slide-out
      rotateIcon(765, 0, 1600, function() {
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

    // JeffBot Sidebar Interactive Functionality
    const jeffbotInput = document.getElementById('jeffbot-input');
    const suggestionButtons = document.querySelectorAll('.jeffbot-suggestion-button');

    // Handle suggestion button clicks
    if (suggestionButtons.length > 0 && jeffbotInput) {
      suggestionButtons.forEach(function(button) {
        button.addEventListener('click', function() {
          const buttonText = button.textContent.trim();
          jeffbotInput.value = buttonText;
          jeffbotInput.focus();
          // Trigger input event to update filled state styling
          jeffbotInput.dispatchEvent(new Event('input', { bubbles: true }));
        });
      });
    }

    // Handle Enter key in input field (prevent default, no submission)
    if (jeffbotInput) {
      jeffbotInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          // No backend functionality yet - just prevent form submission
        }
      });
    }
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

