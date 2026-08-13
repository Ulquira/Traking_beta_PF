const mysql = require('mysql2/promise');
require('dotenv').config();

async function getCols() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'BBDD',
    port: Number(process.env.DB_PORT) || 3306,
  });

  try {
    const [cols] = await connection.query("SHOW COLUMNS FROM USER_2;");
    console.log(cols.map(c => c.Field));
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await connection.end();
  }
}

getCols();
