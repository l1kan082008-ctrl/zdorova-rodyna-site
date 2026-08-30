# Design system rules

## Design tokens

Use named tokens instead of isolated values. Maintain a compact scale:

- Color: brand, accent, text, muted text, surface, elevated surface, border, success, warning, danger.
- Spacing: 4, 8, 12, 16, 24, 32, 48, 64 px or an equivalent project scale.
- Radius: no more than three product radii plus pill and circle.
- Shadow: flat, raised, overlay. Avoid multiple competing shadow recipes.
- Motion: fast 120–180 ms, standard 200–320 ms, deliberate 400–600 ms.
- Type: display, h1, h2, h3, body, small, label. Limit arbitrary sizes.

Document the actual project values in `docs/design-dna.md`.

## Buttons

Use one shared component or class family.

| Variant | Purpose | Visual weight |
| --- | --- | --- |
| Primary | One main action per scope | Solid brand/accent |
| Secondary | Alternative action | Border or quiet surface |
| Ghost | Low-priority utility | Minimal chrome |
| Danger | Destructive action | Restrained danger treatment |

Keep icons 16–20 px for standard buttons, align them optically, and never stretch them. Loading states retain button width to prevent layout shift.

## Cards and surfaces

- Use cards only when grouping or interaction requires a boundary.
- Align headings, metadata, actions, and media consistently across a card family.
- Do not nest cards unless the inner region is a distinct interactive unit.
- Keep hover elevation subtle and never signal clickability on a non-clickable surface.

## Typography

- Prefer one primary family and at most one intentional display family.
- Use weight and spacing before adding colors or containers.
- Keep body copy around 45–75 characters per line on large screens.
- Avoid all-caps for long text and avoid thin weights on low-contrast backgrounds.

## Navigation and overlays

- Keep global navigation placement and behavior stable across routes.
- Use a single dropdown, drawer, modal, and close-button language.
- Lock background scroll for modal interactions and restore focus on close.
- Ensure overlays remain usable with mobile browser chrome and on-screen keyboards.

## Forms

- Keep field height, label spacing, help text, error treatment, and focus styles consistent.
- Place errors next to their source and describe how to recover.
- Distinguish placeholder text from completed values.
- Do not rely on color alone for validation or status.
