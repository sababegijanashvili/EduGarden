# EduGarden — Agent Instructions

## Project Identity
Static vanilla website for a rose nursery in Gori, Georgia.
Stack: HTML5 + CSS3 + ES6 JS (NO frameworks, NO build step), Supabase backend, Vercel hosting.
Repo: https://github.com/notnormaluser/EduGarden
Live: https://edugarden.vercel.app

## Cardinal Rules (Never Break These)
1. NO React, Vue, Tailwind, Vite, Webpack, or any framework unless I explicitly say so
2. Admin dashboard lives entirely in `admin/index.html` — never split it into separate files
3. `admin/index.html` CSS stays in the `<style>` block — no external stylesheets
4. `admin/index.html` JS stays in the `<script>` block — all functions must be globally scoped
5. Photo columns: `staff` and `team_photos` use `photo_url`. Roses and articles use `image_url`
6. `staff.name` and `roses.name` are single shared columns — no EN/GE split
7. There is only ONE roses table. Filter by `type_en` ('Standard' or 'ADR') — never create a second table
8. Roles are centralized in the `roles` table. Assign via `staff.roles` UUID array
9. On delete, always call `deleteImage(url)` for Supabase Storage files
10. Functions called from inline HTML in admin must be global (minified aliases live at bottom of admin script)

## Supabase Connection
URL: https://exoyfpqfgixofsuginxx.supabase.co
Anon Key: sb_publishable_UExfTnoTaFgieljt6oiZ8Q_m0f2raxy
Storage bucket: `images` (publicly readable)
RLS: disabled (prototyping phase — do NOT add RLS unless I ask)

## File Load Order (public site)
Scripts must load in this order in index.html:
1. Supabase CDN
2. js/supabase.js  ← MUST be first (exposes window.supabaseClient, window.showToast)
3. js/language.js
4. js/catalog.js
5. js/slider.js
6. js/articles.js
7. js/contact.js
8. js/staff.js

## Database Quick Reference
- `articles`: id, title_en, title_ge, content_en, content_ge, image_url (comma-separated), created_at, updated_at
- `roses`: id, name, description_en/ge, image_url, type_en/ge ('Standard'/'ADR'), height, width, breeder, year, created_at
- `staff`: id, name, photo_url, bio_en, bio_ge, roles (jsonb uuid[]), order_index, years_at, specialization_en/ge, location
- `roles`: id, role_en, role_ge, badge_color, badge_text_color, priority (lower = first), created_at
- `team_photos`: id, photo_url, created_at
- `contact_messages`: id, name, email, message, read (bool), created_at
- `site_settings`: key, value
- `chatbot_knowledge`: id, content, created_at

## How to Make Changes
1. Read the relevant existing file first before touching it
2. Make SURGICAL changes — do not rewrite working sections
3. Match the existing code style (vanilla JS, lowercase variables, minified admin aliases)
4. Test by checking browser console for errors if Playwright MCP is available
5. When modifying admin, always confirm global scope for new onclick functions

## Language Support
Every visible string has _en and _ge variants.
Language toggle works via body.georgian class + data-translate attributes.
Staff/roles re-render on language change via registerLanguageChange().

## What Is Still Unbuilt (known todos)
- AI chatbot widget on public site (admin editor exists, public widget does not)
- Supabase RLS policies
- Staff order_index reordering UI in admin
- Stricter form validation
