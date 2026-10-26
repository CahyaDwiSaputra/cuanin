const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../db');
const { calculateFee, generateQrisPayload, simulateIrisPayout, createSnapTransaction, SNAP_JS_URL, IS_SANDBOX } = require('../services/midtrans');
const { confirmOrderReceipt, processAutoConfirmEscrow } = require('../services/escrowWorker');

const JWT_SECRET = process.env.JWT_SECRET || 'cuanin_jwt_secret_dev_2026';

function authenticateAdmin(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Akses ditolak: Autentikasi Superadmin diperlukan' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'SUPERADMIN') {
      return res.status(403).json({ success: false, error: 'Akses ditolak: Hanya Superadmin yang diizinkan' });
    }
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Sesi Superadmin tidak valid atau telah kedaluwarsa' });
  }
}

function authenticateTenantOwner(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Akses ditolak: Silakan login sebagai pemilik toko' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role === 'SUPERADMIN') {
      req.user = decoded;
      return next();
    }
    if (decoded.role === 'TENANT_OWNER' && decoded.subdomain === req.params.subdomain) {
      req.user = decoded;
      return next();
    }
    return res.status(403).json({ success: false, error: 'Akses ditolak: Anda tidak memiliki izin untuk toko ini' });
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Sesi login pemilik toko telah kedaluwarsa' });
  }
}

