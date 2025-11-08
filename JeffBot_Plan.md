# JeffBot 3000 Sidebar Implementation Plan

## Summary
- Add a reusable JeffBot sidebar and activator that match the Figma flows (closed `2431-166`, open `2411-42`, shell `2440-188`).
- Keep the site’s existing Webflow-exported HTML/CSS/JS stack and augment it with minimal, well-scoped custom code.
- Prioritize the structural shell, layout push behavior, and key animations; chat content arrives in a later phase.

## Assumptions & Open Question
- Plan assumes vanilla HTML/CSS/JS enhancements within the Webflow export (no bundler). Custom CSS lives at the end of `css/jeff-brydon.webflow.css` and new JS can go in a lightweight `js/jeffbot.js` referenced on every page.
- Clarifying question: should we document and adopt a specific animation helper library (e.g. GSAP, Framer Motion) or stay with native CSS/JS for this phase? Confirming this will lock in class/animation syntax.

## Work Breakdown
| Step | Task | Target Files | Interaction / QA Focus |
| --- | --- | --- | --- |
| 1 | Inventory shared header markup, identify all pages using the nav, and note existing shadows/gradients that must change. | `index.html`, `peek-pro-booking-flow.html`, `eagle-pay.html`, `jira-pricing-page.html`, `out-alive.html`, `reflektive.html`, any other HTML variants | Verify header markup parity across pages before edits. |
| 2 | Introduce global color tokens as CSS custom properties (root-level) for `grey-50` through `black`; replace hardcoded equivalents in new styles. | `css/jeff-brydon.webflow.css` | Check computed colors in dev tools to ensure tokens resolve correctly. |
| 3 | Restyle the header: remove the existing shadow element (`.shadow-div`), add the grey bottom border, and ensure z-index keeps header above sidebar. | All HTML files listed in Step 1, `css/jeff-brydon.webflow.css` | Confirm header sticks to top without shadow, new border visible on scroll. |
| 4 | Add JeffBot activator markup (sparkle button) inside the header for desktop/tablet and enqueue the asset swap on hover. Hide button on small breakpoints. | All HTML files with header, `images/jeffbot_button.svg`, `images/jeffbot_button_hover.svg`, `css/jeff-brydon.webflow.css` | Hover swap fires, button positioned per Figma, hidden via media queries on mobile. |
| 5 | Inject sidebar shell markup (closed by default) immediately after main header, including structural wrappers that allow content push and maintain accessibility landmarks. | Same HTML files, potential shared snippet if feasible | With sidebar closed, layout remains unchanged; DOM order matches accessibility expectations. |
| 6 | Author layout CSS: define sidebar width (~356px), transitions, and page content wrapper that responds to an “open” state class (e.g., `jeffbot-open`) by shrinking the main container. | `css/jeff-brydon.webflow.css` | Toggle open class in dev tools to ensure sidebar pushes content and maintains responsiveness. |
| 7 | Implement animation and state logic: create `js/jeffbot.js` (or inline script) to handle button clicks, icon rotation (+/-765°, resting at 45°), sidebar slide timings (spring vs ease), and sync open state across pages. | `js/jeffbot.js`, script tags in each HTML page | Test open/close to confirm animation durations/easings, icon rotation origin, and that header stays fixed. |
| 8 | Wire mobile hamburger menu entry (“JeffBot 3000”) to call the same toggle handler; ensure button remains hidden on mobile while menu item appears last. | Mobile nav markup inside each HTML file, `css/jeff-brydon.webflow.css`, `js/jeffbot.js` | On devices ≤768px, ensure menu item triggers sidebar, animations identical. |
| 9 | Cross-page QA: load each HTML page to confirm shared assets paths, no layout jank, and that multiple rapid toggles/screen resizes behave gracefully. | Entire `portfolio` directory | Rapid open/close, viewport resize, and scroll with sidebar open remain smooth. |

## Deliverables & Notes
- New file: `js/jeffbot.js` (unless we inline scripts per existing pattern).
- Centralized plan for later chat UI integration: leave placeholder container inside sidebar with comment for future work.
- Document any utility classes or data attributes introduced so future AI agents can extend behavior without diffing entire HTML files.

## Testing Checklist
- Desktop Chrome/Safari/Firefox open/close animations with DevTools throttling to observe easing.
- Tablet portrait check for header alignment and sidebar width.
- Mobile menu activation path, ensuring no collisions with Webflow’s built-in nav scripts.
- Accessibility pass: focus trapping intentionally deferred, but verify activator is keyboard focusable, aria-expanded toggles, and sidebar is announced when open.

