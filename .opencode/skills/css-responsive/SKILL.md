---
name: css-responsive
description: Use when writing or fixing CSS for EduGarden — responsive layouts, mobile fixes, z-index issues, flexbox/grid patterns. Triggers on: CSS, responsive, mobile, layout, z-index, overflow, flex, grid, breakpoint.
---

# CSS Patterns for EduGarden

## CSS Architecture
- `css/base.css` — color variables, resets, typography, global utilities
- Per-section files: navbar, hero, about, slider, catalog, articles, contact
- Admin CSS: inline in `<style>` block in admin/index.html ONLY

## Color Variables (from base.css)
Always use CSS variables, never hardcode colors:
```css
var(--primary)      /* main green */
var(--secondary)    /* rose/pink accent */
var(--text)         /* main text */
var(--bg)           /* background */
var(--card-bg)      /* card background */
```

## Responsive Breakpoints
```css
/* Mobile first */
@media (max-width: 768px) { ... }   /* tablet and below */
@media (max-width: 480px) { ... }   /* phone */
```

## Common Fixes

### Staff card grid
```css
.staff-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
}
```

### Modal overlay
```css
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
```

### Toast z-index
Toast container must be above modals: `z-index: 9999`
