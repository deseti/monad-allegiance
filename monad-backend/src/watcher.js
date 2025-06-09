// src/watcher.js
const Web3 = require('web3');
const pool = require('./db');

// Inisialisasi Web3
const web3 = new Web3('https://testnet-rpc.monad.xyz');

// Pindahkan ke global scope
const TOKEN_CONTRACTS = {
  '0xe0590015a873bf326bd645c3e1266d4db41c4e6b': 'Chog',
  '0xfe140e1dce99be9f4f15d657cd9b7bf622270c50': 'Moyaki',
  '0x0f0bdebf0f83cd1ee3974779bcb7315f9808c714': 'Molandak',
  '0xb2f82d0f38dc453d596ad40a37799446cc89274a': 'aprMON',
  '0xaeef2f6b429cb59c9b2d7bb2141ada993e8571c3': 'gMON',
  '0x3a98250f98dd388c211206983453837c8365bdc1': 'shMON',
  '0xe1d2439b75fb9746e7bc6cb777ae10aa7f7ef9c5': 'sMON'
};

const DAPPS_CONTRACTS = {
  '0x88b96af200c8a9c35442c8ac6cd3d22695aae4f0': 'Ambient',
  '0xca810d095e90daae6e867c19df6d9a8c56db2c89': 'Bean',
  '0xcbe623d259261ffa0cfaff44484bff46c1b7d6c2': 'Talentum',
  '0xf6ffe4f3fdc8bbb7f70ffd48e61f17d1e343ddfd': 'iZUMi',
  '0xb6091233aacacba45225a2b2121bbac807af4255': 'OctoSwap',
  '0x64aff7245ebdaaecaf266852139c67e4d8dba4de': 'Madness',
  '0x4267f317adee7c6478a5ee92985c2bd5d855e274': 'Flap',
  '0xc816865f172d640d93712c68a7e1f83f3fa63235': 'Kuru',
  '0x3ae6d8a282d67893e17aa70ebffb33ee5aa65893': 'Uniswap'
};

let lastBlock = null;

// Fungsi untuk mengecek koneksi RPC
async function checkRPCConnection() {
  try {
    const blockNumber = await web3.eth.getBlockNumber();
    console.log('✅ RPC Connection successful. Current block:', blockNumber);
    return true;
  } catch (error) {
    console.error('❌ RPC Connection failed:', error);
    return false;
  }
}

// Fungsi untuk memperbarui data token
async function updateTokenData(address, name) {
  try {
    // Cek apakah token sudah ada
    const checkQuery = 'SELECT * FROM popular_tokens WHERE LOWER(contract_address) = LOWER($1)';
    const checkResult = await pool.query(checkQuery, [address]);
    
    if (checkResult.rows.length === 0) {
      // Jika belum ada, insert baru
      const insertQuery = `
        INSERT INTO popular_tokens (contract_address, name, transaction_count, logo_url)
        VALUES ($1, $2, 0, $3)
      `;
      await pool.query(insertQuery, [address.toLowerCase(), name.toLowerCase(), `/logos/${name.toLowerCase()}.png`]);
      console.log(`✅ Inserted new token: ${name} (${address})`);
    } else {
      // Jika sudah ada, update transaction_count
      const updateQuery = `
        UPDATE popular_tokens SET transaction_count = transaction_count + $1 WHERE LOWER(contract_address) = LOWER($2)
      `;
      const result = await pool.query(updateQuery, [1, address.toLowerCase()]);
      console.log(`✅ Updated token ${name} count: +1`);
    }
  } catch (error) {
    console.error('❌ Error updating token data:', error);
  }
}

// Fungsi untuk memperbarui data dapp
async function updateDappData(address, name) {
  try {
    // Cek apakah dapp sudah ada
    const checkQuery = 'SELECT * FROM popular_dapps WHERE LOWER(contract_address) = LOWER($1)';
    const checkResult = await pool.query(checkQuery, [address]);
    
    if (checkResult.rows.length === 0) {
      // Jika belum ada, insert baru
      const insertQuery = `
        INSERT INTO popular_dapps (contract_address, name, transaction_count, logo_url)
        VALUES ($1, $2, 0, $3)
      `;
      await pool.query(insertQuery, [address.toLowerCase(), name.toLowerCase(), `/logos/${name.toLowerCase()}.png`]);
      console.log(`✅ Inserted new dapp: ${name} (${address})`);
    } else {
      // Jika sudah ada, update transaction_count
      const updateQuery = `
        UPDATE popular_dapps SET transaction_count = transaction_count + $1 WHERE LOWER(contract_address) = LOWER($2)
      `;
      const resultDapp = await pool.query(updateQuery, [1, address.toLowerCase()]);
      console.log(`✅ Updated dapp ${name} count: +1`);
    }
  } catch (error) {
    console.error('❌ Error updating dapp data:', error);
  }
}

