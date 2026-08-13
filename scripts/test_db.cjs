const mysql = require('mysql2/promise');

async function test() {
  try {
    const conn = await mysql.createConnection({
      host: '34.186.62.43',
      user: 'Quantum',
      password: 'Tonoso.33',
      database: 'BBDD',
      port: 3306
    });
    
    // Verificamos si existe la tabla OPERACION
    const [tables] = await conn.query("SHOW TABLES LIKE '%OP%'");
    console.log("Tablas encontradas:", tables);
    
    // Y vamos a intentar describir la de operaciones
    const [rows] = await conn.query("DESCRIBE OPERACION");
    console.log("Columnas de OPERACION:", rows);
    
    await conn.end();
  } catch (e) {
    console.error('Error MySQL:', e.message);
  }
}

test();