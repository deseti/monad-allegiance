// src/db.js
require('dotenv').config(); // Perintah untuk memuat semua variabel dari file .env
const { Pool } = require('pg'); // Import library 'pg'

// Membuat "pool" koneksi. Pool lebih efisien daripada satu koneksi tunggal.
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

// Export pool ini agar bisa kita gunakan di file lain
module.exports = pool;