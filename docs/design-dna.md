# Design DNA — «Здорова Родина»

## Character

Warm, trustworthy and precise medical care. The public site feels calm and human; the admin panel feels efficient, compact and unambiguous. Every screen belongs to one system.

## Visual language

- Primary ink: `#073f45`
- Brand teal: `#087f82`
- Accent orange: shared site token `--orange` (`#ff7900`) for brand accents and primary actions
- On orange action surfaces, text and arrows are white, never dark (owner preference, 2026-09-05). Preserve this in default, hover and focus states.
- Soft surface: alias of `--surface-neutral` (`#f1f3f5`)
- Neutral information surface: `--surface-neutral: #f1f3f5`, shared by pale public information panels, preparation blocks, schedules, price headers and disclosure backgrounds. Avoid separate mint/grey default fills and decorative gradients on these surfaces. White canvas/cards, brand panels, semantic selection/hover/error/success states and image treatments remain independent.
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

- Public pages: header, footer, hero banners, catalogs and editorial sections share `--site-content-width`, capped at 1240 px with 24 px side gutters (16 px at 760 px and below). Nested sections use their parent width without subtracting the gutters again. Mobile header/footer surfaces stay full-bleed while their content uses the same gutter. Admin editor workspaces keep their independent widths.
- Tablet below 1180 px: workspace stacks while preserving preview and action order.
- Mobile below 760 px: all paired fields become one column; actions remain touch-friendly and never overflow.
- Small mobile below 430 px: horizontal padding and typography tighten without hiding core actions.

## Motion and accessibility

- Interactive overlays share `--overlay-blur: 24px` on a transparent background without tint, edge gradients or backdrop fade (owner preference, 2026-09-18). Do not stack content blur with backdrop blur. Decorative photo filters remain independent.

- State transitions last 150–220 ms and animate opacity/transform only where possible.
- Modal forms share a 300 ms ease entrance: opacity 0–1, scale .975–1 and a 16 px upward reveal; corners stay fixed. Reduced motion disables the reveal.
- Focus-visible rings are always present; controls retain semantic labels and keyboard behavior.
- Destructive actions require confirmation.
- Loading disables repeated submission and communicates progress.
- `prefers-reduced-motion` removes non-essential transitions.

## Quality gate

Substantial UI work is complete only after desktop and mobile visual QA, interaction-state checks, responsive overflow checks and a score of at least 90/100 from the repository UI quality rubric.

## Public banner typography

- Public hero and promotional headings share Manrope, weight 450 and letter-spacing -0.02em. The general banner tokens in globals.css use line-height 1.14; service banners use the approved 1.16 scale below.
- Service hero titles and the All Services intro follow the approved wart-removal scale: clamp(36px, 3.4vw, 48px), weight 450, line-height 1.16 and tracking -0.02em; at <=760px use clamp(28px, 7.2vw, 32px). Shared service-banner tokens live in service-banners.css. Descriptions use 17px/1.62 (15px/1.5 mobile), kickers 12px (10px mobile), and hero actions 19px/700 with 54px minimum height (14px/48px mobile), all in Manrope. Keep route-specific artwork and button colours. The homepage retains its own slogan scale.
- Preserve room for Ukrainian accents and descenders; do not restore compressed line heights below 1 or page-specific negative tracking overrides.

## Teal information panels
- Large teal information and support panels use the shared `--brand-panel-gradient`, matching the About page: a restrained upper-right radial highlight over the deep teal diagonal gradient. Apply to NSZU, consultation support, preparation contact panels, and CT/MRI closing calls to action. Keep existing image-backed heroes and control states independent.

## Service hero geometry
All service heroes share app/service-banners.css: 640px desktop, 700px tablet, 760px mobile (800px at 360px and below), with natural growth for enlarged text. Hero outer width follows `--site-content-width`, including 16px mobile gutters; desktop content padding is 48px (32px on tablet). On mobile, the top gap is 12px, corners 24px and content padding 28px 20px 240px, reserving space for the artwork. Photography and colour treatment remain service-specific. CT/MRI use the same geometry via explicit shared classes.

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

## Mobile overlay rendering

At <=1080px, public floating dialogs and navigation blur the normal-flow main element with filter: blur(24px). All panels, including booking, are body portals; wrappers use display: contents and dismissal targets are empty transparent elements. Booking must use the same section/role=dialog structure as callback, rather than the native dialog top layer, which produces a different Safari toolbar boundary. Shared focus trapping and background inertness preserve modal accessibility. Do not add full-screen backdrop-filter surfaces, edge gradients or delayed blur transitions: these break Safari toolbar continuity. Keep safe-area spacing on controls and restore scroll/focus when closing. Desktop retains backdrop-filter overlays.

