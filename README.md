# cuan.in | Platform Website Toko Online UMKM & Centralized Escrow Gateway

> **"Own Your Profit. No Commission Fees."**  
> Solusi digital terintegrasi berbasis SaaS (Software as a Service) dan Centralized Escrow untuk memberdayakan UMKM Indonesia memiliki website toko online mandiri profesional dalam hitungan menit tanpa koding.

---

## 📌 Latar Belakang & Masalah yang Diselesaikan

Banyak pelaku UMKM di Indonesia menghadapi 3 kendala utama dalam berjualan online:
1. **Biaya Pembuatan Website Terlalu Mahal:** Jasa agensi pembuatan website di pasaran berkisar Rp 1.500.000 hingga Rp 3.500.000, membebani arus kas UMKM rintisan.
2. **Potongan Komisi Marketplace Mencekik:** Marketplace besar memotong komisi 6% hingga 12% dari tiap transaksi, menggerus margin laba bersih pedagang kecil.
3. **Kendala Legalitas Payment Gateway:** Integrasi pembayaran non-tunai (QRIS) mandiri mensyaratkan izin usaha berbadan hukum (PT/CV) yang sulit dipenuhi pedagang perorangan.

**cuan.in** hadir sebagai jalan tengah:
- **Zero Commission Fee:** UMKM menerima **100% hak bersih hasil penjualan**. Biaya pemeliharaan sistem (surcharge 4%) dibayarkan oleh pembeli saat scan QRIS.
- **Centralized Escrow Otomatis:** Dana pembeli ditahan aman di rekening penampung cuan.in hingga kurir menyerahkan barang ke pembeli (dilengkapi auto-confirm 7 hari kalender ala Shopee).
- **Merchant of Record:** cuan.in memfasilitasi pembayaran QRIS resmi Midtrans dan pencairan otomatis (Midtrans Iris API) ke rekening bank pemilik toko (BCA, Mandiri, BRI, BNI).
- **Multi-Tenant Subdomain Berbiaya Rendah:** Memangkas biaya sewa cloud hosting per toko hingga hanya Rp 199.000–Rp 349.000/tahun (setara Rp 16.000–Rp 29.000/bulan).

---

## 🚀 Fitur Utama

- **Pemisahan Domain Arsitektural:**
  - **Platform Agensi Penjualan:** `https://cuan.in` (Etalase template, paket harga hosting, formulir pemesanan online).
  - **Storefront Toko UMKM Mandiri:** `https://(namatoko).cuanin.com` (Katalog produk, keranjang belanja, kalkulator ongkir kurir otomatis JNE/SiCepat).
  - **Portal Superadmin:** `https://cuan.in/superadmin` (Monitoring likuiditas saldo tertahan escrow dan pendapatan platform).
- **6 Pilihan Template Industri Siap Pakai:**
  1. *Katalog Kuliner & Kopi Artisan* (`kopisenja.cuanin.com`)
  2. *Butik & Fashion Muslim Modern* (`butikaisyah.cuanin.com`)
  3. *Galeri Kriya & Kerajinan Nusantara* (`kriyabambu.cuanin.com`)
  4. *Skincare Alami & Herbal Nusantara* (`naturaherbal.cuanin.com`)
  5. *Elektronik & Aksesoris Gadget* (`gadgetpedia.cuanin.com`)
  6. *Toko Tanaman Hias & Florist Segar* (`kebunkita.cuanin.com`)
- **Payment Gateway Midtrans Berkelanjutan:**
  - Mendukung Midtrans Snap Popup SDK (`snap.js`) dan Smart Resilient Fallback ke generator QRIS EMVCo standar nasional.
  - Webhook otomatis `/api/midtrans/notification` untuk pengalihan status pesanan real-time.
- **Dashboard Pemilik Toko Terproteksi JWT:**
  - Kelola pesanan masuk, input nomor resi kurir, tambah produk baru, dan penarikan saldo instan via Midtrans Iris.

---

## 🛠️ Tech Stack

- **Backend Runtime:** Node.js (v20+) & Express.js
- **Database:** PostgreSQL (Relational schema dengan tabel `tenants`, `templates`, `products`, `orders`, `escrow_records`, `payout_requests`, `admins`)
- **Autentikasi & Keamanan:** JSON Web Token (JWT) & bcrypt password hashing
- **Payment & Payout Gateway:** Midtrans Core API, Snap SDK, QRIS EMVCo Generator, Midtrans Iris Payout Simulator
- **Frontend:** Vanilla JS SPA, Tailwind CSS CDN, Google Font *Plus Jakarta Sans*, SVG Vector Branding
- **Hosting & Tunneling:** Cloudflare Tunnel (`cloudflared`) untuk akses HTTPS publik tanpa cold start

---

## 📂 Struktur Direktori

