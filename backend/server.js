// =============================================================
// backend/server.js — Entry Point Backend ALFAS STEP
// =============================================================
// Route API Lengkap (Mendukung alias Bahasa Inggris & Indonesia):
//   GET    /api/products & /api/produk         - Daftar produk (+ filter)
//   GET    /api/products/:id & /api/produk/:id - Detail satu produk
//   POST   /api/products & /api/produk         - Tambah produk (Admin)
//   PUT    /api/products/:id & /api/produk/:id - Update produk (Admin)
//   DELETE /api/products/:id & /api/produk/:id - Hapus produk (Admin)
//   POST   /api/auth/register & /api/register   - Daftar akun pembeli
//   POST   /api/auth/login & /api/login         - Login pembeli
//   POST   /api/auth/admin/login & /api/admin/login - Login admin
//   POST   /api/checkout                        - Submit pesanan + WhatsApp
//   GET    /api/orders                          - Daftar semua pesanan (Admin)
//   PATCH  /api/orders/:id/status               - Update status pesanan (Admin)
// =============================================================

require('dotenv').config();

const express  = require('express');
const cors     = require('cors');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const db       = require('./db');

const app  = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'alfas_step_secret_key_2026';

// MIDDLEWARE
app.use(express.json());
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// HELPER: Format angka ke Rupiah
function formatRupiah(angka) {
  return new Intl.NumberFormat('id-ID').format(angka);
}

// HELPER: Parse field 'sizes' dari string JSON ke array
function parseSizes(row) {
  if (row && typeof row.sizes === 'string') {
    try { row.sizes = JSON.parse(row.sizes); }
    catch (e) { row.sizes = []; }
  }
  return row;
}

// HANDLER: GET /api/products & /api/produk
const getProducts = async (req, res) => {
  try {
    const { category, keyword, sort } = req.query;
    let sql    = 'SELECT * FROM products WHERE 1=1';
    let params = [];

    if (category && category !== 'Semua') {
      sql += ' AND category = ?';
      params.push(category);
    }
    if (keyword && keyword.trim() !== '') {
      sql += ' AND (name LIKE ? OR description LIKE ?)';
      params.push(`%${keyword.trim()}%`, `%${keyword.trim()}%`);
    }
    if (sort === 'price_asc')       sql += ' ORDER BY price ASC';
    else if (sort === 'price_desc') sql += ' ORDER BY price DESC';
    else                            sql += ' ORDER BY created_at DESC';

    const [rows] = await db.query(sql, params);
    return res.status(200).json(rows.map(parseSizes));
  } catch (err) {
    console.error('[GET products]', err.message);
    return res.status(500).json({ error: 'Gagal mengambil data produk' });
  }
};

// HANDLER: GET /api/products/:id & /api/produk/:id
const getProductById = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Produk tidak ditemukan' });
    return res.status(200).json(parseSizes(rows[0]));
  } catch (err) {
    console.error('[GET product by id]', err.message);
    return res.status(500).json({ error: 'Gagal mengambil detail produk' });
  }
};

// HANDLER: POST /api/products & /api/produk
const createProduct = async (req, res) => {
  try {
    const { id, name, category, price, image_url, description, sizes, stock, rating } = req.body;
    if (!id || !name || !category || price === undefined) {
      return res.status(400).json({ error: 'Field wajib: id, name, category, price' });
    }
    const sizesJson = Array.isArray(sizes) ? JSON.stringify(sizes) : JSON.stringify([39,40,41,42,43]);
    await db.query(
      'INSERT INTO products (id, name, category, price, image_url, description, sizes, stock, rating) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, name, category, price, image_url || null, description || null, sizesJson, stock || 0, rating || 0.0]
    );
    const [rows] = await db.query('SELECT * FROM products WHERE id = ?', [id]);
    return res.status(201).json(parseSizes(rows[0]));
  } catch (err) {
    console.error('[POST product]', err.message);
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'ID produk sudah digunakan' });
    return res.status(500).json({ error: 'Gagal menambahkan produk' });
  }
};

