# MASTER UI/UX DESIGN PROMPT — FORMLY

## Premium Minimalist Form Builder SaaS

### 1. Your Role and Mission

Act as a world-class product designer, senior UI/UX engineer, design systems architect, and experienced frontend developer.

Your task is to design and build **Formly**, a premium online form-builder SaaS that competes with Tally, Typeform, Fillout, and Google Forms.

Formly enables users to create beautiful forms, surveys, feedback forms, quizzes, registration forms, lead-generation forms, and questionnaires, then publish them and analyze responses.

The product should combine:

- **Notion:** simplicity, visual clarity, typography, and an almost invisible interface.
- **Tally.co:** frictionless form creation, inline editing, intuitive blocks, and clean public-facing forms.
- **Apple:** precision, restraint, excellent spacing, subtle motion, and premium attention to detail.
- **Linear:** excellent interaction design, keyboard navigation, command menus, and a refined productivity experience.

Do not copy any competitor's interface directly. Take inspiration from their design philosophies and create a distinct identity for Formly.

The final product must feel like a real, carefully crafted SaaS product built by an experienced product team—not a template, a generic admin dashboard, or an AI-generated landing page.

**Core design principle: Remove everything that does not help users create, publish, manage, or understand their forms.**

---

# 2. Brand Identity

## Brand name

Formly

## Brand positioning

A beautifully simple way to create forms and collect meaningful responses.

## Brand personality

- Minimalist, but not boring.
- Premium, but not pretentious.
- Professional, but not corporate.
- Friendly, but not childish.
- Powerful, but never overwhelming.
- Modern, but not dependent on short-lived design trends.

## Existing logo

Use the supplied Formly logo and brand identity as the primary reference.

The logo features a distinctive, abstract geometric symbol inspired by layered or folded forms, paired with a bold, modern sans-serif Formly wordmark.

Preserve the established identity:

- Black symbol and wordmark on light backgrounds.
- White symbol and wordmark on dark backgrounds.
- Strong contrast and clean silhouettes.
- Simple, recognizable geometry.
- Consistent proportions and alignment.

Do not redesign the logo, replace it with an unrelated icon, or invent a new brand mark.

If the actual logo asset is available in the project, reuse it. Prefer SVG for the logo and transparent PNG when SVG is unavailable. Never approximate the actual logo with an emoji or a random icon-library symbol.

Use the standalone symbol for compact applications, including the favicon, application icon, sidebar branding, and loading indicator.

Use the full symbol-plus-wordmark lockup wherever sufficient space is available.

## Brand tagline

Primary option: "Build forms. Get real responses."

Alternative marketing tagline: "Forms that feel effortless."

Use taglines selectively. The dashboard should prioritize functionality over brand messaging.

---

# 3. Overall Visual Direction

The interface must be predominantly monochrome.

The product should feel like a combination of a premium writing application and a professional productivity tool.

Imagine opening Formly and immediately feeling that the interface is calm, intuitive, and exceptionally well considered.

### Visual characteristics

- White and warm-white surfaces.
- Near-black typography.
- Muted gray secondary text.
- Hairline borders.
- Minimal shadows.
- Generous whitespace.
- Strong typographic hierarchy.
- Consistent alignment.
- Small, purposeful icons.
- Subtle hover states.
- Smooth but restrained transitions.
- Clear focus states.
- Almost no decorative elements.

The interface must rely on typography, spacing, alignment, contrast, and hierarchy rather than colorful cards or visual effects.

### Avoid these design clichés

Do not use:

- Purple-blue gradients.
- Glowing backgrounds.
- Glassmorphism everywhere.
- Excessive backdrop blur.
- Giant rounded cards.
- Random floating decorative shapes.
- Oversized dashboard statistics.
- Rainbow charts.
- Excessive pill-shaped buttons.
- Heavy drop shadows.
- Giant hero headings inside the application.
- Emoji as navigation icons.
- Excessive animated backgrounds.
- Artificially complex dashboards.
- Fake AI features that do not work.
- Repeated cards for every section.
- Unnecessary borders around every element.
- Overly saturated accent colors.
- Generic startup landing-page layouts inside the product.

The design should still feel visually rich through its details, not through visual noise.

---

# 4. Design System and Color Tokens

Establish a consistent design system before implementing the interface. Use reusable design tokens rather than hardcoding colors and spacing across components.

