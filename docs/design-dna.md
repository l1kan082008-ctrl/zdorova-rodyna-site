# Design DNA — «Здорова Родина»

## Character

Warm, trustworthy and precise medical care. The public site feels calm and human; the admin panel feels efficient, compact and unambiguous. Every screen belongs to one system.

## Visual language

- Primary ink: `#073f45`
- Brand teal: `#087f82`
- Accent orange: shared site token `--orange` (`#ff7900`) for brand accents and primary actions
- Soft surface: `#f5f9f8`
- Canvas: `#ffffff`
- Border: `#d5e4e2`
- Muted text: `#587276` on white; lighter teal-grey values are reserved for non-text decoration
- Danger: `#a0443b`
- Typeface: Manrope, using the existing project font stack.
- Spacing follows a 4/8 px rhythm. Dense admin layouts use 8, 12, 16, 24 and 32 px gaps.
- Controls are 44–48 px high with 11–12 px radii. Content cards use 18–20 px radii.
- Shadows are subtle and functional; gradients and glass effects are not used in admin interfaces.

## Components

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

- State transitions last 150–220 ms and animate opacity/transform only where possible.
- Focus-visible rings are always present; controls retain semantic labels and keyboard behavior.
- Destructive actions require confirmation.
- Loading disables repeated submission and communicates progress.
- `prefers-reduced-motion` removes non-essential transitions.

## Quality gate

Substantial UI work is complete only after desktop and mobile visual QA, interaction-state checks, responsive overflow checks and a score of at least 90/100 from the repository UI quality rubric.