// HANDLER: PUT /api/products/:id & /api/produk/:id
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const [existing] = await db.query('SELECT id FROM products WHERE id = ?', [id]);
    if (existing.length === 0) return res.status(404).json({ error: 'Produk tidak ditemukan' });

    const { name, category, price, image_url, description, sizes, stock, rating } = req.body;
    const fields = [], values = [];

    if (name        !== undefined) { fields.push('name = ?');        values.push(name); }
    if (category    !== undefined) { fields.push('category = ?');    values.push(category); }
    if (price       !== undefined) { fields.push('price = ?');       values.push(price); }
    if (image_url   !== undefined) { fields.push('image_url = ?');   values.push(image_url); }
    if (description !== undefined) { fields.push('description = ?'); values.push(description); }
    if (sizes       !== undefined) { fields.push('sizes = ?');       values.push(JSON.stringify(sizes)); }
    if (stock       !== undefined) { fields.push('stock = ?');       values.push(stock); }
    if (rating      !== undefined) { fields.push('rating = ?');      values.push(rating); }

    if (fields.length === 0) return res.status(400).json({ error: 'Tidak ada field yang diupdate' });

    values.push(id);
    await db.query(`UPDATE products SET ${fields.join(', ')} WHERE id = ?`, values);
    const [rows] = await db.query('SELECT * FROM products WHERE id = ?', [id]);
    return res.status(200).json(parseSizes(rows[0]));
  } catch (err) {
    console.error('[PUT product]', err.message);
    return res.status(500).json({ error: 'Gagal mengupdate produk' });
  }
};

// HANDLER: DELETE /api/products/:id & /api/produk/:id
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const [existing] = await db.query('SELECT id FROM products WHERE id = ?', [id]);
    if (existing.length === 0) return res.status(404).json({ error: 'Produk tidak ditemukan' });
    await db.query('DELETE FROM products WHERE id = ?', [id]);
    return res.status(200).json({ success: true, message: `Produk "${id}" berhasil dihapus` });
  } catch (err) {
    console.error('[DELETE product]', err.message);
    return res.status(500).json({ error: 'Gagal menghapus produk' });
  }
};

// HANDLER: POST /api/auth/register & /api/register
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Nama, email, dan password wajib diisi' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password minimal 6 karakter' });
    }

    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Email sudah terdaftar' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );

    const token = jwt.sign(
      { id: result.insertId, name, email, role: 'user' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      success: true,
      message: 'Pendaftaran berhasil',
      token,
      user: { id: result.insertId, name, email }
    });
  } catch (err) {
    console.error('[POST register]', err.message);
    return res.status(500).json({ error: 'Gagal mendaftarkan akun' });
  }
};

// HANDLER: POST /api/auth/login & /api/login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email dan password wajib diisi' });
    }

    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Email atau password salah' });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Email atau password salah' });
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: 'user' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      success: true,
      message: 'Login berhasil',
      token,
      user: { id: user.id, name: user.name, email: user.email }
    });
  } catch (err) {
    console.error('[POST login]', err.message);
    return res.status(500).json({ error: 'Gagal melakukan login' });
  }
};

// HANDLER: POST /api/auth/admin/login & /api/admin/login
const loginAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username dan password wajib diisi' });
    }

    const [rows] = await db.query('SELECT * FROM admins WHERE username = ?', [username]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Username atau password salah' });
    }

    const admin = rows[0];
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Username atau password salah' });
    }

    const token = jwt.sign(
      { id: admin.id, username: admin.username, role: 'admin' },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    return res.status(200).json({
      success: true,
      message: 'Login admin berhasil',
      token,
      admin: { id: admin.id, username: admin.username }
    });
  } catch (err) {
    console.error('[POST admin login]', err.message);
    return res.status(500).json({ error: 'Gagal melakukan login admin' });
  }
};

// ================================================================
// REGISTERING ROUTES
// ================================================================
app.get('/api/products', getProducts);
app.get('/api/produk', getProducts);

app.get('/api/products/:id', getProductById);
app.get('/api/produk/:id', getProductById);

app.post('/api/products', createProduct);
app.post('/api/produk', createProduct);

app.put('/api/products/:id', updateProduct);
app.put('/api/produk/:id', updateProduct);

app.delete('/api/products/:id', deleteProduct);
app.delete('/api/produk/:id', deleteProduct);

app.post('/api/auth/register', registerUser);
app.post('/api/register', registerUser);

app.post('/api/auth/login', loginUser);
app.post('/api/login', loginUser);

