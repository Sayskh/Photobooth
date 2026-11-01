# Findings & Technical Decisions: KioskSnap

## Architecture & Technology Stack
- **Framework:** Next.js (App Router), TypeScript, Tailwind CSS.
- **ORM / Database:** Prisma ORM targeting PostgreSQL (or MySQL / SQLite for zero-config offline fallback if DB server offline).
- **Camera Integration:** WebRTC `navigator.mediaDevices.getUserMedia` with device enumeration and horizontal mirroring (`transform: scaleX(-1)`).
- **Canvas Rendering:** HTML5 Canvas 2D Context for crisp 300 DPI exports (1200x1800 for 4x6 inch, 600x1800 for 2x6 inch strip).
- **Payment & Voucher:**
  - Cashier POS auto-generates 6-digit alphanum token, prints on 58mm/80mm thermal receipt.
  - Kiosk displays virtual touch numpad with instant verification.
  - QRIS simulator with polling mechanism.
- **Printing:** Native browser print with `@media print` CSS rules, tested for Chrome kiosk printing `--kiosk-printing`.
- **QR Code Softfile:** Client scans QR code pointing to public route `/download/[token]` to fetch high-res composite + individual shots.
- **IMK Constraints:**
  - Touch targets minimum 56x56 px.
  - Clear countdown and status feedback on all screens.
  - Auto-reset after 60s inactivity.
