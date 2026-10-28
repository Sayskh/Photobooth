# DESIGN.md - KioskSnap Studio

## Product Context & Identity
- **Product**: Self-service touchscreen photobooth kiosk for a local cozy cafe.
- **Audience**: Cafe customers, students, couples, friends capturing casual memories.
- **Dial**: `ENERGY 2 / RHYTHM 2 / MOTION 1`
  - *Energy 2*: Warm, balanced, approachable studio aesthetic. No loud casino neons or crypto dark glow.
  - *Rhythm 2*: Clear progressive disclosure across kiosk steps (Attract -> Pay -> Frame -> Camera -> Customize -> Print).
  - *Motion 1*: Snappy tactile touch feedback (`active:scale-98`), subtle flash shutter, no disorienting looping animations.

## Visual Tokens & Palette
- **Base Surface**: Zinc Neutral (`bg-zinc-50` `#FAFAFA` screen background, `#FFFFFF` cards, `border-zinc-200` `#E4E4E7`).
- **Primary Accent**: Deep Matte Ink (`#18181B` / `bg-zinc-900 text-white`) with high-contrast accessibility.
- **Status Accents**:
  - Timer warning: Red Tint (`bg-red-50 text-red-700 border-red-200`).
  - Success / Ready: Emerald Tint (`bg-emerald-50 text-emerald-700 border-emerald-200`).
- **Typography**: System sans-serif with high legibility at arm's length on touchscreen monitors (touch targets >= 44px).
- **Identity Motif**: Clean tactile physical ticket & studio print aesthetic with rounded corners (8-16px, never uniform pill everywhere).
