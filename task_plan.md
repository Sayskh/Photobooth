# Task Plan: KioskSnap Photobooth Webapp (IMK Project)

**Goal:** Build a production-grade, touchscreen-first Photobooth Webapp kiosk following IMK/HCI principles with Next.js, Tailwind CSS, Prisma (PostgreSQL/MySQL), WebRTC Camera, Canvas Photo Composite, Cashier Token/QRIS Payment, and Silent Print + QR Softfile Download.

---

## Phases

### Phase 1: Project Scaffolding & Database Foundations
**Status:** complete
- Initialized Next.js App Router project with TypeScript and Tailwind CSS.
- Configured Prisma schema with `AdminUser`, `Voucher`, `Booth`, `Session`, `Transaction`, `FrameTemplate`, `PhotoShot`, `PhotoComposite`, `PrintJob`.
- Synchronized database with `prisma db push` and seeded templates, admin, and test vouchers.
- Created singleton Prisma client in `src/lib/prisma.ts`.

### Phase 2: Kiosk Flow & Hardware Capture (WebRTC)
**Status:** complete
- Implemented Attract Screen ("Sentuh Layar untuk Mulai") with 100vw/vh touch target and 5x logo tap secret gesture for admin.
- Implemented WebRTC camera component with horizontal mirroring and automated pose sequencing.
- Implemented synthesized Web Audio API sound effects (tick, shutter, click, success).

### Phase 3: Touch Canvas Editor & Photo Customization
**Status:** complete
- Built HTML5 Canvas compositor in `src/lib/canvas.ts` generating 300 DPI exports (2x6 strip, 4x6 grid, duo polaroid).
- Implemented pixel filter pipeline (Normal, B&W, Vintage, Warm, Cool).
- Implemented interactive touch sticker placement (drag, scale, rotate, delete) and frame color palettes.
- Implemented 90-second editing countdown timer with warning cues.

### Phase 4: Payment System & Token Verification
**Status:** complete
- Built virtual touch numpad with audio feedback for 6-digit cashier voucher token verification.
- Built QRIS dynamic payment simulator with instant verification for easy demo.
- Integrated atomic Prisma transactions to link vouchers, transactions, and session lifecycle.

### Phase 5: Silent Print & QR Softfile Distribution
**Status:** complete
- Configured CSS `@media print` rules for borderless photo prints and Chrome `--kiosk-printing` compatibility.
- Generated dynamic QR code linking to `/download/[token]`.
- Built mobile-responsive public download landing page with single-click PNG composite and individual shot downloads.

### Phase 6: Admin Panel & Cashier Struk Printing
**Status:** complete
- Built Admin/Cashier portal at `/admin` and modal with PIN verification.
- Implemented one-click "Buat Token & Cetak Struk Tunai" with printable thermal receipt layout (58mm/80mm).
- Implemented camera hardware selector and session duration adjustments.
- Added business statistics dashboard (revenue, sessions, paper usage, active vouchers).

### Phase 7: Verification, Antislop Audit & Delivery Gate
**Status:** complete
- Built production Next.js application (`npm run build` compiled with 0 errors).
- Verified full end-to-end database & session integration via `scripts/test-api.mjs` (7/7 tests passed).
- Passed Antislop Delivery Gate: zero em dashes, zero buzzwords, touch targets ≥48-64px, WCAG AA contrast.
- Prepared runbook in `README.md`.

---

## Next Step
All phases complete. Project ready for presentation and live demonstration.
