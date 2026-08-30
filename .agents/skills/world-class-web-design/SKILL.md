---
name: world-class-web-design
description: Strict, project-wide UI/UX design system for premium website work. Use for every task involving UI, UX, layout, styling, responsive behavior, buttons, cards, navigation, typography, colors, icons, animation, motion, microinteractions, scroll effects, visual effects, or visual QA. Enforces a single Design DNA, consistent components, accessibility, performance, responsive quality, and a scored visual QA gate.
---

# World-Class Web Design

Design and implement every interface as part of one coherent product, not as an isolated screen.

## Required workflow

1. Inspect the existing UI, component library, tokens, routes, responsive behavior, and nearby patterns before editing.
2. Locate `docs/design-dna.md`. If it does not exist, create it from `assets/design-dna-template.md` before substantial design implementation. Update it when a deliberate project-wide design decision changes.
3. Define the affected user journey and the hierarchy of primary, secondary, and destructive actions.
4. Reuse and extend existing tokens and components. Do not create a parallel visual language for one page.
5. Implement the smallest coherent change across all affected breakpoints and states.
6. Run the visual QA loop in `references/visual-qa-and-scoring.md`.
7. Score substantial design work with the 100-point rubric. Do not declare it complete below 90/100; iterate until it reaches at least 90.

Read these references when relevant:

- `references/design-system-rules.md` for visual language and component rules.
- `references/responsive-motion-a11y.md` for breakpoints, motion, accessibility, and performance.
- `references/visual-qa-and-scoring.md` before finishing any substantial visual change.

## Non-negotiable design rules

### One visual language

- Preserve one recognizable system across public pages, admin surfaces, overlays, forms, and responsive variants.
- Use a stable token set for color, typography, spacing, radius, border, shadow, motion, and icon stroke.
- Prefer hierarchy, proportion, whitespace, type, and composition over decoration.
- Draw inspiration from leading digital studios and award-winning sites without copying their layouts or brand assets.

### One button system

- Use shared button variants only: primary, secondary, ghost, and danger.
- Keep heights, horizontal padding, radii, typography, icon size, icon gap, and alignment consistent.
- Provide default, hover, focus-visible, active, loading, and disabled states.
- Keep icons optically centered and use one icon family and stroke language.
- Never create a one-off button style merely to make a section feel different.

### Components and composition

- Keep cards consistent in radius, border, surface, shadow, padding, and interaction behavior.
- Use a deliberate spacing scale and align content to a clear grid.
- Use a restrained type scale with readable line lengths and predictable hierarchy.
- Use brand colors purposefully. Reserve accent colors for actions, status, or emphasis.
- Use subtle borders and shadows to clarify depth, not to decorate every container.
- Prefer semantic, recognizable icons. Do not mix outline, filled, emoji, and unrelated icon sets.

### Responsive behavior

- Design desktop, tablet, and mobile intentionally; do not merely shrink the desktop layout.
- Preserve hierarchy and primary actions at every viewport.
- Prevent overflow, clipping, inaccessible off-screen controls, undersized tap targets, and layout jumps.
- Verify long content, empty states, errors, loading, open menus, dialogs, and on-screen keyboard behavior.

### Motion

- Use motion to explain causality, hierarchy, continuity, or feedback.
- Prefer CSS transitions for simple state changes; use GSAP, Rive, Three.js, or WebGL only when the experience materially benefits and the performance budget permits it.
- Keep motion restrained, interruptible, and consistent. Respect `prefers-reduced-motion`.
- Avoid motion that delays tasks, competes with content, or exists only for spectacle.

### Reject generic AI aesthetics

Reject and redesign:

- generic template-like hero sections and repetitive card grids;
- random gradients, glow, glassmorphism, or oversized blobs without purpose;
- inconsistent buttons, radii, shadows, icon styles, or spacing;
- meaningless bento grids and excessive cards around ordinary text;
- arbitrary oversized headings, empty space, or decorative metrics;
- visual novelty that weakens usability, trust, accessibility, or performance.

## Accessibility and performance gate

- Use semantic HTML, keyboard access, visible focus, labels, useful alternative text, and logical reading order.
- Meet WCAG AA contrast for normal content and controls.
- Keep touch targets at least 44 by 44 CSS pixels where practical.
- Avoid layout shift and unnecessarily heavy assets, libraries, video, shaders, or animation.
- Optimize images, fonts, rendering, and interaction latency. Preserve Core Web Vitals.

## Completion contract

For substantial design work, report:

- the Design DNA decisions followed or updated;
- desktop, tablet, and mobile states checked;
- accessibility and performance checks completed;
- the final UI quality score and any remaining risks.

Do not claim completion when the score is below 90/100 or when a critical responsive, accessibility, interaction, or consistency defect remains.