## Core color palette

Use these values as the initial palette.

| Token                | Value     | Purpose                            |
| -------------------- | --------- | ---------------------------------- |
| Primary background   | `#FFFFFF` | Main application canvas            |
| Secondary background | `#FAFAF9` | Subtle secondary surfaces          |
| Tertiary background  | `#F5F5F4` | Hover states and selected surfaces |
| Primary text         | `#171717` | Headings and main content          |
| Secondary text       | `#737373` | Supporting text                    |
| Tertiary text        | `#A3A3A3` | Placeholders and subdued labels    |
| Primary border       | `#E5E5E5` | Standard dividers and outlines     |
| Subtle border        | `#F0F0F0` | Low-emphasis separators            |
| Primary button       | `#171717` | Main calls to action               |
| Primary button text  | `#FFFFFF` | Contrast on dark buttons           |
| Hover surface        | `#F5F5F5` | Interactive hover background       |
| Success              | `#15803D` | Successful actions and states      |
| Warning              | `#A16207` | Warnings and attention states      |
| Error                | `#B91C1C` | Errors and destructive actions     |
| Focus ring           | `#737373` | Accessible keyboard focus          |

Use semantic colors only where they communicate meaningful status. Most of the application should remain monochrome.

Avoid using green for every successful action or red for every destructive button. Use color sparingly and intentionally.

## Dark mode

Support dark mode if practical for the existing architecture.

Suggested tokens:

- Main background: `#111111`
- Secondary surface: `#171717`
- Tertiary surface: `#202020`
- Primary text: `#FAFAFA`
- Secondary text: `#A3A3A3`
- Primary border: `#303030`

Dark mode must be designed deliberately. Do not simply invert all colors. Preserve contrast, hierarchy, readable inputs, and clearly differentiated surfaces.

The public-facing forms should also support a consistent light and dark appearance, according to the form creator's settings.

## Typography

Use a modern sans-serif typeface such as Inter or Geist.

Prefer a consistent font family across the application. A system-font fallback is acceptable.

Typography should feel similar to Notion and Linear: neutral, readable, and carefully spaced.

Suggested type scale:

| Element               |    Size |  Weight |
| --------------------- | ------: | ------: |
| Main page title       | 26–30px |     600 |
| Section heading       | 18–20px |     600 |
| Card or panel heading | 15–16px |     600 |
| Body text             |    14px |     400 |
| Supporting text       |    13px |     400 |
| Metadata              |    12px | 400–500 |
| Small labels          | 11–12px |     500 |
| Public form question  | 22–32px | 500–600 |

Use tighter letter spacing for larger headings and normal letter spacing for body content.

Do not make every heading bold. Use weight and spacing to establish hierarchy.

Keep line heights comfortable:

- Body: 1.5–1.65.
- Headings: 1.15–1.3.
- Form questions: 1.25–1.4.

## Spacing system

Use a consistent 4px-based spacing scale.

Recommended values:

`4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80`

Use 16–24px padding for standard panels and 24–32px for larger workspaces.

Do not create large empty spaces simply to make a design appear luxurious. Whitespace must improve focus and readability.

## Borders and radii

Use restrained rounding.

- Small inputs: 6–8px.
- Buttons: 7–9px.
- Dropdowns and popovers: 8–10px.
- Dialogs: 12–14px.
- Larger containers: 10–12px.
- Small status badges: 4–6px or a subtle pill when appropriate.

Avoid making every component fully rounded.

Prefer 1px borders with subtle contrast. Shadows should be reserved for floating layers such as dropdowns, popovers, and modals.

---

# 5. Application Layout

Create a responsive SaaS application with a consistent navigation system and a spacious central workspace.

The application must have distinct experiences for:

1. Marketing website.
2. Authentication.
3. Main dashboard.
4. Form creation and editing.
5. Form preview.
6. Published forms.
7. Response management.
8. Analytics.
9. Workspace and account settings.

Keep the visual language consistent across every area.

## Main application shell

On desktop, use a compact left sidebar and a flexible main content area.

Suggested structure:

- Left sidebar: approximately 232–256px.
- Main content: remaining viewport width.
- Standard content maximum width: approximately 1200px where appropriate.
- Editor workspace: use the full available width.
- Top navigation: approximately 56–64px high.

The sidebar should feel like Notion's: quiet, efficient, and easy to navigate.

