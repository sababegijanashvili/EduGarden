# EduGarden Project Context

> **For AI Agent Onboarding** — Read this first to understand the entire project. The **code in the repository is the source of truth** if anything here conflicts with a file on disk.

---

## 1. PROJECT OVERVIEW

EduGarden is a **vanilla static website** for a social enterprise based in **Gori, Georgia** that specializes in **ADR roses** (a disease-resistant, certified rose variety). The site serves as a:

- Public marketing/brochure website for visitors ([index.html](index.html))
- Protected admin dashboard for content management ([admin/index.html](admin/index.html))

### Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Vanilla HTML5, CSS3, ES6+ JavaScript (no frontend frameworks, no build step) |
| Backend | Supabase (PostgreSQL database + Storage bucket `images`) |
| Auth (admin) | Supabase Auth (email + password via `signInWithPassword`) |
| Hosting | Vercel (`https://edugarden.vercel.app`) and/or GitHub Pages (workflow in `.github/workflows/static.yml`) |
| Repository | `https://github.com/notnormaluser/EduGarden` |

### Key URLs

- **Live site:** `https://edugarden.vercel.app`
- **Admin panel:** `https://edugarden.vercel.app/admin/` or `https://edugarden.vercel.app/admin/index.html`
- **GitHub:** `https://github.com/notnormaluser/EduGarden`

---

## 2. FILE STRUCTURE

```
/
├── index.html                  → Main public website (navbar, hero, about, staff, slider, catalog, articles, contact, footer)
├── admin/
│   └── index.html              → Protected admin dashboard (single-file app; all CSS & JS inline)
├── admin.js                    → DEPRECATED standalone admin script — not used in production
├── CONTEXT.md                  → This file — project context for AI agents
├── CNAME                       → Custom domain configuration for deployment
├── favicon.svg                 → Website favicon
│
├── sql/
│   └── setup_roles.sql         → SQL migration: creates `roles` table + `staff.roles` jsonb column
│
├── css/
│   ├── base.css                → Color variables, resets, typography, site-wide utilities
│   ├── navbar.css              → Navigation bar and mobile drawer
│   ├── hero.css                → Hero banner
│   ├── about.css               → About section, staff cards, group panels, XenForo-style popovers
│   ├── slider.css              → Team photos slider
│   ├── catalog.css             → Rose catalog grid and A–Z filter buttons
│   ├── articles.css            → Blog cards, article modal, image gallery lightbox
│   └── contact.css             → Contact form and footer styling
│
├── js/
│   ├── supabase.js             → Supabase client init, `window.showToast`, `registerLanguageChange`
│   ├── language.js             → EN/GE translation coordinator
│   ├── catalog.js              → Rose catalog (standard + ADR) with alphabetical filter
│   ├── slider.js               → Homepage team photo slideshow
│   ├── articles.js             → Articles listing, modal, content galleries
│   ├── contact.js              → Contact form → `contact_messages` table
│   ├── staff.js                → Staff roster, role grouping, profile popovers
│   └── full_admin.py           → DEPRECATED Python compile script — not used
│
└── .github/
    └── workflows/
        └── static.yml            → GitHub Pages deploy workflow (push to `main`)
```

### What Is NOT Used

| Path | Status |
|---|---|
| `admin.js` (repo root) | Deprecated — admin lives in `admin/index.html` only |
| `admin.html` | Does not exist — use `admin/index.html` |
| `schema.json` | Removed / never committed — schema is documented here and in `sql/setup_roles.sql` |
| `js/full_admin.py` | Deprecated |

### CSS Organization

CSS is split by page section under `css/`. All public stylesheets are linked in the `<head>` of [index.html](index.html).

Staff popover styles (`.staff-popover`, `.staff-group-panel`, stats grid, etc.) live in [css/about.css](css/about.css).

The admin dashboard ([admin/index.html](admin/index.html)) keeps **all CSS inline** in a `<style>` block. Do not extract admin CSS to separate files — this is intentional to avoid global collisions.

### JS Organization

Public scripts load at the bottom of [index.html](index.html) in this order:

1. Supabase CDN (`@supabase/supabase-js@2`)
2. `js/supabase.js` — **must be first** (exposes `window.supabaseClient`, `window.showToast`)
3. `js/language.js`
4. `js/catalog.js`
5. `js/slider.js`
6. `js/articles.js`
7. `js/contact.js`
8. `js/staff.js`

`index.html` also includes `<div id="toast-container"></div>` before `</body>` for contact form toasts.

The admin page contains **all JavaScript inline** in a single `<script>` tag inside [admin/index.html](admin/index.html).

---

## 3. SUPABASE DATABASE

### Connection Details

```
Project URL:  https://exoyfpqfgixofsuginxx.supabase.co
Anon Key:     sb_publishable_UExfTnoTaFgieljt6oiZ8Q_m0f2raxy
Storage:      images bucket (publicly readable)
```

**Security notice:** Tables currently have RLS disabled for prototyping. Reads and writes use the anon key from the client. RLS hardening is a planned item.

**First-time setup:** Run [sql/setup_roles.sql](sql/setup_roles.sql) in the Supabase SQL Editor before using the Roles admin section or multi-role staff features.

### Client Initialization

Used in [js/supabase.js](js/supabase.js) and [admin/index.html](admin/index.html):

```javascript
const { createClient } = supabase;
window.supabaseClient = createClient(
  'https://exoyfpqfgixofsuginxx.supabase.co',
  'sb_publishable_UExfTnoTaFgieljt6oiZ8Q_m0f2raxy'
);
```

Admin uses a local `supabaseClient` variable (same URL/key) and additionally uses `supabaseClient.auth` for login.

### Database Tables

#### 1. `articles`

Blog posts. `image_url` is comma-separated: first URL = card banner; remaining URLs = gallery in the expanded modal.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | PK, auto-generated |
| `title_en` | text | Required |
| `title_ge` | text | Required |
| `content_en` | text | Required |
| `content_ge` | text | Required |
| `image_url` | text | Optional, comma-separated URLs |
| `created_at` | timestamptz | Auto-set |
| `updated_at` | timestamptz | Auto-set |

#### 2. `roses`

Standard and ADR roses in one table. Distinguished by `type_en` / `type_ge` (`Standard` vs `ADR`).

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | PK |
| `name` | text | Required, single shared name column |
| `description_en` | text | Optional |
| `description_ge` | text | Optional |
| `image_url` | text | Optional |
| `type_en` | text | `Standard` or `ADR` |
| `type_ge` | text | `Standard` or `ADR` |
| `height` | text | ADR only, e.g. `70-90` |
| `width` | text | ADR only, e.g. `85-105` |
| `breeder` | text | ADR only |
| `year` | text | ADR only |
| `created_at` | timestamptz | Auto-set |
| `updated_at` | timestamptz | Auto-set |

#### 3. `roles` *(role library — new)*

Central role definitions. Created by [sql/setup_roles.sql](sql/setup_roles.sql). Admin manages these in the **Roles** sidebar section. Staff members reference roles by UUID in `staff.roles`.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | PK, `gen_random_uuid()` |
| `role_en` | text | Required, English role name |
| `role_ge` | text | Optional, Georgian role name |
| `badge_color` | text | Default `#8d6e63` |
| `badge_text_color` | text | Default `#ffffff` |
| `priority` | integer | Default `10`; **lower number = shown first** in groups and badge order |
| `created_at` | timestamptz | Auto-set |

RLS is disabled on this table per the setup script.

#### 4. `staff`

Team roster. Supports **multiple roles per person** via `roles` jsonb (array of role UUIDs from the `roles` table). Legacy single-role columns are kept for backward compatibility.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | PK |
| `name` | text | Required, single shared name |
| `role_en` | text | Legacy/fallback — synced from primary assigned role on save |
| `role_ge` | text | Legacy/fallback — synced from primary assigned role on save |
| `roles` | jsonb | **Array of role UUID strings**, e.g. `["uuid-1","uuid-2"]` |
| `bio_en` | text | Optional, English biography (popover) |
| `bio_ge` | text | Optional, Georgian biography (popover) |
| `photo_url` | text | Required, profile photo in Storage |
| `order_index` | int4 | Sort order within a role group on the public site |
| `role_priority` | int4 | Legacy — synced from primary role's `priority` on save |
| `badge_color` | text | Legacy — synced from primary role on save |
| `badge_text_color` | text | Legacy — synced from primary role on save |
| `years_at` | int4 | Optional, years at EduGarden (popover stat) |
| `specialization_en` | text | Optional (popover stat — **not** role text) |
| `specialization_ge` | text | Optional (popover stat) |
| `location` | text | Optional, e.g. `Gori, Georgia` (popover stat) |
| `created_at` | timestamptz | Auto-set |

