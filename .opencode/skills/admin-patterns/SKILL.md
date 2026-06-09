---
name: admin-patterns
description: Use when working on admin/index.html. Covers the post-auth injection pattern, minified aliases, modal system, toast system, sidebar navigation, and how admin sections are structured. Triggers on: admin, injectDashboard, sidebar, modal, toast, rsf, rroles, ssf.
---

# Admin Dashboard Patterns

## Architecture
- All markup injected by `injectDashboard()` after Supabase auth — nothing is in static HTML
- All CSS in `<style>` block (never extract)
- All JS in `<script>` block (never extract)
- All onclick functions must be globally scoped

## Section Naming Convention (minified aliases at script bottom)
| Full name | Alias | Purpose |
|---|---|---|
| renderStaffSection | rsf | Render staff list |
| renderRolesSection | rroles | Render roles list |
| showStaffForm | ssf | Open staff edit form |
| showRoseForm | srf | Open rose edit form |
| ... | ... | Add new aliases for any new global function |

## Modal System
```javascript
// Show modal
document.getElementById('modalOverlay').style.display = 'flex';
document.getElementById('modalOverlay').innerHTML = `<div class="modal">...</div>`;

// Confirm dialog
document.getElementById('confirmOverlay').style.display = 'flex';
```

## Toast System
```javascript
// Admin toast (top-right, uses #toastContainer)
function showAdminToast(msg, type = 'success') {
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.textContent = msg;
  document.getElementById('toastContainer').appendChild(t);
  setTimeout(() => t.remove(), 3000);
}

// Public toast (bottom-right, uses window.showToast from js/supabase.js)
window.showToast('Message sent!', 'success');
```

## Adding a New Admin Section
1. Add sidebar button in `injectDashboard()` HTML
2. Add `onclick="renderMySection()"` to button
3. Write `async function renderMySection() { ... }` 
4. Add alias at bottom: `var rms = renderMySection;`
5. Section renders into `<div id="content">` by setting innerHTML