### Sidebar contents

At the top:

- Formly logo.
- Workspace switcher.
- Collapse/expand control.

Main navigation:

- Home.
- All forms.
- Templates.
- Responses, if a consolidated response inbox exists.
- Analytics.

Workspace section:

- Recent forms.
- Pinned forms.
- Optional folders or collections.

At the bottom:

- Help and documentation.
- Settings.
- User avatar and account menu.

Do not fill the sidebar with unnecessary navigation items. Use separators and spacing to organize it.

### Sidebar interactions

- Hovering over a navigation item should reveal a subtle gray background.
- Active items should have a clear but understated selected state.
- Collapsing the sidebar should leave recognizable icons.
- Tooltips should appear on hover when labels are hidden.
- The workspace switcher should open a real dropdown.
- Recent forms should link to their corresponding editors.
- The account menu should expose functional account actions.

On mobile, replace the permanent sidebar with a responsive drawer or compact navigation appropriate to the current screen.

---

# 6. Dashboard — The Main Workspace

The dashboard is where users should immediately understand what to do next.

It should feel like opening a clean workspace, not a page full of KPI cards.

## Dashboard header

Display:

- A small contextual greeting, if useful.
- Main heading: "Your forms" or "Good morning" followed by a clear workspace section.
- Supporting text such as "Create, manage, and share your forms."
- Primary action: "Create form".
- Secondary action: "Explore templates".

Keep the heading concise.

Avoid oversized hero sections and excessive welcome illustrations.

## Quick creation

Provide a prominent but restrained creation entry point.

When users click "Create form", open a creation menu with:

- Start from scratch.
- Use a template.
- Import a form, if supported.
- Duplicate an existing form.

Use a clean dropdown or small modal rather than a large marketing-style panel.

If AI form generation is implemented, it can appear as an optional creation method. Do not present it as functional until the underlying generation flow exists.

## Form list

Display existing forms in a clean list or compact table.

Recommended columns:

- Form name.
- Status.
- Responses.
- Last updated.
- More actions.

Each row may contain a small form icon or preview indicator.

Use a lightweight list as the default presentation. Offer a grid toggle only if it improves discovery or previewing forms.

The grid view should still be restrained and information-dense.

### Form status

Support visually clear states:

- Draft.
- Published.
- Closed, if supported.
- Archived, if supported.

Use muted text or subtle badges. Do not use bright status colors by default.

### Row interactions

- Clicking a form opens the editor.
- Clicking its response count opens the response viewer.
- Clicking the overflow menu opens a functional menu.
- Hovering reveals row actions.
- Forms can be renamed inline or through a dialog.
- Users can duplicate, publish, unpublish, archive, or delete forms where supported.
- Destructive actions require confirmation when appropriate.

### Empty state

When no forms exist, show:

**"Your next great form starts here."**

Supporting text:

"Create a form from scratch or start with a template."

Provide clear actions:

- Create your first form.
- Browse templates.

Use a simple, tasteful illustration only if it adds value. A small abstract composition inspired by the existing Formly logo is preferable to generic 3D illustrations.

The empty state should disappear naturally once forms exist.

### Search, filters, and sorting

Include:

- Search forms.
- Filter by status.
- Sort by last updated, creation date, or response count.
- Optional folders or tags when supported.

Keep filtering controls compact and consistent.

Search should actually filter the displayed forms rather than acting as a decorative input.

---

# 7. Form Creation and Editing — The Most Important Screen

The form editor is the heart of Formly.

Spend the most design and implementation effort here.

The editing experience should combine Tally's frictionless block-based creation with Notion's inline editing and the precision of a professional design tool.

The editor must be powerful without feeling complicated.

## Editor layout

Use a clean three-part structure where appropriate:

### A. Top toolbar

Include:

- Back to dashboard.
- Editable form title.
- Save status.
- Undo and redo.
- Preview.
- Share or publish.
- A small overflow menu.

The top toolbar should be compact, with consistent alignment and no unnecessary decoration.

Show useful save states:

- Saving…
- Saved.
- Changes not saved.
- Save failed.

If autosave is implemented, debounce updates sensibly and handle errors. Do not show "Saved" before changes are actually persisted.

### B. Central canvas

The canvas should be the visual focus.

It should resemble a beautifully typeset document rather than a collection of boxed form-builder components.

