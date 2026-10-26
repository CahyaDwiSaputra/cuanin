# 📄 Product Requirement Document (PRD)
## Cuanin: Multi-Tenant E-Commerce & Centralized Escrow Platform for MSMEs (UMKM)

- **Document Version**: v1.0.0
- **Status**: Draft - Awaiting Approval
- **Author**: Cuanin Core Team & Hermes Agent
- **Date**: 2026-10-21
- **Target Launch (MVP Sandbox)**: Q4 2026

---

## 1. Executive Summary & Problem Statement

### 1.1 Latar Belakang
Mayoritas pelaku Usaha Mikro, Kecil, dan Menengah (UMKM) di Indonesia menghadapi dua kendala utama dalam ekspansi digital:
1. **Biaya & Kompleksitas Pembuatan Website**: Membangun website toko online mandiri memerlukan biaya pengembang (developer) yang mahal serta keahlian teknis pemeliharaan server.
2. **Kendala Payment Gateway & Perpajakan**: Mendaftarkan Payment Gateway (PG) atas nama perorangan/usaha mikro sering kali rumit, dikenakan potongan biaya transaksi (MDR), dan memicu kekhawatiran administrasi pajak jika belum berbadan hukum resmi.

### 1.2 Solusi: Platform Cuanin
**Cuanin** hadir sebagai ekosistem hibrida antara *Website Agency / Template Builder* dan *Centralized Escrow Marketplace* (model Merchant of Record seperti Shopee/Tokopedia):
- **Jasa Web & Template**: Cuanin menjual jasa pembuatan website berbasis katalog template siap pakai untuk UMKM. UMKM membayar biaya pembuatan/lisensi template via QRIS Midtrans.
- **Multi-Tenant Storefront**: UMKM mendapatkan website toko mandiri berbasis subdomain (contoh: `toko-kopi.cuanin.com`) yang terisolasi untuk mengunggah produk dan mengelola pesanan.
- **Centralized Escrow & Zero-Fee UMKM**:
  - Seluruh transaksi pembeli di web UMKM diproses melalui satu akun gerbang pembayaran Midtrans QRIS terpusat milik Cuanin.
  - Surcharge 4% ditambahkan ke tagihan pembeli (0.7% MDR Midtrans + 3.3% Platform/Maintenance Fee Cuanin), sehingga UMKM menerima **100% harga bersih produk** tanpa terpotong biaya admin.
  - Dana pembayaran ditahan (*escrow*) hingga pesanan tiba dan dikonfirmasi oleh pembeli (atau batas 7 hari *auto-confirm*), baru kemudian dicairkan (*payout*) ke rekening bank UMKM secara otomatis via API Midtrans Iris.

---

## 2. User Personas & Role Matrix

| Role | Deskripsi | Akses & Kewenangan |
| :--- | :--- | :--- |
| **Superadmin (Tim Cuanin)** | Tim internal 5 orang pengelola platform Cuanin | - Monitoring seluruh tenant UMKM<br>- Manajemen katalog template website<br>- Monitoring rekening penampung (Escrow Pool)<br>- Approval / audit payout otomatis (Midtrans Iris)<br>- Rekonsiliasi revenue platform (3.3% platform fee) |
| **Owner UMKM (Tenant)** | Pelaku UMKM yang membeli jasa website Cuanin | - Dashboard pengelolaan toko (`/admin` pada subdomain)<br>- Manajemen produk (CRUD, foto, varian, stok, berat)<br>- Manajemen pesanan (ubah status, input nomor resi pengiriman)<br>- Dashboard dompet/saldo penjualan & permohonan penarikan dana (*payout*) |
| **Customer (Pembeli)** | Pengguna umum yang berbelanja di website UMKM | - Registrasi & autentikasi akun pembeli per-toko UMKM<br>- Penjelajahan katalog produk & keranjang belanja<br>- Checkout alamat dengan estimasi ongkir kurir real-time<br>- Pembayaran scan QRIS (termasuk kalkulasi buffer 4%)<br>- Tracking resi & tombol konfirmasi penerimaan barang |

---

## 3. Financial & Escrow Architecture