router.post('/admin/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, error: 'Username/email dan password wajib diisi' });
  }

  try {
    const result = await pool.query(
      'SELECT * FROM admins WHERE username = $1 OR email = $1',
      [username.trim().toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, error: 'Username atau password Superadmin salah' });
    }

    const admin = result.rows[0];
    const match = await bcrypt.compare(password, admin.password_hash);
    if (!match) {
      return res.status(401).json({ success: false, error: 'Username atau password Superadmin salah' });
    }

    const token = jwt.sign(
      { id: admin.id, username: admin.username, email: admin.email, role: 'SUPERADMIN' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Autentikasi Superadmin berhasil',
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/tenant/:subdomain/owner-login', async (req, res) => {
  const { subdomain } = req.params;
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email dan password pemilik toko wajib diisi' });
  }

  try {
    const tenantRes = await pool.query('SELECT * FROM tenants WHERE subdomain = $1', [subdomain]);
    if (tenantRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Toko tidak ditemukan' });
    }
    const tenant = tenantRes.rows[0];

    if (!tenant.password_hash) {
      return res.status(401).json({ success: false, error: 'Toko ini belum memiliki password pemilik' });
    }

    if (tenant.email && tenant.email.toLowerCase() !== email.trim().toLowerCase()) {
      return res.status(401).json({ success: false, error: 'Email atau password pemilik toko salah' });
    }

    const match = await bcrypt.compare(password, tenant.password_hash);
    if (!match) {
      return res.status(401).json({ success: false, error: 'Email atau password pemilik toko salah' });
    }

    const token = jwt.sign(
      { tenant_id: tenant.id, subdomain: tenant.subdomain, email: tenant.email, role: 'TENANT_OWNER' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login pemilik toko berhasil',
      token,
      tenant: {
        id: tenant.id,
        subdomain: tenant.subdomain,
        name: tenant.name,
        owner_name: tenant.owner_name,
        email: tenant.email
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/templates', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM templates ORDER BY price ASC');
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/platform/check-subdomain/:subdomain', async (req, res) => {
  const { subdomain } = req.params;
  const cleanSubdomain = (subdomain || '').toLowerCase().replace(/[^a-z0-9-]/g, '');
  if (!cleanSubdomain || cleanSubdomain.length < 3) {
    return res.json({ success: true, available: false, reason: 'Minimal 3 karakter' });
  }
  if (['www', 'api', 'admin', 'cuan', 'cuanin', 'superadmin', 'app', 'mail', 'store', 'toko'].includes(cleanSubdomain)) {
    return res.json({ success: true, available: false, reason: 'Subdomain dicadangkan sistem' });
  }
  try {
    const existing = await pool.query('SELECT id FROM tenants WHERE subdomain = $1', [cleanSubdomain]);
    res.json({ success: true, available: existing.rows.length === 0, subdomain: cleanSubdomain });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/platform/order-website', async (req, res) => {
  const {
    template_id,
    subdomain,
    store_name,
    owner_name,
    phone,
    email,
    owner_password,
    bank_name,
    bank_account_number,
    bank_account_holder,
    origin_city
  } = req.body;

  if (!template_id || !subdomain || !store_name || !owner_name || !phone || !bank_name || !bank_account_number) {
    return res.status(400).json({ success: false, error: 'Semua kolom wajib diisi' });
  }

  const cleanSubdomain = subdomain.toLowerCase().replace(/[^a-z0-9-]/g, '');

  try {
    const existing = await pool.query('SELECT id FROM tenants WHERE subdomain = $1', [cleanSubdomain]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ success: false, error: 'Subdomain sudah digunakan oleh UMKM lain' });
    }

    const tplRes = await pool.query('SELECT * FROM templates WHERE id = $1', [template_id]);
    if (tplRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Template tidak ditemukan' });
    }
    const template = tplRes.rows[0];

    const passwordToHash = owner_password || 'cuanin123';
    const passwordHash = await bcrypt.hash(passwordToHash, 10);
    const ownerEmail = email || `${cleanSubdomain}@cuanin.store`;

    const insertTenant = await pool.query(
      `INSERT INTO tenants (subdomain, name, template_id, owner_name, phone, email, password_hash, bank_name, bank_account_number, bank_account_holder, origin_city)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING *`,
      [cleanSubdomain, store_name, template_id, owner_name, phone, ownerEmail, passwordHash, bank_name, bank_account_number, bank_account_holder, origin_city || 'Jakarta Selatan']
    );

    const newTenant = insertTenant.rows[0];

    // Seed default sample product for this new tenant
    await pool.query(
      `INSERT INTO products (tenant_id, name, description, price, stock, weight_grams, image_url)
       VALUES ($1, 'Paket Perdana Toko ' || $2, 'Produk unggulan pertama dari ' || $2, 50000, 10, 300, $3)`,
      [newTenant.id, store_name, template.image_url]
    );

    const invoiceNumber = `INV-TPL-${Date.now()}`;
    const orderAmount = Number(req.body.package_price) || Number(template.price) || 349000;
    const qris = await generateQrisPayload(invoiceNumber, orderAmount, store_name);

    // Create Official Midtrans Snap Transaction Token
    const snap = await createSnapTransaction({
      orderId: invoiceNumber,
      grossAmount: orderAmount,
      customerDetails: {
        first_name: owner_name,
        email: ownerEmail,
        phone: phone
      },
      itemDetails: [
        {
          id: template_id,
          price: orderAmount,
          quantity: 1,
          name: `Jasa Website UMKM - ${template.name}`.slice(0, 50)
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Website UMKM berhasil dipesan dan siap digunakan',
      tenant: newTenant,
      snap: {
        token: snap.token,
        redirectUrl: snap.redirectUrl,
        clientKey: snap.clientKey,
        snapJsUrl: snap.snapJsUrl,
        isSandbox: snap.isSandbox
      },
      qrisPayment: {
        invoiceNumber,
        amount: orderAmount,
        qrDataUrl: qris.qrDataUrl,
        qrisString: qris.qrisString,
        source: qris.source
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/store/:subdomain', async (req, res) => {
  const { subdomain } = req.params;
  try {
    const tenantRes = await pool.query(
      `SELECT t.*, tpl.name as template_name, tpl.category as template_category
       FROM tenants t
       LEFT JOIN templates tpl ON t.template_id = tpl.id
       WHERE t.subdomain = $1`,
      [subdomain]
    );

    if (tenantRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Toko UMKM tidak ditemukan' });
    }

    const tenant = tenantRes.rows[0];
    const productsRes = await pool.query(
      'SELECT * FROM products WHERE tenant_id = $1 ORDER BY id DESC',
      [tenant.id]
    );

    res.json({
      success: true,
      data: {
        store: tenant,
        products: productsRes.rows
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/store/:subdomain/products', async (req, res) => {
  const { subdomain } = req.params;
  const { name, description, price, stock, weight_grams, image_url } = req.body;

  if (!name || !price) {
    return res.status(400).json({ success: false, error: 'Nama dan harga produk wajib diisi' });
  }

  try {
    const tenantRes = await pool.query('SELECT id FROM tenants WHERE subdomain = $1', [subdomain]);
    if (tenantRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Toko tidak ditemukan' });
    }
    const tenantId = tenantRes.rows[0].id;

    const insertRes = await pool.query(
      `INSERT INTO products (tenant_id, name, description, price, stock, weight_grams, image_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [tenantId, name, description || '', price, stock || 10, weight_grams || 250, image_url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=500&q=80']
    );

    res.status(201).json({ success: true, data: insertRes.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/store/:subdomain/register', async (req, res) => {
  const { subdomain } = req.params;
  const { name, email, password, phone, address, city } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, error: 'Nama, email, dan password wajib diisi' });
  }

  try {
    const tenantRes = await pool.query('SELECT id FROM tenants WHERE subdomain = $1', [subdomain]);
    if (tenantRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Toko tidak ditemukan' });
    }
    const tenantId = tenantRes.rows[0].id;

    const existing = await pool.query(
      'SELECT id FROM customers WHERE tenant_id = $1 AND email = $2',
      [tenantId, email.toLowerCase()]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ success: false, error: 'Email sudah terdaftar pada toko ini' });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const insertRes = await pool.query(
      `INSERT INTO customers (tenant_id, name, email, password_hash, phone, address, city)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, tenant_id, name, email, phone, address, city`,
      [tenantId, name, email.toLowerCase(), hash, phone || '', address || '', city || 'Jakarta']
    );

    const customer = insertRes.rows[0];
    const token = jwt.sign({ id: customer.id, tenant_id: tenantId, email: customer.email }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ success: true, customer, token });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/store/:subdomain/login', async (req, res) => {
  const { subdomain } = req.params;
  const { email, password } = req.body;

  try {
    const tenantRes = await pool.query('SELECT id FROM tenants WHERE subdomain = $1', [subdomain]);
    if (tenantRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Toko tidak ditemukan' });
    }
    const tenantId = tenantRes.rows[0].id;

    const custRes = await pool.query(
      'SELECT * FROM customers WHERE tenant_id = $1 AND email = $2',
      [tenantId, email.toLowerCase()]
    );
    if (custRes.rows.length === 0) {
      return res.status(401).json({ success: false, error: 'Email atau password salah' });
    }

    const customer = custRes.rows[0];
    const match = await bcrypt.compare(password, customer.password_hash);
    if (!match) {
      return res.status(401).json({ success: false, error: 'Email atau password salah' });
    }

    const token = jwt.sign({ id: customer.id, tenant_id: tenantId, email: customer.email }, JWT_SECRET, { expiresIn: '7d' });
    delete customer.password_hash;

    res.json({ success: true, customer, token });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/store/:subdomain/checkout', async (req, res) => {
  const { subdomain } = req.params;
  const { customer_id, items, courier_name, destination_city } = req.body;

  if (!items || !items.length) {
    return res.status(400).json({ success: false, error: 'Keranjang belanja kosong' });
  }

  try {
    const tenantRes = await pool.query('SELECT * FROM tenants WHERE subdomain = $1', [subdomain]);
    if (tenantRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Toko tidak ditemukan' });
    }
    const tenant = tenantRes.rows[0];

    // Compute subtotal and shipping cost based on items
    let subtotalProduct = 0;
    let totalWeightGrams = 0;

    for (const it of items) {
      subtotalProduct += Number(it.price) * Number(it.quantity);
      totalWeightGrams += (Number(it.weight_grams) || 250) * Number(it.quantity);
    }

    const weightKg = Math.ceil(totalWeightGrams / 1000);
    const courier = courier_name || 'JNE Regular';
    const ratePerKg = courier.includes('Express') ? 22000 : 12000;
    const shippingCost = weightKg * ratePerKg;

    // Surcharge calculation: 4% buffer borne by customer
    const feeCalculation = calculateFee(subtotalProduct, shippingCost);
    const invoiceNumber = `INV-${tenant.subdomain.toUpperCase()}-${Date.now()}`;

    const orderRes = await pool.query(
      `INSERT INTO orders (
        tenant_id, customer_id, invoice_number, items_json,
        subtotal_product, shipping_cost, courier, surcharge_fee, total_paid, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'MENUNGGU_PEMBAYARAN')
      RETURNING *`,
      [
        tenant.id,
        customer_id || null,
        invoiceNumber,
        JSON.stringify(items),
        subtotalProduct,
        shippingCost,
        courier,
        feeCalculation.surcharge,
        feeCalculation.totalPaid
      ]
    );

    const order = orderRes.rows[0];

    // Create Official Midtrans Snap Transaction Token
    const snap = await createSnapTransaction({
      orderId: invoiceNumber,
      grossAmount: feeCalculation.totalPaid,
      customerDetails: {
        first_name: 'Pembeli Toko',
        email: `buyer@${tenant.subdomain}.store`,
        phone: '08123456789'
      },
      itemDetails: items.map(it => ({
        id: String(it.id),
        price: Math.round(Number(it.price)),
        quantity: Number(it.quantity) || 1,
        name: String(it.name).slice(0, 50)
      }))
    });

    // Generate real QRIS QR data url
    const qris = await generateQrisPayload(invoiceNumber, feeCalculation.totalPaid, tenant.name);

    res.status(201).json({
      success: true,
      data: {
        order,
        pricing: {
          subtotalProduct,
          shippingCost,
          weightKg,
          surchargeFee: feeCalculation.surcharge,
          totalPaid: feeCalculation.totalPaid
        },
        snap: {
          token: snap.token,
          redirectUrl: snap.redirectUrl,
          clientKey: snap.clientKey,
          snapJsUrl: snap.snapJsUrl,
          isSandbox: snap.isSandbox
        },
        qrisPayment: {
          invoiceNumber,
          totalAmount: feeCalculation.totalPaid,
          qrDataUrl: qris.qrDataUrl,
          qrisString: qris.qrisString,
          source: qris.source
        }
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/midtrans/simulate-payment', async (req, res) => {
  const { invoice_number } = req.body;

  if (!invoice_number) {
    return res.status(400).json({ success: false, error: 'Nomor invoice dibutuhkan' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const orderRes = await client.query(
      `SELECT * FROM orders WHERE invoice_number = $1 FOR UPDATE`,
      [invoice_number]
    );

    if (orderRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, error: 'Pesanan tidak ditemukan' });
    }

    const order = orderRes.rows[0];
    if (order.status !== 'MENUNGGU_PEMBAYARAN') {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, error: 'Pesanan sudah dibayar atau dibatalkan' });
    }

    const baseAmount = Number(order.subtotal_product) + Number(order.shipping_cost);
    const platformFee = Math.round(baseAmount * 0.033);
    const midtransFee = Number(order.surcharge_fee) - platformFee;

    // Update order status to DIPROSES_TOKO
    await client.query(
      `UPDATE orders
       SET status = 'DIPROSES_TOKO', paid_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [order.id]
    );

    // Create escrow record with status HELD
    await client.query(
      `INSERT INTO escrow_records (order_id, tenant_id, amount_held, platform_fee, midtrans_fee, status)
       VALUES ($1, $2, $3, $4, $5, 'HELD')`,
      [order.id, order.tenant_id, baseAmount, platformFee, midtransFee]
    );

    // Increase tenant balance_held
    await client.query(
      `UPDATE tenants
       SET balance_held = balance_held + $1
       WHERE id = $2`,
      [baseAmount, order.tenant_id]
    );

    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Pembayaran QRIS Midtrans berhasil dikonfirmasi',
      invoiceNumber: order.invoice_number,
      orderStatus: 'DIPROSES_TOKO',
      escrowStatus: 'HELD',
      amountHeld: baseAmount,
      platformFee,
      midtransFee
    });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ success: false, error: err.message });
  } finally {
    client.release();
  }
});

// Official Midtrans Webhook / HTTP Notification Handler
router.post('/midtrans/notification', async (req, res) => {
  const notification = req.body || {};
  const orderId = notification.order_id;
  const transactionStatus = notification.transaction_status;
  const fraudStatus = notification.fraud_status;

  if (!orderId) {
    return res.status(400).json({ success: false, error: 'order_id is required' });
  }

  // Check if status is paid (settlement or capture)
  const isPaid = transactionStatus === 'settlement' || (transactionStatus === 'capture' && fraudStatus === 'accept');
  if (!isPaid) {
    return res.json({ success: true, message: `Notification received for status: ${transactionStatus}` });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const orderRes = await client.query('SELECT * FROM orders WHERE invoice_number = $1 FOR UPDATE', [orderId]);
    if (orderRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, error: 'Pesanan tidak ditemukan' });
    }

    const order = orderRes.rows[0];
    if (order.status === 'MENUNGGU_PEMBAYARAN') {
      const baseAmount = Number(order.subtotal_product) + Number(order.shipping_cost);
      const platformFee = Math.round(baseAmount * 0.033);
      const midtransFee = Number(order.surcharge_fee) - platformFee;

      await client.query(
        `UPDATE orders SET status = 'DIPROSES_TOKO', paid_at = CURRENT_TIMESTAMP WHERE id = $1`,
        [order.id]
      );

      await client.query(
        `INSERT INTO escrow_records (order_id, tenant_id, amount_held, platform_fee, midtrans_fee, status)
         VALUES ($1, $2, $3, $4, $5, 'HELD')`,
        [order.id, order.tenant_id, baseAmount, platformFee, midtransFee]
      );

      await client.query(
        `UPDATE tenants SET balance_held = balance_held + $1 WHERE id = $2`,
        [baseAmount, order.tenant_id]
      );
    }

    await client.query('COMMIT');
    res.json({ success: true, message: 'Midtrans notification processed successfully' });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ success: false, error: err.message });
  } finally {
    client.release();
  }
});

router.get('/orders/:invoice', async (req, res) => {
  const { invoice } = req.params;
  try {
    const orderRes = await pool.query(
      `SELECT o.*, t.name as store_name, t.phone as store_phone,
              c.name as customer_name, c.phone as customer_phone, c.address as customer_address,
              e.status as escrow_status, e.amount_held
       FROM orders o
       JOIN tenants t ON o.tenant_id = t.id
       LEFT JOIN customers c ON o.customer_id = c.id
       LEFT JOIN escrow_records e ON e.order_id = o.id
       WHERE o.invoice_number = $1`,
      [invoice]
    );

    if (orderRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Pesanan tidak ditemukan' });
    }

    res.json({ success: true, data: orderRes.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/orders/:orderId/confirm-receipt', async (req, res) => {
  const { orderId } = req.params;
  try {
    const result = await confirmOrderReceipt(parseInt(orderId, 10));
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json({
      success: true,
      message: 'Barang telah dikonfirmasi diterima. Dana telah dicairkan ke saldo UMKM.',
      data: result
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/tenant/:subdomain/dashboard', authenticateTenantOwner, async (req, res) => {
  const { subdomain } = req.params;
  try {
    const tenantRes = await pool.query('SELECT * FROM tenants WHERE subdomain = $1', [subdomain]);
    if (tenantRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Toko tidak ditemukan' });
    }
    const tenant = tenantRes.rows[0];

    const ordersRes = await pool.query(
      `SELECT o.*, c.name as customer_name, c.city as customer_city, e.status as escrow_status
       FROM orders o
       LEFT JOIN customers c ON o.customer_id = c.id
       LEFT JOIN escrow_records e ON e.order_id = o.id
       WHERE o.tenant_id = $1
       ORDER BY o.id DESC`,
      [tenant.id]
    );

    const productsRes = await pool.query(
      'SELECT * FROM products WHERE tenant_id = $1 ORDER BY id DESC',
      [tenant.id]
    );

    const payoutsRes = await pool.query(
      'SELECT * FROM payout_requests WHERE tenant_id = $1 ORDER BY id DESC LIMIT 10',
      [tenant.id]
    );

    res.json({
      success: true,
      data: {
        tenant,
        orders: ordersRes.rows,
        products: productsRes.rows,
        payouts: payoutsRes.rows
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/tenant/:subdomain/orders/:orderId/ship', authenticateTenantOwner, async (req, res) => {
  const { subdomain, orderId } = req.params;
  const { tracking_number, courier } = req.body;

  if (!tracking_number) {
    return res.status(400).json({ success: false, error: 'Nomor resi wajib diisi' });
  }

  try {
    const tenantRes = await pool.query('SELECT id FROM tenants WHERE subdomain = $1', [subdomain]);
    if (tenantRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Toko tidak ditemukan' });
    }
    const tenantId = tenantRes.rows[0].id;

    const updateRes = await pool.query(
      `UPDATE orders
       SET status = 'DIKIRIM',
           tracking_number = $1,
           courier = COALESCE($2, courier),
           shipped_at = CURRENT_TIMESTAMP
       WHERE id = $3 AND tenant_id = $4
       RETURNING *`,
      [tracking_number, courier || null, orderId, tenantId]
    );

    if (updateRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Pesanan tidak ditemukan atau bukan milik toko ini' });
    }

    res.json({
      success: true,
      message: 'Pesanan telah diserahkan ke kurir dan nomor resi berhasil diinput',
      order: updateRes.rows[0]
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/tenant/:subdomain/payout', authenticateTenantOwner, async (req, res) => {
  const { subdomain } = req.params;
  const { amount } = req.body;

  const withdrawAmount = Number(amount);
  if (!withdrawAmount || withdrawAmount < 10000) {
    return res.status(400).json({ success: false, error: 'Jumlah penarikan minimal Rp 10.000' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const tenantRes = await client.query('SELECT * FROM tenants WHERE subdomain = $1 FOR UPDATE', [subdomain]);
    if (tenantRes.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, error: 'Toko tidak ditemukan' });
    }
    const tenant = tenantRes.rows[0];

    const currentBalance = Number(tenant.balance_active);
    if (currentBalance < withdrawAmount) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        error: `Saldo aktif tidak mencukupi (Tersedia: Rp ${currentBalance.toLocaleString('id-ID')})`
      });
    }

    const irisResult = await simulateIrisPayout({
      bankName: tenant.bank_name,
      accountNumber: tenant.bank_account_number,
      accountHolder: tenant.bank_account_holder,
      amount: withdrawAmount
    });

    await client.query(
      `UPDATE tenants
       SET balance_active = balance_active - $1
       WHERE id = $2`,
      [withdrawAmount, tenant.id]
    );

    const payoutRecord = await client.query(
      `INSERT INTO payout_requests (tenant_id, amount, bank_name, account_number, account_holder, status, reference_id)
       VALUES ($1, $2, $3, $4, $5, 'SUCCESS', $6)
       RETURNING *`,
      [tenant.id, withdrawAmount, tenant.bank_name, tenant.bank_account_number, tenant.bank_account_holder, irisResult.referenceId]
    );

    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Penarikan dana via Midtrans Iris berhasil diproses ke rekening tujuan',
      data: {
        payout: payoutRecord.rows[0],
        newBalanceActive: currentBalance - withdrawAmount,
        irisResponse: irisResult
      }
    });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ success: false, error: err.message });
  } finally {
    client.release();
  }
});

router.post('/admin/run-escrow-worker', authenticateAdmin, async (req, res) => {
  const { forceSimulateAll } = req.body;
  try {
    const summary = await processAutoConfirmEscrow({ forceSimulateAll: Boolean(forceSimulateAll) });
    res.json({
      success: true,
      message: `Worker auto-confirm berhasil dijalankan. ${summary.processedCount} pesanan selesai dan escrow dicairkan.`,
      data: summary
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/admin/overview', authenticateAdmin, async (req, res) => {
  try {
    const tenantsRes = await pool.query(`
      SELECT t.*, tpl.name as template_name,
             (SELECT COUNT(*) FROM orders WHERE tenant_id = t.id) as total_orders
      FROM tenants t
      LEFT JOIN templates tpl ON t.template_id = tpl.id
      ORDER BY t.id DESC
    `);

    const statsRes = await pool.query(`
      SELECT
        COALESCE(SUM(amount_held) FILTER (WHERE status = 'HELD'), 0) as total_escrow_held,
        COALESCE(SUM(platform_fee), 0) as total_platform_earnings,
        COALESCE(SUM(midtrans_fee), 0) as total_midtrans_fees
      FROM escrow_records
    `);

    const ordersRes = await pool.query(`
      SELECT o.*, t.name as store_name, e.status as escrow_status
      FROM orders o
      JOIN tenants t ON o.tenant_id = t.id
      LEFT JOIN escrow_records e ON e.order_id = o.id
      ORDER BY o.id DESC LIMIT 15
    `);

    res.json({
      success: true,
      data: {
        tenants: tenantsRes.rows,
        stats: statsRes.rows[0],
        recentOrders: ordersRes.rows
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