Use a centered canvas with a comfortable maximum width of approximately 720–800px for the primary form content.

At the top, display:

- Editable form title.
- Optional description.
- Form questions in a vertical sequence.
- A subtle add-block affordance between questions.

Keep the background white or very lightly tinted.

Do not put every question inside a large bordered card.

Each question should appear as a clean content block with its own spacing and a minimal hover toolbar.

### C. Contextual properties panel

Use a right-hand panel, approximately 260–320px wide, when field settings or design settings are needed.

The panel should be contextual rather than permanently overwhelming.

For example, selecting a question should reveal:

- Question type.
- Label.
- Description.
- Required toggle.
- Placeholder.
- Options, when applicable.
- Validation settings.
- Advanced settings.

A form-level selection can expose:

- Theme.
- Typography.
- Layout.
- Background.
- Button style.
- Progress indicator.
- Thank-you screen.

On smaller screens, turn the properties panel into a drawer or contextual sheet.

Do not show every setting at once. Group advanced options into expandable sections.

---

# 8. Block-Based Form Builder

Build a reliable block system for composing forms.

Each block should have a consistent internal structure and editing behavior.

## Initial supported question types

Implement the following as the initial field library:

1. Short text.
2. Long text.
3. Email.
4. Number.
5. Phone number.
6. Website URL.
7. Single-choice selection.
8. Multiple-choice selection.
9. Dropdown.
10. Yes/no.
11. Rating.
12. Linear scale.
13. Date.
14. File upload, if storage and validation are supported.
15. Consent checkbox.
16. Statement or informational text.
17. Page break, if multi-page forms are supported.

The interface should make adding a question effortless.

## Adding blocks

When users click an add-block control, open a small searchable block menu.

Group fields into sensible categories:

**Text:** short text, long text, email, phone, URL.

**Choices:** single choice, multiple choice, dropdown, yes/no.

**Rating:** rating, linear scale.

**Date and files:** date, file upload.

**Layout:** heading, description, page break.

**Other:** number, consent.

Show small monochrome icons and short labels.

Use keyboard navigation in the menu. Allow users to search for a field by name.

If drag-and-drop is supported, it should feel stable and precise. Provide a clear drop indicator without excessive animations.

## Inline editing

Users should be able to click a question title and edit it immediately.

Use a clean, document-like interaction:

- Text cursor appears naturally.
- Editing does not cause layout jumps.
- Enter and modifier-key behavior is deliberate.
- Escape cancels or exits editing where appropriate.
- Changes persist correctly.

For option-based fields, users should be able to edit choices inline, add options, delete options, and reorder them when supported.

Use sensible default content to help users understand a field without forcing them to delete excessive placeholder text.

## Selected block state

When a block is selected:

- Add a subtle outline or background.
- Show the contextual toolbar.
- Expose the relevant properties panel.
- Keep the question itself readable and visually dominant.

Do not use bright blue selection outlines or thick borders unless required by an accessibility convention.

## Block actions

Each block should support appropriate actions:

- Duplicate.
- Delete.
- Move up/down.
- Reorder.
- Mark as required.
- Open advanced settings.

Do not display all controls permanently. Reveal them on hover, selection, or through a contextual menu.

---

# 9. Public Form Experience

The published form must look and feel like a separate, carefully designed product experience.

Respondents should not see the dashboard sidebar, editor controls, or internal application chrome.

The form must load quickly, work well on mobile, and be easy to complete.

## Visual structure

Use a centered form container with a comfortable maximum width of approximately 640–720px for standard forms.

For conversational or one-question-at-a-time forms, use a narrower content area of approximately 560–680px.

Display:

- Formly branding where appropriate.
- Form title.
- Optional description.
- Questions and inputs.
- Required-field indicators.
- Progress, if enabled.
- Primary submit or continue button.
- Optional footer branding.

Maintain generous vertical spacing between questions.

Do not wrap the entire form in a giant shadowed card unless the selected theme calls for it.

## Input styling

Use simple white inputs with subtle borders and clearly visible focus states.

Input height should generally be around 42–48px for standard text fields, adjusted for accessibility and mobile use.

Use:

- Readable placeholder text.
- Comfortable internal padding.
- Clear labels.
- Helpful validation messages.
- Visible required states.
- Proper input types and autocomplete attributes.

For choice questions, use subtle interactive rows or radio controls rather than overly elaborate option cards.

