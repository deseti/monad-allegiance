const pool = require('./db');

async function alterTables() {
  try {
    console.log('🚀 Altering tables...');
    
    // Tambahkan kolom ke popular_tokens
    await pool.query(`
      ALTER TABLE popular_tokens 
      ADD COLUMN IF NOT EXISTS symbol VARCHAR(50),
      ADD COLUMN IF NOT EXISTS total_supply VARCHAR(255) DEFAULT '0',
      ADD COLUMN IF NOT EXISTS holders INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
    `);
    
    // Tambahkan kolom ke popular_dapps
    await pool.query(`
      ALTER TABLE popular_dapps
      ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
    `);
    
    console.log('✅ Tables altered successfully!');
  } catch (error) {
    console.error('❌ Error altering tables:', error);
  } finally {
    await pool.end();
  }
}

alterTables(); 