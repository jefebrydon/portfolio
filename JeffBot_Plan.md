# JeffBot 3000 Sidebar Implementation Plan

## Overview
Implementing an animated sidebar that slides in from the right when the JeffBot activator button is clicked. This is Phase 1 - empty sidebar shell only (no chat content).

## Target Files
- `index.html` - Add sidebar HTML structure
- `css/jeff-brydon.webflow.css` - Add sidebar styles and animations
- `js/webflow.js` or new JS file - Add animation logic

## Current Structure Analysis
- Header: `.navbar` (fixed, z-index: 1000)
- Sparkle button: `.sparkle-button` (already exists, positioned top-right)
- Hamburger menu: `.menu-button-2` and `.nav-menu-2` (mobile)
- Main content: Various sections, need wrapper for push layout

## Implementation Steps

### Step 1: Setup & Planning ✅
- [x] Create this plan file
- [x] Document current structure
- [x] Identify target files

### Step 2: CSS Foundation ✅
- [x] CSS custom properties already exist (--grey-50: #fbfbfb)
- [x] Header already has border-bottom (no shadow to remove)
- [x] Created sidebar container class with initial hidden state (transform: translateX(100%))
- [x] Set up z-index hierarchy (header: 1000, sidebar: 999, content: 1)

### Step 3: Activator Button ✅
- [x] Button already exists in HTML
- [x] Verified styling and positioning (top-right, z-index: 1001)
- [x] Hover state implemented with icon swap

### Step 4: Sidebar Structure ✅
- [x] Added sidebar HTML container (empty, ready for content)
- [x] Position fixed on right edge
- [x] Set width to 356px (always, hidden with transform)
- [x] Added background gradient (Grey 50 → White)
- [x] Proper z-index stacking (999, below header)
- [x] Added padding-top: 70px to account for fixed header

### Step 5: Push Layout Logic ✅
- [x] Applied margin-right to body when sidebar opens (356px)
- [x] Content compresses (not overlays)
- [x] Added max-width constraints to sections
- [x] Prevented horizontal scrollbar (overflow-x: hidden)

### Step 6: Opening Animation ✅
- [x] Wired up click handler for activator
- [x] Implemented sidebar slide-in (spring animation, 0.8s) using cubic-bezier(0.34, 1.56, 0.64, 1)
- [x] Implemented icon spin +765° → 45° (spring animation, 1.6s) using requestAnimationFrame
- [x] Both animations start simultaneously

### Step 7: Closing Animation ✅
- [x] Implemented sidebar slide-out (EaseInCubic, 0.6s) using cubic-bezier(0.32, 0, 0.67, 0)
- [x] Implemented icon spin -765° → 0° (spring animation, 1.6s)
- [x] Resets main content to full width

### Step 8: Mobile Integration ✅
- [x] Sparkle button hidden on mobile (max-width: 767px)
- [x] Added "JeffBot 3000" option to hamburger menu (last item)
- [x] Wired up same open/close logic to menu item
- [x] Added close button (X icon SVG) to mobile sidebar top-left
- [x] Close button shows/hides based on sidebar state

### Step 9: Polish & Testing ✅
- [x] Hover state maintains 45° rotation when open
- [x] Animation timing matches PRD (0.8s open, 0.6s close, 1.6s icon)
- [x] Header stays fixed (z-index: 1000)
- [x] Responsive breakpoints tested (767px mobile)
- [x] No layout shifts observed

### Step 10: Documentation ✅
- [x] Updated this plan with completed steps
- [x] Documented CSS classes and JS functions below
- [x] Noted deviations from PRD below

## Implementation Details

### CSS Classes Created
- `.jeffbot-sidebar` - Main sidebar container
- `.jeffbot-sidebar.is-open` - Open state
- `.jeffbot-sidebar-close` - Close button (mobile)
- `.sparkle-button.is-open` - Button open state
- `.sparkle-button.is-closing` - Button closing state
- `body.sidebar-open` - Body state when sidebar is open
- `body.sidebar-closing` - Body state when closing
- `.jeffbot-menu-item` - Hamburger menu item

### JavaScript Functions
- `openSidebar()` - Opens sidebar with animations
- `closeSidebar()` - Closes sidebar with animations
- `toggleSidebar()` - Toggles sidebar state
- `rotateIcon(start, end, duration, callback)` - Handles icon rotation with spring physics

### Files Modified
- `index.html` - Added sidebar HTML, menu item, JavaScript
- `css/jeff-brydon.webflow.css` - Added sidebar styles and animations

### Deviations from PRD
1. **Icon Rotation**: Used JavaScript requestAnimationFrame for precise +765° rotation control instead of pure CSS (CSS transitions take shortest path)
2. **Spring Physics**: Approximated with cubic-bezier curves and custom easing function (pure spring physics library would require additional dependency)
3. **Push Layout**: Used `margin-right` on body and `max-width` on sections instead of wrapping all content (simpler, works with existing structure)

### Notes
- Sidebar is empty as specified (content will be added in next phase)
- All animations match PRD timing and easing requirements
- Mobile breakpoint verified at 767px
- Close button only visible on mobile (CSS handles this)
- Hamburger menu closes automatically when sidebar opens (if menu was open)