## Submission experience

When a respondent submits the form:

- Validate required fields.
- Display errors next to the relevant fields.
- Preserve valid answers when errors occur.
- Prevent accidental duplicate submissions.
- Show a clear loading state.
- Display a thank-you screen after a successful submission.
- Provide an appropriate retry state if submission fails.

Example success message:

"Thank you for your response."

Supporting text:

"Your answers have been submitted successfully."

The thank-you screen should use the same restrained visual identity as the rest of the product.

## Public form accessibility

- Associate labels with inputs.
- Support keyboard-only completion.
- Use semantic HTML.
- Provide visible focus indicators.
- Announce validation errors appropriately.
- Ensure readable contrast.
- Support mobile touch targets.
- Avoid unnecessary animations that interfere with completion.

---

# 10. Form Preview, Themes, and Customization

Form creators should be able to preview their form before publishing it.

Provide a clear preview mode that removes editor-only controls.

The preview should accurately reflect the published experience.

## Theme customization

Create a simple theme panel with the following options:

- Light and dark appearance.
- Background color.
- Text color, when supported.
- Accent color.
- Font family.
- Form width.
- Input style.
- Button style.
- Border radius.
- Progress indicator.
- Logo visibility.
- Thank-you screen.

Keep the default theme monochrome and premium.

Do not force users to customize dozens of settings before their form looks good.

Provide attractive defaults.

## Preset themes

Offer a small collection of restrained presets:

- Formly Classic — white background, black text.
- Formly Soft — warm white and subtle gray.
- Formly Dark — charcoal background and light text.
- Formly Paper — editorial, typography-focused.
- Formly Contrast — high contrast with prominent controls.

The presets should be meaningfully different without looking like unrelated templates.

If users change a theme setting, update the preview immediately.

Persist the chosen settings with the form and apply them to the published version.

---

# 11. Responses Dashboard

Users need to understand and manage submissions without fighting the interface.

Create a dedicated responses view for each form.

## Header

Display:

- Form name.
- Total responses.
- Published status.
- Date range, if filtering is supported.
- Export action.
- Navigation between editor, responses, and analytics.

Keep the header compact.

## Response overview

Use a small number of useful summary metrics:

- Total submissions.
- Completion rate, if measurable.
- Average completion time, if measurable.
- Recent submissions.

Only display metrics that are actually available from collected data.

Do not invent statistics to make the dashboard look populated.

## Response table

Use a clean, compact table.

Suggested columns:

- Submission identifier or respondent.
- Submission date.
- Completion status, if applicable.
- A few useful response previews.

The exact columns should adapt to the form's question types.

Support:

- Sorting.
- Search.
- Filtering.
- Pagination or sensible incremental loading.
- Selecting a response.
- Opening a detailed response view.
- Exporting CSV, if supported.

Avoid horizontal overflow on smaller screens. Use a responsive layout or a deliberate horizontal scrolling region when necessary.

## Individual response view

When a user opens a response, display answers in a readable document-like layout.

Show:

- Submission metadata.
- Each question.
- Its answer.
- Relevant file links, if supported.
- Navigation to the previous or next response, if supported.

Use strong typography and subtle separators.

Do not display raw database structures or technical identifiers as the primary interface.

---

# 12. Analytics

Create a simple analytics experience that answers real questions.

Avoid turning Formly into a complex business intelligence platform.

Potential metrics include:

- Total views.
- Started forms.
- Completed submissions.
- Completion rate.
- Drop-off by question, when the necessary events are collected.
- Submission trends over time.

Only display analytics that the underlying application actually tracks.

## Chart styling

Charts should use a monochrome visual language.

- Dark lines or bars for primary data.
- Subtle gray grid lines.
- Minimal axis labels.
- Restrained tooltips.
- Clear date ranges.
- No unnecessary gradients.
- No rainbow palettes.

Use charts only when they communicate something more effectively than a simple number or table.

On mobile, simplify charts and prevent labels from colliding.

Provide a useful empty state when insufficient data exists.

---

# 13. Templates Library

The templates page should help users start quickly.

Provide categories such as:

- Contact.
- Customer feedback.
- Event registration.
- Lead generation.
- Job applications.
- Surveys.
- Education.
- Quizzes.
- Product research.
- Order requests.

Use a restrained grid of template previews.

Each template should include:

