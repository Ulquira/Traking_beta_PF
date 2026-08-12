const mysql = require('mysql2/promise');
require('dotenv').config();

async function showTables() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'BBDD',
    port: Number(process.env.DB_PORT) || 3306,
  });

  try {
    const [tables] = await connection.query("SHOW TABLES;");
    console.log(tables);
  } catch (error) {
    console.error("Error en la operación:", error.message);
  } finally {
    await connection.end();
  }
}

showTables();
