# Design DNA — «Здорова Родина»

## Character

Warm, trustworthy and precise medical care. The public site feels calm and human; the admin panel feels efficient, compact and unambiguous. Every screen belongs to one system.

## Visual language

- Primary ink: `#073f45`
- Brand teal: `#087f82`
- Accent orange: shared site token `--orange` (`#ff7900`) for brand accents and primary actions
- On orange action surfaces, text and arrows are white, never dark (owner preference, 2026-09-05). Preserve this in default, hover and focus states.
- Soft surface: `#f5f9f8`
- Neutral information surface: `#f1f3f5`, used where a calm grey background should not carry a teal tint
- Canvas: `#ffffff`
- Border: `#d5e4e2`
- Muted text: `#587276` on white; lighter teal-grey values are reserved for non-text decoration
- Danger: `#a0443b`
- Typeface: Manrope, using the existing project font stack.
- Spacing follows a 4/8 px rhythm. Dense admin layouts use 8, 12, 16, 24 and 32 px gaps.
- Controls are 44–48 px high with 11–12 px radii. Content cards use 18–20 px radii.
- Shadows are subtle and functional; gradients and glass effects are not used in admin interfaces.

## Components

- Homepage services precede the promotional carousel. Mobile hero art and advantages are compact; the approved doctor fan and its scrolling remain unchanged. Quick actions use real links, and priced cards offer booking directly.

- Home search starts with quick directions, uses full-width readable result groups, preserves doctor queries, and keeps the selection summary sticky. Result counts distinguish shown items from total matches. Arrow keys focus result links; Enter opens the focused result (or first result from the search input).

- One button system: teal primary, quiet outlined secondary, red outlined destructive action.
- One form system: label above control, consistent height, border, focus ring and error placement.
- One card system: white surface, fine teal-grey border, restrained shadow.
- Icons are simple, single-colour and aligned to the same optical box.
- Lists expose state and hierarchy without decorative noise.

## Responsive behavior

- Desktop: content is capped at 1420 px; editor workspaces use a compact list rail and a flexible editor.
- Tablet below 1180 px: workspace stacks while preserving preview and action order.
- Mobile below 760 px: all paired fields become one column; actions remain touch-friendly and never overflow.
- Small mobile below 430 px: horizontal padding and typography tighten without hiding core actions.

## Motion and accessibility

- Interactive overlays share `--overlay-blur: 24px` and a light blue-grey tint at 32% opacity, matching the owner's strong-blur reference. Do not stack content blur with backdrop blur. Decorative photo filters remain independent.

- State transitions last 150–220 ms and animate opacity/transform only where possible.
- Modal forms share a 300 ms ease entrance: opacity 0–1, scale .975–1 and a 16 px upward reveal; corners stay fixed. Reduced motion disables the reveal.
- Focus-visible rings are always present; controls retain semantic labels and keyboard behavior.
- Destructive actions require confirmation.
- Loading disables repeated submission and communicates progress.
- `prefers-reduced-motion` removes non-essential transitions.

## Quality gate

Substantial UI work is complete only after desktop and mobile visual QA, interaction-state checks, responsive overflow checks and a score of at least 90/100 from the repository UI quality rubric.
