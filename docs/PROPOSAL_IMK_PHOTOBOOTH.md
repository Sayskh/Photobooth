# PROPOSAL PROYEK MATA KULIAH INTERAKSI MANUSIA DAN KOMPUTER (IMK)
## "KioskSnap: Rancang Bangun Web-Based Self-Service Photobooth Kiosk Berorientasi pada Prinsip Interaksi Manusia dan Komputer"

---

## 1. Identitas Proyek
* **Judul Proyek**: KioskSnap — Sistem Photobooth Mandiri Berbasis Web Touchscreen
* **Mata Kuliah**: Interaksi Manusia dan Komputer (IMK)
* **Semester / Tahun**: Semester 3 / 2026
* **Sasaran Perangkat**: Laptop Touchscreen / Layar Sentuh Tablet (16:9 / 16:10)
* **Target Pengguna**: Mahasiswa, Pengunjung Kafe, Generasi Z & Milenial

---

## 2. Latar Belakang & Permasalahan

Tren photobooth instan telah menjadi gaya hidup populer di kalangan anak muda dan pengunjung kafe. Namun, dalam observasi interaksi antarmuka photobooth konvensional sering ditemukan beberapa kelemahan kritis dari sudut pandang **Interaksi Manusia dan Komputer (IMK)**:
1. **Beban Kognitif Berlebih (*Cognitive Overload*)**: Antarmuka sering kali memadukan terlalu banyak tombol navigasi kecil yang tidak ramah sentuhan jari (*touchscreen-unfriendly*), sehingga pengguna bingung harus menekan apa.
2. **Ketiadaan Batas Waktu Terkelola (*Lack of Time Constraint Cues*)**: Ketiadaan indikator waktu yang jelas pada tahap kustomisasi foto membuat pengguna menghabiskan waktu terlalu lama, mengakibatkan antrean panjang dan menurunkan kenyamanan pengguna lain.
3. **Mekanisme Pembayaran & Validasi yang Kaku**: Sebagian besar photobooth hanya mengandalkan satu metode pembayaran tanpa alternatif jika terjadi kendala jaringan.
4. **Hambatan Distribusi Softfile**: Pengguna kerap harus memasukkan email atau nomor WhatsApp secara manual menggunakan keyboard fisik, yang rentan kesalahan ketik (*error-prone*) dan memperlambat alur.

Proyek **KioskSnap** hadir untuk menjawab tantangan tersebut dengan merancang sistem photobooth yang mengedepankan kemudahan penggunaan (*usability*), ergonomi layar sentuh, dan alur terpandu (*guided linear wizard*).

---

## 3. Tujuan dan Nilai Guna Proyek

1. **Menerapkan Teori IMK secara Nyata**: Mengimplementasikan Hukum Fitts (*Fitts’s Law*), 8 Aturan Emas Shneiderman (*Shneiderman’s 8 Golden Rules*), dan *Nielsen’s 10 Usability Heuristics* ke dalam antarmuka anjungan mandiri (*public kiosk*).
2. **Mengoptimalkan Ergonomi Layar Sentuh**: Menghilangkan kebutuhan mouse dan keyboard fisik; semua interaksi dirancang berbasis sentuhan jari dengan ukuran target sentuh (*touch target size*) yang memadai dan respons haptik/audio-visual.
3. **Meningkatkan Efisiensi Waktu Sesi**: Menggabungkan hitung mundur terpadu pada tahap pengambilan pose dan editing, menjaga ritme penggunaan tanpa membuat pengguna merasa terburu-buru.
4. **Mempersiapkan Landasan Komersial Berkelanjutan**: Sistem dirancang modular sehingga setelah tugas kuliah selesai, aplikasi dapat dikomersialkan sebagai layanan sewa anjungan atau software-as-a-service (SaaS) untuk kafe-kafe lokal.

---

## 4. Landasan Teori & Penerapan Prinsip IMK

Dalam perancangan antarmuka KioskSnap, diterapkan kaidah-kaidah IMK berikut:

