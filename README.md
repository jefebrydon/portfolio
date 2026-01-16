# jeff-brydon

## Stack Overview
- Built from a Webflow export; the root page is `index.html` with companion case-study pages (`peek-pro-booking-flow.html`, `reflektive.html`, `eagle-pay.html`, `jira-pricing-page.html`, etc.).
- Styling lives in `css/normalize.css`, `css/webflow.css`, and `css/jeff-brydon.webflow.css`; assets are under `images/` and `videos/`.
- Global scripts include the Google WebFonts loader and Webflow runtime helpers injected in the `<head>`, plus the Google Analytics snippet (`UA-173352983-1`).
- Additional scripts at the end of `index.html` load jQuery 3.5.1 from Webflow CDN and Webflow's `js/webflow.js` interactions runtime.

## Runtime Behaviors To Preserve
- A `DOMContentLoaded` handler intercepts clicks on `peek-pro-booking-flow.html` links to show a password modal before redirecting.
- The same handler wires up modal submit/cancel/escape/outside-click logic; keep IDs (`password-modal`, `modal-password`, etc.) intact when editing the modal markup.
- A secondary `DOMContentLoaded` listener fades in the hero background video once it can play; maintain the `opacity` transition on the video element when changing hero media.

## Working With This Repo
- Treat `portfolio/` as the project root when running git commands, builds, or local servers.
- Keep page-specific inline scripts colocated in their HTML files unless you have a clear reason to extract them; other pages reuse the modal logic.
- The custom domain lives in `CNAME` (`www.jeffbrydon.com`); update it if deploying to a different host.
- When adding new assets, follow existing naming conventions in `images/` and `videos/`, and ensure new videos include poster frames for Webflow background video elements.

## JeffBot Integration
- JeffBot sidebar uses OpenAI's Assistants API with file search (RAG) functionality.
- **Frontend**: the chat UI is rendered on all portfolio pages and runs entirely in the browser (hosted on GitHub Pages at `www.jeffbrydon.com`).
- **Backend**: OpenAI calls are proxied through a serverless function deployed on Vercel at `/api/chat` in this repo (`api/chat.js`); the frontend talks to it via HTTPS.
- **Secrets**: `OPENAI_API_KEY` and `ASSISTANT_ID` are stored as environment variables in Vercel (Project → Settings → Environment Variables) and **never** exposed to the browser.
- **Local development**: a separate Express server for JeffBot lives in `jeffbot_rag/server.js` and uses a local `.env` (see `jeffbot_rag/README.md` for setup); the browser points to `http://localhost:3001/api` when running locally.
- **Production config**: `js/jeffbot-config.js` detects `localhost` for dev; otherwise it calls the Vercel deployment URL (e.g. `https://portfolio-six-nu-9myb2s6fia.vercel.app/api`) so the GitHub Pages frontend can use the Vercel backend without DNS changes.
- Chat conversations persist in `sessionStorage` for the duration of the browser session.
