const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const { pool } = require('./src/db');

async function seed() {
  const client = await pool.connect();
  try {
    console.log('Seeding rich templates and demo stores...');
    await client.query('BEGIN');

    // 1. Upsert 6 Templates
    const templates = [
      {
        id: 'tpl-kuliner',
        name: 'Katalog Kuliner & Kopi Artisan',
        category: 'F&B / Kuliner',
        price: 349000,
        description: 'Template modern dan bersahaja khusus cafe, bakery, roastery, dan resto UMKM. Dilengkapi navigasi kategori menu, rincian karakter rasa, dan kalkulator kurir cepat.',
        image_url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=800&q=80',
        demo_subdomain: 'kopisenja'
      },
      {
        id: 'tpl-fashion',
        name: 'Butik & Fashion Muslim Modern',
        category: 'Fashion & Busana',
        price: 349000,
        description: 'Tata letak visual bersih dan anggun berfokus pada lookbook busana, pemilihan varian warna/ukuran, dan galeri kain premium untuk hijab, gamis, dan distro.',
        image_url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80',
        demo_subdomain: 'butikaisyah'
      },
      {
        id: 'tpl-kriya',
        name: 'Galeri Kriya & Kerajinan Nusantara',
        category: 'Kriya & Handicraft',
        price: 349000,
        description: 'Desain bertema alami dan hangat khusus produk buatan tangan lokal, anyaman, gerabah, dan mebel kayu dengan kalkulator dimensi dan bobot ekspedisi aman.',
        image_url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80',
        demo_subdomain: 'kriyabambu'
      },
      {
        id: 'tpl-beauty',
        name: 'Skincare Alami & Herbal Nusantara',
        category: 'Kecantikan & Herbal',
        price: 349000,
        description: 'Desain bersih bernuansa organik higienis untuk produk kosmetik, sabun herbal, minyak atsiri, dan perawatan tubuh ramah lingkungan.',
        image_url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80',
        demo_subdomain: 'naturaherbal'
      },
      {
        id: 'tpl-gadget',
        name: 'Elektronik & Aksesoris Gadget',
        category: 'Gadget & Elektronik',
        price: 349000,
        description: 'Nuansa teknologi modern bernada gelap profesional untuk toko aksesoris gawai, audio TWS, perangkat daya, dan perlengkapan komputer.',
        image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
        demo_subdomain: 'gadgetpedia'
      },
      {
        id: 'tpl-florist',
        name: 'Toko Tanaman Hias & Florist Segar',
        category: 'Tanaman Hias & Bunga',
        price: 349000,
        description: 'Tampilan segar bernuansa dedaunan hijau untuk toko tanaman indoor, kaktus hias, rangkaian buket bunga segar, dan media tanam.',
        image_url: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=800&q=80',
        demo_subdomain: 'kebunkita'
      }
    ];

    for (const t of templates) {
      await client.query(`
        INSERT INTO templates (id, name, category, price, description, image_url)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          category = EXCLUDED.category,
          price = EXCLUDED.price,
          description = EXCLUDED.description,
          image_url = EXCLUDED.image_url
      `, [t.id, t.name, t.category, t.price, t.description, t.image_url]);
    }
    console.log('Templates seeded successfully.');

    // 2. Demo Tenants Configuration
    const defaultPasswordHash = await bcrypt.hash('cuanin123', 10);

    const demoTenants = [
      {
        subdomain: 'kopisenja',
        name: 'Kopi Senja Nusantara',
        template_id: 'tpl-kuliner',
        owner_name: 'Budi Santoso',
        phone: '081234567890',
        email: 'owner@kopisenja.com',
        bank_name: 'BCA',
        bank_account_number: '8820192841',
        origin_city: 'Jakarta Selatan',
        tagline: 'Koleksi Biji Kopi Sangrai Artisan & Seduhan Segar Langsung dari Petani Lokal',
        products: [
          {
            name: 'Arabika Gayo Single Origin 250g',
            price: 75000,
            weight_grams: 250,
            stock: 35,
            image_url: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=600&q=80',
            description: 'Biji kopi pilihan dataran tinggi Aceh Gayo. Karakter rasa peach, dark chocolate, dan floral aroma dengan acidity seimbang.'
          },
          {
            name: 'Robusta Dampit Espresso Roast 250g',
            price: 48000,
            weight_grams: 250,
            stock: 40,
            image_url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80',
            description: 'Kopi robusta Malang lereng Gunung Semeru. Body tebal, crema melimpah dengan aroma karamel manis dan roasted nutty.'
          },
          {
            name: 'Cold Brew Concentrate Bottle 500ml',
            price: 65000,
            weight_grams: 600,
            stock: 20,
            image_url: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=600&q=80',
            description: 'Konsentrat seduh dingin 16 jam, siap minum atau dicampur susu segar. Tanpa pemanis buatan dan tanpa bahan pengawet.'
          },
          {
            name: 'Artisan Drip Bag Box Isi 5 Sachet',
            price: 55000,
            weight_grams: 150,
            stock: 50,
            image_url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=600&q=80',
            description: 'Praktis seduh di mana saja cukup tuang air panas. Berisi 5 varian single origin Nusantara terbaik.'
          },
          {
            name: 'Sirup Karamel Vanila Organik 250ml',
            price: 38000,
            weight_grams: 400,
            stock: 25,
            image_url: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=600&q=80',
            description: 'Pemanis alami pelengkap kopi susu favorit Anda, dibuat dari gula tebu murni dan vanila polong asli.'
          },
          {
            name: 'Croissant Almond Butter Toast (Isi 2)',
            price: 42000,
            weight_grams: 200,
            stock: 15,
            image_url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=600&q=80',
            description: 'Pastry renyah berlapis mentega Prancis impor dengan taburan kacang almond panggang gurih.'
          }
        ]
      },
      {
        subdomain: 'butikaisyah',
        name: 'Butik Aisyah Modest Wear',
        template_id: 'tpl-fashion',
        owner_name: 'Siti Nur Aisyah',
        phone: '081398765432',
        email: 'owner@butikaisyah.com',
        bank_name: 'Bank Mandiri',
        bank_account_number: '1310088921021',
        origin_city: 'Bandung',
        tagline: 'Koleksi Busana Muslimah Elegan, Nyaman, dan Bersahaja Karya Desainer Lokal',
        products: [
          {
            name: 'Pashmina Silk Premium Rosewood',
            price: 69000,
            weight_grams: 180,
            stock: 45,
            image_url: 'https://images.unsplash.com/photo-1609357605129-26f69add5d6e?auto=format&fit=crop&w=600&q=80',
            description: 'Bahan silk lembut berkilau anggun, mudah dibentuk, tidak licin, dan sejuk digunakan sepanjang hari.'
          },
          {
            name: 'Gamis Katun Linen Bordir Daisy',
            price: 245000,
            weight_grams: 550,
            stock: 20,
            image_url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80',
            description: 'Gamis bersiluet loose fit dengan aksen bordir bunga daisy halus pada ujung lengan. Wudhu-friendly dan busui-friendly.'
          },
          {
            name: 'Kemeja Koko Modern Sage Green',
            price: 165000,
            weight_grams: 350,
            stock: 30,
            image_url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80',
            description: 'Koko pria kasual dengan potongan modern mandarin collar berbahan katun toyobo premium yang adem.'
          },
          {
            name: 'Tunik Floral Pastel Lilac Breeze',
            price: 135000,
            weight_grams: 300,
            stock: 25,
            image_url: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=600&q=80',
            description: 'Tunik santai motif dedaunan lembut cocok dipadukan dengan celana kulot atau rok plisket.'
          },
          {
            name: 'Outer Cardigan Rajut Etnik Cream',
            price: 110000,
            weight_grams: 450,
            stock: 18,
            image_url: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=600&q=80',
            description: 'Rajutan benang katun tebal namun tidak gerah, pas untuk outfit kerja santai maupun hangout akhir pekan.'
          },
          {
            name: 'Tote Bag Kanvas Etnik Tenun Jepara',
            price: 85000,
            weight_grams: 250,
            stock: 35,
            image_url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80',
            description: 'Tas jinjing kanvas kuat dengan kombinasi kain tenun asli nusantara. Muat laptop hingga 14 inch.'
          }
        ]
      },
      {
        subdomain: 'kriyabambu',
        name: 'Kriya Bambu & Kayu Nusantara',
        template_id: 'tpl-kriya',
        owner_name: 'Wayan Suardana',
        phone: '081287654321',
        email: 'owner@kriyabambu.com',
        bank_name: 'BRI',
        bank_account_number: '034101002938501',
        origin_city: 'Yogyakarta',
        tagline: 'Kerajinan Tangan Estetik Berkelanjutan dari Kayu Jati & Anyaman Bambu Alami',
        products: [
          {
            name: 'Set Piring & Sendok Kayu Jati Alami',
            price: 89000,
            weight_grams: 450,
            stock: 30,
            image_url: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=600&q=80',
            description: 'Dipahat langsung dari kayu jati solid perhutani dengan finishing beeswax aman untuk makanan (food-grade).'
          },
          {
            name: 'Tas Anyaman Bambu Halus Handle Kulit',
            price: 125000,
            weight_grams: 350,
            stock: 20,
            image_url: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=600&q=80',
            description: 'Anyaman bambu apus kualitas ekspor karya perajin Kulon Progo dengan pegangan kulit sapi nabati.'
          },
          {
            name: 'Cangkir Keramik Stoneware Rustic 280ml',
            price: 65000,
            weight_grams: 300,
            stock: 40,
            image_url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80',
            description: 'Keramik buatan tangan dibakar pada suhu 1200 derajat Celsius. Tahan microwave dan dishwasher.'
          },
          {
            name: 'Lampu Gantung Anyaman Rotan Boho',
            price: 195000,
            weight_grams: 800,
            stock: 15,
            image_url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80',
            description: 'Kap lampu estetik pemberi aksen hangat untuk ruang tamu, teras, maupun cafe idaman Anda.'
          },
          {
            name: 'Nampan Saji Kayu Mahoni Alur Rapi',
            price: 75000,
            weight_grams: 500,
            stock: 25,
            image_url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80',
            description: 'Nampan kayu dengan handel ergonomis, cocok untuk menyajikan minuman kopi dan cemilan tamu.'
          },
          {
            name: 'Lilin Aromaterapi Pot Gerabah Cendana',
            price: 55000,
            weight_grams: 280,
            stock: 50,
            image_url: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=600&q=80',
            description: 'Soy wax alami dengan aroma menenangkan kayu cendana dan rempah nusantara. Waktu bakar hingga 30 jam.'
          }
        ]
      },
      {
        subdomain: 'naturaherbal',
        name: 'Natura Herbal & Skincare Organik',
        template_id: 'tpl-beauty',
        owner_name: 'Dr. Ni Made Ayu',
        phone: '081987654321',
        email: 'owner@naturaherbal.com',
        bank_name: 'BCA',
        bank_account_number: '7720918231',
        origin_city: 'Denpasar',
        tagline: 'Formula Perawatan Kulit Alami Berbasis Ekstrak Rempah & Kelapa Murni Bali',
        products: [
          {
            name: 'Sabun Batang Minyak Kelapa & Madu Hutan',
            price: 35000,
            weight_grams: 120,
            stock: 60,
            image_url: 'https://images.unsplash.com/photo-1607006314644-884d5df64639?auto=format&fit=crop&w=600&q=80',
            description: 'Dibuat dengan teknik cold process tanpa SLS dan paraben. Melembapkan kulit sensitif secara alami.'
          },
          {
            name: 'Serum Pencerah Wajah Ekstrak Bengkoang',
            price: 89000,
            weight_grams: 80,
            stock: 30,
            image_url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80',
            description: 'Serum ringan kaya vitamin C alami untuk mencerahkan noda hitam dan meratakan warna kulit wajah.'
          },
          {
            name: 'Rose Water Hydrating Mist 100ml',
            price: 45000,
            weight_grams: 150,
            stock: 40,
            image_url: 'https://images.unsplash.com/photo-1608248597359-00994f30b200?auto=format&fit=crop&w=600&q=80',
            description: 'Penyegar wajah dari air sulingan mawar murni. Mengembalikan kesegaran kulit lelah seketika.'
          },
          {
            name: 'Body Scrub Kopi Robusta & Kakao 200g',
            price: 52000,
            weight_grams: 220,
            stock: 25,
            image_url: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=600&q=80',
            description: 'Lulur eksfoliasi butiran kopi asli untuk mengangkat sel kulit mati dan menghaluskan permukaan kulit.'
          },
          {
            name: 'Lip Balm Beeswax Alami Aroma Jeruk Bali',
            price: 28000,
            weight_grams: 30,
            stock: 50,
            image_url: 'https://images.unsplash.com/photo-1599305090598-fe179d501227?auto=format&fit=crop&w=600&q=80',
            description: 'Pelembap bibir dari lilin lebah murni dan minyak almond, ampuh mengatasi bibir kering dan pecah-pecah.'
          },
          {
            name: 'Minyak Esensial Lavender Alami 15ml',
            price: 68000,
            weight_grams: 70,
            stock: 35,
            image_url: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=600&q=80',
            description: '100% essential oil murni untuk diffuser relaksasi tidur nyenyak dan menenangkan pikiran.'
          }
        ]
      },
      {
        subdomain: 'gadgetpedia',
        name: 'GadgetPedia Aksesoris & Audio',
        template_id: 'tpl-gadget',
        owner_name: 'Kevin Wijaya',
        phone: '081765432109',
        email: 'owner@gadgetpedia.com',
        bank_name: 'Bank Mandiri',
        bank_account_number: '1420098231041',
        origin_city: 'Surabaya',
        tagline: 'Perlengkapan Gawai & Audio Berkualitas Tinggi dengan Garansi Resmi Toko',
        products: [
          {
            name: 'Wireless TWS Earbuds Bass Boost v5.3',
            price: 189000,
            weight_grams: 120,
            stock: 30,
            image_url: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=600&q=80',
            description: 'Earphone nirkabel latensi rendah dengan driver dinamis 13mm dan baterai tahan hingga 28 jam bersama case.'
          },
          {
            name: 'Powerbank Fast Charging 20.000mAh Dual Port',
            price: 215000,
            weight_grams: 400,
            stock: 25,
            image_url: 'https://images.unsplash.com/photo-1609592424109-dd9892f1b177?auto=format&fit=crop&w=600&q=80',
            description: 'Dukungan Power Delivery 22.5W dan Quick Charge 3.0. Aman dibawa ke dalam kabin pesawat.'
          },
          {
            name: 'Stand Laptop Aluminium Lipat Ergonomis',
            price: 98000,
            weight_grams: 350,
            stock: 40,
            image_url: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=600&q=80',
            description: 'Dapat diatur dalam 6 level ketinggian untuk mencegah sakit leher dan menjaga sirkulasi udara laptop.'
          },
          {
            name: 'Kabel Data Type-C to C Braided 60W 1.2M',
            price: 45000,
            weight_grams: 50,
            stock: 60,
            image_url: 'https://images.unsplash.com/photo-1588508065123-287b28e013da?auto=format&fit=crop&w=600&q=80',
            description: 'Kabel anyaman nilon anti kusut, tahan tekukan hingga 15.000 kali dengan kecepatan transfer 480Mbps.'
          },
          {
            name: 'Ring Light LED 26cm + Tripod Fleksibel',
            price: 79000,
            weight_grams: 650,
            stock: 20,
            image_url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80',
            description: 'Lampu penerangan konten video TikTok dan live streaming dengan 3 mode warna dan 10 level kecerahan.'
          },
          {
            name: 'Casing Ponsel Silikon Matte Shockproof',
            price: 39000,
            weight_grams: 60,
            stock: 50,
            image_url: 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=600&q=80',
            description: 'Pelindung gawai dengan bumper sudut tebal anti benturan dan lapisan lembut anti noda sidik jari.'
          }
        ]
      },
      {
        subdomain: 'kebunkita',
        name: 'Kebun Kita Florist & Tanaman',
        template_id: 'tpl-florist',
        owner_name: 'Indah Lestari',
        phone: '081239847192',
        email: 'owner@kebunkita.com',
        bank_name: 'BNI',
        bank_account_number: '0982319201',
        origin_city: 'Bogor',
        tagline: 'Koleksi Tanaman Hias Hijau Segar & Rangkaian Bunga Alami untuk Ruang Hidup Anda',
        products: [
          {
            name: 'Monstera Deliciosa Pot Tanah Liat 30cm',
            price: 115000,
            weight_grams: 1200,
            stock: 15,
            image_url: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=600&q=80',
            description: 'Tanaman hias indoor berdaun sobek ikonik, sudah berakar kuat dalam pot terakota siap pajang.'
          },
          {
            name: 'Buket Bunga Mawar Merah Segar Asli',
            price: 175000,
            weight_grams: 600,
            stock: 20,
            image_url: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=600&q=80',
            description: 'Rangkaian 10 tangkai mawar segar premium berbalut kertas kado rustic dan kartu ucapan kustom.'
          },
          {
            name: 'Paket Mini Sukulen & Kaktus (Isi 3 Pot)',
            price: 48000,
            weight_grams: 500,
            stock: 35,
            image_url: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?auto=format&fit=crop&w=600&q=80',
            description: 'Tanaman meja mungil minim perawatan, cukup disiram seminggu sekali. Sangat manis untuk meja kerja.'
          },
          {
            name: 'Sansevieria Lidah Mertua Pembersih Udara',
            price: 65000,
            weight_grams: 900,
            stock: 25,
            image_url: 'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=600&q=80',
            description: 'Tanaman tangguh penyerap polusi udara dan penghasil oksigen malam hari untuk kamar tidur.'
          },
          {
            name: 'Pupuk Cair Organik Daun Subur 500ml',
            price: 32000,
            weight_grams: 600,
            stock: 40,
            image_url: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=600&q=80',
            description: 'Nutrisi tanaman alami dari fermentasi rumput laut dan asam amino untuk merangsang tunas baru.'
          },
          {
            name: 'Watering Can Logam Estetik Kuningan 1.2L',
            price: 89000,
            weight_grams: 400,
            stock: 18,
            image_url: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=600&q=80',
            description: 'Penyiram tanaman corong panjang anti tumpah dengan sentuhan warna tembaga elegan.'
          }
        ]
      }
    ];

    for (const t of demoTenants) {
      console.log(`Processing demo tenant: ${t.subdomain} (${t.name})...`);

      // Upsert tenant
      const res = await client.query(`
        INSERT INTO tenants (
          subdomain, name, template_id, owner_name, phone, email,
          password_hash, bank_name, bank_account_number, bank_account_holder,
          origin_city, balance_held, balance_active
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 0, 0
        )
        ON CONFLICT (subdomain) DO UPDATE SET
          name = EXCLUDED.name,
          template_id = EXCLUDED.template_id,
          owner_name = EXCLUDED.owner_name,
          phone = EXCLUDED.phone,
          email = EXCLUDED.email,
          password_hash = EXCLUDED.password_hash,
          bank_name = EXCLUDED.bank_name,
          bank_account_number = EXCLUDED.bank_account_number,
          bank_account_holder = EXCLUDED.bank_account_holder,
          origin_city = EXCLUDED.origin_city
        RETURNING id;
      `, [
        t.subdomain,
        t.name,
        t.template_id,
        t.owner_name,
        t.phone,
        t.email,
        defaultPasswordHash,
        t.bank_name,
        t.bank_account_number,
        t.owner_name,
        t.origin_city
      ]);

      const tenantId = res.rows[0].id;

      // Delete old products for clean enrichment
      await client.query('DELETE FROM products WHERE tenant_id = $1', [tenantId]);

      // Insert all 6 rich products
      for (const p of t.products) {
        await client.query(`
          INSERT INTO products (tenant_id, name, description, price, stock, weight_grams, image_url)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [
          tenantId,
          p.name,
          p.description,
          p.price,
          p.stock,
          p.weight_grams,
          p.image_url
        ]);
      }
    }

    await client.query('COMMIT');
    console.log('Successfully seeded all 6 templates and all 6 rich demo stores!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Seeding error:', err);
  } finally {
    client.release();
    pool.end();
  }
}

seed();