- Template name.
- Short description.
- Category.
- Small visual preview.
- Use-template action.

Use subtle borders and restrained hover states.

Avoid huge, colorful template cards.

When users select a template, create a new form using that template's actual structure.

Do not make the entire template gallery look like a marketing website.

---

# 14. Marketing Website

The public marketing website should communicate Formly's value without compromising the minimalist brand.

Use the same black-and-white visual identity.

## Navigation

Include:

- Formly logo.
- Product.
- Templates.
- Pricing.
- Documentation or Help.
- Sign in.
- Get started.

Keep navigation simple and unobtrusive.

## Hero section

Suggested headline:

**"Forms that feel effortless."**

Supporting text:

"Create beautiful forms, collect meaningful responses, and understand what matters—all without the complexity."

Primary CTA: "Start building"

Secondary CTA: "Explore templates"

Use a realistic product preview showing the actual Formly editor or a representative form. The preview should reinforce the product rather than become a decorative image.

## Product showcase

Present the main capabilities through a small number of carefully designed sections:

- Create forms effortlessly.
- Customize the experience.
- Share forms anywhere.
- Understand responses.
- Turn submissions into useful insights.

Use authentic UI previews with consistent typography and spacing.

Avoid generic stock photos, floating dashboard cards, excessive gradients, and fake product screenshots.

## Social proof

Only display real customer testimonials, actual usage statistics, or verified integrations.

If none exist yet, omit the section or use a transparent product demonstration instead.

Never fabricate customer logos or numerical claims.

## Pricing

If pricing is implemented, keep the pricing page clean and easy to compare.

Clearly distinguish free and paid features.

Do not invent pricing or claim unlimited features unless those are genuine product capabilities.

---

# 15. Authentication and Onboarding

Authentication screens should feel like a natural extension of the Formly brand.

Use a clean centered layout or a restrained two-column layout with the actual product preview.

Include:

- Sign up.
- Sign in.
- Password reset.
- Email verification, if supported.
- OAuth options, if implemented.

Use accessible form fields, clear errors, loading states, and password visibility toggles where appropriate.

## Onboarding

Keep onboarding short.

Ask only for information that is genuinely useful.

Potential steps:

1. Create or name a workspace.
2. Choose the intended use case, if needed.
3. Create the first form or select a template.

Allow users to skip optional steps.

The goal is to help a new user reach a usable form quickly—not to make them complete a long onboarding questionnaire before seeing the product.

---

# 16. Microinteractions and Animation

Motion should make the interface feel responsive, not theatrical.

Use CSS transitions or an existing animation library when appropriate.

Suggested durations:

- Hover and focus: 100–160ms.
- Dropdown opening: 120–180ms.
- Dialog transitions: 160–220ms.
- Larger layout transitions: 180–260ms.

Prefer subtle opacity and small positional changes.

Examples:

- A button darkens slightly on hover.
- A list row gains a soft background.
- A dropdown fades in and moves a few pixels.
- A modal appears smoothly.
- A selected question reveals its toolbar.
- A successful save shows a subtle confirmation.
- A newly added block enters without a disruptive layout jump.

Use spring-based motion sparingly and only when it improves the interaction.

Avoid:

- Bouncy animations on ordinary buttons.
- Large scale transformations.
- Constantly moving elements.
- Scroll-triggered animations inside the editor.
- Animated gradients.
- Excessive loading skeletons.
- Motion that delays user actions.

Respect `prefers-reduced-motion`.

Every animation must preserve usability and not interfere with typing, dragging, selection, or navigation.

---

# 17. Component Design and Interaction States

Create reusable components for the entire application.

At minimum, establish consistent implementations for:

- Buttons.
- Icon buttons.
- Inputs.
- Textareas.
- Select menus.
- Checkboxes.
- Radio buttons.
- Toggles.
- Tooltips.
- Dropdown menus.
- Context menus.
- Dialogs.
- Drawers.
- Tabs.
- Breadcrumbs.
- Tables.
- Status badges.
- Toast notifications.
- Empty states.
- Loading states.
- Error states.
- Form blocks.
- Question editors.
- Form previews.

Every interactive component must have appropriate states.

### Buttons

Support:

- Default.
- Hover.
- Active.
- Focus-visible.
- Disabled.
- Loading.

Use dark primary buttons, neutral secondary buttons, and subtle ghost buttons.

