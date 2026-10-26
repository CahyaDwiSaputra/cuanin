---
version: alpha
name: Cuanin Design System
description: Modern dark-and-light hybrid design system with vibrant violet accent and deep midnight slate surfaces for Cuanin MSME E-Commerce and Centralized Escrow Platform.
colors:
  primary: "#6355F6"
  secondary: "#0E0F1E"
  tertiary: "#8B70F8"
  neutral: "#FFFFFF"
  primary-hover: "#5244E5"
  surface-dark: "#0E0F1E"
  surface-dark-card: "#16182E"
  surface-light: "#FFFFFF"
  surface-tint: "#F4F2FF"
  text-primary-dark: "#FFFFFF"
  text-secondary-dark: "#A5B4FC"
  text-primary-light: "#0F172A"
  text-secondary-light: "#64748B"
  border-light: "#E2E8F0"
  border-tint: "#ECE9FE"
  border-dark: "#26294A"
  status-held: "#B45309"
  status-released: "#047857"
  text-badge-tint: "#4F46E5"
  text-badge-dark: "#C7D2FE"
typography:
  h1:
    fontFamily: Plus Jakarta Sans
    fontSize: 3rem
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  h2:
    fontFamily: Plus Jakarta Sans
    fontSize: 2.25rem
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.015em"
  h3:
    fontFamily: Plus Jakarta Sans
    fontSize: 1.5rem
    fontWeight: 600
    lineHeight: 1.3
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 1rem
    lineHeight: 1.6
  caption:
    fontFamily: Plus Jakarta Sans
    fontSize: 0.875rem
    lineHeight: 1.5
rounded:
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  full: 9999px
spacing:
  xs: 8px
  sm: 16px
  md: 24px
  lg: 32px
  xl: 48px
  xxl: 64px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.neutral}"
    rounded: "{rounded.full}"
    padding: 14px
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
    textColor: "{colors.neutral}"
    rounded: "{rounded.full}"
    padding: 14px
  button-dark-cta:
    backgroundColor: "{colors.secondary}"
    textColor: "{colors.text-primary-dark}"
    rounded: "{rounded.full}"
    padding: 14px
  card-hero-dark:
    backgroundColor: "{colors.surface-dark}"
    textColor: "{colors.text-primary-dark}"
    rounded: "{rounded.xl}"
    padding: 48px
  card-dark-sub:
    backgroundColor: "{colors.surface-dark-card}"
    textColor: "{colors.text-secondary-dark}"
    rounded: "{rounded.lg}"
    padding: 24px
  card-tint-metrics:
    backgroundColor: "{colors.surface-tint}"
    textColor: "{colors.text-primary-light}"
    rounded: "{rounded.xl}"
    padding: 48px
  card-pricing-pro:
    backgroundColor: "{colors.surface-dark}"
    textColor: "{colors.text-primary-dark}"
    rounded: "{rounded.lg}"
    padding: 32px
  card-pricing-standard:
    backgroundColor: "{colors.surface-light}"
    textColor: "{colors.text-primary-light}"
    rounded: "{rounded.lg}"
    padding: 32px
  badge-status-held:
    backgroundColor: "{colors.status-held}"
    textColor: "{colors.neutral}"
    rounded: "{rounded.full}"
    padding: 6px
  badge-status-released:
    backgroundColor: "{colors.status-released}"
    textColor: "{colors.neutral}"
    rounded: "{rounded.full}"
    padding: 6px
  badge-tint:
    backgroundColor: "{colors.border-tint}"
    textColor: "{colors.text-badge-tint}"
    rounded: "{rounded.full}"
    padding: 6px
  badge-dark-outline:
    backgroundColor: "{colors.border-dark}"
    textColor: "{colors.text-badge-dark}"
    rounded: "{rounded.full}"
    padding: 6px
  text-caption-light:
    textColor: "{colors.text-secondary-light}"
    backgroundColor: "{colors.surface-light}"
  card-border-light:
    backgroundColor: "{colors.border-light}"
    textColor: "{colors.text-primary-light}"
    rounded: "{rounded.sm}"
---

## Overview

Cuanin Design System mengadaptasi estetika hybrid modern (perpaduan container deep midnight navy dengan seksi kontras putih bersih dan lavender wash lembut) yang diperkaya dengan aksen Electric Violet (`#6355F6`). Desain ini dirancang khusus untuk memenuhi kebutuhan PRD platform Cuanin:
1. Menghadirkan citra platform finansial dan e-commerce UMKM yang kredibel, terpercaya, dan aman bagi transaksi rekening bersama (escrow).
2. Menyajikan informasi biaya transaksi transparan (surcharge 4% pembeli) secara elegan tanpa membingungkan pelaku usaha maupun konsumen.
3. Memberikan pengalaman navigasi intuitif baik pada landing page pemesanan template, etalase toko multi-tenant subdomain, hingga dashboard rekonsiliasi saldo UMKM.

