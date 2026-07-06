// =============================================================
// backend/db.js — MySQL Connection Pool untuk ALFAS STEP
// =============================================================
// Modul ini mengelola koneksi ke database MySQL menggunakan
// connection pool agar efisien: koneksi dipakai ulang dan
// tidak dibuka baru untuk setiap request yang masuk.
// =============================================================

// Load environment variables dari file .env
require('dotenv').config();

// Import driver MySQL2
const mysql = require('mysql2');

// Buat connection pool dengan konfigurasi dari environment variables
const pool = mysql.createPool({
  host:     process.env.DB_HOST,           // Host database (Railway)
  port:     process.env.DB_PORT || 3306,   // Port database, default 3306
  user:     process.env.DB_USER,           // Username database
  password: process.env.DB_PASSWORD,       // Password database
  database: process.env.DB_NAME,           // Nama database

  // Opsi pool connection
  waitForConnections: true,  // Tunggu jika semua koneksi sedang dipakai
  connectionLimit:    10,    // Maksimal 10 koneksi aktif sekaligus
  queueLimit:         0      // 0 = tidak ada batas antrian request
});

// Export pool dengan Promise API agar semua query bisa menggunakan async/await
module.exports = pool.promise();
