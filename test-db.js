const mysql = require('mysql2/promise');

async function testConnection() {
  try {
    const connection = await mysql.createConnection({
      host: '1.14.111.139',
      user: 'bendi',
      password: '5siGcF3F4iAtpcjE',
      database: 'bendi',
      connectTimeout: 10000
    });
    console.log('Connected successfully!');
    await connection.end();
  } catch (err) {
    console.error('Connection failed:', err.message, err.code);
  }
}

testConnection();
