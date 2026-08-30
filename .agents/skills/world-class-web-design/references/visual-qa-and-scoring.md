# Visual QA and scoring

## Required QA loop

1. Render or open the affected experience at representative desktop, tablet, and mobile widths.
2. Compare it with `docs/design-dna.md` and adjacent production components.
3. Exercise all affected states: default, hover, focus, active, loading, disabled, empty, error, expanded, and overlay where applicable.
4. Check alignment, overflow, wrapping, spacing rhythm, typography, icon geometry, contrast, tap targets, and motion.
5. Fix the highest-impact defects first.
6. Repeat the visual check after each meaningful correction.
7. Score the result. Substantial work must reach 90/100 and have no critical defect.

Use real screenshots or browser inspection whenever available. Do not infer visual correctness from a successful build alone.

## 100-point rubric

Each category is scored from 0 to 10, then weighted.

| Category | Weight |
| --- | ---: |
| Visual coherence and Design DNA adherence | 15 |
| Buttons, cards, controls, and icon consistency | 15 |
| Responsive behavior | 15 |
| Typography and content hierarchy | 10 |
| Layout, alignment, and spacing rhythm | 10 |
| Accessibility | 10 |
| Performance and implementation restraint | 10 |
| Motion and microinteraction quality | 5 |
| Content clarity and task flow | 5 |
| State coverage and final visual QA | 5 |

Calculate the weighted score with `scripts/score-ui-quality.ps1`.

Example input:

```json
{
  "visualCoherence": 9,
  "componentConsistency": 9,
  "responsive": 10,
  "typography": 9,
  "layoutSpacing": 9,
  "accessibility": 9,
  "performance": 9,
  "motion": 8,
  "contentFlow": 9,
  "stateCoverage": 9
}
```

## Automatic failure conditions

Do not pass substantial design work when any of these remain:

- horizontal overflow or clipped primary content;
- inaccessible keyboard path or invisible focus;
- unreadable contrast or missing form labels;
- background scrolling behind a modal;
- inconsistent primary button treatment within the same product;
- broken loading, error, empty, or disabled state;
- motion that ignores reduced-motion preferences;
- preventable major layout shift or a clearly excessive asset/library cost.
