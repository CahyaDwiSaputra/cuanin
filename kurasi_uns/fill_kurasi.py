import os
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH

def build_filled_document():
    doc_path = 'C:/Users/muham/cuanin/kurasi_uns/01_Instrumen_Kurasi_Mahasiswa_Wirausaha_UNS_2026_ORIGINAL.docx'
    doc = docx.Document(doc_path)
    
    def set_cell_paragraphs(cell, para_list):
        p0 = cell.paragraphs[0]
        p0.text = ''
        for extra_p in list(cell.paragraphs[1:]):
            p_elem = extra_p._element
            p_elem.getparent().remove(p_elem)
        
        for idx, item in enumerate(para_list):
            p = p0 if idx == 0 else cell.add_paragraph()
            p.paragraph_format.space_before = Pt(1)
            p.paragraph_format.space_after = Pt(2)
            p.paragraph_format.line_spacing = 1.15
            if isinstance(item, str):
                r = p.add_run(item)
                r.font.name = 'Times New Roman'
                r.font.size = Pt(11)
            elif isinstance(item, tuple):
                prefix, normal = item
                if prefix:
                    r1 = p.add_run(prefix)
                    r1.font.name = 'Times New Roman'
                    r1.font.size = Pt(11)
                    r1.bold = True
                if normal:
                    r2 = p.add_run(normal)
                    r2.font.name = 'Times New Roman'
                    r2.font.size = Pt(11)

    def set_cell_image_and_text(cell, image_path, width_inches, desc_paragraphs):
        p0 = cell.paragraphs[0]
        p0.text = ''
        for extra_p in list(cell.paragraphs[1:]):
            p_elem = extra_p._element
            p_elem.getparent().remove(p_elem)
        
        if os.path.exists(image_path):
            run_img = p0.add_run()
            run_img.add_picture(image_path, width=Inches(width_inches))
            p0.paragraph_format.space_after = Pt(4)
        
        for desc in desc_paragraphs:
            p = cell.add_paragraph()
            p.paragraph_format.space_before = Pt(1)
            p.paragraph_format.space_after = Pt(2)
            p.paragraph_format.line_spacing = 1.15
            if isinstance(desc, tuple):
                prefix, normal = desc
                if prefix:
                    r1 = p.add_run(prefix)
                    r1.font.name = 'Times New Roman'
                    r1.font.size = Pt(10.5)
                    r1.bold = True
                if normal:
                    r2 = p.add_run(normal)
                    r2.font.name = 'Times New Roman'
                    r2.font.size = Pt(10.5)
            else:
                r = p.add_run(desc)
                r.font.name = 'Times New Roman'
                r.font.size = Pt(10.5)

    # ==========================================
    # TABLE 0: INFORMASI UMUM MAHASISWA
    # ==========================================
    t0 = doc.tables[0]
    set_cell_paragraphs(t0.rows[0].cells[2], ['22 Oktober 2026'])
    set_cell_paragraphs(t0.rows[1].cells[2], [
        ('Cahya Dwi Saputra', ' (NIM: V3924022)')
    ])
    set_cell_paragraphs(t0.rows[2].cells[2], [
        'D-III Teknik Informatika PSDKU Madiun, Sekolah Vokasi, Universitas Sebelas Maret'
    ])
    set_cell_paragraphs(t0.rows[3].cells[2], ['085755705433'])
    set_cell_paragraphs(t0.rows[4].cells[2], ['cahyadwisaputra@student.uns.ac.id'])

    # ==========================================
    # TABLE 1: IDENTITAS USAHA
    # ==========================================
    t1 = doc.tables[1]
    # R1: Nama Usaha
    set_cell_paragraphs(t1.rows[1].cells[2], [
        ('cuan.in ', '(Platform Toko Online UMKM & Centralized Escrow Gateway)')
    ])
    # R2: Logo Usaha
    logo_img = 'C:/Users/muham/cuanin/public/cuanin_logo_full.png'
    set_cell_image_and_text(t1.rows[2].cells[2], logo_img, 2.4, [
        ('Filosofi & Deskripsi Logo:', ''),
        ('1. Simbol Keranjang & Panah Pertumbuhan (Shopping Cart & Growth Arrow): ', 'Menggabungkan bentuk keranjang belanja e-commerce dengan grafik panah finansial yang menembus ke atas, melambangkan akselerasi penjualan dan peningkatan laba usaha bagi pelaku UMKM.'),
        ('2. Muatan Komoditas Lokal Nusantara: ', 'Di dalam keranjang memuat ilustrasi produk kriya dan pangan nusantara (ketupat, karung hasil bumi, dan jar kriya), menegaskan fokus cuan.in pada digitalisasi produk UMKM lokal Indonesia.'),
        ('3. Palet Warna Hijau Zamrud (#185834) & Kuning Keemasan (#EFA91F): ', 'Hijau melambangkan kemakmuran, stabilitas, dan pertumbuhan ekonomi berkelanjutan; kuning keemasan melambangkan kejayaan, optimisme, dan nilai keuntungan ("cuan") bagi mitra pedagang.'),
        ('4. Tipografi & Slogan Resmi: ', 'Menggunakan font modern ramah "cuan.in" dengan slogan resmi "Own Your Profit. No Commission Fees." yang menegaskan komitmen 0% potongan komisi untuk pedagang.')
    ])
    # R3: Alamat Usaha
    set_cell_paragraphs(t1.rows[3].cells[2], [
        'Kampus PSDKU Madiun Universitas Sebelas Maret, Jl. Imam Bonjol No. 13, Pandean, Kec. Taman, Kota Madiun, Jawa Timur 63161 (Kantor Operasional & Riset Digital Tim Cuanin)'
    ])
    # R4: Media Sosial
    set_cell_paragraphs(t1.rows[4].cells[2], [
        ('Website Resmi Agensi: ', 'https://cuan.in (Akses Online Publik: https://social-avatar-gardens-emma.trycloudflare.com)'),
        ('Halaman Pemesanan Toko: ', 'https://cuan.in/order'),
        ('Portal Contoh Toko UMKM: ', 'https://(namatoko).cuanin.com (Katalog 6 Klaster Industri)'),
        ('Instagram Bisnis: ', '@cuanin.id'),
        ('LinkedIn: ', 'cuanin-digital-indonesia'),
        ('WhatsApp Layanan Mitra: ', '085755705433')
    ])
    # R5: Tahun Berdiri
    set_cell_paragraphs(t1.rows[5].cells[2], ['2026'])
    # R6: Status Kepemilikan
    set_cell_paragraphs(t1.rows[6].cells[2], [
        'Kelompok Mahasiswa Wirausaha (Tim 5 Mahasiswa Multidisiplin UNS: Tech Lead/Hacker, UI/UX Designer, Business Development, Escrow Financial Ops, & Merchant Relations. Sedang persiapan pendaftaran NIB dan formalisasi badan usaha CV/PT).'
    ])
    # R7: Jumlah Karyawan
    set_cell_paragraphs(t1.rows[7].cells[2], [
        '5 Orang Tim Pengembang Inti (Founding Team Multidisiplin).'
    ])

    # ==========================================
    # TABLE 2: DESKRIPSI DAN JENIS USAHA
    # ==========================================
    t2 = doc.tables[2]
    # R1: Deskripsi Usaha
    set_cell_paragraphs(t2.rows[1].cells[2], [
        'cuan.in adalah platform digital terintegrasi berbasis SaaS (Software as a Service) dan Centralized Escrow yang dirancang khusus untuk memfasilitasi UMKM Indonesia memiliki website toko online mandiri profesional dalam hitungan menit tanpa memerlukan keahlian koding (zero-code website builder).',
        'Platform ini memecahkan 3 masalah fundamental yang dialami pelaku UMKM:',
        ('1. Biaya Jasa Pembuatan Website yang Terlalu Mahal: ', 'Jasa agensi pembuatan web di pasaran rata-rata mematok Rp 1,5 juta - Rp 3,5 juta, sangat membebani kas UMKM pemula.'),
        ('2. Potongan Komisi Marketplace yang Mencekik Margin: ', 'Marketplace besar mengenakan komisi potongan 6% hingga 12% per transaksi, menggerus profit bersih pedagang kecil.'),
        ('3. Hambatan Legalitas Payment Gateway: ', 'Integrasi pembayaran non-tunai (QRIS) mandiri umumnya mensyaratkan izin usaha berbadan hukum PT/CV yang sulit dipenuhi pedagang perorangan.'),
        'Melalui cuan.in, UMKM mendapatkan subdomain toko mandiri resmi (format: namatoko.cuanin.com), katalog produk terintegrasi kalkulator ongkos kirim kurir otomatis (JNE & SiCepat), pembayaran QRIS Midtrans terpusat di mana cuan.in bertindak sebagai Merchant of Record, serta sistem Rekening Bersama (Centralized Escrow) otomatis ala Shopee/Tokopedia.',
        'Dana pembeli ditahan aman di akun escrow cuan.in dan otomatis dicairkan ke rekening bank UMKM (BCA, Mandiri, BRI, BNI via Midtrans Iris) saat pembeli mengonfirmasi barang diterima atau setelah 7 hari kalender (auto-confirm). Mengusung prinsip "Own Your Profit. No Commission Fees", UMKM menerima 100% uang hasil penjualan bersih tanpa potongan biaya admin/pajak.'
    ])
    # R2: Kategori Usaha
    set_cell_paragraphs(t2.rows[2].cells[2], [
        '☐ Makanan dan Minuman',
        '☐ Budidaya',
        '☐ Industri Kreatif, Seni, dan Budaya',
        '☐ Jasa, Pariwisata, dan Perdagangan',
        '☐ Manufaktur dan Teknologi Terapan',
        ('☑ Bisnis Digital ', '(Pilihan Kategori: Platform SaaS, E-Commerce Enabler, & FinTech Escrow Gateway)'),
        '*centang salah satu: Terpilih Bisnis Digital'
    ])
    # R3: Keunikan Produk/Jasa
    set_cell_paragraphs(t2.rows[3].cells[2], [
        ('1. Zero Commission Fee (100% Hak Bersih Penjual): ', 'Berbeda dengan marketplace konvensional yang memotong komisi 6-12% dari penjualan UMKM, cuan.in tidak memungut komisi persentase penjualan dari mitra. Biaya pemeliharaan sistem (surcharge 4%) dibayarkan secara transparan oleh pembeli saat scan QRIS, sehingga uang penjualan UMKM 100% utuh.'),
        ('2. Rekening Bersama (Centralized Escrow) Otomatis: ', 'Menyelesaikan kendala krisis kepercayaan konsumen saat berbelanja di website toko online independen. Dana pembeli ditahan aman di sistem rekber cuan.in hingga kurir menyerahkan barang pesanan (dilengkapi fitur auto-confirm 7 hari kalender).'),
        ('3. Arsitektur Multi-Tenant Subdomain Berbiaya Rendah: ', 'Mengadopsi arsitektur multi-tenant Node.js + PostgreSQL efisien tinggi sehingga biaya sewa hosting per toko dapat ditekan hingga hanya Rp 199.000 - Rp 349.000/tahun (setara Rp 16.000 - Rp 29.000/bulan), jauh lebih terjangkau dibanding Shopify ($25-$39/bulan) atau Sirclo (Rp 100rb-Rp 250rb/bulan).'),
        ('4. 6 Template Siap Pakai Lintas Industri: ', 'Disediakan katalog template responsif sesuai ceruk bisnis (Katalog Kuliner & Kopi Artisan, Butik Fashion Muslim, Galeri Kriya & Kayu Nusantara, Skincare Herbal Alami, Aksesoris Gadget, dan Tanaman Hias/Florist).'),
        ('5. Merchant of Record & Payout Otomatis: ', 'UMKM perorangan dapat langsung menerima pembayaran QRIS nasional tanpa harus mengurus izin perbankan/fintech PT/CV sendiri, dengan fasilitas pencairan instan otomatis (Midtrans Iris API).')
    ])
    # R4: Tahap Usaha
    set_cell_paragraphs(t2.rows[4].cells[2], [
        '☐ Ide',
        ('☑ Prototipe / MVP Berjalan Penuh ', '(Sistem website live online, database PostgreSQL terintegrasi, katalog 6 template aktif, integrasi QRIS Midtrans & rekber escrow berjalan penuh di internet).'),
        '☐ Sudah Berjalan',
        '*centang salah satu: Terpilih Prototipe / MVP Validasi Pasar'
    ])

    # ==========================================
    # TABLE 3: ANALISIS PASAR
    # ==========================================
    t3 = doc.tables[3]
    # R1: Target Pasar
    set_cell_paragraphs(t3.rows[1].cells[2], [
        ('1. Target Pasar Primer: ', 'Pelaku UMKM mikro dan kecil di Indonesia (khususnya klaster F&B kuliner olahan, butik busana muslim/lokal, dan pengrajin kriya) yang telah aktif berjualan via media sosial/WhatsApp namun memerlukan katalog produk terstruktur, kalkulator ongkir kurir otomatis, dan pembayaran QRIS resmi.'),
        ('2. Target Pasar Sekunder: ', 'Mahasiswa wirausaha kampus, brand lokal rintisan (D2C / Direct-to-Consumer), dan komunitas pengrajin binaan pemerintah daerah Solo Raya & Madiun yang ingin mandiri dari monopoli algoritma marketplace besar.'),
        ('3. Estimasi Ukuran Pasar: ', 'Terdapat lebih dari 64 juta unit UMKM di Indonesia, di mana lebih dari 21 juta telah terhubung ke ekosistem digital. Target pasar realistis (SOM) tahap awal adalah 500-1.000 UMKM mitra binaan di wilayah Jawa Tengah dan Jawa Timur dalam 12 bulan pertama.')
    ])
    # R2: Analisis Pesaing
    set_cell_paragraphs(t3.rows[2].cells[2], [
        ('1. Marketplace Raksasa (Shopee, Tokopedia, TikTok Shop): ', 'Kelebihan memiliki basis pengguna besar; kelemahan membebankan potongan komisi sangat tinggi (6-12%), perang harga kanibal antar penjual, dan merchant tidak memiliki database pelanggan sendiri.'),
        ('2. Global Website Builder (Shopify, WooCommerce): ', 'Shopify mematok tarif langganan dolar yang mahal (Rp 4,5 juta+/tahun) serta konfigurasi gateway pembayaran lokal yang rumit. WooCommerce memerlukan keahlian coding server, instalasi plugin manual, dan biaya maintenance mandiri.'),
        ('3. Platform Toko Lokal (Sirclo Store, Tokotalk): ', 'Mematok biaya sewa bulanan Rp 100.000 - Rp 250.000/bulan (Rp 1,2 juta - Rp 3 juta/tahun) tanpa fasilitas ekosistem rekber escrow terpusat untuk toko mandiri.'),
        ('Keunggulan Kompetitif cuan.in: ', 'Menghadirkan titik temu sempurna: biaya paket sangat terjangkau (Rp 349.000/tahun), 0% komisi transaksi ke penjual, sistem rekber escrow terintegrasi untuk keamanan pembeli, antarmuka 100% ramah pengguna berbahasa Indonesia, dan setup instan siap jualan dalam 3 langkah.')
    ])
    # R3: Strategi Pemasaran
    set_cell_paragraphs(t3.rows[3].cells[2], [
        ('1. B2G & Campus Partnership (Kemitraan Strategis): ', 'Bermitra dengan Inkubator Wirausaha UNS, Dinas Koperasi dan UMKM Surakarta/Madiun, serta komunitas UMKM daerah untuk mengadakan workshop pelatihan "Go Digital Mandiri Tanpa Beban Komisi".'),
        ('2. Content Marketing Komparatif (TikTok & Instagram Reels): ', 'Membuat konten edukasi bisnis interaktif: "Simulasi Keuangan: Jualan di Marketplace vs Website Sendiri (Hemat Ratusan Ribu Setiap Bulan Bersama cuan.in)".'),
        ('3. Model Interaktif "Try-Before-Buy": ', 'Menyediakan etalase 6 toko demo live (Kopi Senja, Butik Aisyah, Kriya Bambu, Natura Herbal, GadgetPedia, Kebun Kita) sehingga calon mitra UMKM dapat mencoba langsung alur belanja dan dashboard pemilik sebelum memutuskan membeli paket.'),
        ('4. Program Merchant Ambassador & Referral: ', 'Memberikan reward perpanjangan masa aktif hosting gratis 3 bulan bagi mitra UMKM yang berhasil merekrut sesama pelaku usaha untuk menggunakan website cuan.in.')
    ])

    # ==========================================
    # TABLE 4: KEUANGAN DAN OMSET USAHA
    # ==========================================
    t4 = doc.tables[4]
    # R1: Sumber Modal Awal
    set_cell_paragraphs(t4.rows[1].cells[2], [
        ('☑ Dana Pribadi: Rp. 2.500.000 ', '(Patungan mandiri 5 anggota tim @ Rp 500.000 untuk sewa server cloud NVMe cluster, registrasi domain, dan tooling pengembangan sistem).'),
        '☐ Pinjaman: Rp. -',
        ('☑ Hibah Wibawa / Program Wirausaha UNS: Rp. 0 ', '(Target pendanaan program hibah kurasi wirausaha UNS untuk akselerasi server, legalitas badan usaha, dan edukasi UMKM).'),
        '☐ Investor: Rp. -',
        '☐ Lainnya, Rp. -',
        '*centang yang sesuai: Dana Pribadi & Hibah Wibawa Program UNS'
    ])
    # R2: Omset Bulanan Rata-Rata
    set_cell_paragraphs(t4.rows[2].cells[2], [
        'Tahap Awal Validasi (MVP): Rp 4.500.000 - Rp 8.000.000 / bulan (Didapatkan dari penjualan paket website Starter/Pro kepada 15-20 klien UMKM awal serta estimasi transaction fee platform 3.3%).'
    ])
    # R3: Keuntungan Bersih Bulanan Rata-Rata
    set_cell_paragraphs(t4.rows[3].cells[2], [
        'Rp 3.450.000 - Rp 6.150.000 / bulan (Margin laba bersih mencapai ~77% karena arsitektur multi-tenant membagi biaya pokok server cloud secara efisien antar merchant).'
    ])
    # R4: Proyeksi Keuangan
    set_cell_paragraphs(t4.rows[4].cells[2], [
        ('Proyeksi Pendapatan dan Pengeluaran 6 Bulan ke Depan: ', ''),
        ('- Bulan 1-2 (Fase Akuisisi 50 UMKM Awal): ', 'Pendapatan paket web: 50 x Rp 349.000 = Rp 17.450.000. Biaya operasional server & tools: Rp 3.000.000. Laba Bersih: Rp 14.450.000.'),
        ('- Bulan 3-4 (Fase Skalabilitas 150 UMKM): ', 'Akumulasi 150 toko aktif. Estimasi perputaran transaksi belanja merchant Rp 150.000.000/bulan x fee platform 3.3% = Rp 4.950.000/bulan pasif + penjualan paket baru Rp 17.450.000 = Total Pendapatan Rp 22.400.000/bulan. Biaya operasional: Rp 4.500.000. Laba Bersih: Rp 17.900.000/bulan.'),
        ('- Bulan 5-6 (Fase Ekspansi 300 UMKM Mitra): ', 'Target 300 UMKM aktif. Total proyeksi pendapatan akumulatif mencapai Rp 75.000.000 - Rp 85.000.000 dengan proyeksi laba bersih operasional di atas 70% (~Rp 55.000.000 - Rp 59.500.000).')
    ])
    # R5: Penggunaan Laba
    set_cell_paragraphs(t4.rows[5].cells[2], [
        ('Alokasi Penggunaan Laba (100% Reinvestasi untuk Akselerasi Usaha): ', ''),
        ('1. 40% Penguatan Infrastruktur Teknologi: ', 'Upgrade cluster cloud NVMe server berkecepatan tinggi, database backup replication, dan peningkatan kapasitas transaksi payment gateway.'),
        ('2. 35% Aspek Legalitas & Perlindungan Hukum: ', 'Pendirian badan hukum resmi (PT/CV), pendaftaran HAKI Merek Dagang cuan.in di DJKI, dan sertifikasi PSE Kominfo.'),
        ('3. 25% Edukasi Merchant & Pemasaran: ', 'Penyelenggaraan workshop digitalisasi UMKM di Solo Raya/Madiun, pembuatan materi edukasi online, dan operasional customer onboarding support.')
    ])

    # ==========================================
    # TABLE 5: DAMPAK SOSIAL DAN LINGKUNGAN
    # ==========================================
    t5 = doc.tables[5]
    # R1: Dampak Sosial
    set_cell_paragraphs(t5.rows[1].cells[2], [
        ('1. Menjaga Kedaulatan & Keuntungan Bersih UMKM: ', 'Memberdayakan pelaku UMKM lokal agar terbebas dari potongan komisi tinggi marketplace besar (6-12%), sehingga pendapatan hasil jerih payah pedagang 100% utuh untuk pengembangan usahanya.'),
        ('2. Penciptaan Lapangan Kerja di Tingkat Lokal: ', 'Peningkatan penjualan online mitra UMKM mendorong penyerapan tenaga kerja lokal baru di lingkungan sekitar, seperti penambahan tenaga produksi kuliner, penjahit busana, pengrajin kriya, serta staf pengemasan/kurir lokal.'),
        ('3. Peningkatan Literasi FinTech & Transaksi Non-Tunai: ', 'Membimbing pelaku usaha konvensional di daerah untuk terbiasa mengelola transaksi digital, pembayaran QRIS terstandar, pelacakan nomor resi ekspedisi, dan pencairan dana perbankan otomatis secara transparan dan akuntabel.')
    ])
    # R2: Dampak Lingkungan
    set_cell_paragraphs(t5.rows[2].cells[2], [
        ('1. Efisiensi Paperless (Zero Waste Administration): ', 'Menggantikan seluruh dokumen kertas transaksi manual (nota penjualan, faktur tagihan, kuitansi, dan buku kas fisik) menjadi sistem pencatatan digital otomatis, menghemat puluhan ribu lembar kertas per tahun.'),
        ('2. Penurunan Jejak Karbon Logistik: ', 'Integrasi API kurir terpusat (JNE/SiCepat) meminimalisir kesalahan alamat dan rute penjemputan paket bolak-balik, membantu menurunkan emisi gas buang armada pengiriman barang.'),
        ('3. Kampanye Merchant Berkelanjutan: ', 'Memberikan badge khusus "Eco-Friendly Merchant" dan sorotan promosi di etalase cuan.in bagi toko UMKM yang menggunakan bahan baku ramah lingkungan dan kemasan biodegradable (daun pisang, besek bambu, kardus daur ulang, bio-cassava plastic).')
    ])

    # ==========================================
    # TABLE 6: LEGALITAS, IZIN, DAN HAKI
    # ==========================================
    t6 = doc.tables[6]
    # R1: Legalitas Usaha
    set_cell_paragraphs(t6.rows[1].cells[2], [
        'KBLI 62019 (Aktivitas Pemrograman Komputer Lainnya) & KBLI 63122 (Portal Web dan/atau Platform Digital dengan Tujuan Komersial)'
    ])
    # R2: Apakah terdaftar resmi?
    set_cell_paragraphs(t6.rows[2].cells[2], [
        'Sudah / ☑ Belum',
        '☐ NIB (Tahap persiapan pendaftaran OSS RBA)',
        '☐ IUMK',
        ('☑ Lainnya: ', 'Sedang dalam proses persiapan pendaftaran NIB melalui OSS RBA Kementerian Investasi/BKPM dengan fasilitasi program wirausaha UNS.'),
        '*centang yang sesuai: Belum (Proses Pengajuan NIB)'
    ])
    # R3: Rencana mendaftar?
    set_cell_paragraphs(t6.rows[3].cells[2], [
        ('☑ Ya ', '/ ☐ Tidak (Akan didaftarkan NIB perseorangan/kelompok dalam 1-2 bulan ke depan bersamaan dengan pendampingan kurasi wirausaha UNS).')
    ])
    # R4: Izin Produk
    set_cell_paragraphs(t6.rows[4].cells[2], [
        '☐ PIRT',
        '☐ Sertifikat Halal',
        '☐ Izin BPOM',
        '☐ Izin edar BPOM',
        '☐ Standar Nasional Indonesia (SNI)',
        ('☑ Lainnya: ', 'Layanan berbasis SaaS / Platform Digital (Bukan produk konsumsi/obat fisik sehingga tidak memerlukan PIRT/BPOM/Halal produk barang, melainkan tunduk pada regulasi pendaftaran Penyelenggara Sistem Elektronik / PSE Kominfo RI).'),
        '*centang yang sesuai: Lainnya (Layanan Platform Digital / PSE)'
    ])
    # R5: Kekayaan Intelektual
    set_cell_paragraphs(t6.rows[5].cells[2], [
        ('☑ Merek ', '(Persiapan pendaftaran Merek Dagang "cuan.in" Kelas 35 & 42 ke Direktorat Jenderal Kekayaan Intelektual / DJKI Kemenkumham RI).'),
        '☐ Desain Industri',
        ('☑ Hak Cipta ', '(Pencatatan Hak Cipta atas Ciptaan Program Komputer / Source Code & Desain Antarmuka Platform Web cuan.in).'),
        '☐ Paten',
        '☐ Rahasia dagang',
        '*centang yang sesuai: Merek & Hak Cipta'
    ])

    # ==========================================
    # TABLE 7: RENCANA PENGEMBANGAN DAN TANTANGAN
    # ==========================================
    t7 = doc.tables[7]
    # R1: Rencana Jangka Pendek
    set_cell_paragraphs(t7.rows[1].cells[2], [
        ('Target 6 Bulan ke Depan: ', ''),
        ('1. Validasi & Onboarding 100 UMKM: ', 'Mengakuisisi dan membina minimal 100 pelaku UMKM di Solo Raya, Madiun, dan sekitarnya hingga aktif menghasilkan transaksi penjualan rutin.'),
        ('2. Finalisasi Legalitas Usaha: ', 'Penyelesaian NIB resmi, pendaftaran PSE Kominfo, dan pengajuan Merek Dagang cuan.in ke DJKI.'),
        ('3. Integrasi WhatsApp Notification Gateway: ', 'Menyempurnakan otomasi notifikasi status pembayaran dan update nomor resi pengiriman kurir langsung ke nomor WhatsApp pembeli dan penjual.'),
        ('4. Prestasi di Ajang Kewirausahaan UNS: ', 'Mengoptimalkan bimbingan inkubasi UNS untuk lolos seleksi pendanaan program kewirausahaan mahasiswa tingkat universitas dan nasional.')
    ])
    # R2: Rencana Jangka Panjang
    set_cell_paragraphs(t7.rows[2].cells[2], [
        ('Visi 2-5 Tahun ke Depan: ', ''),
        ('1. Ekosistem E-Commerce Enabler Terdepan: ', 'Menjadi platform solusi digital UMKM nomor 1 di Indonesia dengan membina lebih dari 25.000 merchant aktif di berbagai provinsi.'),
        ('2. Pengembangan Ekosistem Terpadu: ', 'Menghadirkan fitur kasir offline (POS / Point of Sale), integrasi multi-gudang logistik daerah, dan fitur micro-financing permodalan usaha bagi UMKM dengan riwayat transaksi terbaik.'),
        ('3. Transformasi Entitas Bisnis Mandiri: ', 'Mendirikan badan hukum PT Cuanin Digital Nusantara dan tumbuh menjadi startup teknologi nasional yang mandiri, profitable, dan berkelanjutan.')
    ])
    # R3: Tantangan Terbesar
    set_cell_paragraphs(t7.rows[3].cells[2], [
        ('1. Hambatan Literasi Digital Pedagang Konvensional: ', 'Sebagian pelaku UMKM tradisional masih terbiasa mencatat pesanan manual via WhatsApp chat dan ragu menggunakan dashboard toko otomatis. Solusi: Menyediakan modul panduan video singkat, template siap pakai, dan pendampingan WhatsApp onboarding 1-on-1.'),
        ('2. Kepercayaan Pembeli pada Toko Online Mandiri: ', 'Konsumen online sering khawatir tertipu saat belanja di luar marketplace besar. Solusi: cuan.in menghadirkan Rekening Bersama (Centralized Escrow) otomatis bergaransi auto-confirm 7 hari, di mana uang pembeli ditahan aman hingga barang diterima.'),
        ('3. Reliabilitas Infrastruktur & Keamanan FinTech: ', 'Menjaga performa server cloud tetap stabil 99.9% uptime saat menangani lonjakan transaksi massal dan mematuhi regulasi keamanan data perbankan payment gateway.')
    ])
    # R4: Bantuan yang Dibutuhkan
    set_cell_paragraphs(t7.rows[4].cells[2], [
        ('Bantuan Prioritas Utama Program Wirausaha UNS (Ditandai Nomor Urut): ', ''),
        ('[ 1 ] Akses Permodalan ', '(Prioritas 1: Alokasi pengadaan infrastruktur server cloud NVMe cluster berkecepatan tinggi, integrasi lisensi payment gateway berlisensi Bank Indonesia, dan biaya pendirian badan hukum usaha).'),
        ('[ 2 ] Pengurusan KI, sebutkan: ', 'Pendaftaran Merek Dagang "cuan.in" (Kelas 35 & 42) dan Hak Cipta Source Code Program Komputer ke DJKI Kemenkumham (Prioritas 2).'),
        ('[ 3 ] Jejaring & Pameran ', '(Prioritas 3: Pembukaan akses kemitraan strategis dengan dinas koperasi/UMKM, asosiasi wirausaha daerah, serta fasilitasi booth pameran produk UMKM binaan).'),
        ('Pelatihan Teknis, sebutkan: ', 'Optimasi Cloud Architecture, Database Scalability & Cybersecurity FinTech.'),
        ('Pelatihan Pemasaran, Keuangan, Branding dan Packaging: ', 'Sebagai pendukung penguatan manajemen bisnis internal tim.')
    ])

    # Save to both target locations
    filled_local = 'C:/Users/muham/cuanin/kurasi_uns/01_Instrumen_Kurasi_Mahasiswa_Wirausaha_UNS_2026_FILLED.docx'
    filled_downloads = 'C:/Users/muham/Downloads/01_Instrumen Kurasi Mahasiswa Wirausaha UNS_2026 (1).docx'
    
    doc.save(filled_local)
    doc.save(filled_downloads)
    print(f'Successfully saved filled instrument to:\n - {filled_local}\n - {filled_downloads}')

if __name__ == '__main__':
    build_filled_document()
