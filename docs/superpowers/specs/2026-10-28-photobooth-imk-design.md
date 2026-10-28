# Technical Specification & PRD: Photobooth Webapp (Kiosk IMK)

- **Tanggal Dokumen**: 28 Oktober 2026
- **Mata Kuliah**: Interaksi Manusia dan Komputer (IMK)
- **Target Platform**: Touchscreen Laptop / Tablet Kiosk (Browser PWA / Webapp)
- **Status**: Disetujui (Approved for Planning)

---

## 1. Ringkasan Eksekutif & Tujuan Proyek

Aplikasi **Photobooth Webapp** adalah sistem anjungan foto mandiri (*self-service kiosk*) berbasis web yang dirancang dengan prioritas utama pada prinsip-prinsip **Interaksi Manusia dan Komputer (IMK)**. Sistem ini memungkinkan pengunjung mengambil foto dengan hitung mundur otomatis, memodifikasi frame, menambahkan filter, stiker, dan coretan (*doodle*), serta mencetak foto fisik dan mengunduh *softfile* melalui pemindaian QR Code.

Aplikasi dirancang dengan arsitektur **Local-First Client-Server** (Next.js + PostgreSQL/MySQL via Prisma ORM) yang berjalan optimal di satu mesin kios tanpa ketergantungan koneksi internet terus-menerus, namun memiliki kapabilitas sinkronisasi *cloud* untuk akses QR *softfile*, serta fondasi arsitektur yang siap dieskpansi menjadi layanan multi-tenant SaaS untuk kafe dan *commercial pop-up store*.

---

## 2. Analisis Landasan IMK (Human-Computer Interaction)

Sistem ini menerapkan standar desain antarmuka anjungan mandiri (*public kiosk interface*):

| Prinsip IMK | Penerapan dalam Photobooth Webapp |
|---|---|
| **Fitts's Law** | Semua tombol interaksi utama berukuran minimal 56x56 px dengan margin antar tombol ≥16 px agar mudah disentuh akurat dengan jari tanpa stylus. |
| **Visibility of System Status** | Umpan balik langsung pada setiap aksi: countdown timer angka besar, flash visual dan audio saat shutter, progress bar pose (1/4, 2/4, dst), dan loading state status print. |
| **Error Prevention & Recovery** | Virtual keypad voucher kasir hanya menerima digit angka dengan tombol backspace besar; sesi kedaluwarsa otomatis (auto-reset) jika pengguna meninggalkan bilik di tengah sesi. |
| **Shneiderman’s 8 Golden Rules** | Alur linear langkah-demi-langkah (Wizard Flow) mencegah kognitif berlebih; tombol 'Batal/Ulangi' disediakan sebelum tahap cetak; konfirmasi akhir jelas. |
| **Accessibility & Contrast** | Rasio kontras teks dan latar belakang minimal 4.5:1 (WCAG AA), teks petunjuk singkat (microcopy) berbahasa Indonesia yang intuitif bagi semua kalangan usia. |

---

## 3. Alur Pengguna (User Journey Flow)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. Attract Screen (Layar Diam)                                              │
│    - Animasi menarik "Sentuh Layar untuk Mulai" (Touch target 100vw/vh)     │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 2. Pemilihan & Verifikasi Pembayaran                                        │
│    ├── Opsi Tunai: Input 6-Digit Token dari Struk Kasir (Numpad virtual)     │
│    │   (Kasir klik 'Bayar Tunai' -> Auto-generate token di struk thermal)   │
│    └── Opsi Non-Tunai: QRIS Dinamis + Polling status otomatis               │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 3. Pemilihan Template Frame                                                 │
│    - Pilihan layout: Strip 2x6 (3/4 pose) atau Grid 4x6 (4 pose)             │
│    - Pratinjau langsung dimensi cetak                                       │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 4. Sesi Pengambilan Foto (Capture Stage)                                    │
│    - Cermin video live (mirroring WebRTC)                                   │
│    - Hitung mundur audio visual 3.. 2.. 1.. Flash putih layar               │
│    - Pengambilan pose otomatis berurutan sesuai kapasitas frame              │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 5. Kustomisasi Foto (Timer 90 Detik)                                        │
│    - Tab 1: Filter Warna (Normal, B&W, Vintage, Warm)                       │
│    - Tab 2: Warna / Tema Bingkai Frame                                      │
│    - Tab 3: Stiker & Doodle Sentuh (Drag, rotate, scale, hapus)             │
│    - Timer berjalan mundur di pojok atas (merah berkedip saat <15 detik)    │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 6. Output & Distribusi                                                      │
│    - Cetak Fisik: Opsi 1 atau 2 lembar -> trigger silent print              │
│    - QR Softfile: QR Code dinamis besar untuk unduh foto composite & strip  │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 7. Selesai & Auto Reset                                                     │
│    - Ucapan terima kasih, countdown 15 detik kembali ke Attract Screen      │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Kebutuhan Fungsional & Non-Fungsional (PRD)

