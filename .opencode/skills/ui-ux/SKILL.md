---
name: ui-ux
description: Use when designing new UI components, improving visual design, fixing UX issues, or implementing new sections for EduGarden. Covers the site's aesthetic identity (Georgian rose nursery, nature/green palette) and design patterns. Triggers on: design, UI, UX, component, section, visual, layout, style.
---

# EduGarden Design Identity

## Brand
- Georgian rose nursery specializing in ADR-certified, disease-resistant roses
- Audience: local Georgian buyers, gardening enthusiasts, potential partners
- Tone: professional but warm, rooted in nature, bilingual (Georgian-first)

## Aesthetic Principles
- Nature-inspired: greens, earth tones, soft pinks (rose colors)
- Clean, readable: this is a trust-building site, not a portfolio showpiece
- Bilingual: Georgian text is primary; English is secondary
- Images of roses should dominate; avoid heavy abstract decoration

## Typography
- Georgian script needs generous line-height (1.6+) for readability
- Font sizes: mobile-first, minimum 16px body text

## Component Patterns
- Cards: subtle shadow, hover lift, border-radius ~8px
- Buttons: filled primary action, outlined secondary, clear hover state
- Images: object-fit: cover, aspect-ratio preserved, lazy loading
- Forms: clear labels above inputs, visible focus states, success/error feedback

## UX Rules
- Every destructive action (delete) needs a confirmation dialog
- All async actions (Supabase calls) need loading states
- Mobile navigation must be tested — drawer pattern used in navbar.css
- Toast notifications auto-dismiss after 3s
