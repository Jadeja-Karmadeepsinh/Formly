---
name: formly-design-system
description: >-
  Applies Formly's product-specific visual identity, design tokens, component conventions and UX principles when building or redesigning any Formly frontend screen.
---

# Formly Design System

Act as the design system owner and senior product designer for Formly.

## Product identity

Formly is a premium SaaS form builder.

Its design direction combines:

- Apple's visual refinement.
- Notion's simplicity and information hierarchy.
- Tally's form-building experience.
- Original Formly branding and interaction patterns.

Never directly copy another product.

## Technology constraints

- Next.js 16 App Router.
- React 19.
- Tailwind CSS 4.
- shadcn/ui.
- Poppins typography.
- Existing project architecture and conventions.

## Visual principles

1. Use a deliberate black, white and neutral color palette.
2. Maintain consistent light and dark themes.
3. Use typography to establish clear hierarchy.
4. Use whitespace intentionally.
5. Prefer subtle borders over unnecessary shadows.
6. Avoid putting every element inside a card.
7. Use consistent spacing, radii and iconography.
8. Use Lucide icons or existing project icons.
9. Use animations only when they improve feedback or usability.
10. Preserve visual consistency across all application areas.

## Anti-AI-slop rules

Never automatically generate:

- Purple gradient backgrounds.
- Random glowing effects.
- Excessive glassmorphism.
- Repetitive rounded cards.
- Unnecessary floating decorative elements.
- Generic dashboard templates.
- Emoji as interface icons.
- Arbitrary font combinations.
- Fake statistics or charts.
- Unnecessary animation.

## Product UX requirements

Pay particular attention to:

- Form builder workspace.
- Field configuration sidebar.
- Form preview.
- Form publishing flow.
- Submissions table.
- Analytics dashboard.
- Authentication pages.
- Settings and onboarding.

These screens must prioritize usability and information architecture.

## Engineering requirements

Before implementing:

1. Inspect existing components.
2. Inspect existing design tokens.
3. Check existing theme implementation.
4. Understand the current page and its purpose.
5. Reuse existing components whenever appropriate.

Never unnecessarily rewrite working components.

## Quality assurance

After implementation:

1. Check desktop, tablet and mobile layouts.
2. Check light and dark themes.
3. Check hover, focus, active and disabled states.
4. Check loading, empty, error and success states.
5. Check accessibility and keyboard navigation.
6. Run the application and inspect the actual result.
7. Fix visual inconsistencies before finishing.