app.post('/api/auth/admin/login', loginAdmin);
app.post('/api/admin/login', loginAdmin);

// POST /api/checkout — Submit pesanan + generate WhatsApp link
app.post('/api/checkout', async (req, res) => {
  try {
    const { customer_name, customer_phone, customer_address, items, total_price } = req.body;

    if (!customer_name || !customer_phone || !customer_address) {
      return res.status(400).json({ error: 'Data tidak lengkap: nama, telepon, dan alamat wajib diisi' });
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Keranjang tidak boleh kosong' });
    }

    // Generate pesan WhatsApp
    const lines = [
      '*Pesanan Baru - ALFAS STEP*', '',
      `Nama     : ${customer_name}`,
      `Telepon  : ${customer_phone}`,
      `Alamat   : ${customer_address}`,
      '', '*Detail Pesanan:*'
    ];
    items.forEach((item, i) => {
      lines.push(`${i + 1}. ${item.name}`);
      lines.push(`   Ukuran ${item.selectedSize} | ${item.qty}x | Rp ${formatRupiah(item.price)}`);
    });
    lines.push('', `*Total: Rp ${formatRupiah(total_price)}*`);

    const waMessage = lines.join('\n');
    const ownerNum  = process.env.OWNER_WA_NUMBER || '6288269447882';
    const waLink    = `https://wa.me/${ownerNum}?text=${encodeURIComponent(waMessage)}`;

    // Simpan ke database
    const [result] = await db.query(
      'INSERT INTO orders (customer_name, customer_phone, customer_address, items, total_price, wa_link) VALUES (?, ?, ?, ?, ?, ?)',
      [customer_name, customer_phone, customer_address, JSON.stringify(items), total_price, waLink]
    );
    const orderId = result.insertId;

    // Update wa_link dengan order ID
    const finalMsg  = waMessage + `\n*ID Pesanan: #${orderId}*`;
    const finalLink = `https://wa.me/${ownerNum}?text=${encodeURIComponent(finalMsg)}`;
    await db.query('UPDATE orders SET wa_link = ? WHERE id = ?', [finalLink, orderId]);

    return res.status(201).json({ success: true, order_id: orderId, wa_link: finalLink });
  } catch (err) {
    console.error('[POST /api/checkout]', err.message);
    return res.status(500).json({ error: 'Gagal menyimpan pesanan' });
  }
});

// GET /api/orders — Daftar semua pesanan (Admin)
app.get('/api/orders', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM orders ORDER BY created_at DESC');
    const orders = rows.map(row => {
      if (row.items && typeof row.items === 'string') {
        try { row.items = JSON.parse(row.items); } catch (e) { row.items = []; }
      }
      return row;
    });
    return res.status(200).json(orders);
  } catch (err) {
    console.error('[GET /api/orders]', err.message);
    return res.status(500).json({ error: 'Gagal mengambil data pesanan' });
  }
});

// PATCH /api/orders/:id/status — Update status pesanan (Admin)
app.patch('/api/orders/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const validStatuses = ['Diproses', 'Dikirim', 'Selesai', 'Dibatalkan'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ error: `Status tidak valid. Pilih: ${validStatuses.join(', ')}` });
    }
    const [existing] = await db.query('SELECT id FROM orders WHERE id = ?', [id]);
    if (existing.length === 0) return res.status(404).json({ error: 'Pesanan tidak ditemukan' });

    await db.query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
    return res.status(200).json({ success: true, message: `Status pesanan #${id} diubah menjadi "${status}"` });
  } catch (err) {
    console.error('[PATCH /api/orders/:id/status]', err.message);
    return res.status(500).json({ error: 'Gagal mengubah status pesanan' });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: `Route tidak ditemukan: ${req.method} ${req.originalUrl}` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[Global Error]', err.stack || err.message);
  res.status(500).json({ error: 'Terjadi kesalahan internal pada server' });
});

// START SERVER
app.listen(PORT, () => {
  console.log('🚀 ALFAS STEP Backend berjalan di port ' + PORT);
  console.log('   Akses: http://localhost:' + PORT + '/api/products');
  console.log('   Auth : http://localhost:' + PORT + '/api/auth/login');
  console.log('   Environment: ' + (process.env.NODE_ENV || 'development'));
});
