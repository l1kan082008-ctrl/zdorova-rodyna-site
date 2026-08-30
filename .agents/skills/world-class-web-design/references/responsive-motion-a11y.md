# Responsive, motion, accessibility, and performance

## Responsive review

Check at minimum:

- Mobile narrow: 320–390 px.
- Mobile wide: 390–480 px.
- Tablet: 768–1024 px.
- Desktop: 1280–1440 px.
- Wide desktop: 1600 px and above.

Also test content-driven stress cases: long labels, large text zoom, empty data, validation errors, open navigation, modal content, and software keyboard visibility.

Prefer container queries or content-driven breakpoints when component behavior depends on available space. Avoid device-specific pixel patches unless a verified platform issue requires them.

## Motion hierarchy

1. Feedback: hover, press, focus, validation.
2. State change: expand, collapse, select, filter.
3. Spatial continuity: drawer, modal, carousel, route transition.
4. Expressive motion: hero or storytelling moments only.

Use transform and opacity for smooth animation. Avoid animating layout-heavy properties when a composited alternative exists. Keep easing and duration consistent with the Design DNA.

Use GSAP for coordinated timelines or scroll-linked storytelling, Rive for compact authored interactive illustration, and Three.js/WebGL for genuinely spatial experiences. Do not add them for a simple reveal or hover.

## Accessibility checks

- Keyboard-only navigation reaches every control in a logical order.
- Focus indicators remain visible against all surfaces.
- Dialogs trap focus, expose an accessible name, close with Escape, and restore focus.
- Menu buttons expose expanded state and relationships.
- Text and controls meet WCAG AA contrast.
- Meaning is not conveyed by color, motion, or position alone.
- Motion is reduced or removed under `prefers-reduced-motion`.
- Zoom to 200% does not hide content or actions.

## Performance checks

- Use responsive images with correct intrinsic dimensions and modern formats.
- Lazy-load below-the-fold media; prioritize the true LCP asset.
- Avoid shipping animation or 3D libraries to routes that do not use them.
- Prevent cumulative layout shift from fonts, media, banners, and async data.
- Audit expensive filters, backdrop blur, large shadows, and continuous animation on mobile.
- Keep interaction feedback immediate and avoid long main-thread tasks.
