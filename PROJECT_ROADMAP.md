# ARoom — Project Roadmap & Honest Self-Assessment

> A self-assessment of where ARoom is today, what's missing, what could be added next, and where it could go in the long run.
> Written so you can use it for your own planning **and** to answer the inevitable "what's next?" defense question.
>
> Tone: honest. Not a sales pitch. Examiners respect students who know exactly what their project does and doesn't do.

---

## Table of Contents

1. [Current State — What Works](#1-current-state--what-works)
2. [What's Missing or Broken](#2-whats-missing-or-broken)
3. [What's Possible to Add (achievable improvements)](#3-whats-possible-to-add-achievable-improvements)
4. [Future Work (research / long-term vision)](#4-future-work-research--long-term-vision)
5. [Defense Talking Points](#5-defense-talking-points)

---

## 1. Current State — What Works

These are the features that work end-to-end today. Everything in this list can be demonstrated live without surprises.

### Authentication & user accounts
- **Registration with email verification** — sign up sends a 6-digit code by email, code verifies the account, then the user sets a password.
- **Login with JWT** — username + password returns a signed JWT (RS256) that the frontend stores in localStorage and sends with every request.
- **Logout** — clears the token from localStorage and removes the role.
- **Auto-expiry** — `isAuthenticated()` decodes the JWT client-side and logs the user out when `exp` passes.
- **Role-based route guards** — `customer_required`, `admin_required`, `accountant_required`, `marketing_manager_required`, `stock_manager_required`, `deliveryman_required` all enforce roles on the backend.
- **Admin user CRUD** — admins can list, create, edit, and delete users.

### Products & catalog
- **Product list page** — fetches `/api/products`, renders a grid of `ProductCard` components.
- **Product detail page** — full product data, color variants, price, images, embeds the 3D viewer.
- **Search** — `/search?keyword=...` searches by name and description (case-insensitive Python string match).
- **Admin search-users** — case-insensitive ILIKE on username/email.

### 3D viewer
- **3D preview on the product detail page** — `<model-viewer>` loads `sofa.glb`, the user can rotate, zoom, see shadows, and the model auto-rotates when idle.
- **Color swatches** — clicking a swatch updates the model's base color in real time via the PBR material API.
- **AR button gate** — products marked `able_ar=true` show the "View in AR" button; others show 3D preview only.

### AR mode
- **Android AR via Scene Viewer** — `<model-viewer>` triggers a Google Play Services for AR intent and launches the model in the user's camera view.
- **WebXR fallback** — if Chrome on Android supports it, AR runs inside the browser tab.
- **Real-world scale** — `ar-scale="fixed"` ensures the model appears at correct meters in the user's room.

### Cart & checkout
- **Add / update / remove cart items** — backed by the `Cart` and `CartItems` tables.
- **Checkout flow** — `CheckoutPage.jsx` collects shipping info and creates an `Orders` row plus `OrderItems`.
- **Order history** — `HistoryPage.jsx` lists past orders for the logged-in user.
- **Tracking page** — `TrackingPage.jsx` shows delivery status pulled from the `OrderItems.status` column.

### Favorites
- **Heart-to-favorite** — `ProductCard` and `ProductPage` toggle favorite state via `POST /favorites` / `DELETE /favorites/:id`.
- **Favorite page** — `FavoritePage.jsx` lists every product the user has hearted.

### Chatbot (Roomie)
- **Lamp mascot** — animated SVG with eye-follow, blinking, jump-on-click, and a delayed greeting bubble.
- **Chat panel** — opens on click; messages render with role-based styling; quick-reply chips appear before the user's first message.
- **Three contextual prompts** — `before_ar`, `during_ar`, `after_ar` change Roomie's behavior depending on the page.
- **Catalog injection** — the entire `products.json` is included in the system prompt so Roomie knows what we sell.
- **Typing indicator** — bouncing dots while waiting for the API response.
- **Graceful error fallback** — network or backend failures show a polite error in the chat instead of crashing.

### Admin dashboards (5 roles)
- **Admin** — Accounts, Complaints, Configuration, Engagements, Report, Validation.
- **Stock Manager** — ProductCatalog (CRUD products), AR (toggle `able_ar`), Returns, Delivery, Overview.
- **Marketing Manager** — Campaigns, Promotions, Newsletters, Blog.
- **Accountant** — own dashboard.
- **Delivery Man** — own dashboard.
- **Returns endpoint** — `/api/returns` returns all canceled order items joined with users, products, and the first product image.
- **Stats endpoint** — `/stats` aggregates orders and users by day.

### Infrastructure
- **CORS** — configured for `localhost:5173`, `localhost:5174`, and `aroom.com`.
- **Static file serving** — uploaded product images served from `/static/...`.
- **Auto-create tables** — `models.Base.metadata.create_all()` runs on startup.
- **Manual migration script** — `migrate.py` adds missing columns and enum values when the schema changes.

---

## 2. What's Missing or Broken

Brutal honesty. Three categories: demo-blocking, functional gaps, and code-quality issues.

### 2.A — Demo-Blocking Issues
Things that could fail or look bad during a live defense demo.

| # | File | Issue | Fix effort |
|---|------|-------|------------|
| 1 | `frontend/public/models/` | **Only one `.glb` file (`sofa.glb`).** Every product on the site uses the same sofa model. If you click two different products in front of the jury, both will look identical. | 1-2 hours per product if free models are available; otherwise 1-2 days to create from scratch |
| 2 | `frontend/public/models/` | **No `.usdz` files at all.** If anyone on the panel has an iPhone and taps "View in AR," AR Quick Look will launch and immediately fail to load. | 30 min per model using Apple's `usdzconvert` or Reality Converter |
| 3 | `frontend/src/components/ChatWidget/ChatWidget.jsx` line 212 | **Hardcoded `apiUrl = "http://localhost:8000/api/chat"`.** If the backend runs on a different port or host on demo day (or if you deploy), the chatbot silently breaks. | 5 min — replace with `import.meta.env.VITE_API_URL` |
| 4 | 10 frontend files (HomePage, CartPage, ProductPage, ProfilePage, FavoritePage, stock manager pages, ChatWidget, CircularImage) | **Same hardcoded `localhost:8000` problem in 10 places.** Anything that runs outside dev breaks. | 1-2 hours to centralize through `services/api.js` |
| 5 | `backend/.env` (assumed) | **`GROQ_API_KEY` must be present and valid.** If it expires or is missing on demo day, Roomie returns "Sorry, something went wrong" for every message. | 5 min to verify; add a startup check that fails fast |
| 6 | `backend/keys/private.pem`, `public.pem` | **Required at startup.** If these aren't generated on the demo machine, the backend crashes on import. | 1 min — `python generate_keys.py` |
| 7 | Email verification flow | **Requires SMTP credentials.** If the SMTP server in `email_utils.py` is down or rate-limited, new sign-ups stall waiting for a code. | Bypass risk by pre-creating a verified demo account |
| 8 | `<model-viewer>` script (loaded from unpkg CDN in `frontend/index.html`) | **External CDN dependency.** If the demo room's wifi blocks unpkg.com (some campus networks do), the entire 3D viewer disappears with no warning. | 1 hour — install `@google/model-viewer` via npm and import locally |

### 2.B — Functional Gaps
Features that exist in the UI but don't fully work, or features that should exist but don't.

| File / Area | Issue | 1-sentence fix |
|-------------|-------|----------------|
| `frontend/public/models/` | Only `sofa.glb` exists; iOS AR has no `.usdz`. | Source or convert real `.glb` + `.usdz` per product. |
| Color swatches on `ProductCard.jsx` vs. `ProductViewer.jsx` | The card may show a different default color than the model loads with. | Pass a `defaultVariant` index and apply it on viewer mount. |
| `<model-viewer>` | No `poster` (placeholder image) attribute. While the `.glb` loads, the canvas is blank. | Add `poster="/images/sofa-poster.jpg"` per model. |
| `<model-viewer>` | No `error` event handler — if the `.glb` 404s, the user sees nothing. | Listen for `model-viewer`'s `error` event and render a fallback message. |
| `ChatWidget.jsx` | **No conversation memory across sessions.** Closing the tab loses everything. | Persist messages keyed by `user_id` in PostgreSQL, load on widget mount. |
| `ChatWidget.jsx` | **No streaming responses.** Roomie's reply appears all at once, not word-by-word. | Switch the SDK call to `stream=True` and append tokens as they arrive. |
| `groq_service.py` | **Product catalog is read from a static `products.json`**, not the live database. | Replace `load_products()` with a SQLAlchemy query (cached for ~5 min). |
| `routers/product.py` | No image fallback if a product has zero rows in `ProductImage`. | Default to a placeholder URL when the join returns nothing. |
| `FurniturePage.jsx` | **No filter or sort UI** — just a flat grid. | Add price range + category filter chips; sort by price/popularity. |
| `Search.jsx` | Search returns ALL products and filters in Python (`backend/main.py:251-263`). | Push the filter into SQL with `Products.name.ilike(f"%{kw}%")`. |
| `ProfilePage.jsx` | **No profile picture upload UI** — column likely exists in DB but no file picker. | Add an `<input type="file">` + `POST /profile/avatar` that saves to `/static/avatars/`. |
| `OrderPage.jsx` / `TrackingPage.jsx` | **Tracking is static** — shows the current `status` but no real-time updates or history of status changes. | Add an `OrderStatusHistory` table; poll or use SSE for updates. |
| Email verification | If the user closes the browser between "Receive code" and "Set password," there's no resend button. | Add a "Resend code" endpoint and UI button. |
| Cart | No quantity validation — user can add 9999 of an item with 3 in stock. | Backend cart endpoint should clamp to `Products.stock`. |
| Admin dashboards | Some metrics in `/api/overview` are **hardcoded** (`"total_revenue": 248400`, `"performance": [...]`). | Compute from `Orders` and `OrderItems`. |
| `/api/health` | References `ar_db`, `campaign_db`, `promotion_db`, `subscriber_db`, `blog_db` — variables that **don't exist** in `main.py`. The endpoint will throw `NameError` if called. | Replace with real `db.query(...).count()` or remove the endpoint. |

### 2.C — Code Quality Issues
Things that work but would not survive a code review.

| File | Issue | Fix |
|------|-------|-----|
| 10 frontend files | **`http://localhost:8000` hardcoded in 10 separate components.** Already breaks production; also breaks if the port changes. | Replace every `fetch("http://localhost:8000/...")` with the `api` Axios instance in `services/api.js`. |
| `backend/migrate.py` | **Raw `ALTER TABLE` statements.** No version tracking, no down-migrations, no review trail. Risky if run twice or against a live DB. | Switch to Alembic — autogenerate migrations from SQLAlchemy models. |
| `backend/models.py` ↔ database | **Schema drift.** `migrate.py` patches columns into existing tables; some columns may not match the model definitions exactly. | Adopt Alembic and let it diff `metadata` against the live DB. |
| `backend/main.py` | **`models.Base.metadata.create_all()` on startup.** Hides schema changes; doesn't drop or alter columns. | Remove and rely on Alembic migrations. |
| `backend/main.py` | **422-line "main" file** mixing CORS setup, user CRUD, search, profile, and stats. Hard to navigate. | Split user CRUD, search, profile, and stats into their own routers. |
| `<model-viewer>` integration | **No loading indicator.** No error state. No analytics on AR launch success. | Add `loading`, `progress`, and `error` event listeners with corresponding UI. |
| `services/api.js` | **No response interceptor.** A 401 from any endpoint just bubbles into the calling component instead of triggering an automatic logout. | Add a response interceptor: on 401, call `logout()` and redirect to `/login`. |
| `auth.js` | **Token decoded client-side only — no actual signature verification.** That's expected for client-side checks but worth being explicit about. | Document this as expected; the real check is on the backend. |
| `groq_service.py` line 30 | **Groq client created at import time.** If the API key is missing, the entire module fails to import and the server crashes. | Lazy-init the client inside `get_bot_response`. |
| `chat.py` line 56 | **Catches all exceptions and returns the error string in the chat.** Leaks stack info; bad UX. | Log the full exception server-side, return a generic "Roomie's having trouble right now" to the user. |
| `routers/chat.py` | **No rate limiting.** Anyone can spam `/api/chat` and burn through the Groq quota. | Add `fastapi-limiter` (already in `req.txt`!) — e.g., 10 messages per minute per IP. |
| Token blacklist | **In-memory `set()`.** Resets every server restart; not shared across workers. | Move to Redis or a `RevokedTokens` table. |
| `keys/` folder | **Generated locally; risk of committing the private key.** | Add `keys/` to `.gitignore` if not already; use environment-injected keys in production. |
| Test coverage | **Zero automated tests.** No pytest, no Vitest, no integration tests. | Start with one happy-path test per critical route (login, add-to-cart, place-order). |
| Logging | **Mostly `print()` statements** instead of structured logging. | Configure `logging` once, use it everywhere; ship to a file in production. |
| `.env` | **Likely committed risk** — verify `.env` is in `.gitignore`. | Confirm and add `.env.example` with placeholder values. |

---

## 3. What's Possible to Add (Achievable Improvements)

Things you could realistically build on top of the current architecture, with the skills you already used. No new languages, no new frameworks.

### 3.1 — Author more `.glb` models

**What it is:** populate `frontend/public/models/` with a real `.glb` for each product.

**Why it would improve the project:** the single biggest visual impact. Right now every "product" in AR is the same sofa.

**Effort:** 1-2 days for a starter set of 6-10 models, depending on source.

**Files that change:**
- `frontend/public/models/*.glb` (new files)
- `backend/models.py` — `Products` table likely already has a `model_url` column; populate it.
- Stock manager dashboard — upload UI for models.

**Implementation approach:**
1. Source free models from **Sketchfab** (filter "Downloadable + CC license"), **Poly Pizza** (Google's old Poly archive, all CC0), or **KhronosGroup/glTF-Sample-Assets** on GitHub.
2. Re-export through Blender to ensure correct units (meters), correct orientation (Y-up), and a single material.
3. Compress with **gltfpack** (`gltfpack -i sofa.glb -o sofa.opt.glb`) — typically halves file size.
4. Drop into `frontend/public/models/`, update `Products.model_url` per product.

### 3.2 — Add `.usdz` files for iOS AR

**What it is:** ship a `.usdz` alongside every `.glb` so iPhone AR works.

**Why:** without `.usdz`, every iPhone user gets a broken AR experience.

**Effort:** 30 min per model once the pipeline is set up.

**Files that change:** `frontend/public/models/*.usdz` (new); `<model-viewer>` already accepts `ios-src` — pass `iosSrc={"/models/sofa.usdz"}` from `ProductPage.jsx`.

**Implementation approach:**
1. Use **Apple's Reality Converter** (Mac, free): drag in a `.glb`, export as `.usdz`. Or
2. Use **`usd-from-gltf`** (cross-platform CLI, open source).
3. Or use Google's `<model-viewer>` editor (free web tool) to convert and download.
4. Test on an iPhone in Safari before defense — Quick Look does silently fail on malformed `.usdz`.

### 3.3 — Replace `migrate.py` with Alembic

**What it is:** Alembic is the official migration tool for SQLAlchemy. It autogenerates migration scripts from model changes and tracks them with version IDs.

**Why:** raw `ALTER TABLE` is error-prone, can't be rolled back, and gives no audit trail. Alembic is what you'd use in any real job.

**Effort:** half a day.

**Files that change:** new `backend/alembic/` folder, new `alembic.ini`, delete `migrate.py`.

**Implementation approach:**
1. `pip install alembic`, then `alembic init alembic`.
2. Point `alembic.ini` at your `database.py` engine.
3. Run `alembic revision --autogenerate -m "initial"` — it diffs `models.Base` against the live DB and writes a script.
4. Future schema changes: edit `models.py`, then `alembic revision --autogenerate -m "add stock column"`, then `alembic upgrade head`.

### 3.4 — Centralize the API base URL via `VITE_API_URL`

**What it is:** every frontend file uses the `api` Axios instance from `services/api.js`, never `fetch("http://localhost:8000/...")` directly.

**Why:** today, deploying or running on a different port breaks 10 files. Centralizing means **one config change** for production.

**Effort:** 2-3 hours.

**Files that change:** the 10 files identified in section 2.A — replace each `fetch("http://localhost:8000/path", ...)` with `api.get("/path")` or `api.post("/path", body)`.

**Implementation approach:**
1. Audit: `grep "localhost:8000" frontend/src/` — touched 10 files.
2. Replace each call with the existing `api` instance, which already reads `VITE_API_URL`.
3. Add `frontend/.env.example` with `VITE_API_URL=http://localhost:8000`.
4. For the chat widget, take `apiUrl` out of props and use `api.post("/api/chat", ...)`.

### 3.5 — Loading and error states for `<model-viewer>`

**What it is:** show a placeholder while the model loads and a friendly message if loading fails.

**Why:** today the canvas is just empty. Looks broken to a non-technical viewer.

**Effort:** 1-2 hours.

**Files that change:** `frontend/src/components/ProductViewer/ProductViewer.jsx` and a small `.css` update.

**Implementation approach:**
1. Add `poster="/images/poster-{productId}.jpg"` per product (a screenshot of the model).
2. Listen for the model-viewer events: `load`, `error`, `progress`. Use `useEffect` with `viewerRef.current.addEventListener('load', ...)`.
3. Show a spinner over the canvas until the `load` event. Show a message + "Try again" button on `error`.

### 3.6 — Conversation memory for Roomie

**What it is:** chat history is saved per user, so closing and re-opening the tab continues the conversation.

**Why:** matches the experience users now expect from ChatGPT and Claude. Avoids repeating context.

**Effort:** 1 day.

**Files that change:**
- `backend/models.py` — new `ChatMessages` table (id, user_id, role, content, created_at).
- `backend/routers/chat.py` — save each turn; on connect, load last N messages.
- `frontend/src/components/ChatWidget/ChatWidget.jsx` — fetch history on mount.

**Implementation approach:**
1. Migration adds the table.
2. Modify `POST /api/chat` to: load the last 20 messages for `current_user`, append them to `history`, save the new turn after the model replies.
3. Frontend calls `GET /api/chat/history` on mount and seeds `messages` state.

### 3.7 — Streaming responses from Groq

**What it is:** Roomie's reply appears word-by-word instead of all at once.

**Why:** **perceived speed**. Even though Groq's full reply takes <1 second, users feel "it's thinking" if nothing happens during that second. Streaming starts showing text after ~100 ms.

**Effort:** half a day.

**Files that change:** `backend/services/groq_service.py`, `backend/routers/chat.py` (switch to a streaming response), `frontend/.../ChatWidget.jsx` (read the stream).

**Implementation approach:**
1. Server: change to `client.chat.completions.create(..., stream=True)`. Iterate chunks. Wrap in FastAPI's `StreamingResponse` with `media_type="text/event-stream"`.
2. Client: replace `fetch().json()` with the **EventSource** API or `fetch()` + `ReadableStream` reader. Append each token to the in-progress bot message.

### 3.8 — Real product images instead of placeholders

**What it is:** every product has 1-3 real images uploaded through the stock-manager dashboard.

**Why:** the 3D model is the wow, but images still drive the catalog grid.

**Effort:** 1 day for the upload pipeline + a few hours of content work.

**Files that change:** `backend/routers/product.py` (image upload endpoint already exists), stock-manager `ProductCatalogPage.jsx` (file-picker UI).

**Implementation approach:**
1. Verify `POST /api/products/{id}/images` exists (it should — `static/` is mounted).
2. In the dashboard, add a multi-file `<input type="file">`. Upload via `FormData`.
3. Resize on upload using **Pillow** (`from PIL import Image`).

### 3.9 — Search & filter on the catalog

**What it is:** the catalog page gains: a search box, a price range slider, category chips, and a sort dropdown.

**Why:** flat grids don't scale beyond ~20 products. Filters convert browsers into buyers.

**Effort:** 1-2 days.

**Files that change:** `backend/routers/product.py` (add query params), `frontend/src/pages/FurniturePage.jsx` (UI).

**Implementation approach:**
1. Backend: `GET /api/products?q=&min_price=&max_price=&category=&sort=`. Use SQLAlchemy `.filter()` chaining.
2. Frontend: store filter state in `useState`, debounce the input, refetch on change.

### 3.10 — Profile picture upload

**What it is:** the user can pick an image and it shows in the header and on the profile page.

**Why:** small touch, big perceived polish.

**Effort:** 3-4 hours.

**Files that change:** `backend/models.py` (add `Users.avatar_url`), `backend/routers/profile.py` (upload endpoint), `frontend/src/pages/ProfilePage.jsx`.

**Implementation approach:**
1. Add column via Alembic migration.
2. Endpoint accepts a file, saves to `/static/avatars/{user_id}.jpg`, updates the column.
3. Frontend file picker + preview.

### 3.11 — Real-time order tracking

**What it is:** the tracking page polls the order status and shows a timeline (placed → confirmed → shipped → out for delivery → delivered).

**Why:** "where is my order" is the #1 customer service question for any e-com store.

**Effort:** 1 day.

**Files that change:** `backend/models.py` (new `OrderStatusHistory`), `backend/routers/orders.py`, `frontend/src/pages/TrackingPage.jsx`.

**Implementation approach:**
1. Add the history table; insert a row whenever status changes.
2. `GET /api/orders/{id}/timeline` returns the full history.
3. Frontend polls every 30s, or use simple SSE.
4. Render as a vertical stepper with timestamps.

---

## 4. Future Work (Research / Long-Term Vision)

Bigger ideas — these are v2, research, or "if I had three more months" territory. They are also the answers that impress examiners when phrased thoughtfully.

### 4.1 — AI-generated 3D models from product photos

**The vision:** a stock manager uploads 4-8 photos of a new sofa from different angles. Within minutes, the system generates a usable `.glb` model and lists the product.

**Why it matters:** the bottleneck of an AR commerce store is **3D content**. Hand-modeling a piece of furniture takes hours. AI photogrammetry collapses that to minutes.

**Technologies:**
- **Meshy AI** (paid API, photo → 3D in ~3 min)
- **Luma AI Genie** (similar, paid)
- **NeRF / Gaussian Splatting** (open source, more research-heavy: nerfstudio, splatting libraries)
- **DUSt3R / VGGT** (open-source dense reconstruction, 2024-2025)

**To learn:** photogrammetry basics, mesh post-processing in Blender, automatic UV unwrapping, model topology cleanup.

### 4.2 — Voice-driven Roomie

**The vision:** the user taps a microphone icon and says "Roomie, show me sofas under 50 000 dinars in beige." Roomie listens, transcribes, and responds either by speech or by filtering the catalog.

**Why it matters:** AR is a hands-busy context (the user is holding the phone up). Voice is the natural interface.

**Technologies:**
- **Web Speech API** (browser-native speech-to-text)
- **Whisper** (OpenAI's speech-to-text, runnable via Groq's free Whisper deployment)
- **ElevenLabs** or **OpenAI TTS** for spoken responses
- Existing Groq + LLaMA pipeline for understanding

**To learn:** browser audio capture, MediaRecorder API, streaming audio to a backend.

### 4.3 — Real-time multi-user AR

**The vision:** two people in the same physical room — say, a couple deciding on a sofa — both see the same virtual sofa anchored in the same spot in real time. They can each move it, and both see the change.

**Why it matters:** furniture decisions are rarely solo. Shared AR turns the feature from "preview" into "decide together."

**Technologies:**
- **WebXR Anchors API** with shared spatial anchors (Google Cloud Anchors / Niantic Lightship)
- **WebRTC** for peer-to-peer state sync
- A FastAPI WebSocket backend for session coordination

**To learn:** WebRTC fundamentals, AR cloud anchors, conflict-free state sync (CRDTs).

### 4.4 — Personalized recommendations from room photos

**The vision:** user uploads a photo of their living room. A computer-vision model identifies dominant colors, style (modern / vintage / minimalist), existing furniture. Roomie then recommends pieces that fit.

**Why it matters:** removes the cold-start problem of "what do I even want."

**Technologies:**
- **CLIP** (OpenAI's image-text model) for room style classification
- **Segment Anything (SAM)** for furniture detection
- A small recommendation model on top (collaborative filtering or LLM-based)

**To learn:** image embeddings, vector search (pgvector or FAISS), recommender systems.

### 4.5 — Native mobile apps

**The vision:** a real iOS and Android app available on the App Store and Google Play, with native ARKit / ARCore integration that's tighter than the web fallback.

**Why it matters:** native AR is faster, smoother, and supports features (occlusion, lighting estimation) that web AR doesn't.

**Technologies:**
- **React Native** (reuse most of the React component knowledge) + **expo-three** + **viro-react** for AR
- Or **Flutter** (Dart) + `arcore_flutter_plugin` / `arkit_flutter_plugin`

**To learn:** mobile build pipelines (Xcode signing, Play Console), native bridging, AR session management at the native layer.

### 4.6 — Production deployment with real DevOps

**The vision:** the project lives on a public domain (`aroom.dz` or similar) with HTTPS, automated deploys, monitoring, backups, and error tracking.

**Why it matters:** the difference between "a school project" and "a system."

**Technologies:**
- **Docker** for containerization
- **GitHub Actions** for CI/CD (lint, test, build, deploy)
- **Hosting:** Vercel/Netlify for frontend; Railway/Render/Fly.io or a VPS for backend; managed PostgreSQL (Neon, Supabase)
- **Monitoring:** Sentry (errors), Logflare or Grafana Cloud (logs), UptimeRobot
- **Object storage** for `.glb`, `.usdz`, and product images: AWS S3 or Cloudflare R2 + CDN

**To learn:** Docker fundamentals, GitHub Actions YAML, DNS, TLS, secrets management, observability basics.

### 4.7 — Algerian payment integration

**The vision:** customers pay with **CIB** card, **Edahabia** post-card, or via **Chargily Pay** (the Algerian gateway aggregator). Today, checkout is "place order"; there is no real money flow.

**Why it matters:** every Algerian commerce student gets asked this question. Showing you've thought about it is a differentiator.

**Technologies:**
- **Chargily Pay API** (REST, supports CIB and Edahabia, has a Python SDK)
- **SATIM / GIE Monetique** for direct CIB integration (requires a real merchant account)

**To learn:** Algerian merchant onboarding, Chargily webhook flow, SCA / 3D Secure principles, idempotent payment endpoints.

### 4.8 — Multi-language support (Arabic, French, English)

**The vision:** the entire UI flips between three languages based on user preference. Arabic gets right-to-left layout. Roomie answers in the chosen language.

**Why it matters:** the Algerian market is trilingual. English-only is a usability barrier.

**Technologies:**
- **react-i18next** for the frontend (translation files per language)
- **CSS logical properties** (`margin-inline-start` instead of `margin-left`) for RTL
- The Roomie system prompt would include the user's language: `"Reply in {user_language}."` — LLaMA 3.1 handles all three well.

**To learn:** i18n key management, RTL CSS pitfalls, locale-aware date/number formatting, translation workflow.

### 4.9 — Hologram / LED-fan display integration

**The vision:** the product detail page can stream the 3D model to a physical hologram fan display in the showroom — customers see the sofa floating in mid-air at scale.

**Why it matters:** completes the "phygital" loop. AR in the user's home **and** physical 3D in the store.

**Technologies:**
- LED fan displays typically come with proprietary apps that accept videos; a custom integration would render the `.glb` to a video clip server-side using **Blender headless** or **Three.js + Puppeteer**.
- For real-time control, a **MQTT** or **WebSocket** bridge to the device.

**To learn:** the specific fan display's protocol, headless 3D rendering, video encoding for circular displays.

### 4.10 — Vector search over the catalog

**The vision:** the user types "something cozy and beige for a small apartment." The search returns products by **meaning**, not keywords.

**Why it matters:** keyword search misses synonyms and intent. Vector search enables conversational discovery, especially when paired with Roomie.

**Technologies:**
- **pgvector** (a PostgreSQL extension — adds a `vector` column type and similarity operators)
- An embedding model: **`text-embedding-3-small`** (OpenAI), **`bge-small`** (open source on Hugging Face), or Groq when they release embeddings.
- Embedding storage: alongside each product row.

**To learn:** vector embeddings, cosine similarity, ANN indexes (HNSW, IVFFLAT), reindex strategies.

---

## 5. Defense Talking Points

Five polished answers for "what's next?" or "what would you improve?" Use them out loud, slightly paraphrased so it doesn't sound rehearsed.

### Talking point 1 — Asset library

> "The biggest honest gap is the 3D asset library. Right now I have one production-quality `.glb` model — the sofa — and the rest of the catalog uses placeholders. The system around the model is complete: upload pipeline, AR gating, color variants, real-world scaling, the chatbot context. Adding more models is a content task, not an engineering task. The next step would be to source 10-15 free models from Sketchfab or generate them with photogrammetry tools like Meshy, then convert each to `.usdz` for iOS using Apple's Reality Converter."

### Talking point 2 — Production-readiness

> "If I had two more weeks, I'd focus on production-readiness rather than new features. That means: replacing my manual `migrate.py` with Alembic so the database has proper version-controlled migrations, centralizing the API URL through `VITE_API_URL` instead of hardcoding `localhost:8000` in 10 files, moving the JWT blacklist to Redis so it survives restarts and works across multiple workers, and putting the whole thing behind Docker + GitHub Actions for repeatable deploys. None of that is research — it's the path from school project to operable system."

### Talking point 3 — The chatbot evolves

> "Roomie today is stateless — every conversation starts fresh, and the reply appears all at once. The next two improvements would be **persistence** (save the conversation in PostgreSQL, keyed by user_id, so the user resumes where they left off) and **streaming** (use Groq's `stream=True` so the user sees tokens appear as they're generated). Both are well-scoped: a day each. Beyond that, the more interesting direction is **voice** — using the browser's Web Speech API to capture the user's voice and Whisper for transcription, so they can talk to Roomie hands-free while their phone is in AR mode."

### Talking point 4 — Computer vision and AI-generated 3D

> "The research direction I'm most excited about is closing the content gap with AI. Tools like Meshy and Luma AI can already generate a usable `.glb` from 4-8 product photos in a few minutes. Integrating that as an upload step in the stock-manager dashboard would let staff add a new product without ever touching Blender. It's a real research project — quality of generated meshes is still uneven, photogrammetry needs good lighting — but the trajectory of the technology is clear. Two years ago this required a turntable rig and a day of cleanup. Today it's an API call."

### Talking point 5 — Local market integration

> "If this project went beyond a defense, the priority would be Algerian payment integration. The current checkout creates an order but doesn't move money — it's a stub. Chargily Pay exposes a clean REST API and supports both CIB cards and Edahabia, which covers most local customers. Adding it is a webhook-based flow plus a payment status table. After that comes multi-language support — Arabic, French, English with right-to-left layout — because English-only doesn't make sense for the local market. Both are well-scoped technical projects, not research."

---

### One-line honesty test

If an examiner asks **"if you had to remove one feature to ship tomorrow, which would it be?"**:

> "I'd remove the multiple admin dashboards and ship with just the customer-facing flow plus a single admin role. Five separate role dashboards is more than a v1 needs — it was useful for showing role-based access works, but a real launch would consolidate them and grow them back as the team using them grows."

That answer wins the room. It shows you can prioritize.

Good luck. Walk in slow. You know where this project is and where it isn't.
