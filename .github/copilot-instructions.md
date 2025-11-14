## Copilot / AI agent instructions — Proyecto_Corte1-DAW

This repo is a static frontend catalog (HTML/CSS/JS) for a wellness services site. Use this file to get productive quickly: where to look, conventions to follow, and concrete examples of DOM and network patterns you will edit.

High-level architecture
- Static pages only: `index.html` is the main entry; `cart.html` and `desarrolladores.html` are auxiliary pages. There is no server code in this repo.
- Client-side JS handles product loading, UI state, and cart/auth interactions. Inspect `js/js_index.js`, `js/js_cart.js`, and `js/login.js` to understand data flows.

Where to start (order)
1. `index.html` — layout, modals, and the DOM nodes scripts expect (IDs/classes). Key nodes: `#container_citas` (services list), `.container-cart-products` (floating cart), `#contador-productos` (cart count), `#loginModal` / `#registerModal` (auth modals), `#btnProbar` (protected-route tester).
2. `js/js_index.js` — how services are fetched and rendered (comments mention Google Sheets). Follow fetch logic and how each product element is created.
3. `js/login.js` — login/register UI behavior, how auth state is stored and how `#btnProbar` triggers protected calls.
4. `js/js_cart.js` & `cart.html` — cart management, total calculation and the `Pagar` flow (query params used to send order).

Important patterns and conventions (do not break these)
- Cache-busting: script tags are versioned using query params (e.g., `js/js_index.js?v=3`). When updating JS, increment the `?v=` value in HTML to force clients to load the newest file.
- Visibility toggles use the `hidden` or `hidden-cart` classes. JS shows/hides elements by adding/removing these classes — preserve class names and element IDs.
- DOM identifiers are stable and referenced directly by scripts. Common examples:
  - `#container_citas` — container where `js_index` injects service cards.
  - `.container-cart-products`, `.row-product`, `.cart-total`, `.cart-empty` — cart structure used by `js_cart`.
  - `#loginModal`, `#registerModal`, `#loginForm`, `#registerForm` — auth UI elements used by `login.js`.
- External resources included via CDN: Ionicons (see `index.html`) and embedded Google Maps iframes. Avoid removing or changing these without testing.

Integration points / external calls
- `js/js_index.js` contains logic to fetch service data (comments indicate Google Sheets). Look there for the exact URL or API key usage.
- `js/login.js` may attempt protected endpoints (button `#btnProbar`) — those calls target external APIs (not present in this repo). When mocking or testing locally, stub `fetch` or point to a dev endpoint.

Developer workflows (how a human runs and tests the site)
- No build step; to preview the site run a static server from repo root. Examples:
```bash
# quick with npx
npx http-server . -p 8080

# or if you use npm global
http-server . -p 8080
```
- Alternatively use VS Code Live Server extension and open `index.html`.
- When changing JS/CSS, bump `?v=` in the HTML `<script>` or reload with cache disabled in the browser.

How AI edits should behave
- Preserve IDs/classes and the exact HTML nodes referenced by JS. If you rename an ID, update every JS reference in the repo.
- For UI changes, keep CSS files under `css/` and follow existing naming schemes (`style_index.css`, `login.css`, `style_cart.css`).
- For adding features that depend on an external API, prefer to add a small configuration area (e.g., a top-level `config.js` with constants) rather than hardcoding URLs into many files.

Examples (precise strings to look for)
- Service container: `id="container_citas"` (in `index.html`).
- Cart counter span: `id="contador-productos"`.
- Script cache-busting example: `js/js_index.js?v=3`.
- Auth tester button: `id="btnProbar"` (used to check protected endpoints from `index.html`).

When something is unclear
- If you cannot find an API endpoint or credential referenced in the JS, assume it is environment-specific and add a comment TODO with a clear example placeholder and tests that gate the behavior (e.g., mock fetch with sample JSON).

Docs & references
- README.md contains a short project description and purpose — it confirms this is a static catalog that sends orders via query params.

If you edit this file
- Keep it short and factual. Include exact file paths or example lines you edited so reviewers can quickly verify the change.

---
If anything above is missing or you want more detail on network endpoints or test examples, tell me which file or flow you want me to expand and I will update this doc.