### 4.1 Fungsional Kios Pengunjung
1. **Pemicu Sesi**: Dukungan pembayaran ganda (input kode voucher fisik dari kasir dan QRIS otomatis).
2. **Kamera WebRTC**: Akses ke kamera perangkat (termasuk USB Webcam eksternal dan mirror feed horizontal).
3. **Penyusun Gambar (Canvas Engine)**: Menggabungkan beberapa frame foto menjadi satu berkas siap cetak 300 DPI secara instan di sisi klien.
4. **Penyuntingan Sentuh**: Menempelkan stiker vektor, memilih palet filter warna real-time, dan mengganti warna background frame.
5. **Pencetakan Otomatis**: Integrasi dengan dialog cetak browser (mendukung Chrome `--kiosk-printing`).
6. **QR Code Generator**: Menghasilkan tautan unik menuju laman unduh aman per sesi.

### 4.2 Fungsional Panel Kasir / Admin
1. **Autentikasi Terproteksi**: Akses via rute `/admin` atau gestur tersembunyi (ketuk logo kios 5x berturut-turut) dilindungi PIN/Kata Sandi.
2. **Auto-Generate Token & Struk Kasir**: Kasir cukup menekan tombol 'Transaksi Tunai' di panel kasir. Sistem secara otomatis menghasilkan token 6-digit unik dan langsung mencetak struk pembayaran thermal (58mm/80mm) yang mencantumkan kode token serta instruksi bagi pengunjung untuk dimasukkan ke layar anjungan kios.
3. **Pengaturan Hardware**: Pemilihan sumber kamera aktif (internal webcam vs USB cam), batas waktu sesi (timeout edit), dan harga default.
4. **Laporan & Log Cetak**: Rekapitulasi jumlah sesi sukses, voucher terpakai, dan estimasi kertas cetak yang keluar.

### 4.3 Kebutuhan Non-Fungsional
1. **Keandalan Kios (Kiosk Reliability)**: Cegah refresh yang tidak disengaja, nonaktifkan menu klik kanan, blokir kombinasi tombol keluar (`Ctrl+W`, `Ctrl+N`, `F11`), serta auto-reset jika ditinggal tanpa aktivitas >60 detik.
2. **Performa**: Waktu render kanvas komposit foto di bawah 2 detik setelah sesi editing selesai.
3. **Kualitas Cetak**: Ukuran canvas disetel ke resolusi cetak standar lab foto (1200x1800 px untuk 4x6 inch pada 300 DPI).

---

## 5. Perancangan Skema Database (ERD)

Database menggunakan **PostgreSQL / MySQL** dikelola dengan **Prisma ORM**.

```
┌──────────────────┐       1:N       ┌──────────────────┐
│    AdminUser     ├────────────────►│     Voucher      │
│  (Kasir / Owner) │                 │  (Token Tunai)   │
└────────┬─────────┘                 └────────┬─────────┘
         │                                    │ 1:1 (optional)
         │ 1:N                                ▼
┌────────▼─────────┐       1:N       ┌──────────────────┐
│      Booth       ├────────────────►│     Session      │
│ (Profil Kios/PC) │                 │ (Sesi Pengguna)  │
└──────────────────┘                 └────────┬─────────┘
                                              │
         ┌──────────────────┬─────────────────┼──────────────────┐
         │ 1:1              │ 1:N             │ 1:1              │ 1:N
         ▼                  ▼                 ▼                  ▼
┌──────────────────┐ ┌─────────────┐  ┌──────────────┐   ┌─────────────┐
│   Transaction    │ │  PhotoShot  │  │PhotoComposite│   │  PrintJob   │
│  (QRIS / Tunai)  │ │ (Raw Jpeg)  │  │(Final Render)│   │ (Log Cetak) │
└──────────────────┘ └─────────────┘  └───────┬──────┘   └─────────────┘
                                              │ N:1
                                              ▼
                                      ┌──────────────┐
                                      │FrameTemplate │
                                      │ (2x6 / 4x6)  │
                                      └──────────────┘
```

### Definisi Skema Prisma (`schema.prisma`):