## Colors

Sistem warna Cuanin dibangun dengan rasio kontras tinggi dan memenuhi standar aksesibilitas WCAG AA:

- **Primary Accent (`#6355F6` - Electric Violet):** Aksen utama penarik perhatian untuk tombol tindakan utama (CTA), nomor metrik kunci, dan tautan aktif.
- **Accent Gradient (`#8B70F8` ke `#5E3BEE`):** Gradien halus untuk penekanan teks penting pada judul utama (headline) dan visual kartu interaktif.
- **Dark Neutral (`#0E0F1E` - Deep Midnight Slate):** Latar belakang untuk blok hero utama, kartu paket unggulan (Pro Tier), dan navigasi atas.
- **Card Dark Surface (`#16182E`):** Lapisan kartu sekunder di dalam kontainer gelap.
- **Light Canvas (`#FFFFFF`):** Latar utama bersih untuk etalase katalog produk dan kartu paket reguler.
- **Soft Tint Surface (`#F4F2FF` - Lavender Wash):** Latar seksi metrik transparansi biaya dan bukti perlindungan transaksi escrow.
- **Text Primary Light (`#0F172A`):** Warna teks utama pada permukaan terang dengan kontras tajam.
- **Text Secondary Light (`#64748B`):** Teks pendukung, deskripsi produk, dan label rincian ongkir.
- **Status Escrow Held (`#D97706` - Amber Warm):** Menandakan dana transaksi sedang ditahan di rekening penampung selama pengiriman kurir.
- **Status Escrow Released (`#059669` - Emerald Green):** Menandakan dana transaksi telah berhasil dicairkan ke saldo aktif toko UMKM.

## Typography

Tipografi menggunakan rupa huruf sans-serif geometris modern **Plus Jakarta Sans** dengan hierarki yang tegas dan proporsional:

- **Display & Hero H1:** Bold, ukuran 48px (3rem), line-height 1.15, letter-spacing -0.02em. Digunakan untuk headline utama landing page.
- **Section Heading H2:** Bold, ukuran 36px (2.25rem), line-height 1.2, letter-spacing -0.015em. Digunakan untuk judul seksi katalog dan transparansi biaya.
- **Card Heading H3:** Semi-bold, ukuran 24px (1.5rem), line-height 1.3. Digunakan untuk nama produk dan judul kartu harga template.
- **Body Text:** Regular, ukuran 16px (1rem), line-height 1.6. Digunakan untuk paragraf penjelasan alur escrow dan spesifikasi produk toko.
- **Caption & Microcopy:** Medium, ukuran 12px-14px, line-height 1.5. Digunakan untuk rincian fee MDR Midtrans, nomor resi kurir, dan tanggal transaksi.

## Layout

Tata letak halaman mengutamakan keterbacaan, keteraturan visual, dan kenyamanan responsif pada seluruh ukuran layar:

- **Grid Container:** Lebar maksimum 1280px (max-w-7xl) terpusat di tengah layar dengan padding horizontal 24px hingga 32px.
- **Seksi Hero Hybrid:** Kontainer rounded besar 32px dengan latar belakang `#0E0F1E`, memisahkan proposisi nilai teks di sisi kiri dan elemen visual studio di sisi kanan.
- **Seksi Metrik Transparansi Biaya:** Kontainer bertingkat dengan latar belakang `#F4F2FF` yang memuat kalkulator interaktif surcharge 4% dan empat kartu data mengambang (floating cards).
- **Katalog Template 3 Kolom:** Tata letak grid seimbang untuk pilihan template (Kuliner/F&B, Fashion Muslim, dan Kriya Kerajinan).
- **Etalase Toko Multi-Tenant:** Tata letak asimetris 2 kolom produk di kiri dan 1 kolom keranjang belanja / checkout di kanan yang sticky saat di-scroll.

## Elevation & Depth

Kedalaman visual dibangun menggunakan bayangan halus yang tidak berlebihan:

- **Card Level 1 (Flat Border):** Batas tipis 1px `#E2E8F0` tanpa bayangan tebal untuk menjaga kesederhanaan etalase produk.
- **Card Level 2 (Floating Metric & Checkout):** Bayangan halus `0 10px 25px -5px rgba(15, 23, 42, 0.05)` untuk kartu metrik dan tagihan QRIS.
- **Modal Backdrop:** Lapisan gelap tembus pandang `#0F172A` dengan opacity 60% dan backdrop-filter blur 4px untuk pemusatan fokus interaksi checkout QRIS dan pencairan dana.

## Shapes