| Teori / Prinsip IMK | Desain Solusi pada KioskSnap |
|---|---|
| **Fitts’s Law** | Tombol navigasi vital (misal: "Mulai", "Lanjut", "Cetak") diletakkan pada posisi mudah dijangkau, dengan ukuran minimal **56 x 56 pixel** dan jarak aman antar elemen minimal 16 pixel untuk mencegah *fat-finger error*. |
| **Visibility of System Status** | Sistem selalu mengabarkan kondisi terkini: animasi hitung mundur foto (3.. 2.. 1.. Flash), sisa waktu sesi edit dalam detik dan bar warna dinamis, serta status proses cetak printer. |
| **Match Between System & Real World** | Metafora visual kamera polaroid, cermin langsung (*mirror camera*), dan slot frame foto yang menyerupai kertas cetak fisik sesungguhnya. |
| **Error Prevention & Slip Tolerant** | Numpad sentuh khusus digit untuk input 6-digit kode token dari struk kasir; tidak ada keyboard QWERTY lengkap di layar pembayaran guna mencegah salah ketik. |
| **Recognition Rather Than Recall** | Pilihan filter warna dan stiker disajikan dengan kartu pratinjau visual langsung (*direct visual preview*), bukan sekadar teks nama filter. |

---

## 5. Fitur Utama Sistem (Kiosk & Kasir)

### A. Fitur Kios Pengunjung (Layar Sentuh)
1. **Layar Pikat (Attract Screen)**: Tampilan visual memikat dengan animasi instruksi ramah "Sentuh Layar untuk Mulai".
2. **Opsi Pembayaran Fleksibel**:
   - **Tunai**: Pengunjung membayar di kasir, kasir klik 'Transaksi Tunai', sistem auto-generate token 6-digit yang otomatis tercetak pada struk pembayaran fisik. Pengunjung mengetik kode token dari struk tersebut ke layar kios.
   - **Nontunai**: Menampilkan QRIS dinamis yang siap dipindai dengan smartphone.
3. **Pemilihan Frame & Layout**: Opsi strip vertikal 2x6 (3-4 foto) atau grid kartu pos 4x6 (4 foto).
4. **Bilik Foto Cermin (Live Mirror WebRTC)**: Umpan video real-time dengan efek cermin horizontal dan hitung mundur bersuara sebelum tombol shutter otomatis berkedip.
5. **Kustomisasi Sentuh Interaktif (Canvas Studio)**:
   - Filter foto instan (Normal, Hitam Putih, Vintage, Warm).
   - Penggantian warna tema bingkai.
   - Penambahan stiker lucu yang dapat digeser, dirotasi, dan diatur skalanya dengan sentuhan.
6. **Distribusi Ganda (Cetak & QR Softfile)**:
   - Tombol cetak fisik (terhubung ke printer foto).
   - QR Code instan berukuran besar di layar untuk mengunduh komposit foto resolusi tinggi ke smartphone tanpa perlu login.
7. **Pembersihan & Reset Otomatis**: Layar otomatis kembali ke keadaan awal jika pengunjung tidak beraktivitas selama batas waktu tertentu, melindungi privasi foto sesi sebelumnya.

### B. Fitur Panel Kasir & Pengelola (Admin Dashboard)
1. **Auto-Generate Token & Struk Pembayaran Kasir**: Kasir cukup memproses transaksi tunai dengan satu tombol; sistem langsung men-generate token 6-digit unik dan mencetak struk thermal kasir berisi kode akses kios.
2. **Konfigurasi Kamera & Hardware**: Memilih kamera aktif (webcam internal laptop vs kamera USB eksternal).
3. **Pengaturan Durasi Sesi**: Menyesuaikan waktu pengambilan foto dan waktu editing sesuai kepadatan antrean.
4. **Log & Rekap Transaksi**: Mencatat total lembar cetak dan pemasukan harian.

---

## 6. Arsitektur Teknis & Skema Basis Data

