# EduGarden Project Context

> **For AI Agent Onboarding** — Read this first to understand the entire project. You can still inspect individual files for full context.

---

## 1. PROJECT OVERVIEW

EduGarden is a **vanilla static website** for a social enterprise based in **Gori, Georgia** that specializes in **ADR roses** (a disease-resistant, certified rose variety). The site serves as a:

- Public marketing/brochure website for visitors ([index.html](file:///c:/Users/sabab/EduGarden/index.html))
- Protected admin dashboard for content management ([admin/index.html](file:///c:/Users/sabab/EduGarden/admin/index.html))

### Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Vanilla HTML5, CSS3, ES6+ JavaScript (no frontend frameworks) |
| Backend | Supabase (PostgreSQL database + Storage bucket `images`) |
| Hosting | Vercel (static site, auto-deploys from GitHub) |
| Repository | `https://github.com/notnormaluser/EduGarden` |

### Key URLs

- **Live site:** `https://edugarden.vercel.app`
- **Admin panel:** `https://edugarden.vercel.app/admin/` or `https://edugarden.vercel.app/admin/index.html`
- **GitHub:** `https://github.com/notnormaluser/EduGarden`

---

## 2. FILE STRUCTURE

```
/
├── index.html                  → Main public website (navbar, hero, about, slider, catalog, articles, contact, footer)
├── admin/
│   └── index.html              → Protected admin dashboard (single-file dashboard application; all CSS & JS inline)
├── admin.js                    → Standalone admin script (deprecated; not used in production)
├── CONTEXT.md                  → This file — project context for AI agents
├── favicon.svg                 → Website favicon
├── schema.json                 → Local copy of database schema documentation
│
├── css/
│   ├── base.css                → Color variables, resets, typography, and site-wide utility classes
│   ├── navbar.css              → Navigation bar layout and responsive mobile drawer rules
│   ├── hero.css                → Hero banner styling with text shadow overlays
│   ├── about.css               → About section, staff cards, group panels, and XenForo-style hover popovers
│   ├── slider.css              → Image slider layout and navigation dots styling
│   ├── catalog.css             → Rose catalog grid layout, card styles, and letter filter buttons
│   ├── articles.css            → Blog/articles cards layout, details modal, and image gallery lightbox
│   └── contact.css             → Contact form fields, input borders, maps wrapper, and footer styling
│
└── js/
    ├── supabase.js             → Shared script; initializes Supabase Client and defines global toast & translation helpers
    ├── language.js             → Language translation coordinator (English vs Georgian) and URL-based translation updates
    ├── catalog.js              → Dynamic rose catalog parser with alphabetical filter indexing and ADR card specs
    ├── slider.js               → Dynamic team photos slideshow fetching from Supabase Storage & Database
    ├── articles.js             → Dynamic blog articles listing, expanded modal renderer, and content galleries
    ├── contact.js              → Dynamic contact form submission handler connecting directly to Supabase DB
    ├── staff.js                → Dynamic staff roster grid, role grouping logic, and XenForo-style profile popovers
    └── full_admin.py           → Deprecated Python script originally designed to compile admin assets
```

### CSS Organization

CSS is split modularly by page section under the `css/` directory. All public stylesheets are linked inside the `<head>` of [index.html](file:///c:/Users/sabab/EduGarden/index.html). The admin dashboard ([admin/index.html](file:///c:/Users/sabab/EduGarden/admin/index.html)) houses all its CSS rules inline inside a `<style>` block to keep operations fully self-contained and avoid global layout collisions.

### JS Organization

Public page scripting is modularized under the `js/` directory. Files are loaded at the bottom of the public `<body>` in order of dependency. [supabase.js](file:///c:/Users/sabab/EduGarden/js/supabase.js) must be loaded first (after the Supabase CDN dependency) to expose `window.supabaseClient` and global notification utilities to downstream files. The admin page ([admin/index.html](file:///c:/Users/sabab/EduGarden/admin/index.html)) contains its Javascript inline inside a `<script>` tag.

---

## 3. SUPABASE DATABASE

### Connection Details

```
Project URL:  https://exoyfpqfgixofsuginxx.supabase.co
Anon Key:     sb_publishable_UExfTnoTaFgieljt6oiZ8Q_m0f2raxy
Storage:      images bucket (publicly readable)
```

**Security Notice:** Tables currently have RLS disabled for prototyping purposes. Write and delete operations are performed directly via the client using the anon key. RLS hardening is a planned roadmap item.

### Client Initialization (used in supabase.js and admin/index.html)

```javascript
const { createClient } = supabase;
window.supabaseClient = createClient(
  'https://exoyfpqfgixofsuginxx.supabase.co',
  'sb_publishable_UExfTnoTaFgieljt6oiZ8Q_m0f2raxy'
);
```

### Database Tables Schema

#### 1. `articles`
Stores blog posts/articles. `image_url` stores a comma-separated list of image URLs. The first image acts as the card banner, while any subsequent URLs are rendered as a scrollable gallery in the expanded view modal.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | Primary Key, auto-generated |
| `title_en` | text | Required, English title |
| `title_ge` | text | Required, Georgian title |
| `content_en` | text | Required, English content |
| `content_ge` | text | Required, Georgian content |
| `image_url` | text | Optional, comma-separated image URLs (Banner, Content Image 1, Content Image 2...) |
| `created_at` | timestamptz | Auto-set |
| `updated_at` | timestamptz | Auto-set |

#### 2. `roses`
Stores catalog records for standard and ADR (certified disease-resistant) roses. ADR entries store additional specification attributes such as height, width, breeder, and year. The name field is a single shared column for both English and Georgian translation layouts.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | Primary Key, auto-generated |
| `name` | text | Required, shared name value |
| `description_en` | text | Optional, English description |
| `description_ge` | text | Optional, Georgian description |
| `image_url` | text | Optional, main image path |
| `type_en` | text | Optional, type descriptor (e.g. `Standard` or `ADR`) |
| `type_ge` | text | Optional, type descriptor (e.g. `Standard` or `ADR`) |
| `height` | text | Optional, ADR height range in cm (e.g., `70-90`) |
| `width` | text | Optional, ADR width range in cm (e.g., `85-105`) |
| `breeder` | text | Optional, breeder designation (e.g., `Kordes`) |
| `year` | text | Optional, breeding year (e.g., `2021`) |
| `created_at` | timestamptz | Auto-set |
| `updated_at` | timestamptz | Auto-set |

#### 3. `staff`
Roster database. Grouped into headers dynamically on the main page by mapping matching `role_en`/`role_ge` values. It utilizes color attributes to style custom role badges. Drag-and-drop order updates rewrite `order_index` values in PostgreSQL.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | Primary Key, auto-generated |
| `name` | text | Required, staff member's name (shared column) |
| `role_en` | text | Optional, English role title |
| `role_ge` | text | Optional, Georgian role title |
| `bio_en` | text | Optional, detailed English biography |
| `bio_ge` | text | Optional, detailed Georgian biography |
| `photo_url` | text | Required, profile photo path |
| `order_index` | int4 | Layout sorting index within groupings |
| `role_priority` | int4 | Sort weight to order role panels (e.g., Founders show first) |
| `badge_color` | text | Hex code background (e.g., `#4CAF50`) |
| `badge_text_color` | text | Hex code text color (e.g., `#ffffff`) |
| `years_at` | int4 | Optional, number of years active at EduGarden |
| `specialization_en` | text | Optional, specialization in English (e.g., `Organic Cultivation`) |
| `specialization_ge` | text | Optional, specialization in Georgian |
| `location` | text | Optional, location details (e.g., `Gori, Georgia`) |
| `created_at` | timestamptz | Auto-set |

#### 4. `team_photos`
Home page slider gallery photos.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | Primary Key, auto-generated |
| `photo_url` | text | Required, image location |
| `created_at` | timestamptz | Auto-set |

#### 5. `contact_messages`
Form feedback submissions.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | Primary Key, auto-generated |
| `name` | text | Sender name |
| `email` | text | Sender email address |
| `message` | text | Message body |
| `is_read` | boolean | Toggle flag; default is false |
| `created_at` | timestamptz | Auto-set |

#### 6. `chatbot_knowledge`
Markdown articles utilized for chatbot reasoning injection.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | Primary Key, auto-generated |
| `content` | text | Markdown structured knowledge base data |
| `created_at` | timestamptz | Auto-set |
| `updated_at` | timestamptz | Auto-set |

#### 7. `site_settings`
Global site parameters. Overrides static fallback emails, phone lines, addresses, and translation mission text variables inside the public website files on startup.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | Primary Key, auto-generated |
| `email` | text | Public contact email |
| `phone` | text | Public phone number |
| `address` | text | Public office physical address |
| `mission_en` | text | Mission statement (English) |
| `mission_ge` | text | Mission statement (Georgian) |
| `updated_at` | timestamptz | Auto-set timestamp |

---

## 4. ADMIN PANEL ([admin/index.html](file:///c:/Users/sabab/EduGarden/admin/index.html))

### Authentication Architecture

The admin panel uses native **Supabase Auth** with email and password credentials. There are no hardcoded bypass checks. 

- **Session Persistence**: On page load, `checkSession()` calls `supabaseClient.auth.getSession()` to read active cookies or tokens. If a session is valid, the login card is hidden and the admin dashboard initializes.
- **Login Card**: Displayed when there is no active session. Unsuccessful logins display an inline "Invalid email or password" error.
- **Logout**: Handled via `supabaseClient.auth.signOut()`, which tears down user session variables and returns the browser to the login screen.
- **Security Precaution**: The HTML markup of the dashboard is **not present** on initial page load. It is dynamically injected into the `#dashboardRoot` div only after successful session verification. This keeps sensitive admin operations and structural information hidden from unauthorized visitors.

### Sidebar Navigation & Sections

The dashboard displays 8 distinct management sections:
1. **Articles**: Add, edit, and delete news articles. Supports multiple image selection (banner image + thumbnail uploads).
2. **Rose Catalog**: Add, edit, and delete standard rose items in the catalog.
3. **ADR Roses**: Manage ADR certified roses. Form features inputs for height (cm), width (cm), breeder, and year.
4. **Staff**: Roster management. Includes drag-and-drop elements to change order. Features custom badge colors (using background and text `<input type="color">` pickers) and a category selector (remembers new roles locally in `localStorage` to display as future dropdown suggestions).
5. **Team Photos**: Upload slide photos to the home page carousel.
6. **Messages**: Inbox containing message cards with quick actions to delete or toggle the read/unread state (updates the sidebar badge counter).
7. **Chatbot Knowledge**: Central markdown text editor linking to `chatbot_knowledge`.
8. **Site Settings**: Central form to update phone numbers, emails, addresses, and mission statements.

### Function Name Mappings

The admin panel scripts use minified and abbreviated function names to keep the inline file compact. Below is the mapping of these abbreviations to their full names and purposes:

| Abbreviation | Full Name | Purpose |
|---|---|---|
| `st(m, t)` | `showToast(m, type)` | Triggers alert toast banner notifications |
| `cm()` | `closeModal()` | Closes modal overlay and resets active selections |
| `om(title)` | `openModal(title)` | Opens modal dialog overlay with target title header |
| `rs(section)` | `renderSection(section)` | Dispatches database queries and re-draws section screens |
| `ui(file)` | `uploadImage(file)` | Uploads binary image to Supabase Storage bucket |
| `di(url)` | `deleteImage(url)` | Deletes asset URL path from Supabase storage |
| `sc(t, m, c)` | `showConfirm(title, msg, callback)` | Displays confirmation modal before destructive actions |
| `cfu(u, f)` | `createFileUpload(url, callback)` | Renders dashed upload container/image preview block |
| `setL(btn, loading)`| `setLoading(btn, loading)` | Toggles spinner class and disables target submit buttons |
| `rr(container)` | `renderRoses(container)` | Renders standard rose cards grid |
| `radr(container)` | `renderAdrRoses(container)` | Renders ADR certified rose cards grid |
| `rsf(container)` | `renderStaff(container)` | Renders staff list panels grouped by role |
| `rtp(container)` | `renderTeamPhotos(container)` | Renders team photo grid |
| `rm(container)` | `renderMessages(container)` | Renders list of incoming contact messages |
| `rcb(container)` | `renderChatbot(container)` | Renders chatbot knowledge text editor section |
| `rset(container)` | `renderSettings(container)` | Renders settings text form inputs |
| `srf(id)` | `showRoseForm(id)` | Renders standard rose editor form modal |
| `sadrf(id)` | `showAdrRoseForm(id)` | Renders ADR rose editor form modal with height/width fields |
| `ssf(id)` | `showStaffForm(id)` | Renders staff card editor form with color pickers and dropdown roles |
| `stpf()` | `showTeamPhotoForm()` | Renders team slide upload form modal |
| `sr()` | `saveRose()` | Inserts or updates standard rose records |
| `sadr()` | `saveAdrRose()` | Inserts or updates ADR rose records |
| `ss()` | `saveStaff()` | Inserts or updates staff records |
| `dr(id, iu)` | `deleteRose(id, url)` | Deletes standard rose record and its storage image |
| `dadr(id, iu)` | `deleteAdrRose(id, url)` | Deletes ADR rose record and its storage image |
| `ds(id, iu)` | `deleteStaff(id, url)` | Deletes staff member record and their profile photo |
| `dtp(id, iu)` | `deleteTeamPhoto(id, url)` | Deletes team slide photo record and its storage file |
| `da(id, iu)` | `deleteArticle(id, url)` | Deletes article record and all its comma-separated images |
| `dmsg(id)` | `deleteMessage(id)` | Deletes contact feedback message |
| `mr(id)` | `markRead(id)` | Toggles contact message read state (updates sidebar counts) |

---

## 5. WHAT WORKS NOW

All dynamic features on both the public website and the admin panel have been integrated with Supabase and are fully functional.

### Public Website ([index.html](file:///c:/Users/sabab/EduGarden/index.html))

1. **Articles**: Dynamically loaded from `articles` table in descending order. Cards feature descriptions, dates, and author metadata. Clicking a card opens a modal overlay with the full content. Multiple images in the `image_url` column are rendered as a content gallery below the text. Images feature click-to-zoom overlays (lightbox).
2. **Rose Catalog**: Catalog entries under 'Standard' are dynamically loaded and filtered under an alphabetical index (A-Z).
3. **ADR Roses Section**: Automatically displays certified roses (`type_en === 'ADR'`) along with their specific details (Height, Width, Breeder, and Year).
4. **Staff Roster**: Staff members are dynamically grouped by role and sorted based on `role_priority` and `order_index`. Card details are displayed in a clean grid. If a bio is present, clicking the card opens a XenForo-style popover aligned above the card. The popover contains:
   - Name first.
   - Dynamic badges (role badge with custom database colors + a static neutral team member badge).
   - Bio details (derived from the translation column or fallback role splitter).
   - A 3-column stats grid at the bottom (Years at EduGarden, Specialization, and Location).
5. **Team Photos Slider**: Slideshow component on the main homepage dynamically loads, caches, and cycles through images from the `team_photos` table.
6. **Contact Form**: Submitting the contact form creates a new record in the `contact_messages` table and shows a success toast.
7. **Site Settings & Translations**: Site metadata (email, phone, address, and mission statements) is fetched dynamically on startup and applied across the page translations (English/Georgian).

### Admin Panel ([admin/index.html](file:///c:/Users/sabab/EduGarden/admin/index.html))

1. **Supabase Auth**: Secure email/password login and session validation. Login screen content is bypassed if an active session is found, and dashboard HTML is dynamically injected on success.
2. **Standard and ADR Rose Catalog CRUD**: Standalone standard and ADR sections manage database insert/update operations and display records correctly.
3. **Staff Roster Manager & Drag Reordering**: Dragging and dropping staff cards triggers `setupDragDrop()`, re-ordering them instantly and updating their `order_index` in PostgreSQL via `saveStaffOrder()`. The modal form allows full edits, color picker updates, and custom roles.
4. **Team Photos Carousel Uploader**: Allows uploading new images and deleting existing slides.
5. **Inbox Messages manager**: Lists user queries, handles toggling read status (synchronizing sidebar badge counts), and message deletion.
6. **Chatbot Knowledge Editor**: Markdown text area editor allows quick updates to chatbot knowledge files.
7. **Global site parameters settings form**: Form edits contact details and mission translations.

---

## 6. WHAT STILL NEEDS BUILDING

While the core functionality is complete, the following improvements can be implemented in future phases:

### 1. AI Chatbot Widget (Public Site Integration)
Add a floating chat bubble widget on the public website that enables users to query information about EduGarden, organic gardening, and ADR roses. The widget should send queries to a serverless backend service or an AI model API that references the content stored in the `chatbot_knowledge` table as context (RAG).

### 2. Form Validation & Edge Cases
Enhance admin panel forms with stricter validation checks (e.g. email format verification, image size restrictions, character limits for biographies).

### 3. Row-Level Security (RLS) Policies
Implement PostgreSQL RLS policies in the Supabase Dashboard to secure tables:
- **`contact_messages`**: Public write-only (allow anonymous inserts), authenticated admin read/delete.
- **`articles`**, **`roses`**, **`staff`**, **`team_photos`**, **`site_settings`**, **`chatbot_knowledge`**: Public read-only, authenticated write/delete restricted to admin users.

---

## 7. DEPLOYMENT

### Hosting

- **Platform:** Vercel
- **Live URL:** `https://edugarden.vercel.app`
- **Deployment Trigger:** Auto-deploys from the `main` branch on GitHub.

### Deployment Notes

- **Static site deployment**: Vercel serves the files directly. No build step is required.
- **Custom domain**: A `CNAME` file is present in the repository root for custom domain configuration.
- **Environment variables**: Not required for deployment. Database credentials use the public/anonymous key, which is safe to expose.

---

## 8. KEY PATTERNS & CONVENTIONS

### Language Switching & State Coordination
The public page uses [language.js](file:///c:/Users/sabab/EduGarden/js/language.js) to manage English and Georgian translations. On language toggle:
- `lang-ge` or `lang-en` active styles are updated.
- All DOM nodes matching `[data-translate]` are translated.
- Language change callbacks registered via `registerLanguageChange()` are triggered, allowing dynamic sections (staff list, articles list, rose catalog) to fetch data and refresh content in the selected language.

### Image Handling
Images are uploaded to Supabase Storage in the `images` bucket using unique filenames:
`timestamp_random.ext`
The public URL format is:
`https://exoyfpqfgixofsuginxx.supabase.co/storage/v1/object/public/images/{filename}`
When articles or other items with attached images are deleted, their corresponding storage assets are also deleted via the `deleteImage(url)` helper to prevent storage accumulation.

### Dialog Modals and Alert Toast Notifications
The public website and admin panel share modular modal overlays (`#modalOverlay` or `#articleModal`) that close when users click outside the container.
- Confirmation modals prevent accidental deletion of database items.
- A custom toast container handles notifications. Toast messages auto-dismiss after 3 seconds.

---

## 9. TROUBLESHOOTING COMMON ISSUES

### Minified Function Mismatches
When editing [admin/index.html](file:///c:/Users/sabab/EduGarden/admin/index.html), ensure that calls from dynamically rendered HTML strings target globally-scoped, minified function aliases (e.g., `da()` instead of `deleteArticle()`). Refer to the Function Name Mappings table above.

### Input IDs vs Shorthand fallbacks
Inputs inside forms use standard descriptive IDs (e.g., `article_title_en`). Some legacy scripts reference minified abbreviations (`ate`). Always use safe fallback assignments to prevent null pointer exceptions:
```javascript
var te = (document.getElementById('ate') || document.getElementById('article_title_en')).value.trim();
```

---

## 10. CRITICAL INFORMATION FOR INCOMING AI AGENTS

If you are an AI system onboarding to this codebase, pay close attention to these architectural constraints and execution patterns to avoid breaking functionality:

### 1. Architectural Style & Code Structure
- **Strictly Vanilla CSS and Vanilla JS**: Do not introduce build pipelines (Vite, Webpack, Parcel, Babel), compiler tools, or frameworks (React, Vue, Tailwind, etc.) unless explicitly instructed by the user. 
- **Admin Panel Self-Containment**: The admin dashboard is located in [admin/index.html](file:///c:/Users/sabab/EduGarden/admin/index.html) and contains all its CSS styling and Javascript code inline. Do not extract these styles or scripts into separate files. Maintaining a single file is a design requirement to keep the deployment framework-free and avoid global CSS collisions.
- **Post-Auth Injected Dashboard**: In [admin/index.html](file:///c:/Users/sabab/EduGarden/admin/index.html), the dashboard markup is injected into `#dashboardRoot` *after* a successful login session check in `injectDashboard()`. You will not find the dashboard HTML directly in the body tags on page load.

### 2. Database Columns & Typing
- **Roses vs Catalog**: Standard and ADR roses are both stored in the `roses` table, distinguished by the `type_en`/`type_ge` values (`Standard` vs `ADR`). There is no table named `rose_catalog` or `adr_roses`.
- **Unified Name Column**: The `roses` and `staff` tables use a single `name` column for both English and Georgian translation states. Georgian names generally do not differ from English spellings in this context, so do not try to split names or use separators (such as `Name EN | Name GE` or pipe strings).
- **Staff Biography Storage**: While the `staff` table has separate `bio_en` and `bio_ge` columns, [js/staff.js](file:///c:/Users/sabab/EduGarden/js/staff.js) supports a fallback mechanism where it splits the `role_en`/`role_ge` strings at the pipe `|` character (i.e., `Role | Biography`) if the biography columns are empty. This is for legacy data compatibility.
- **Photos Column Naming**: The `staff` and `team_photos` tables store their file links in a column named `photo_url`, NOT `image_url`. The `roses` and `articles` tables store their links in `image_url`. Ensure you use the correct column name for the target table.

### 3. Minified Abbreviated Names & Aliases
- In [admin/index.html](file:///c:/Users/sabab/EduGarden/admin/index.html), shorthand abbreviations are used for inputs (e.g. `ate`, `atg`) and global action methods (e.g. `dr()`, `ssf()`, `da()`). If you introduce new action methods in the script, **you must expose global aliases** at the bottom of the `<script>` tag so inline event strings (like `onclick="..."`) can resolve them successfully.
- Keep the `(document.getElementById('shortId') || document.getElementById('longId')).value` fallback pattern when retrieving input element values in forms to protect against null reference crashes.

### 4. Staff Ordering and Drag-and-Drop
- The ordering of staff cards on the public page is sorted by `role_priority` first, then `order_index`. 
- Drag-and-drop actions in the admin panel trigger `setupDragDrop()` which reads the relative positions of the DOM nodes and pushes separate `update` requests to Supabase in a loop (`saveStaffOrder()`). There is no custom Postgres function or RPC.

### 5. Media Disposal
- When deleting records from `articles`, `roses`, `staff`, or `team_photos` tables, always parse and delete their corresponding files from the Supabase Storage `images` bucket using the `deleteImage(url)` helper to prevent dead files from accumulating in cloud storage. Articles may have multiple images stored as a comma-separated list; make sure to iterate over and delete all of them.

---

*End of context document. Last updated: May 31, 2026.*