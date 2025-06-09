// index.js (Versi Perbaikan Final)

const express = require('express');
const pool = require('./src/db');
const { startWatcher } = require('./src/watcher');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Konfigurasi CORS yang lebih spesifik
app.use(cors({
  origin: '*', // Izinkan semua origin untuk testing
  methods: ['GET', 'POST'],
  credentials: true
}));

app.use(express.json());

// Middleware untuk logging
app.use((req, res, next) => {
  console.log(`📥 ${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('📥 Headers:', req.headers);
  next();
});

// Route dasar untuk mengecek server hidup
app.get('/', (req, res) => {
  res.send('Server Monad Backend Berjalan!');
});


// ROUTE UTAMA UNTUK DIKONSUMSI OLEH FRONTEND
app.get('/api/data', async (req, res) => {
  try {
    console.log('🔍 [DEBUG] Fetching data for frontend...');
    
    // Ambil data teratas dari popular_tokens
    const topTokensQuery = `
      SELECT 
        contract_address AS address,
        name, 
        logo_url AS logo,
        transaction_count::integer AS count
      FROM popular_tokens
      ORDER BY transaction_count DESC;
    `;
    console.log('📝 [DEBUG] Executing tokens query:', topTokensQuery);
    const topTokensResult = await pool.query(topTokensQuery);
    console.log('✅ [DEBUG] Tokens result:', JSON.stringify(topTokensResult.rows, null, 2));

    // Ambil data teratas dari popular_dapps
    const topDappsQuery = `
      SELECT 
        contract_address AS address,
        name, 
        logo_url AS logo,
        transaction_count::integer AS count
      FROM popular_dapps
      ORDER BY transaction_count DESC;
    `;
    console.log('📝 [DEBUG] Executing dapps query:', topDappsQuery);
    const topDappsResult = await pool.query(topDappsQuery);
    console.log('✅ [DEBUG] Dapps result:', JSON.stringify(topDappsResult.rows, null, 2));
    
    // Kirim data sebagai satu objek JSON
    const response = {
      popularTokens: topTokensResult.rows,
      popularDapps: topDappsResult.rows,
    };
    console.log('📤 [DEBUG] Sending response:', JSON.stringify(response, null, 2));
    res.json(response);

  } catch (error) {
    console.error("❌ [DEBUG] Error fetching API data:", error);
    console.error("❌ [DEBUG] Error stack:", error.stack);
    res.status(500).json({ error: 'Gagal mengambil data dari database.' });
  }
});

// Endpoint untuk Popular Token List
app.get('/api/popular-tokens', async (req, res) => {
  try {
    console.log('🔍 [DEBUG] Request received for /api/popular-tokens');
    console.log('🔍 [DEBUG] Fetching popular tokens...');
    const query = `
      SELECT 
        contract_address AS address,
        name,
        logo_url AS logo,
        transaction_count AS count
      FROM popular_tokens
      ORDER BY transaction_count DESC
      LIMIT 10;
    `;
    console.log('📝 [DEBUG] Executing query:', query);
    const result = await pool.query(query);
    console.log('✅ [DEBUG] Query result:', JSON.stringify(result.rows, null, 2));
    res.json(result.rows);
  } catch (error) {
    console.error('❌ [DEBUG] Error fetching popular tokens:', error);
    console.error('❌ [DEBUG] Error stack:', error.stack);
    res.status(500).json({ error: 'Gagal mengambil data token populer.' });
  }
});

// Endpoint untuk Popular Dapps List
app.get('/api/popular-dapps', async (req, res) => {
  try {
    console.log('🔍 Fetching popular dapps...');
    const query = `
      SELECT 
        contract_address AS address,
        name,
        logo_url AS logo,
        transaction_count AS count
      FROM popular_dapps
      ORDER BY transaction_count DESC
      LIMIT 10;
    `;
    console.log('📝 Executing query:', query);
    const result = await pool.query(query);
    console.log('✅ Query result:', result.rows);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Error fetching popular dapps:', error);
    res.status(500).json({ error: 'Gagal mengambil data dapps populer.' });
  }
});

// Tambahkan logika reset otomatis setiap 24 jam UTC
let dateLastReset = null;
setInterval(async () => {
  const now = new Date();
  const utcDate = now.toISOString().slice(0, 10); // format YYYY-MM-DD
  if (dateLastReset !== utcDate) {
    try {
      await pool.query('UPDATE popular_tokens SET transaction_count = 0');
      await pool.query('UPDATE popular_dapps SET transaction_count = 0');
      dateLastReset = utcDate;
      console.log(`[RESET] transaction_count direset ke 0 pada UTC ${utcDate}`);
    } catch (err) {
      console.error('[RESET] Gagal reset transaction_count:', err);
    }
  }
}, 60 * 1000); // cek setiap 1 menit

// Jalankan server dan watcher
app.listen(PORT, () => {
  console.log(`🚀 Server backend berjalan di http://localhost:${PORT}`);
  console.log('📊 Database config:', {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_DATABASE,
    user: process.env.DB_USER
  });
  startWatcher(); 
});