```
[ Pembeli ] 
    │  Membayar: (Harga Produk + Ongkir) x 1.04 via QRIS Midtrans
    ▼
[ Midtrans PG (Cuanin Account) ]
    ├── Potong 0.7% MDR (Midtrans)
    └── Sisa 103.3% masuk ke Rekening Escrow Cuanin
            │
            ├─► 3.3% Platform Maintenance Fee ──► [ Pendapatan Cuanin ]
            │
            └─► 100% (Harga Produk + Ongkir)  ──► [ ESCROW POOL (Ditahan) ]
                                                        │
                                                        │ Barang Diterima / 7 Hari Auto-Confirm
                                                        ▼
                                                  [ Saldo Dompet UMKM ]
                                                        │
                                                        │ Request Payout (Midtrans Iris Sandbox)
                                                        ▼
                                                  [ Rekening Bank UMKM ]
```

### 3.1 Skema Perhitungan Biaya (Fee Structure)
* **Harga Produk**: Ditetapkan bebas oleh Owner UMKM (misal: Rp 10.000).
* **Ongkos Kirim**: Dihitung otomatis via Kurir API berdasarkan asal toko & tujuan pembeli (misal: Rp 10.000).
* **Subtotal Transaksi**: Rp 20.000.
* **Surcharge Pembeli (4.0%)**: Rp 20.000 x 4% = Rp 800.
* **Total Tagihan QRIS Pembeli**: **Rp 20.800**.
* **Alokasi Dana**:
  - Biaya Midtrans (0.7%): Rp 145,60.
  - Platform Fee Cuanin (3.3%): Rp 654,40.
  - Dana Bersih Hak UMKM (100%): **Rp 20.000** (ditahan di escrow Cuanin sampai transaksi selesai).

---

## 4. User Journey & Core Functional Requirements

### 4.1 Modul 1: Platform Inti Cuanin (Landing & Template Service)
1. **Landing Page Cuanin**:
   - Showcase fitur unggulan: Toko online instan, bebas pajak UMKM, payment gateway QRIS langsung aktif, perlindungan rekber escrow.
   - Galeri Template: Pilihan desain website berdasarkan kategori usaha (Fashion, Kuliner/F&B, Craft, Jasa).
2. **Order & Setup Website UMKM**:
   - UMKM memilih template dan mengisi formulir registrasi toko (Nama Toko, Subdomain pilihan, Alamat toko asal/origin kurir, Kontak WA).
   - Checkout pembelian jasa website menggunakan QRIS Midtrans.
   - Sistem melakukan *provisioning* subdomain tenant baru (misal: `kopi-kenangan.cuanin.com`).

### 4.2 Modul 2: Multi-Tenant Storefront (Website UMKM)
1. **Routing Subdomain**:
   - Middleware mendeteksi subdomain request: jika subdomain = `toko-a`, load context & database tenant `toko-a`.
2. **Katalog & Navigasi**:
   - Beranda toko dengan banner promo, kategori produk, dan pencarian produk.
   - Detail produk: galeri foto, deskripsi, harga, stok, berat barang (gram).
3. **Autentikasi Pembeli**:
   - Wajib registrasi/login sebelum checkout (Email, Password, Nama, No. WhatsApp).
4. **Checkout & Pengiriman**:
   - Pemilihan alamat pengiriman (Provinsi, Kota/Kabupaten, Kecamatan, Kode Pos).
   - Integrasi Kurir API (RajaOngkir / Biteship Starter) untuk menghitung ongkir otomatis (JNE, SiCepat, J&T).
5. **Pembayaran QRIS Midtrans**:
   - Menampilkan Snap Modal / Dynamic QR Code QRIS sebesar `(Subtotal + Ongkir) * 1.04`.
   - Webhook listener Midtrans menerima notifikasi pembayaran sukses `settlement` -> update status pesanan menjadi `PAID_PREPARING` secara real-time.

### 4.3 Modul 3: Manajemen Toko UMKM (Dashboard UMKM)
1. **Manajemen Produk**: Tambah, ubah, hapus produk, atur stok dan berat pengiriman.
2. **Manajemen Pesanan**:
   - Daftar pesanan masuk dengan status: `MENUNGGU_PEMBAYARAN`, `DIPROSES_TOKO`, `DIKIRIM`, `SELESAI`, `DIBATALKAN`.
   - Form input kurir & nomor resi pengiriman saat pesanan diserahkan ke jasa ekspedisi.
   - Notifikasi otomatis / update link pelacakan untuk pembeli.
