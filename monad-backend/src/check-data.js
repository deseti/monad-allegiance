const pool = require('./db');

async function checkData() {
  try {
    console.log('🔍 Checking popular_tokens table...');
    const result = await pool.query('SELECT * FROM popular_tokens;');
    console.log('Data in popular_tokens:', result.rows);
    
    console.log('\n🔍 Checking popular_dapps table...');
    const dappsResult = await pool.query('SELECT * FROM popular_dapps;');
    console.log('Data in popular_dapps:', dappsResult.rows);
  } catch (error) {
    console.error('❌ Error checking data:', error);
  } finally {
    await pool.end();
  }
}

checkData(); 