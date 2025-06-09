const fs = require('fs');
const path = require('path');
const pool = require('./db');

async function initializeDatabase() {
  try {
    console.log('🚀 Initializing database...');
    
    // Baca file schema.sql
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Jalankan schema
    await pool.query(schema);
    
    console.log('✅ Database initialized successfully!');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    process.exit(1);
  } finally {
    // Tutup pool koneksi
    await pool.end();
  }
}

// Jalankan inisialisasi
initializeDatabase(); 