```prisma
datasource db {
  provider = "postgresql" // atau "mysql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model AdminUser {
  id           String    @id @default(uuid())
  username     String    @unique
  passwordHash String
  role         String    @default("CASHIER") // ADMIN, CASHIER
  vouchers     Voucher[]
  createdAt    DateTime  @default(now())
}

model Voucher {
  id          String       @id @default(uuid())
  code        String       @unique // 6-digit alphanumerik unik
  amount      Int          @default(30000)
  isUsed      Boolean      @default(false)
  usedAt      DateTime?
  expiresAt   DateTime
  createdById String
  createdBy   AdminUser    @relation(fields: [createdById], references: [id])
  transaction Transaction?
  createdAt   DateTime     @default(now())
}

model Booth {
  id             String    @id @default(uuid())
  name           String    @default("Booth Utama")
  sessionTimeout Int       @default(90) // detik jatah edit
  cameraDeviceId String?
  sessions       Session[]
  isActive       Boolean   @default(true)
}

enum SessionStatus {
  AWAITING_PAYMENT
  FRAME_SELECT
  CAPTURING
  EDITING
  PRINTING
  COMPLETED
  ABANDONED
}

model Session {
  id            String          @id @default(uuid())
  boothId       String
  booth         Booth           @relation(fields: [boothId], references: [id])
  status        SessionStatus   @default(AWAITING_PAYMENT)
  transaction   Transaction?
  photoShots    PhotoShot[]
  customization PhotoComposite?
  printJobs     PrintJob[]
  startedAt     DateTime        @default(now())
  completedAt   DateTime?
}

enum PaymentMethod {
  CASH_VOUCHER
  QRIS
}

enum PaymentStatus {
  PENDING
  PAID
  EXPIRED
  FAILED
}

model Transaction {
  id        String        @id @default(uuid())
  sessionId String        @unique
  session   Session       @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  method    PaymentMethod
  amount    Int
  status    PaymentStatus @default(PENDING)
  voucherId String?       @unique
  voucher   Voucher?      @relation(fields: [voucherId], references: [id])
  qrisRef   String?
  paidAt    DateTime?
  createdAt DateTime      @default(now())
}

model FrameTemplate {
  id          String           @id @default(uuid())
  name        String           // "Strip Klasik 2x6", "Grid Pop 4x6"
  layoutType  String           // STRIP_2X6, GRID_4X6
  slotsCount  Int              @default(3) // 3 atau 4 shot pose
  overlaySvg  String?
  composites  PhotoComposite[]
  isActive    Boolean          @default(true)
}

model PhotoShot {
  id         String   @id @default(uuid())
  sessionId  String
  session    Session  @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  poseIndex  Int      // 1, 2, 3, 4
  filePath   String   // lokasi simpan file mentah lokal
  capturedAt DateTime @default(now())
}

model PhotoComposite {
  id              String        @id @default(uuid())
  sessionId       String        @unique
  session         Session       @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  frameTemplateId String
  frameTemplate   FrameTemplate @relation(fields: [frameTemplateId], references: [id])
  filterSelected  String        @default("NORMAL")
  frameColor      String        @default("#FFFFFF")
  stickersData    Json?         // array posisi { id, x, y, scale, rotation }
  finalImagePath  String        // berkas komposit 300 DPI
  qrDownloadToken String        @unique @default(cuid())
  createdAt       DateTime      @default(now())
}

enum PrintStatus {
  QUEUED
  PRINTING
  SUCCESS
  FAILED
}

model PrintJob {
  id        String      @id @default(uuid())
  sessionId String
  session   Session     @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  copies    Int         @default(1)
  status    PrintStatus @default(QUEUED)
  createdAt DateTime    @default(now())
}
```

---

## 6. Spesifikasi Integrasi Perangkat Keras (Hardware)

1. **Layar Sentuh (Touchscreen Display)**:
   - Target rasio: 16:9 atau 16:10.
   - Penskalaan UI berbasis responsive dynamic rem/vw sehingga elemen tetap presisi baik pada laptop layar sentuh 14" maupun tablet 11".
2. **Kamera (Camera Source)**:
   - Diakses melalui API modern `navigator.mediaDevices.getUserMedia({ video: { width: 1920, height: 1080 } })`.
   - Modul pengaturan di Panel Admin menyimpan `deviceId` kamera pilihan secara persistent di `Booth.cameraDeviceId` atau LocalStorage.
3. **Printer Foto**:
   - Dukungan printer inkjet / dye-sublimation foto (seperti Canon Selphy, DNP, atau printer inkjet biasa yang dimuati kertas foto 4x6 / 2x6).
   - Pengoperasian mode silent print via browser flags:
     `chrome.exe --kiosk --kiosk-printing http://localhost:3000`
4. **Distribusi Softfile (QR Code)**:
   - File hasil komposit disimpan di folder publik web server atau diunggah ke storage cloud.
   - QR code yang ditampilkan merujuk ke endpoint responsif `/download/[qrDownloadToken]`.
   - Di lingkungan lokal tanpa IP publik tetap, pengujian dapat menggunakan Cloudflare Tunnel atau Ngrok sehingga ponsel dosen/pengunjung dapat langsung memindai QR code dari jaringan seluler mana pun.

---

## 7. Rencana Rilis & Roadmap

- **Fase 1 (Tugas Kuliah IMK Kiosk)**:
  - Implementasi seluruh alur IMK kios lokal (Idle, Voucher/QRIS dummy, Capture WebRTC, Editing Canvas, Silent Print, QR Softfile).
  - Evaluasi heuristik kegunaan (Usability Testing) bersama rekan tim dan dosen.
- **Fase 2 (Ekspansi Komersial Kafe)**:
  - Integrasi payment gateway QRIS dinamis produksi (Midtrans / Xendit).
  - Multi-outlet booth management dan analitik penjualan real-time.