```text
cuanin/
├── public/                     # Aset frontend web statis
│   ├── app.js                  # Logika interaktif landing page utama
│   ├── cuanin_logo_full.png    # Aset logo lengkap beresolusi tinggi
│   ├── index.html              # Landing page agensi cuan.in
│   ├── logo_cuanin.svg         # Vektor logo resmi cuan.in
│   ├── order.html              # Halaman konfigurasi pemesanan website
│   ├── order.js                # Logika pemesanan, validasi subdomain & QRIS
│   ├── store.html              # Storefront toko UMKM (*.cuanin.com)
│   ├── store.js                # Logika belanja, ongkir kurir, escrow & dashboard owner
│   ├── styles.css              # Custom styling & token Saasify
│   ├── superadmin.html         # Portal monitoring escrow tim pengawas
│   └── superadmin.js           # Logika rekonsiliasi keuangan & worker
├── src/                        # Kode sumber backend
│   ├── db.js                   # PostgreSQL connection pool & schema init
│   ├── server.js               # Entry point Express, proxy & subdomain resolver
│   ├── routes/
│   │   └── api.js              # REST API endpoints
│   └── services/
│       ├── escrowWorker.js     # Background worker pencairan escrow 7 hari
│       └── midtrans.js         # Generator payload QRIS, Snap & Iris payout
├── kurasi_uns/                 # Dokumen resmi Instrumen Kurasi Mahasiswa Wirausaha UNS
├── seed_full_templates_and_stores.js # Seeder 6 template & 6 toko demo
├── setup_local_cuanin_domain.bat     # Skrip Windows 1-klik mapping domain cuan.in
├── start_presentation.bat            # Skrip Windows 1-klik runner server & tunnel
├── DESIGN.md                   # Spesifikasi Google Design Token & anti-slop
├── PRD.md                      # Product Requirement Document v1.0.0
├── package.json
└── README.md
```

---

## ⚡ Panduan Menjalankan Sistem (Getting Started)

### 1. Prasyarat
- Node.js v18 atau yang lebih baru
- PostgreSQL Server (aktif pada port 5432)

### 2. Instalasi Dependensi
```bash
git clone https://github.com/CahyaDwiSaputra/cuanin.git
cd cuanin
npm install
```

### 3. Konfigurasi Lingkungan (.env)
Salin `.env.example` menjadi `.env` dan sesuaikan kredensial database Anda:
```bash
cp .env.example .env
```
Isi konfigurasi pada berkas `.env`:
```env
PORT=4000
DB_HOST=127.0.0.1
DB_PORT=5432
DB_USER=buana_admin
DB_PASSWORD=your_postgres_password
DB_NAME=cuanin_db
JWT_SECRET=cuanin_jwt_secret_key_2026

MIDTRANS_SERVER_KEY=SB-Mid-server-xxxxxxxxxxxx
MIDTRANS_CLIENT_KEY=SB-Mid-client-xxxxxxxxxxxx
MIDTRANS_IS_PRODUCTION=false
```

### 4. Inisialisasi Database & Seeder Toko Demo
Jalankan skrip seeder untuk mengisi tabel, data template, dan 6 toko demo awal:
```bash
node seed_full_templates_and_stores.js
```

### 5. Menjalankan Server
```bash
node src/server.js
```
Aplikasi akan aktif di:
- **Lokal Port 4000:** `http://127.0.0.1:4000`
- **Lokal Port 80 (Opsional):** `http://127.0.0.1`

### 🐳 Menjalankan via Docker / Docker Compose (Otomatis & Portabel)

Platform cuan.in telah dilengkapi dengan container Docker resmi untuk PostgreSQL dan Node.js:

1. **Jalankan Database PostgreSQL di Docker (Port 5433):**
   ```bash
   docker-compose up -d cuanin-db
   ```
   *Seluruh tabel (`templates`, `tenants`, `products`, `orders`, `escrow_records`, `admins`) dan data 6 toko demo langsung terisi otomatis via entrypoint.*

2. **Jalankan Seluruh Layanan (Database + Backend App):**
   ```bash
   docker-compose up -d
   ```
   *Aplikasi akan berjalan di port `4001` (atau port host yang ditentukan) dan database di port `5433`.*

3. **Memeriksa Status & Isi Database di Docker:**
   ```bash
   docker exec -it cuanin-postgres psql -U buana_admin -d cuanin_db -c "\dt"
   docker exec -it cuanin-postgres psql -U buana_admin -d cuanin_db -c "SELECT name, subdomain FROM tenants;"
   ```

---

## 🌐 Akses Halaman & Kredensial Demo

| Halaman | URL Akses | Kredensial Login |
| :--- | :--- | :--- |
| **Website Utama** | `http://127.0.0.1:4000/` | Publik |
| **Pemesanan Toko** | `http://127.0.0.1:4000/order` | Publik |
| **Toko Kopi Senja** | `http://127.0.0.1:4000/toko/kopisenja` | Owner: `owner@kopisenja.com` / `cuanin123` |
| **Toko Butik Aisyah** | `http://127.0.0.1:4000/toko/butikaisyah` | Owner: `owner@butikaisyah.com` / `cuanin123` |
| **Toko Kriya Bambu** | `http://127.0.0.1:4000/toko/kriyabambu` | Owner: `owner@kriyabambu.com` / `cuanin123` |
| **Toko Skincare Natura** | `http://127.0.0.1:4000/toko/naturaherbal` | Owner: `owner@naturaherbal.com` / `cuanin123` |
| **Toko GadgetPedia** | `http://127.0.0.1:4000/toko/gadgetpedia` | Owner: `owner@gadgetpedia.com` / `cuanin123` |
| **Toko Kebun Kita** | `http://127.0.0.1:4000/toko/kebunkita` | Owner: `owner@kebunkita.com` / `cuanin123` |
| **Superadmin Cuanin** | `http://127.0.0.1:4000/superadmin` | Admin: `admin` / `cuanin_super_secret_2026!` |

---

## 👨‍💻 Tim Pengembang

**Tim Wirausaha Mahasiswa Universitas Sebelas Maret (UNS):**
- **Ketua / Tech Lead:** Cahya Dwi Saputra (D-III Teknik Informatika PSDKU Madiun, Sekolah Vokasi UNS)
- **GitHub:** [@CahyaDwiSaputra](https://github.com/CahyaDwiSaputra)
- **Email:** cahyadwisaputra@student.uns.ac.id

---

## 📄 Lisensi
Hak Cipta © 2026 Tim Pengembang cuan.in. Seluruh hak cipta dilindungi undang-undang.