3. **Dompet Saldo & Payout**:
   - Menampilkan total saldo aktif (dana yang sudah selesai masa escrow).
   - Menampilkan saldo tertahan (dana dalam proses pengiriman/menunggu konfirmasi).
   - Form penarikan saldo (*Withdraw*): Memilih rekening bank tujuan -> memicu request transfer otomatis via Midtrans Iris API.

### 4.4 Modul 4: Escrow & Auto-Confirmation Lifecycle
1. **Konfirmasi Manual Pembeli**:
   - Pembeli dapat menekan tombol "Konfirmasi Pesanan Diterima" di halaman detail pesanan.
   - Status pesanan berubah menjadi `COMPLETED`, dana dialihkan dari status `HELD` menjadi `RELEASED` ke saldo dompet UMKM.
2. **Otomatisasi 7 Hari (Auto-Release Worker)**:
   - Worker background (Cron Job) berjalan setiap jam.
   - Memeriksa pesanan dengan status `DIKIRIM` yang telah melewati `7 x 24 jam` sejak resi diinput.
   - Jika pembeli tidak melakukan konfirmasi/komplain, sistem secara otomatis mengeksekusi konfirmasi pesanan (`COMPLETED`) dan mencairkan dana ke saldo UMKM.

### 4.5 Modul 5: Superadmin Cuanin
1. **Tenant Directory**: Pemantauan seluruh website UMKM aktif, status lisensi/template, dan performa omset.
2. **Escrow Liquidity Monitor**: Monitoring saldo riil pada rekening penampung Midtrans vs saldo kewajiban escrow UMKM.
3. **Platform Earnings**: Laporan akumulasi keuntungan 3.3% fee platform Cuanin.
4. **Payout Audit**: Riwayat pengiriman uang otomatis ke UMKM via Iris API beserta log status transaksi perbankan.

---

## 5. Technical Stack & Architecture

### 5.1 Tech Stack Recommendation
- **Frontend & Routing**: **Next.js 15 (App Router)** / **Vite React + Node Multi-tenant Router**
  - Menggunakan Wildcard Subdomain Routing (`*.cuanin.com`).
  - Styling: Tailwind CSS v4 + Shadcn UI untuk komponen bersih dan responsif.
- **Backend API & Multi-Tenancy**: **Node.js (TypeScript) + Express / Next.js Server Actions**
  - Tenant resolution middleware berbasis Host header (`req.headers.host`).
- **Database & ORM**: **PostgreSQL** + **Prisma ORM**
  - Skema Relasional Multi-Tenant (Tenant-ID Scoped isolation untuk integritas data yang efisien dan aman).
- **Payment & Payout Gateway**:
  - **Midtrans Snap / Core API (Sandbox)** untuk QRIS payment generation & webhook handler.
  - **Midtrans Iris API (Sandbox)** untuk transfer dana otomatis antar bank ke rekening UMKM.
- **Logistics Integration**:
  - **RajaOngkir API (Starter/Pro)** atau **Biteship API** untuk kalkulasi tarif ongkir antar kecamatan/kota.
- **Scheduled Background Worker**:
  - Node-Cron / BullMQ (Redis) untuk pengecekan batas waktu 7 hari *auto-confirm escrow*.

---

## 6. Database Schema Design (High-Level Entity Relationship)

```
┌────────────────┐       ┌────────────────┐       ┌────────────────┐
│    Tenants     │1     *│    Products    │1     *│   OrderItems   │
│  (Toko UMKM)   ├───────┤  (Katalog UMKM)├───────┤                │
└───────┬────────┘       └────────────────┘       └───────┬────────┘
        │1                                                │*
        │*                                        ┌───────┴────────┐
┌───────┴────────┐       ┌────────────────┐1     1│     Orders     │
│  TenantUsers   │       │   Customers    ├───────┤ (Pesanan User) │
│ (Owner/Staff)  │       │   (Pembeli)    │       └───────┬────────┘
└────────────────┘       └────────────────┘               │1
                                                          │1
                                                  ┌───────┴────────┐
                                                  │ EscrowHoldings │
                                                  │ (Status Rekber)│
                                                  └────────────────┘
```

