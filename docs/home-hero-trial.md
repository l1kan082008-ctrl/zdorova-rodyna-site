# Homepage hero artwork trial

## Current right-side trial (Firefly)

Source: `C:/Users/L1kan/Downloads/Firefly .png`. Asset: `public/hero-family-walking-trial.webp` (1376×768, WebP encoding only). The exact supplied illustration is horizontally reflected with CSS `scaleX(-1)`. The copy occupies a separate pure-white column aligned to the shared content frame. On desktop the artwork extends to the right viewport edge with the original curved silhouette, and the advantages panel overlaps its lower edge, matching the supplied placement reference. The right slot clips unused source whitespace while keeping all three figures visible; below 980px the illustration follows the copy.

Remove `hero--family-walking-trial` to restore the original banner. Replace it with `hero--family-trial hero--family-wide-trial` to restore the preceding full-width trial. All previous assets remain unchanged.

## Previous full-width trial

The original `/hero-family-v4.webp` and the first supplied JPG remain unchanged.
Remove `hero--family-wide-trial` from the hero class to return to the first image trial. Remove both trial classes to restore the original artwork.

Generated with the built-in image_gen tool. Browser assets use WebP encoding; no cropping or stretching is applied. Desktop and tablet use the 3:1 canvas; mobile uses the 4:3 composition.

Assets:
- `public/hero-family-wide-trial.webp`
- `public/hero-family-mobile-trial.webp`

## Wide image prompt

Use case: precise-object-edit. Asset type: full-width medical-center website hero background. Input Image 1 is the edit target, an approved abstract ceramic family illustration. Expand/outpaint it to an ultrawide 3:1 horizontal composition, 2400x800 or the closest supported wide resolution. Preserve the same three embracing sculptures: tall teal parent, ivory parent and small teal child, their exact pose, shape, proportions and tactile ceramic finish. Preserve the orange sun and muted teal botanical motif. Only extend/rebalance the surrounding pale neutral background and whitespace to suit the wider canvas. Keep the entire family and orange sun completely visible with comfortable top and bottom margins; do not crop their heads or sculpture base. Place the family at approximately 76% canvas width, occupying the right third; keep the left 55% mostly clean warm-white negative space for real HTML heading and buttons. Continue the same subtle pale circles and soft grounded shadows naturally to the canvas edges, no seams or rectangular backdrop. Keep foliage restrained near the far edges so it does not interfere with the left text area. No new figures, no extra props, no text, no logo, no watermark. This is artwork only, not a screenshot or UI mockup.

## Mobile image prompt

Use case: precise-object-edit. Asset type: mobile website hero artwork, landscape 4:3 aspect ratio. Input Image 1 is the approved ceramic family illustration to adapt. Preserve the exact same three embracing figures (teal parent, ivory parent, small teal child), pose, shapes, ceramic texture, orange sun, muted teal leaves and soft neutral backdrop. Recompose only the surrounding whitespace for a mobile layout: place the entire family prominently near the center, filling around 75% of the image height, with comfortable margins above both heads and below the complete sculpture base and its shadow. Keep the orange sun entirely visible at upper right; subtly arrange the existing foliage along the right edge. Reduce unused left whitespace compared with the reference, but do not zoom/crop away any part of the family. No extra subjects or props. No text, no logos, no watermark, no UI. Keep all colors and lighting consistent with the reference. Whole subject must fit in frame.