Bentuk sudut komponen dirancang konsisten dan terukur:

- **Outer Containers (Hero & Metrik Wash):** Sudut melengkung ekstra besar 32px (`rounded-3xl` / `2rem`) untuk membingkai area fokus visual.
- **Product & Pricing Cards:** Sudut melengkung 16px hingga 20px (`rounded-2xl` / `1.25rem`).
- **Interactive Buttons & Badges:** Sudut melengkung penuh pill-shaped 9999px (`rounded-full`) dengan padding horizontal yang lapang untuk target sentuh minimal 44px.

## Components

### 1. Navigation Header
- Baris navigasi atas bersih dengan logo brand Cuanin di kiri.
- Selector toko multi-tenant yang memungkinkan pergantian konteks toko UMKM secara cepat.
- Tab navigasi beralih peran: Platform Utama, Toko Pembeli, Dashboard Admin UMKM, dan Superadmin Escrow.

### 2. Primary Pill Button
- Latar belakang Electric Violet (`#6355F6`) dengan teks putih tebal.
- Dilengkapi lingkaran ikon panah terarah di sisi kanan tombol untuk menandai aksi maju atau checkout.
- State hover beralih ke `#5244E5` dengan transisi warna halus 150ms.

### 3. Hero Value Proposition Card
- Kontainer gelap `#0E0F1E` dengan teks kontras putih dan gradien violet pada kata kunci utama.
- Menampilkan pill badge status di atas headline yang menyatakan model bisnis Merchant of Record Cuanin.
- Tumpukan avatar pelanggan (customer social proof) di bawah tombol CTA.

### 4. Interactive Fee Transparency Calculator
- Input form untuk harga produk toko dan estimasi tarif kurir pengiriman.
- Panel rincian kalkulasi dinamis yang memecah total tagihan:
  - Subtotal pesanan (Produk + Ongkir)
  - Surcharge 4% yang dibayarkan pembeli
  - Total tagihan scan QRIS
  - Dana bersih hak toko UMKM (100% tanpa potongan)
  - Alokasi fee resmi Midtrans (0.7%) dan platform fee Cuanin (3.3%)

### 5. QRIS Payment Modal
- Menampilkan QR Code resmi berstandar QRIS yang digenerate langsung dari sistem.
- Rincian invoice dan instruksi pembayaran dengan batas waktu kedaluwarsa.
- Tombol simulasi webhook callback Midtrans untuk menguji alur verifikasi otomatis.

### 6. Escrow & Order Lifecycle Card
- Kartu status pesanan real-time dengan tahapan yang jelas: `MENUNGGU_PEMBAYARAN` -> `DIPROSES_TOKO` -> `DIKIRIM` -> `SELESAI`.
- Informasi nomor resi kurir pengiriman.
- Indikator status rekber escrow (`HELD` di akun Cuanin atau `RELEASED` ke saldo toko).
- Tombol aksi *"Konfirmasi Barang Diterima"* bagi pembeli untuk melepaskan dana.

### 7. UMKM Wallet Dashboard
- Dua kartu metrik terpisah: Saldo Tertahan (Escrow HELD) dan Saldo Aktif (Siap Ditarik).
- Tabel daftar pesanan masuk dengan tombol serah terima kurir dan input resi.
- Modal penarikan dana ke rekening bank dengan integrasi simulasi API Midtrans Iris Payouts.

## Do's and Don'ts

### Do's
- Gunakan kontras teks minimal rasio 4.5:1 terhadap latar belakang untuk menjamin keterbacaan (WCAG AA).
- Tampilkan kalkulasi surcharge 4% secara transparan di etalase belanja sebelum pembeli menekan tombol bayar QRIS.
- Pertahankan bentuk tombol aksi utama dalam wujud pill-shaped (`rounded-full`) dengan padding proporsional.
- Pastikan seluruh kontrol interaktif (tombol, dropdown, modal, form input) memiliki fungsi nyata yang dapat dieksekusi.
- Berikan penanda status yang jelas antara dana tertahan di rekening bersama dengan dana yang siap dicairkan oleh UMKM.

### Don'ts
- Jangan gunakan karakter em dash dalam seluruh teks antarmuka maupun dokumentasi pengguna.
- Jangan gunakan bayangan tebal atau efek glow yang berlebihan pada seluruh komponen secara bersamaan.
- Jangan menyembunyikan rincian biaya admin atau membebankan potongan fee ke pihak UMKM tanpa pemberitahuan.
- Jangan membuat tautan navigasi atau tombol mati yang tidak memiliki aksi atau tujuan halaman yang jelas.
- Jangan mencairkan saldo escrow sebelum pembeli melakukan konfirmasi penerimaan atau batas waktu 7 hari terlampaui.