**Role assignment model:**
- Admin assigns one or more roles via clickable chips in the staff form.
- `staff.roles` stores an array of `roles.id` UUIDs.
- On save, the **primary role** (lowest `priority` among selected roles) is copied into legacy columns (`role_en`, `role_ge`, `badge_color`, `badge_text_color`, `role_priority`).
- Public site groups each member under their **primary role** (lowest priority number among assigned roles).
- If `staff.roles` is empty, [js/staff.js](js/staff.js) falls back to legacy `role_en` / `role_ge` / badge columns.

**Legacy bio fallback:** If `bio_en` / `bio_ge` are empty, [js/staff.js](js/staff.js) may split `role_en` / `role_ge` at `|` (`Role | Biography`) for old data.

#### 5. `team_photos`

Homepage slider images. Column is `photo_url` (not `image_url`).

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | PK |
| `photo_url` | text | Required |
| `created_at` | timestamptz | Auto-set |

#### 6. `contact_messages`

Contact form submissions.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | PK |
| `name` | text | Sender name |
| `email` | text | Sender email |
| `message` | text | Message body |
| `is_read` | boolean | Default `false`; toggled in admin Messages section |
| `created_at` | timestamptz | Auto-set |

#### 7. `chatbot_knowledge`

Markdown content for a future AI chatbot (RAG context). Not yet exposed on the public site.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | PK |
| `content` | text | Markdown |
| `created_at` | timestamptz | Auto-set |
| `updated_at` | timestamptz | Auto-set |

#### 8. `site_settings`

Global contact info and mission text; loaded on public site startup.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | PK |
| `email` | text | Public contact email |
| `phone` | text | Public phone |
| `address` | text | Physical address |
| `mission_en` | text | Mission statement (English) |
| `mission_ge` | text | Mission statement (Georgian) |
| `updated_at` | timestamptz | Auto-set |

---

## 4. ADMIN PANEL ([admin/index.html](admin/index.html))

### Authentication

The admin panel uses **Supabase Auth** — there is **no hardcoded password** or client-side bypass.

- **Login:** `supabaseClient.auth.signInWithPassword({ email, password })` via the login card (`#loginScreen`).
- **Session check:** On load, `checkSession()` calls `supabaseClient.auth.getSession()`. Valid session → `injectDashboard()` + `initApp()`.
- **Logout:** `supabaseClient.auth.signOut()` tears down the session and shows the login screen again.
- **Auth state listener:** `onAuthStateChange` hides the dashboard on `SIGNED_OUT`.
- **Security:** Dashboard HTML is **not in the initial DOM**. It is injected into `#dashboardRoot` only after authentication via `injectDashboard()`.

Admin users must be created in the Supabase Dashboard (Authentication → Users).

### Sidebar Sections (9 total)

| # | Section key | Label | Add button |
|---|---|---|---|
| 1 | `articles` | Articles | + Add New |
| 2 | `roses` | Rose Catalog | + Add New |
| 3 | `adr_roses` | ADR Roses | + Add New |
| 4 | `roles` | Roles | + Add New |
| 5 | `staff` | Staff | + Add New |
| 6 | `team_photos` | Team Photos | + Upload Photo |
| 7 | `messages` | Messages | (none) |
| 8 | `chatbot` | Chatbot Knowledge | (none) |
| 9 | `settings` | Site Settings | (none) |

#### Section summaries

