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

- Header dropdowns use one explicit open state: desktop mouse entry opens a category and leaving it closes it; click or Enter/Space toggles it. Switching closes the previous category. Outside click, leaving navigation focus and Escape dismiss it. Touch uses clicks. CSS hover and focus styling must not independently keep panels or backdrops open.

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

- Interactive overlays share `--overlay-blur: 24px` and a light neutral tint `rgba(238, 241, 246, .58)` (owner preference, 2026-09-17). Do not stack content blur with backdrop blur. Decorative photo filters remain independent.

- State transitions last 150–220 ms and animate opacity/transform only where possible.
- Modal forms share a 300 ms ease entrance: opacity 0–1, scale .975–1 and a 16 px upward reveal; corners stay fixed. Reduced motion disables the reveal.
- Focus-visible rings are always present; controls retain semantic labels and keyboard behavior.
- Destructive actions require confirmation.
- Loading disables repeated submission and communicates progress.
- `prefers-reduced-motion` removes non-essential transitions.

## Quality gate

Substantial UI work is complete only after desktop and mobile visual QA, interaction-state checks, responsive overflow checks and a score of at least 90/100 from the repository UI quality rubric.

## Public banner typography

- All public hero and promotional headings share Manrope, weight 450, line-height 1.14 and letter-spacing -0.02em through banner heading tokens in globals.css.
- Service hero titles share clamp(38px, 4.1vw, 66px); below 760px they use clamp(28px, 7.5vw, 44px). The homepage keeps a smaller desktop scale to fit its two-line slogan.
- Preserve room for Ukrainian accents and descenders; do not restore compressed line heights below 1 or page-specific negative tracking overrides.

## Teal information panels
- Large teal information and support panels use the shared `--brand-panel-gradient`, matching the About page: a restrained upper-right radial highlight over the deep teal diagonal gradient. Apply to NSZU, consultation support, preparation contact panels, and CT/MRI closing calls to action. Keep existing image-backed heroes and control states independent.

## Service hero geometry
All service heroes share app/service-banners.css: 640px desktop, 700px tablet, 760px mobile (800px at 360px and below), with natural growth for enlarged text. Mobile gutters are 12px, top gap 12px, corners 24px, content inset 20px. Photography and colour treatment remain service-specific. CT/MRI use the same geometry via explicit shared classes.

Service information sections use one editorial treatment at every viewport: white canvas, orange markers, unboxed preparation and process rows, and fine teal-grey separators. Desktop keeps paired information columns and three process columns; mobile uses one column. Important notes keep their semantic label/icon without a separate coloured card.

Public directory framing uses neutral #dedfe1 borders and black-alpha shadows, without teal tint. Contact action buttons use the shared pill radius; call actions are labelled Зателефонувати. Preserve approved mint selection surfaces and location-hover gradients.

Public editorial section headings share 36px desktop / 28px mobile, 1.15 line height, weight 450. Section rhythm is 64px desktop / 48px mobile, with a 24px heading-to-content gap. These tokens exclude hero titles, card titles, footer navigation, and bespoke CT/MRI/cardiology/family sections.

The preparation guide reuses FAQ disclosure cards, including their radius, surfaces, typography, spacing, orange numbers, and plus/minus controls. Expanded recommendations and visit checklists have no nested cards. Its closing panel reuses ServiceBookingCta with preparation-specific copy.

Public floating dialogs share white surfaces, neutral #e5e7eb borders, a grey 0 24px 70px rgba(25,32,45,.16) shadow, 28px corners and 60px padding. At <=760px use 24px corners and 24px/20px vertical/horizontal padding. Branch dialogs apply the padding to their header and content panels.

Public overlay scrollbars use one neutral treatment: 4px in WebKit/Blink, thin in Firefox, transparent track, #d5d8dd thumb and #b8bec6 on hover, without decorative gradients or arrow buttons.

Booking and callback fields share 48px height, 12px corners, 16px text, neutral #c9ced5 borders and a #087f82 focus border with a restrained 3px teal-alpha ring. Composite phone fields render focus only around their outer wrapper. Textareas retain natural multiline height and error states retain semantic red.

Directory search controls (prices, doctors and FAQ) use a separate spacious capsule treatment: 62px height and 999px radius, matching the price toolbar and CITO control. Booking fields retain their compact 48px/12px geometry.

## Public page start spacing

All public routes use `--page-start-gap`: 40px desktop/tablet, 24px at 720px and below. Text intros use top padding; visual banners use top margin. Patient wrappers own this spacing so nested introductions and breadcrumbs do not double it. Defined in `app/page-spacing.css`.