### 6.1 Arsitektur Sistem
* **Frontend & Backend**: Next.js (App Router) Monolith dengan Tailwind CSS — berjalan secara lokal (*offline-first*) di laptop kios.
* **Canvas Engine**: HTML5 Canvas API untuk rendering foto komposit beresolusi 300 DPI siap cetak.
* **Basis Data**: PostgreSQL / MySQL yang dikelola melalui Prisma ORM.
* **Integrasi Kamera**: Modern WebRTC API (`navigator.mediaDevices.getUserMedia`).
* **Sistem Cetak**: Native Browser Print dengan dukungan Chrome Kiosk Silent Print (`--kiosk-printing`).

### 6.2 Relasi Basis Data (ERD Ringkas)
* `AdminUser` (1) ── (N) `Voucher` (1) ── (1) `Transaction`
* `Booth` (1) ── (N) `Session` (1) ── (N) `PhotoShot` (Raw Foto)
* `Session` (1) ── (1) `PhotoComposite` (Render Final & QR Token)
* `Session` (1) ── (N) `PrintJob` (Log Cetak Kertas)

---

## 7. Rencana Pengujian Kegunaan (Usability Testing)

Sebagai pemenuhan standar mata kuliah IMK, sistem akan diuji menggunakan dua metode:
1. **Heuristic Evaluation**: Pengecekan antarmuka terhadap 10 Heuristik Usabilitas Nielsen bersama anggota tim dan calon pengguna.
2. **User Testing & System Usability Scale (SUS)**:
   - Melakukan uji coba langsung ke 10–15 responden mahasiswa.
   - Mengukur parameter kuantitatif:
     - **Time to Complete (TTC)**: Waktu dari sentuhan pertama hingga foto keluar.
     - **Error Rate**: Berapa kali pengguna salah menekan tombol atau mengalami kebingungan.
     - **Skor SUS**: Target skor usabilitas > 75 (kategori *Good/Excellent*).

---

## 8. Rencana Jadwal Pengerjaan (Timeline)

| Minggu | Agenda Kerja | Output Utama |
|---|---|---|
| **Minggu 1** | Finalisasi Proposal, Wireframe Figma, & Setup Repository | Proposal ACC, Desain UI/UX Figma |
| **Minggu 2** | Implementasi Skema DB (Prisma), Integrasi WebRTC Kamera, & Layar Kios | Kamera aktif, alur capture berjalan |
| **Minggu 3** | Pengerjaan Canvas Studio (Filter, Frame, Stiker) & Alur Pembayaran | Editing sentuh & Voucher kasir aktif |
| **Minggu 4** | Integrasi Silent Printing, QR Softfile, & Panel Kasir Admin | Cetak fisik & unduh QR berfungsi |
| **Minggu 5** | Usability Testing (SUS), Perbaikan Feedback IMK, & Laporan Akhir | Laporan Tugas Akhir & Presentasi Demo |

---

## 9. Pembagian Peran Anggota Tim (Contoh Distribusi)

1. **Lead & UI/UX Designer**: Riset kebutuhan pengguna, pembuatan wireframe & prototype interaksi sentuh, evaluasi heuristik IMK.
2. **Frontend Developer**: Implementasi antarmuka Next.js, animasi interaksi, responsivitas layar sentuh, dan canvas editor foto.
3. **Backend & Hardware Specialist**: Konfigurasi Prisma DB (PostgreSQL/MySQL), API voucher, koneksi WebRTC kamera, dan integrasi silent printing.
4. **QA & Usability Researcher**: Pengujian pengujian skenario pengguna, koordinasi pengujian SUS, dokumentasi laporan pengujian IMK.

---

## 10. Kesimpulan

Proyek **KioskSnap** menggabungkan kebutuhan hiburan modern dengan penerapan ilmu Interaksi Manusia dan Komputer secara nyata. Melalui antarmuka anjungan mandiri yang intuitif, minim hambatan, dan berkinerja tinggi, proyek ini tidak hanya siap menjadi karya unggulan pada mata kuliah IMK, tetapi juga memiliki potensi nyata untuk dikembangkan menjadi produk komersial bagi ekosistem UMKM dan kafe lokal.