1. **Articles** — CRUD; banner + multiple content images; `image_url` comma-joined.
2. **Rose Catalog** — CRUD for `type_en !== 'ADR'`.
3. **ADR Roses** — CRUD for `type_en === 'ADR'`; height, width, breeder, year fields.
4. **Roles** — CRUD for the `roles` table. Form fields: name EN, name GE, badge color, text color, priority. List shows colored badge preview + Edit/Delete. Delete uses confirmation dialog.
5. **Staff** — CRUD; staff grouped by primary role from `roles` table. Group headers use **`Georgian (English)`** format, e.g. `დამფუძნებელი (Founder)`. Staff with no assigned role appear under **Unassigned**. Staff form fields:
   - Name (required)
   - **Roles** — clickable chips loaded from `roles` table (multi-select, checkmark when selected)
   - Bio EN / Bio GE
   - Specialization EN / Specialization GE
   - Location
   - Years at EduGarden
   - Photo (required on create)
   - Saves `staff.roles` as UUID array; syncs legacy columns from primary role.
6. **Team Photos** — Upload/delete slider images.
7. **Messages** — Contact inbox; expand to read; mark read/unread; delete; unread badge on sidebar.
8. **Chatbot Knowledge** — Markdown textarea editor.
9. **Site Settings** — Email, phone, address, mission EN/GE.

### Global State Variables (admin script)

| Variable | Purpose |
|---|---|
| `currentSection` | Active sidebar section key |
| `currentAction` | `'add'` or `'edit'` for modal forms |
| `currentEditId` | UUID of record being edited |
| `allStaffMembers` | Cached staff array for staff section |
| `allRolesLibrary` | Cached roles from `roles` table |
| `staffSelectedRoleIds` | Role UUIDs selected in staff form chips |
| `dashboardInjected` | Whether `#dashboardRoot` has been populated |

### Function Name Mappings

The admin script uses abbreviated names for compact inline `onclick` handlers. **New global functions** used in onclick strings must remain at top level (not only inside closures).

| Abbreviation / Name | Purpose |
|---|---|
| `st(m, t)` | `showToast(message, type)` |
| `cm()` | `closeModal()` |
| `om(title)` | `openModal(title)` |
| `rs(section)` | `renderSection(section)` — dispatches to section renderers |
| `ui(file)` | `uploadImage(file)` → Supabase Storage `images` bucket |
| `di(url)` | `deleteImage(url)` from Storage |
| `sc(t, m, c)` | `showConfirm(title, msg, callback)` |
| `cfu(u, f)` | `createFileUpload(url, onFileSelect)` |
| `setL(btn, loading)` | `setLoading(btn, loading)` |
| `showArticleForm(id)` | Article add/edit modal |
| `da(id, iu)` | `deleteArticle(id, imageUrls)` |
| `rr(c)` | `renderRoses` — standard rose grid |
| `radr(c)` | `renderAdrRoses` — ADR rose grid |
| `srf(id)` | `showRoseForm(id)` |
| `sadrf(id)` | `showAdrRoseForm(id)` |
| `sr()` | `saveRose()` |
| `sadr()` | `saveAdrRose()` |
| `dr(id, iu)` | `deleteRose` |
| `dadr(id, iu)` | `deleteAdrRose` |
| `rroles(c)` | `renderRoles` — roles library list |
| `showRoleForm(id)` | Role add/edit modal |
| `saveRole()` | Insert/update `roles` table |
| `deleteRole(id)` | Delete role with confirmation |
| `loadRolesLibrary()` | Fetch all roles ordered by `priority` |
| `rsf(c)` | `renderStaff` — staff grouped by primary role |
| `ssf(id)` | `showStaffForm(id)` — staff editor with role chips |
| `ss()` | `saveStaff()` |
| `toggleStaffRoleChip(roleId)` | Toggle role selection in staff form |
| `renderStaffRoleChips()` | Re-render role chip buttons |
| `ds(id, iu)` | `deleteStaff` |
| `rtp(c)` | `renderTeamPhotos` |
| `stpf()` | `showTeamPhotoForm()` |
| `dtp(id, iu)` | `deleteTeamPhoto` |
| `rm(c)` | `renderMessages` |
| `toggleMsg(el)` | Expand/collapse message |
| `mr(id)` | `markRead` — toggle `is_read` |
| `dmsg(id)` | `deleteMessage` |
| `rcb(c)` | `renderChatbot` |
| `rset(c)` | `renderSettings` |
| `formatRoleLabelAdmin(role)` | Returns `Georgian (English)` label string |
| `escHtmlAttr(val)` | Escape HTML attribute text |