### Entitas Kunci:
1. `tenants`: `id`, `name`, `subdomain`, `owner_name`, `phone`, `bank_code`, `bank_account_number`, `bank_account_holder`, `origin_city_id`, `created_at`
2. `products`: `id`, `tenant_id`, `name`, `description`, `price`, `stock`, `weight_grams`, `images`
3. `customers`: `id`, `tenant_id`, `email`, `password_hash`, `name`, `phone`, `address`
4. `orders`: `id`, `tenant_id`, `customer_id`, `invoice_number`, `product_subtotal`, `shipping_cost`, `surcharge_fee` (4%), `total_gross_amount`, `courier_name`, `tracking_number` (resi), `status` (`PENDING`, `PAID`, `SHIPPED`, `COMPLETED`, `CANCELLED`), `shipped_at`, `completed_at`
5. `escrow_transactions`: `id`, `order_id`, `tenant_id`, `amount_held` (100% hak UMKM), `platform_fee` (3.3%), `midtrans_fee` (0.7%), `status` (`HELD`, `RELEASED`, `REFUNDED`), `released_at`
6. `payout_requests`: `id`, `tenant_id`, `amount`, `bank_code`, `account_number`, `status` (`QUEUED`, `PROCESSING`, `SUCCESS`, `FAILED`), `iris_reference_no`

---

## 7. Boundaries & Quality Rules (Guiding Principles)

- **Always Do**:
  - Validasi signature webhook Midtrans menggunakan `Server-Key` SHA-512 untuk mencegah manipulasi notifikasi bayar.
  - Terapkan atomic database transactions saat mengubah status pesanan dari `SHIPPED` -> `COMPLETED` dan menambahkan saldo UMKM.
  - Pisahkan pembukuan antara saldo titipan escrow UMKM dengan revenue platform Cuanin (3.3%).
  - Pastikan setiap query produk/pesanan selalu menyertakan filter `tenant_id` untuk mencegah *data leaking* antar UMKM.
- **Ask First**:
  - Perubahan formula surcharge fee dari 4% menjadi angka lain.
  - Perubahan durasi auto-confirm dari 7 hari.
  - Perubahan skema routing multi-tenant (misal dari subdomain ke subpath atau custom domain).
- **Never Do**:
  - Menyimpan nomor rekening, PIN, atau kredensial perbankan tanpa enkripsi.
  - Melepaskan (*release*) dana escrow sebelum ada konfirmasi terima valid atau masa auto-release 7 hari terpenuhi.
  - Menghapus riwayat transaksi finansial atau log webhook Midtrans.

---

## 8. Success Criteria & Definition of Done (MVP Sandbox)

1. [ ] **Storefront Provisioning**: Sistem dapat me-render toko dengan URL subdomain unik (contoh: `alpha.cuanin.local`) berdasarkan data tenant di database.
2. [ ] **Customer Authentication**: Pembeli dapat mendaftar dan login di website toko UMKM.
3. [ ] **Dynamic Fee Calculation**: Sistem otomatis menambahkan surcharge 4% pada tagihan checkout QRIS.
4. [ ] **Midtrans QRIS Simulation**: Pembeli dapat melakukan scan QRIS sandbox Midtrans dan webhook berhasil memperbarui status pesanan menjadi `PAID_PREPARING`.
5. [ ] **Fulfillment & Resi**: Owner UMKM dapat memasukkan nomor resi kurir, mengubah status menjadi `DIKIRIM`.
6. [ ] **Escrow Release**:
   - Jika pembeli klik "Konfirmasi Terima", saldo langsung masuk ke dompet UMKM.
   - Worker otomatis mengkonfirmasi pesanan jika sudah 7 hari sejak resi diinput.
7. [ ] **Automated Payout Simulation**: UMKM dapat menarik saldo dari dashboard dan sistem berhasil memicu endpoint transfer Midtrans Iris Sandbox.