Mobile booking cards use the existing neutral border without an outer shadow: a tall fixed card would cast that shadow across Safari's toolbar boundary. Booking grid tracks and native selects have explicit inline-size constraints; branch options use city + branch name while the full address remains readable below at every viewport size.

The selected-price summary is a solid brand-teal floating bar, matching the selected “Додано” buttons: a separate service count, prominent white total and an orange “Калькулятор →” action. It retains a 48px mobile tap target, safe-area bottom clearance and space after the catalog; it uses no backdrop filter or duplicate count badge.

CT/MRI body-area navigation uses compact three-column cards (196px minimum height, 14px gaps) with natural content growth; tablet retains two columns and mobile one column at 176px minimum. Keep the artwork, readable descriptions and full-card links; never duplicate a tall minimum height on the inner content.

Within the shared public frame, mobile header logos may shrink while action targets remain at least 44px. At 360px and below home advantages stack and long city/benefit labels retain room. Family medicine feature-panel headings cap at 56px and their point titles at 24px; declaration fields stack at 900px and below to stay inside the panel.

CT/MRI body-area cards have no decorative border in default or hover states. Their shadows use neutral black alpha (.055 at rest, .10 on hover), without a teal cast. Preserve the visible keyboard-only focus outline and the original anatomy artwork.

At <=760px, booking dialogs use a compact rhythm: 20px padding, 12px between form blocks, 6px label gaps and 16px after the introduction. Selected-doctor and study summaries sit directly on the white form, with a muted label, 16px semibold value, 4px gap and a neutral bottom divider. They have no coloured panel or side rail; bottom padding is 16px on desktop and 12px on mobile. Keep 48px fields and submit actions, 44px comment/consent targets, full branch addresses and existing Safari overlay behavior. Desktop dialog spacing is unchanged.

The family declaration application retains its approved mint background (#edf6f5) with a subtle upper-right radial teal highlight (rgba(42,165,164,.16), fading at 34%). This is an intentional exception to neutral information surfaces.

Homepage search fields and result panels have opaque white fills (#fff). The closed field and result panel use neutral black-alpha shadows; the open field sits above the panel and has no shadow of its own, so neither shadow can tint the adjacent white surface. Keep the full-screen mobile panel above the original field.

Homepage search frames use the same light neutral card border in default, focused and expanded states, without darkening on click. The CSS magnifier is optically raised by 4px to centre its circle and descending handle together at every size.

Homepage search rectangular surfaces and controls share --radius-card (20px): search fields, desktop result panel, suggestion buttons and action buttons. Keep circular icon controls and portraits circular; the full-screen mobile panel has square viewport edges. Search results use white unboxed rows with thin neutral separators; a faint neutral tint appears only on pointer hover or keyboard focus within the row.

The homepage About section uses a full-width neutral-grey band. Its copy and reception image remain inside the shared content width and responsive gutters; only the image retains rounded corners.

Homepage Services uses the white canvas; About retains the neutral-grey full-width surface (--surface-neutral, #f1f3f5). Both use 32px vertical padding on desktop/tablet and 24px at <=760px. Service card surfaces and their legibility gradients remain white.

Booking dialogs begin directly with their functional title; omit the redundant “Зворотний зв’язок” eyebrow for doctor, service, calculator and home-visit bookings. The calculator also starts with “Калькулятор вартості”, without the “Ваш вибір” eyebrow. Keep submission status messages and descriptive page-section labels.

The family declaration introduction follows the public editorial scale (36px/28px headings, 16px body copy) and shared 64px/48px section rhythm. Its three steps are a semantic ordered list on white with neutral dividers and orange numbers: three columns on desktop/tablet, compact rows on mobile. Keep the approved mint declaration form and teal NSZU panel independent.

Mobile modal panels retain the shared 300ms entrance on their own surface. The portalled navigation uses a 400ms ease entrance (opacity and 28px translation, without scaling) and a 240ms ease-in exit. Keep its portal, focus trap and scroll lock until the exit completes; background blur is immediate on opening and is removed with the panel. The selected-services icon uses a brief 220ms entrance. Reduced motion disables these reveals. Mobile submenus expand to their natural content height without clipping or long per-item delays.