Reserve red or similarly prominent destructive styling for genuinely destructive actions.

### Inputs

Support:

- Empty.
- Filled.
- Focused.
- Disabled.
- Invalid.
- Read-only.

Labels must remain readable when the input is focused or populated.

### Overlays

Dropdowns, popovers, dialogs, and drawers should:

- Have correct stacking order.
- Close appropriately on Escape.
- Support keyboard interaction.
- Avoid being clipped by parent containers.
- Return focus appropriately when closed.
- Work with touch input.

Use consistent behavior across the application.

---

# 18. Responsive Design

The product must work well on desktop, tablet, and mobile.

Do not simply shrink the desktop interface.

## Desktop

Prioritize:

- Full sidebar.
- Spacious editor.
- Contextual properties panel.
- Dense but readable response tables.
- Keyboard-driven workflows.

## Tablet

- Allow the sidebar to collapse.
- Reduce unnecessary margins.
- Make properties panels collapsible.
- Keep the form canvas comfortable to edit.
- Avoid overcrowding the toolbar.

## Mobile

- Replace the sidebar with a drawer or mobile navigation.
- Use a single-column layout.
- Move editor properties into a bottom sheet or drawer.
- Keep critical actions accessible.
- Use appropriately sized touch targets.
- Make public forms particularly easy to complete.
- Adapt response tables into readable rows or cards when appropriate.

Aim for touch targets around 44px where practical.

Test at approximately 375px, 390px, 768px, 1024px, and 1440px viewport widths.

Avoid horizontal page overflow and clipped controls.

The public form experience must be excellent on mobile, even if the full form editor is optimized primarily for desktop.

---

# 19. Accessibility and Usability

Accessibility is part of the design system, not an optional enhancement.

Implement:

- Semantic HTML.
- Correct heading hierarchy.
- Keyboard navigation.
- Visible focus indicators.
- Proper input labels.
- Accessible dialog behavior.
- Meaningful icon-button labels.
- Appropriate ARIA attributes.
- Sufficient color contrast.
- Reduced-motion support.
- Screen-reader-friendly error messages.
- Usable form controls without a mouse.

Do not rely on color alone to communicate errors, status, or selection.

Use native browser behavior whenever it improves reliability and accessibility.

---

# 20. Technical Implementation Requirements

Before writing code, inspect the existing repository and understand its architecture.

Identify the framework, routing, styling system, component library, current screens, state management, API integration, and installed dependencies.

**Do not rewrite a working project from scratch merely to implement the new design.**

Follow these rules:

1. Reuse the existing architecture whenever practical.
2. Preserve working business logic and API contracts.
3. Use the existing styling system if it is already established.
4. Build reusable components instead of duplicating markup.
5. Keep visual tokens centralized.
6. Use the existing router and authentication flow.
7. Keep form definitions, response data, and UI state organized.
8. Separate complex editor components into maintainable modules.
9. Use appropriate form validation.
10. Keep the interface responsive and accessible.
11. Handle loading, error, empty, and success states.
12. Avoid unnecessary dependencies.
13. Do not replace working features with static mockups.
14. Do not hardcode fake user data into production-facing screens.
15. Do not expose secrets or API credentials in client code.

If the project uses React and Tailwind CSS, use them consistently rather than introducing another styling framework without a compelling reason.

Use TypeScript if the existing project uses it or if introducing it is appropriate for the project.

Use a suitable icon library already installed in the project. Prefer consistent monochrome outline icons. Do not mix multiple icon styles or use emojis as replacements for interface icons.

If a suitable icon library is not available, select one consistent library instead of drawing arbitrary icons for each component.

Use CSS variables or equivalent design tokens for colors, typography, spacing, borders, radii, and shadows.

Ensure the resulting code is maintainable and that the design system can evolve without requiring changes to dozens of unrelated components.

---

# 21. Functional Requirements

The final interface must be more than a static visual prototype.

Every visible action must either work or be clearly marked as unavailable.

Examples:

- Create form opens the appropriate creation flow.
- Search filters actual form data.
- Template selection creates a form.
- Question selection opens its properties.
- Adding a field inserts it into the form.
- Deleting a field removes it correctly.
- Reordering fields updates their order.
- Preview displays the current form.
- Theme changes update the preview.
- Publishing changes the appropriate status.
- Share controls provide a working link or sharing workflow.
- Responses display real submission data.
- Export generates a real file when implemented.
- Settings persist when users save them.
- Autosave reflects the actual persistence state.