// Fungsi untuk memproses transaksi
async function processTransaction(tx, TOKEN_CONTRACTS, DAPPS_CONTRACTS) {
  try {
    if (typeof tx === 'string') return [];
    const result = [];
    const targetAddress = tx.to?.toLowerCase();
    if (targetAddress) {
      if (TOKEN_CONTRACTS[targetAddress]) {
        result.push({ type: 'token', address: targetAddress });
      }
      if (DAPPS_CONTRACTS[targetAddress]) {
        result.push({ type: 'dapp', address: targetAddress });
      }
    }
    if (tx.input && tx.input.length > 2) {
      const inputData = tx.input.slice(2);
      for (const [address, _] of Object.entries(TOKEN_CONTRACTS)) {
        if (inputData.includes(address.slice(2).toLowerCase())) {
          result.push({ type: 'token', address });
        }
      }
      for (const [address, _] of Object.entries(DAPPS_CONTRACTS)) {
        if (inputData.includes(address.slice(2).toLowerCase())) {
          result.push({ type: 'dapp', address });
        }
      }
    }
    return result;
  } catch (error) {
    console.error('❌ Error processing transaction:', error);
    return [];
  }
}

async function pollBlocks() {
  try {
    const latestBlockNumber = await web3.eth.getBlockNumber();
    if (lastBlock === null) {
      lastBlock = latestBlockNumber - 1; // skip block history
    }
    for (let i = lastBlock + 1; i <= latestBlockNumber; i++) {
      const block = await web3.eth.getBlock(i, true);
      if (block && block.transactions) {
        console.log(`✨ New Block #${block.number} received with ${block.transactions.length} transactions.`);
        const updates = {};
        for (const tx of block.transactions) {
          const results = await processTransaction(tx, TOKEN_CONTRACTS, DAPPS_CONTRACTS);
          if (results && results.length > 0) {
            for (const { type, address } of results) {
              updates[address] = (updates[address] || 0) + 1;
              console.log(`[DEBUG] TX: ${tx.hash} | Type: ${type} | Address: ${address}`);
            }
          }
        }
        for (const address in updates) {
          const count = updates[address];
          console.log(`🔄 Updating count for ${address}: +${count}`);
          if (TOKEN_CONTRACTS[address]) {
            const result = await pool.query(
              'UPDATE popular_tokens SET transaction_count = transaction_count + $1 WHERE LOWER(contract_address) = LOWER($2) RETURNING transaction_count',
              [count, address]
            );
            console.log(`✅ Updated ${TOKEN_CONTRACTS[address]} token count to ${result.rows[0].transaction_count}`);
          }
          if (DAPPS_CONTRACTS[address]) {
            const resultDapp = await pool.query(
              'UPDATE popular_dapps SET transaction_count = transaction_count + $1 WHERE LOWER(contract_address) = LOWER($2) RETURNING transaction_count',
              [count, address]
            );
            console.log(`✅ Updated ${DAPPS_CONTRACTS[address]} dapp count to ${resultDapp.rows[0].transaction_count}`);
          }
        }
      }
      lastBlock = i;
    }
  } catch (error) {
    console.error('❌ Error polling blocks:', error);
  }
  setTimeout(pollBlocks, 10000); // polling setiap 10 detik
}

// Fungsi utama yang akan kita panggil dari index.js
const startWatcher = async () => {
  console.log('🚀 Starting Monad Block Watcher...');

  try {
    // Cek koneksi RPC
    const isConnected = await checkRPCConnection();
    if (!isConnected) {
      console.error('❌ Failed to connect to RPC. Retrying in 30 seconds...');
      setTimeout(startWatcher, 30000);
      return;
    }

    // Inisialisasi data di database
    for (const [address, name] of Object.entries(TOKEN_CONTRACTS)) {
      await updateTokenData(address, name);
    }

    for (const [address, name] of Object.entries(DAPPS_CONTRACTS)) {
      await updateDappData(address, name);
    }

    pollBlocks();

  } catch (error) {
    console.error('❌ Error starting watcher:', error);
    // Restart watcher setelah error
    setTimeout(startWatcher, 30000);
  }
};

module.exports = { startWatcher };