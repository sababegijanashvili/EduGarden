---
name: debug-js
description: Use when debugging JavaScript errors, tracing bugs, fixing console errors, or doing root cause analysis. Triggers on: error, undefined, null, TypeError, cannot read, is not a function, NaN, broken, not working.
---

# JS Debugging Playbook

## Step 1: Gather Facts
Before touching code, ask:
- What is the exact error message and file:line?
- Does it happen on page load or on user action?
- Is it in admin or public site?
- Does it only happen after a Supabase call?

## Step 2: Common EduGarden Pitfalls

### "X is not a function" in admin
Almost always means a function isn't globally scoped.
Fix: Check bottom of admin `<script>` for minified aliases. Add if missing:
```javascript
// At bottom of admin script
window.myNewFunction = myNewFunction; // or
var mnf = myNewFunction; // if using shorthand in HTML
```

### Supabase returns null data
Check RLS — even though disabled, verify the table name is correct.
Check: `console.log(error)` — Supabase always returns `{ data, error }`.

### Language not updating a new element
New DOM elements need `data-translate` attribute OR manual re-render via `registerLanguageChange(callback)`.

### Staff popover shows wrong data
`specialization_en/ge` must come from staff columns — NOT from role columns.
`bio` comes from `bio_en/bio_ge` — NOT from pipe-split of `role_en` (that's legacy).

### Admin onclick handler not found
All functions called from HTML strings (e.g. `onclick="editRose('${id}')"`) must be global.

## Step 3: Use Playwright MCP to Verify
If Playwright MCP is available:
1. Navigate to the page
2. Open console
3. Trigger the action
4. Read console errors directly
This is faster than guessing.