If a backend feature does not exist, implement the frontend interaction only to the extent supported by the architecture and make the limitation clear. Do not fabricate a successful API response.

Preserve existing API contracts and authentication behavior.

Implement appropriate loading indicators, error messages, and retry paths.

---

# 22. Performance and Reliability

The interface must feel fast and predictable.

Prioritize:

- Fast initial rendering.
- Minimal layout shifts.
- Efficient list rendering.
- Stable form editor interactions.
- Proper debouncing for search and autosave.
- Sensible pagination or incremental loading for large datasets.
- Efficient rendering when a form contains many blocks.
- Lazy loading for noncritical media.
- Clean error handling.
- No unnecessary animation loops.

Do not introduce expensive animation effects or unnecessary client-side dependencies merely to make the application look sophisticated.

Use optimistic updates only where rollback and error handling are properly implemented.

Prevent unsaved changes from being silently lost.

---

# 23. Final Quality Bar

Before considering the work complete, inspect the entire product visually and functionally.

Check the following:

### Visual consistency

- Does the logo match the supplied Formly identity?
- Is the application predominantly black and white?
- Are typography and spacing consistent?
- Are borders subtle and intentional?
- Are shadows used sparingly?
- Does the interface feel premium without looking empty?
- Are all screens part of the same design system?

### Usability

- Can a new user create a form without unnecessary friction?
- Is the editor understandable without a tutorial?
- Are question controls discoverable?
- Can users preview and publish their forms?
- Are responses easy to find and read?
- Do empty and error states provide clear next steps?

### Functionality

- Do all visible buttons work?
- Do forms validate correctly?
- Do settings persist?
- Does the editor handle keyboard interaction?
- Does the application recover from errors?
- Are save states accurate?
- Are published forms usable on mobile?

### Technical quality

- Does the application run without errors?
- Are existing routes and features preserved?
- Are components reusable?
- Is there any broken layout at common screen sizes?
- Are there console errors or failed network requests?
- Does the final implementation use real data where available?

Fix obvious visual inconsistencies and functional defects before declaring the work complete.

---

# 24. Execution Strategy

Work in the following order.

**Phase 1 — Inspect:** Understand the repository, identify the existing architecture, and locate the current logo asset.

**Phase 2 — Establish the design system:** Define typography, colors, spacing, borders, radii, buttons, inputs, and shared layout components.

**Phase 3 — Build the application shell:** Implement the sidebar, workspace header, navigation, and responsive layout.

**Phase 4 — Build the dashboard:** Implement form management, creation flows, search, filtering, and empty states.

**Phase 5 — Build the editor:** Prioritize the block canvas, field insertion, inline editing, properties panel, autosave, preview, and publishing.

**Phase 6 — Build the respondent experience:** Implement published forms, validation, submission, and success states.

**Phase 7 — Build responses and analytics:** Implement response tables, individual submissions, exports, and data-backed analytics.

**Phase 8 — Complete the product:** Add templates, settings, authentication, and marketing screens as required by the project.

**Phase 9 — Refine:** Test responsiveness, keyboard navigation, accessibility, animation, visual consistency, and functionality.

Adapt this sequence to the existing codebase rather than forcing unnecessary architectural changes.

If time is limited, prioritize a complete, polished core workflow over many half-finished screens.

---

# 25. The Final Vision

Formly should feel like a tool that gets out of the user's way.

When someone opens the dashboard, they should immediately know how to create a form.

When they enter the editor, it should feel like writing a document, not configuring a complicated enterprise system.

When someone opens a published form, it should feel thoughtfully designed, readable, and effortless to complete.

When the creator views responses, the information should be organized and useful without overwhelming them.

Every pixel, interaction, and animation should support this experience.

The goal is not to make the application look expensive through visual effects. The goal is to make it feel expensive through exceptional design decisions.

**Design benchmark:** Notion's clarity, Tally's creation experience, Linear's interaction quality, and Apple's attention to detail.

**Brand:** Formly.

**Visual identity:** Monochrome, geometric, typography-led, restrained, and premium.

**Product philosophy:** Powerful functionality. Minimal interface. Effortless creation.

Build Formly as a coherent, production-minded SaaS experience—not just a collection of attractive screens.