### Input ID Fallback Pattern

Article forms use descriptive IDs (`article_title_en`) with legacy shorthand fallbacks (`ate`). When reading form values:

```javascript
var te = (document.getElementById('ate') || document.getElementById('article_title_en')).value.trim();
```

---

## 5. PUBLIC SITE BEHAVIOR

### Staff ([js/staff.js](js/staff.js) + [css/about.css](css/about.css))

On load, fetches **`roles`** and **`staff`** in parallel.

**Grouping:** Staff appear under the group for their **primary role** (assigned role with lowest `priority`). Groups are ordered by `roles.priority`.

**Group headers:** `Georgian (English)` when both names exist; otherwise English or Georgian alone.

**Compact cards:** Photo, name, primary role label. Clickable when bio exists.

**Popover layout** (top to bottom):

```
┌─────────────────────────────────┐
│ [PHOTO]  Name (large, bold)     │
│          Role badge(s)          │
│          "Team Member" badge    │
├─────────────────────────────────┤
│ Bio text (left-aligned)         │
├─────────────────────────────────┤
│ Years | Specialization | Location│
└─────────────────────────────────┘
```

- Role badges: from `staff.roles` → resolved against `roles` table (colors from DB). Sorted by `priority`. Legacy fallback if `roles` column empty.
- Team Member badge: `Team Member` / `გუნდის წევრი` (fixed neutral color in CSS).
- Bio: `bio_en` / `bio_ge` (or legacy pipe-split from `role_en`).
- Stats: `years_at`, `specialization_en/ge`, `location` — **not** from role columns.
- Re-renders on language change via `registerLanguageChange(renderStaff)`.

### Contact ([js/contact.js](js/contact.js))

Submits to `contact_messages`. On success calls `window.showToast('Message sent!', 'success')` and resets the form.

### Toast ([js/supabase.js](js/supabase.js))

`window.showToast(message, type)` — `type` is `'success'`, `'error'`, or `'info'`. Container: `#toast-container` (bottom-right on public site; admin uses `#toastContainer` top-right inline).

### Language ([js/language.js](js/language.js))

Toggles `body.georgian` class; translates `[data-translate]` nodes; fires `registerLanguageChange` callbacks.

---

## 6. WHAT WORKS NOW

### Public Website ([index.html](index.html))

| Feature | Status |
|---|---|
| Articles (list, modal, multi-image gallery, lightbox) | Working |
| Rose catalog (standard, A–Z filter) | Working |
| ADR roses section (`type_en === 'ADR'`) | Working |
| Staff roster (roles table, multi-role badges, popover) | Working |
| Team photos slider | Working |
| Contact form → Supabase + success toast | Working |
| Site settings (email, phone, address, mission) | Working |
| EN / GE language switching | Working |

### Admin Panel ([admin/index.html](admin/index.html))

| Feature | Status |
|---|---|
| Supabase Auth (email/password, session persistence) | Working |
| Articles CRUD + multi-image upload | Working |
| Standard + ADR rose CRUD | Working |
| **Roles library CRUD** (`roles` table) | Working |
| **Staff CRUD with multi-role chip assignment** | Working |
| Staff list grouped by primary role, bilingual headers | Working |
| Team photos upload/delete | Working |
| Messages inbox (read/unread toggle, delete, badge) | Working |
| Chatbot knowledge editor | Working (content only; no public widget) |
| Site settings form | Working |

---

## 7. WHAT STILL NEEDS BUILDING

### 1. AI Chatbot Widget (Public Site)
Floating chat UI on the public site that queries an AI backend using `chatbot_knowledge` as RAG context. The admin editor exists; the public widget does not.

### 2. Row-Level Security (RLS)
Implement Supabase RLS policies:
- `contact_messages`: anonymous insert; authenticated read/delete for admins.
- `articles`, `roses`, `staff`, `roles`, `team_photos`, `site_settings`, `chatbot_knowledge`: public read; authenticated write/delete for admins.

### 3. Form Validation & Edge Cases
Stricter admin validation (email format, image size limits, bio length). Contact toast may be hard to see (bottom-right z-index) — consider repositioning in `supabase.js`.

