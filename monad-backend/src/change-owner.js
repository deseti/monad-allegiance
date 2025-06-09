const { Pool } = require('pg');

// Buat koneksi ke database sebagai superuser
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_DATABASE || 'monad_dashboard',
  user: 'postgres', // Gunakan postgres sebagai superuser
  password: process.env.POSTGRES_PASSWORD // Password postgres
});

async function changeOwner() {
  try {
    console.log('🚀 Changing table owners...');
    
    // Ubah owner tabel popular_tokens
    await pool.query(`
      ALTER TABLE popular_tokens OWNER TO jxp_user;
      GRANT ALL PRIVILEGES ON TABLE popular_tokens TO jxp_user;
    `);
    
    // Ubah owner tabel popular_dapps
    await pool.query(`
      ALTER TABLE popular_dapps OWNER TO jxp_user;
      GRANT ALL PRIVILEGES ON TABLE popular_dapps TO jxp_user;
    `);
    
    console.log('✅ Table owners changed successfully!');
  } catch (error) {
    console.error('❌ Error changing table owners:', error);
  } finally {
    await pool.end();
  }
}

changeOwner(); 