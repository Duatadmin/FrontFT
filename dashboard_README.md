Premium Analytics Dashboard — Detailed Deconstruction

1. Layout Anatomy

#

Zone

Sub‑elements

Notes

1

Sidebar (Left Rail ≈ 250 px)

• Brand logo & name• Vertical menu list (icon + label + caret for nested)• Section dividers (thin lines)• Upgrade CTA card (90 × 140 px)• Account mini‑card (avatar + name + email + external‑link icon)

Fixed, dark‑on‑darker contrast (≈ #0F1014 on #050608). Icons in desaturated gray, active state in neon‑green.

2

Top Bar (inside content frame)

• H1 page title (“Analytics”)• Search input (glass icon + placeholder)• Month dropdown (pill button)

Pseudo‑sticky, sits on same dark surface as cards.

3

KPI Card Row

Four 200 × 100 px cards: metric icon + label, big number, badge w/ % delta & trend arrow, ••• menu.

Card radius 24 px, inner padding 20 px.

4

Main Grid

Left column 1/3 width → donut gauge card (export btn). Right 2/3 → stacked bar chart.

24 px gap grid. Chart cards equal height.

5

Bottom Grid

Left 2/3 → line chart card. Right 1/3 → semi‑circular gauge.

Same card style.

Grid System — 12‑col CSS grid inside the content viewport, 24 px gutters, card min‑height 280 px.

2. Visual Style Guide

Colors (HSL approximation)

Token

Hex

Usage

bg-body

#090A0F

Overall page background.

bg-panel

#12131A

Sidebar background.

bg-card

#1C1D24

All cards.

bg-card-hover

#24262F

Hover / active.

text-primary

#E9E9EB

Headings / numbers.

text-secondary

#9A9AA2

Labels.

accent-green

#3AF27F

Positive delta, active menu.

accent-red

#F44336

Negative delta.

accent-purple

#B99EFF

Logo accent.

gradient-bg

radial top (lavender → transparent)

Hero subtle backdrop.

Typography

Purpose

Font

Weight

Size / Line‑height

H1

Inter

700

28 / 34 px

KPI number

Inter Mono

600

24 px

Body

Inter

400

14 / 20 px

Effects

Glass‑morphism subtle on cards: background: rgba(28,29,36,0.7) + backdrop‑filter: blur(6px).

Card shadow: 0 4px 20px rgba(0,0,0,0.35).

Border radius: 24 px outer, charts inset 16 px.

Framer Motion hover lift**: translateY ‑4 px, shadow intensify.

Iconography

Lucide‑react, 18 px stroke, color inherits text.

KPI trend arrow: small 10 px glyph filled accent color.

Data Viz

Recharts stacked bar + radial bar + area chart.

Palette for series: #8B5CF6 (violet), #22D3EE (cyan), #FDE047 (amber).

3. Cursor Implementation Prompt

You are ChatGPT acting as the project lead.

Context:
- Existing codebase: React + Tailwind + shadcn/ui + lucide‑react + recharts.
- Current progress dashboard uses dark cards on light body; we need to refactor to premium dark theme matching the spec above.

### Deliverables (one PR):
1. **Global Theme**
   - Create `tailwind.preset.ts` with color tokens from section 2.
   - Add `font-display: swap` for Inter & Inter Mono via @next/font.
   - Configure shadcn/ui `card` and `button` variants to use `bg-card` etc.

2. **Layout Refactor** (`/src/components/layout/AnalyticsLayout.tsx`)
   - Implement 12‑col CSS grid with `grid-cols-12 gap-6` inside `<main>`.
   - Sidebar extracted to `Sidebar.tsx`; make it collapsible (width 72 px vs 250 px) with framer‑motion width animation.

3. **KPI Card Component**
   - Props: `icon: LucideIcon, label: string, value: string, deltaPct: number`.
   - Positive vs negative delta uses accent‑green / accent‑red, arrow up / down.
   - Include ••• popover menu (shadcn `DropdownMenu`).

4. **Charts**
   - Donut gauge → Recharts `RadialBarChart` 270° arc, center number.
   - Stacked bar chart & area graph styled per palette.
   - Wrap each in `Card` with header slot (title + period selector + export btn).

5. **Theming Playground (temporary dev‑only)**
   - Add `ThemeTuner` floating panel (bottom‑right) toggled with `⌘+K` that exposes Color token editors (input type color) and a typography scale slider (100 –110 %).
   - Persist tweaks to `localStorage` so designer can iterate live.

6. **Tests**
   - Add jest + testing‑library smoke test that the layout renders and cards accept props.

7. **Storybook**
   - New stories for `KpiCard`, `Sidebar`, each chart variant.

### Constraints
- Keep PR ≤ 500 LOC (exclude generated stories).
- Use type‑safe React (TS strict).
- No inline styles; rely on Tailwind tokens & classnames library.
- Accessibility: sidebar nav must be keyboard navigable, `aria-current` on active link.

### Acceptance Criteria
- Page matches visual spec within 2 px spacing tolerance.
- Switching to compact sidebar keeps grid responsive.
- ThemeTuner correctly overrides CSS vars and survives page reload.

This document gives the design spec and an engineer‑ready Cursor prompt to migrate your dashboard to the premium dark analytics style.

