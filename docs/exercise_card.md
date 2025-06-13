Exercise Card Component Design Document

Version: 1.1   Date: 2025‑06‑13 (updated)

1 · Purpose & Scope

Design a reusable, data‑driven Exercise Card sourced from the exrcwiki table and rendered in two tiers:

Preview Card – compact tile for list/scroll views.

Full View – immersive detail screen launched from the preview.

The component must be mobile‑first (iOS & Android) with graceful desktop scaling, dark/light theme support, and integrate with our React + Tailwind stack.

2 · Data Source: exrcwiki

Field

Usage

name

Display name (H4 in Preview, H2 in FullView)

equipment

Chip/label

muscle_group

Primary category tag

compound / isolation

Boolean → styled tag

tier

Difficulty chip

gifurl

Media asset.• Preview Card → static JPG/PNG thumbnail (first frame or pre‑generated photo).• FullView → autoplay looping GIF/MP4 video demonstration

maintarget

Main target muscle (FullView)

secondarymuscles

JSON→list chips (FullView)

instructions

JSON→ordered steps (FullView)

pros / cons / tips

Optional JSON blocks (FullView, conditional)

Note: If a dedicated photo_url or video_url field appears later, the media mapper should fall back gracefully.

3 · Preview Card Design

Layout (90 × 120 dp base):

Photo Thumbnail: 1:1 square, rounded‑lg, sourced from gifurl first frame or pre‑exported JPG.

Text Block (stacked):

name (two‑line clamp)

muscle_group (caption)

Footer Chips:

equipment

tier

Tag: compound or isolation

Interaction:

Entire card is tappable / has role="button".

Elevation increase + gentle scale on press.

Opens FullView with fade + slide‑up transition.

4 · Full View Card Design

Section A – Header

name (H2)

Chips: muscle_group, equipment, tier, compound/isolation

Section B – Media Zone

16:9 video container.

Autoplays looping video/GIF from gifurl (muted, plays inline).

Fallback: static thumbnail with play icon overlay.

Section C – Targets

Main Target: maintarget

Secondary Muscles: Chips from secondarymuscles JSON.

Section D – Instructions

Numbered list from instructions JSON.

Section E – Optional Blocks (render only if JSON present)

Tips (callout list)

Pros (✔ bullet list)

Cons (✖ bullet list)

Section F – CTA / Utilities

“Add to Plan”, “Close”, and share options.

Gestures & UX Notes:

Swipe‑down or X closes.

Collapsible accordions for optional blocks to keep scroll length manageable.

Remember accessibility captions for video.

5 · States & Error Handling

Loading: shimmer skeletons for photo & text.

No video: fallback to full‑width photo thumbnail.

Missing instructions: hide section & show generic prompt.