### 4. Messages UX Improvements (optional)
Split inbox into New / Read lists, instant DOM updates without full section re-render, Supabase Realtime for new messages.

### 5. Staff `order_index` Management
No admin UI currently reorders staff cards within a group (`order_index`). Public site sorts by `order_index` within groups.

### 6. Database Setup Verification
Ensure [sql/setup_roles.sql](sql/setup_roles.sql) has been run in Supabase so `roles` table and `staff.roles` column exist. Create at least one role (e.g. Founder / დამფუძნებელი, priority `1`) before assigning staff.

---

## 8. DEPLOYMENT

### Vercel (primary live URL)

- **URL:** `https://edugarden.vercel.app`
- **Trigger:** Auto-deploy from `main` on GitHub
- **Build:** None — static files served as-is
- **Env vars:** Not required (anon key is public in client code)

### GitHub Pages

- Workflow: [.github/workflows/static.yml](.github/workflows/static.yml)
- Deploys entire repo root on push to `main`

### Custom Domain

[CNAME](CNAME) file present in repo root.

---

## 9. KEY PATTERNS & CONVENTIONS

### Architectural Rules for AI Agents

1. **Vanilla only** — No React, Vue, Vite, Webpack, Tailwind, etc., unless explicitly requested.
2. **Admin is one file** — Do not split [admin/index.html](admin/index.html) CSS/JS into separate files.
3. **Post-auth injection** — Dashboard markup is built by `injectDashboard()`, not present in static HTML.
4. **Photo column naming** — `staff` and `team_photos` use `photo_url`; `roses` and `articles` use `image_url`.
5. **Unified name column** — `staff.name` and `roses.name` are single columns (not split EN/GE).
6. **Roses table** — No separate `rose_catalog` or `adr_roses` tables; filter by `type_en`.
7. **Roles are centralized** — Define roles in `roles` table; assign to staff via `staff.roles` UUID array. Do not invent per-staff inline role definitions without updating the library.
8. **Global onclick handlers** — Functions called from HTML strings in admin must be globally scoped. Minified aliases (`st`, `cm`, `rs`, etc.) are at the bottom of the admin script.
9. **Media cleanup** — On delete, call `deleteImage(url)` for Storage files. Articles may have multiple comma-separated URLs.

### Image Handling

Upload path: `images` bucket, filename `timestamp_random.ext`

Public URL:
```
https://exoyfpqfgixofsuginxx.supabase.co/storage/v1/object/public/images/{filename}
```

### Modals & Toasts

- Admin: `#modalOverlay`, `#confirmOverlay`, `#toastContainer`
- Public articles: `#articleModal` or `#modalOverlay` (see articles.js)
- Toasts auto-dismiss after ~3 seconds

---

## 10. TROUBLESHOOTING

| Problem | Likely cause |
|---|---|
| Roles section empty / errors | `roles` table not created — run [sql/setup_roles.sql](sql/setup_roles.sql) |
| Staff form shows "No roles defined" | Create roles in admin **Roles** section first |
| Staff not grouped correctly | Check `staff.roles` UUIDs match `roles.id`; primary role = lowest `priority` |
| Popover shows wrong specialization | Must come from `specialization_en/ge`, not `role_ge` |
| Admin onclick handler not found | Function not global — add alias at bottom of admin `<script>` |
| `rsf is not a function` confusion | In admin, `rsf` = render staff section. In public site, staff logic is in [js/staff.js](js/staff.js) `renderStaff()` |
| Contact toast invisible | Toast container bottom-right may be behind footer; check `#toast-container` in DOM |

---

## 11. QUICK START FOR A NEW AI AGENT

1. Read this file.
2. Skim [index.html](index.html) script load order and [admin/index.html](admin/index.html) sidebar + `injectDashboard()`.
3. Confirm Supabase has run [sql/setup_roles.sql](sql/setup_roles.sql).
4. For staff/roles work: read [js/staff.js](js/staff.js) and admin sections `rroles`, `rsf`, `ssf`, `ss`.
5. Make **surgical** changes; match existing vanilla JS style and minified admin patterns.
6. Do **not** extract admin into separate files or add a build pipeline without explicit user request.

---

*End of context document. Last updated: May 31, 2026.*
