const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: process.env.DB_NAME || 'cuanin_db',
  user: process.env.DB_USER || 'buana_admin',
  password: process.env.DB_PASSWORD || 'buana_dev_secret_2026!'
});

async function initDb() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS templates (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        category VARCHAR(50) NOT NULL,
        price NUMERIC(12, 2) NOT NULL,
        description TEXT,
        image_url TEXT
      );

      CREATE TABLE IF NOT EXISTS tenants (
        id SERIAL PRIMARY KEY,
        subdomain VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(100) NOT NULL,
        template_id VARCHAR(50) REFERENCES templates(id),
        owner_name VARCHAR(100) NOT NULL,
        phone VARCHAR(30) NOT NULL,
        bank_name VARCHAR(50) NOT NULL,
        bank_account_number VARCHAR(50) NOT NULL,
        bank_account_holder VARCHAR(100) NOT NULL,
        origin_city VARCHAR(100) DEFAULT 'Jakarta Selatan',
        balance_held NUMERIC(15, 2) DEFAULT 0,
        balance_active NUMERIC(15, 2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        tenant_id INT REFERENCES tenants(id) ON DELETE CASCADE,
        name VARCHAR(150) NOT NULL,
        description TEXT,
        price NUMERIC(12, 2) NOT NULL,
        stock INT DEFAULT 20,
        weight_grams INT DEFAULT 250,
        image_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS customers (
        id SERIAL PRIMARY KEY,
        tenant_id INT REFERENCES tenants(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(120) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        phone VARCHAR(30),
        address TEXT,
        city VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(tenant_id, email)
      );

      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        tenant_id INT REFERENCES tenants(id) ON DELETE CASCADE,
        customer_id INT REFERENCES customers(id),
        invoice_number VARCHAR(60) UNIQUE NOT NULL,
        items_json JSONB NOT NULL,
        subtotal_product NUMERIC(12, 2) NOT NULL,
        shipping_cost NUMERIC(12, 2) NOT NULL,
        courier VARCHAR(50) NOT NULL,
        surcharge_fee NUMERIC(12, 2) NOT NULL,
        total_paid NUMERIC(12, 2) NOT NULL,
        status VARCHAR(30) DEFAULT 'MENUNGGU_PEMBAYARAN',
        tracking_number VARCHAR(80),
        paid_at TIMESTAMP,
        shipped_at TIMESTAMP,
        completed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS escrow_records (
        id SERIAL PRIMARY KEY,
        order_id INT REFERENCES orders(id) ON DELETE CASCADE,
        tenant_id INT REFERENCES tenants(id) ON DELETE CASCADE,
        amount_held NUMERIC(12, 2) NOT NULL,
        platform_fee NUMERIC(12, 2) NOT NULL,
        midtrans_fee NUMERIC(12, 2) NOT NULL,
        status VARCHAR(20) DEFAULT 'HELD',
        released_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS payout_requests (
        id SERIAL PRIMARY KEY,
        tenant_id INT REFERENCES tenants(id) ON DELETE CASCADE,
        amount NUMERIC(12, 2) NOT NULL,
        bank_name VARCHAR(50) NOT NULL,
        account_number VARCHAR(50) NOT NULL,
        account_holder VARCHAR(100) NOT NULL,
        status VARCHAR(20) DEFAULT 'SUCCESS',
        reference_id VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS admins (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'SUPERADMIN',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      ALTER TABLE tenants ADD COLUMN IF NOT EXISTS email VARCHAR(120);
      ALTER TABLE tenants ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);
    `);

    // Seed default superadmin if empty
    const adminCheck = await client.query('SELECT COUNT(*) FROM admins');
    if (parseInt(adminCheck.rows[0].count, 10) === 0) {
      await client.query(`
        INSERT INTO admins (username, email, password_hash, role)
        VALUES ('admin', 'admin@cuanin.com', '$2b$10$4F/kzcD5Dwf3ExsCviZLhOKIJftgFEom2cC4KjucJakNDm7WAO9bq', 'SUPERADMIN')
      `);
    }

    // Seed default templates if empty
    const templateCheck = await client.query('SELECT COUNT(*) FROM templates');
    if (parseInt(templateCheck.rows[0].count, 10) === 0) {
      await client.query(`
        INSERT INTO templates (id, name, category, price, description, image_url) VALUES
        ('tpl-kuliner', 'Katalog Kuliner & Kopi Artisan', 'F&B / Kuliner', 149000, 'Template elegan untuk coffee shop, bakery, dan restoran UMKM dengan menu cepat dan integrasi kurir instan.', 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=600&q=80'),
        ('tpl-fashion', 'Butik & Fashion Muslim Modern', 'Fashion', 199000, 'Tata letak visual bersih berfokus pada katalog busana, pemilihan ukuran, dan lookbook busana premium.', 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=600&q=80'),
        ('tpl-kriya', 'Galeri Kriya & Kerajinan Kayu', 'Craft / Kriya', 179000, 'Fokus narasi produk buatan tangan lokal dengan galeri detail material dan kalkulator bobot pengiriman akurat.', 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80')
      `);
    }

    // Seed default sample tenant 'kopisenja' if empty
    const tenantCheck = await client.query('SELECT COUNT(*) FROM tenants WHERE subdomain = $1', ['kopisenja']);
    if (parseInt(tenantCheck.rows[0].count, 10) === 0) {
      const res = await client.query(`
        INSERT INTO tenants (subdomain, name, template_id, owner_name, phone, bank_name, bank_account_number, bank_account_holder, origin_city, balance_held, balance_active)
        VALUES ('kopisenja', 'Kopi Senja Nusantara', 'tpl-kuliner', 'Budi Santoso', '081234567890', 'BCA', '8820192841', 'Budi Santoso', 'Jakarta Selatan', 0, 0)
        RETURNING id;
      `);
      const tenantId = res.rows[0].id;

      await client.query(`
        INSERT INTO products (tenant_id, name, description, price, stock, weight_grams, image_url) VALUES
        ($1, 'Arabika Gayo Single Origin 250g', 'Biji kopi sangrai pilihan dataran tinggi Aceh Gayo. Karakter rasa peach, dark chocolate, dan floral.', 75000, 25, 250, 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=500&q=80'),
        ($1, 'Robusta Dampit Espresso Roast 200g', 'Kopi robusta Malang lereng Gunung Semeru. Body tebal, aroma karamel manis dan nutty.', 48000, 30, 200, 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=500&q=80'),
        ($1, 'Cold Brew Concentrate Bottle 500ml', 'Ekstrak seduh dingin konsentrat siap minum, diseduh 16 jam dengan air steril.', 65000, 15, 600, 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=500&q=80')
      `, [tenantId]);
    }

    // Ensure kopisenja has owner login credentials
    await client.query(`
      UPDATE tenants
      SET email = COALESCE(email, 'owner@kopisenja.com'),
          password_hash = COALESCE(password_hash, '$2b$10$T8ceZiRK0LRNlBQHuW4HDerLRCpru78H.yycHIh6ZRPcpfHo2EpYu')
      WHERE subdomain = 'kopisenja'
    `);
  } finally {
    client.release();
  }
}

module.exports = { pool, initDb };
