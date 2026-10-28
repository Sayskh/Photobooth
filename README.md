# 📸 KioskSnap — Web-Based Self-Service Photobooth Kiosk

> **Proyek Tugas Besar Mata Kuliah**: Interaksi Manusia dan Komputer (IMK)  
> **Semester / Tahun**: Semester 3 / 2026  
> **Repository**: [https://github.com/Sayskh/Photobooth.git](https://github.com/Sayskh/Photobooth.git)  
> **Target Perangkat**: Layar Sentuh Kiosk / Laptop Touchscreen (Aspek Rasio 16:9 atau 16:10)  
> **Format Output Cetak**: Kertas Foto 4R Landscape (6×4 inci / 1800×1200 px @ 300 DPI)

---

## 📌 Daftar Isi
1. [Tentang Proyek](#-tentang-proyek)
2. [Dokumen & Proposal Proyek (Wajib Dibaca Anggota Tim)](#-dokumen--proposal-proyek-wajib-dibaca-anggota-tim)
3. [Alur Pengguna & Arsitektur Kios (User Journey)](#-alur-pengguna--arsitektur-kios-user-journey)
4. [Prinsip Desain & Landasan IMK](#-prinsip-desain--landasan-imk)
5. [Panduan Instalasi & Menjalankan di Komputer Masing-Masing](#-panduan-instalasi--menjalankan-di-komputer-masing-masing)
6. [Panduan Pengujian & Skenario Demo (Demo Dosen)](#-panduan-pengujian--skenario-demo-demo-dosen)
7. [Struktur Folder Proyek](#-struktur-folder-proyek)
8. [Panduan Kolaborasi Tim & Git Workflow](#-panduan-kolaborasi-tim--git-workflow)

---

## 🎯 Tentang Proyek

**KioskSnap** adalah anjungan photobooth mandiri (*self-service kiosk*) berbasis web yang dirancang khusus dengan mengutamakan prinsip-prinsip **Interaksi Manusia dan Komputer (IMK)**. Sistem ini memandu pengunjung kafe atau mahasiswa untuk mengambil foto secara mandiri melalui layar sentuh tanpa memerlukan bantuan operator.

### Keunggulan Utama
- **True 4R Landscape Canvas Engine (1800×1200 px @ 300 DPI)**: Menghasilkan cetakan tajam standar studio lab foto tanpa distorsi atau memotong pose kelompok.
- **Twin Horizontal Film Strips**: Satu lembar kertas 4R memuat 2 strip film horizontal (1800×600 px) dengan garis potong di tengah (`y = 600`), masing-masing strip memuat pose berbeda (3 pose unik per strip = total 6 pose).
- **Studio Shutter Trigger Bar & Spacebar Hardware Support**: Tombol jepret bergaya studio tactile minimalis dengan dukungan tombol fisik `Spacebar` (kompatibel dengan pedal kaki / arcade button kasir).
- **Antislop UI & Bebas AI-Slop**: Tipografi bersih, target sentuh ergonomis (48–80 px), zero emoji dekoratif liar, dan kontras WCAG AA.
- **Distribusi Cetak Otomatis & QR Softfile**: Cetak otomatis via *silent printing* serta halaman unduh softfile instan via QR code (`/download/[token]`).

---

## 📚 Dokumen & Proposal Proyek (Wajib Dibaca Anggota Tim)

Semua anggota kelompok **wajib membaca dokumen referensi berikut** agar memahami latar belakang akademis, perancangan antarmuka, dan arsitektur database:

| Dokumen | Lokasi Berkas | Deskripsi & Tujuan |
|---|---|---|
| 📄 **Proposal Proyek IMK** | [`docs/PROPOSAL_IMK_PHOTOBOOTH.md`](docs/PROPOSAL_IMK_PHOTOBOOTH.md) | Dokumen resmi proposal kuliah: identitas proyek, latar belakang masalah, landasan teori IMK, timeline kerja 5 minggu, metode Usability Testing (SUS), dan pembagian peran anggota tim. |
| 📐 **Spesifikasi Teknis & PRD** | [`docs/superpowers/specs/2026-10-28-photobooth-imk-design.md`](docs/superpowers/specs/2026-10-28-photobooth-imk-design.md) | *Product Requirement Document* teknis: spesifikasi fungsional, state machine kiosk, skema ERD database Prisma, alur API endpoint, dan penanganan timeout. |
| 🎨 **Panduan Desain (Antislop)** | [`DESIGN.md`](DESIGN.md) | Aturan desain antarmuka, palet warna Zinc, rasio kontras WCAG AA, ukuran target sentuh (*touch targets*), dan larangan AI-slop visual. |

---

## 🧭 Alur Pengguna & Arsitektur Kios (User Journey)

Sistem menggunakan alur linier (*wizard-based linear journey*) untuk meminimalkan beban kognitif (*cognitive load*):

```
┌────────────────────────────────────────────────────────────────────────┐
│ 1. Attract Screen (Layar Pikat)                                       │
│    - Layar idle memikat "Sentuh Layar untuk Mulai" (Target 100vw/vh)   │
│    - Gestur Tersembunyi: Ketuk logo KioskSnap 5x -> Panel Kasir/Admin   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ 2. Pembayaran & Voucher Gate                                          │
│    - Tunai: Masukkan 6-digit kode token dari struk kasir via virtual   │
│      numpad ergonomis (misal: KS-7788).                               │
│    - Nontunai: Tampilan QRIS dinamis + tombol simulasi instan.        │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ 3. Pemilihan Format Cetak & Desain Frame                               │
│    - Twin Film Strip (2 strip horizontal landscape, 6 pose unik)      │
│    - Postcard Modern (Grid 2×2 landscape 4R, 4 pose lebar)            │
│    - Twin Polaroid (2 kartu polaroid berdampingan, 4 pose)             │
│    - Pilihan tema studio (Archive Ticket, Studio Minimal, Y2K, Cafe)  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ 4. Bilik Pengambilan Foto (WebRTC Live Camera)                         │
│    - Tampilan cermin horizontal live feed.                            │
│    - Hitung mundur audio-visual 3.. 2.. 1.. Flash putih layar.         │
│    - Trigger: Ketuk Shutter Bar Studio atau tekan tombol SPASI/Pedal. │
│    - Fasilitas retake (ulang pose tertentu atau pose terakhir).        │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ 5. Touch-Up & Kustomisasi Sentuh (Timer 90 Detik)                      │
│    - Filter Warna Studio: Natural, Monochrome, Vintage, Warm, Cool.   │
│    - Penempatan Stiker: Dukungan drag, rotate, resize, dan tombol     │
│      shortcut instan pasang di "Strip 1 (Atas)" & "Strip 2 (Bawah)".   │
│    - Sisa waktu sesi tampil di header dengan status indikator.         │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ 6. Cetak Otomatis & QR Softfile                                        │
│    - Perintah print otomatis terkirim via browser media print.        │
│    - QR Code besar di layar menuju URL unduh: /download/[token]       │
│    - Pengunjung dapat mengunduh foto komposit dan seluruh foto mentah.│
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ 7. Selesai & Auto-Reset Sesi                                           │
│    - Countdown 60 detik atau tombol reset instan.                     │
│    - Sesi dibersihkan otomatis demi privasi pengunjung berikutnya.     │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🧠 Prinsip Desain & Landasan IMK

Sebagai proyek mata kuliah **Interaksi Manusia dan Komputer**, KioskSnap menerapkan teori-teori usabilitas nyata:

1. **Hukum Fitts (*Fitts's Law*)**:
   - Seluruh tombol utama memiliki ukuran minimal **48px hingga 80px** dengan *gap* yang longgar untuk mencegah kesalahan sentuh (*fat-finger error*).
   - Tombol shutter ditempatkan di bagian tengah bawah yang paling ergonomis bagi jangkauan tangan pengguna saat berdiri.
2. **Keterlihatan Status Sistem (*Visibility of System Status*)**:
   - Hitung mundur pose besar, indikator pose aktif (misal: "Pose 2 dari 6"), indikator aperture mekanis, dan timer sesi 90 detik.
3. **Pencegahan Kesalahan (*Error Prevention*)**:
   - Layar input voucher menggunakan virtual keypad numerik khusus tanpa keyboard QWERTY lengkap, meminimalkan salah ketik.
   - Sesi terlindungi *idle auto-reset* jika pengunjung meninggalkan anjungan di tengah sesi.
4. **Kesesuaian dengan Dunia Nyata (*Match Between System & Real World*)**:
   - Efek flash layar dan suara rana mekanis (*audio synthesis Web Audio API*).
   - Mockup lembar cetak 4R di layar menyerupai kertas fisik asli lengkap dengan panduan garis potong putus-putus.

---

## 💻 Panduan Instalasi & Menjalankan di Komputer Masing-Masing

Ikuti langkah-langkah berikut untuk menguji dan menjalankan aplikasi di laptop/komputer masing-masing:

### 1. Prasyarat Sistem
- **Node.js**: Versi 18.18+ atau versi 20+ (Rekomendasi LTS). Cek dengan `node -v`.
- **Git**: Terpasang di komputer. Cek dengan `git -v`.
- **Browser**: Google Chrome atau Microsoft Edge terbaru.
- **Kamera**: Webcam laptop internal atau USB Webcam aktif.

### 2. Clone Repository
Buka terminal (Git Bash / PowerShell / Command Prompt / Terminal macOS):
```bash
git clone https://github.com/Sayskh/Photobooth.git
cd Photobooth
```

### 3. Install Dependensi
Jalankan perintah berikut untuk mengunduh semua library yang dibutuhkan:
```bash
npm install
```

### 4. Setup File Environment
Salin file template environment:
- **Windows (PowerShell)**:
  ```powershell
  Copy-Item .env.example .env
  ```
- **macOS / Linux / Git Bash**:
  ```bash
  cp .env.example .env
  ```

File `.env` default menggunakan SQLite lokal (`file:./dev.db`), sehingga **kamu tidak perlu menginstall database MySQL/PostgreSQL tambahan** untuk menguji aplikasi di laptop:
```env
DATABASE_URL="file:./dev.db"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
ADMIN_PIN="1234"
```

### 5. Inisialisasi Database & Seeding Data Awal
Jalankan migrasi schema dan buat data dummy (voucher gratis, admin kasir, dan template):
```bash
npx prisma db push
npm run prisma:seed
```
*Output yang diharapkan: `Seed completed successfully!`*

### 6. Jalankan Server Development
```bash
npm run dev
```
Buka browser dan akses: **[http://localhost:3000](http://localhost:3000)**

---

## 🧪 Panduan Pengujian & Skenario Demo (Demo Dosen)

Saat presentasi atau pengujian mandiri, gunakan data dan trik pengujian berikut:

### 1. Voucher Siap Pakai (Untuk Masuk ke Bilik)
Pada layar pembayaran pilih **Tunai / Voucher Kasir**, lalu masukkan salah satu kode berikut:
- `KS-7788`
- `KS-1234`
- `KS-9999`
*(Atau gunakan tombol **Simulasi Bayar QRIS** jika ingin melewati tanpa voucher).*

### 2. Tombol Shutter Fisik (Spacebar)
- Saat berada di layar kamera, kamu bisa menekan tombol **`SPASI` (Spacebar)** di keyboard laptop.
- Ini mensimulasikan penggunaan pedal kaki (*foot pedal*) atau tombol arcade eksternal kiosk.

### 3. Akses Panel Kasir / Admin (`/admin`)
Untuk demonstrasi alur kasir kafe mencetak voucher tunai baru:
- **Cara 1 (Gestur Rahasia)**: Di layar utama (Layar Pikat), ketuk logo **KioskSnap** di sudut kiri atas sebanyak **5 kali berturut-turut**.
- **Cara 2 (Akses Langsung)**: Buka tab baru di browser: **[http://localhost:3000/admin](http://localhost:3000/admin)**
- **PIN Kasir**: `1234`
- **Fitur Kasir**:
  - Klik **"Buat Voucher Tunai Baru"** untuk menghasilkan token 6-digit dan mencetak simulasi struk kasir thermal 58mm.
  - Memilih sumber kamera perangkat (internal vs eksternal).
  - Melihat rekap omzet transaksi dan kertas cetak.

### 4. Pengujian Mode Kiosk Penuh (Silent Printing)
Jika ingin menguji mode kiosk sungguhan di Google Chrome tanpa muncul dialog popup printer Windows:
```bash
# Jalankan Chrome dalam mode Kiosk Printing
chrome.exe --kiosk --kiosk-printing http://localhost:3000
```

---

## 📂 Struktur Folder Proyek

```
Photobooth/
├── docs/                                 # Dokumentasi & Proposal IMK
│   ├── PROPOSAL_IMK_PHOTOBOOTH.md        # Proposal lengkap tugas mata kuliah
│   └── superpowers/specs/                # PRD & spesifikasi teknis arsitektur
├── prisma/
│   ├── schema.prisma                     # Skema database SQLite (default lokal)
│   ├── schema.postgresql.prisma          # Skema siap pakai untuk PostgreSQL
│   └── seed.js                           # Script pembuat data awal (voucher & admin)
├── public/                               # File statis gambar, audio, dan ikon
├── src/
│   ├── app/                              # Next.js App Router (Rute & API)
│   │   ├── page.tsx                      # State machine utama kiosk (Attract -> Selesai)
│   │   ├── layout.tsx                    # Shell layout utama
│   │   ├── globals.css                   # Tailwind v4 CSS & aturan media print landscape
│   │   ├── admin/page.tsx                # Panel kasir & manajemen voucher
│   │   ├── download/[token]/page.tsx     # Halaman publik unduh softfile via QR
│   │   └── api/                          # Backend API (Sessions, Vouchers, Print, Booth)
│   ├── components/                       # Komponen antarmuka modular per tahap
│   │   ├── AttractScreen.tsx             # Layar sentuh idle utama
│   │   ├── PaymentScreen.tsx             # Pilihan pembayaran tunai/QRIS
│   │   ├── FrameSelectScreen.tsx         # Pilihan format kertas 4R & desain frame
│   │   ├── CameraCaptureScreen.tsx       # Viewport WebRTC, shutter bar, countdown
│   │   ├── CanvasCustomizerScreen.tsx    # Filter warna, stiker sentuh, timer 90 detik
│   │   ├── PrintOutputScreen.tsx         # Auto print sheet landscape & QR softfile
│   │   └── AdminModal.tsx                # Dialog login kasir terproteksi PIN
│   └── lib/
│       ├── canvas.ts                     # Canvas Engine 300 DPI Landscape 4R
│       ├── prisma.ts                     # Prisma client singleton
│       └── sound.ts                      # Audio synthesizer efek kamera (Web Audio API)
├── DESIGN.md                             # Aturan desain antislop & panduan visual
├── package.json                          # Manifest dependensi & script NPM
└── tsconfig.json                         # Konfigurasi TypeScript
```

---

## 🤝 Panduan Kolaborasi Tim & Git Workflow

Agar pengerjaan tugas kelompok rapi dan terhindar dari konflik kode (*merge conflict*):

1. **Selalu Tarik Perubahan Terbaru Sebelum Mulai Mengedit**:
   ```bash
   git pull origin main
   ```
2. **Gunakan Branch Fitur untuk Tugas Masing-Masing**:
   ```bash
   git checkout -b fitur/nama-fitur
   ```
3. **Commit dengan Pesan yang Jelas (Conventional Commits)**:
   ```bash
   git commit -m "feat(customizer): tambah filter warna vintage"
   git commit -m "fix(camera): perbaiki delay audio countdown"
   ```
4. **Verifikasi Build Sebelum Push**:
   Pastikan kode tidak memiliki error TypeScript atau build Next.js:
   ```bash
   npm run build
   ```
5. **Kirim Perubahan ke GitHub**:
   ```bash
   git push origin fitur/nama-fitur
   ```

---

*Dikembangkan untuk Tugas Besar Mata Kuliah Interaksi Manusia dan Komputer (IMK) Semester 3 2026.*
