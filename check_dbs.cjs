const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkOtherDbs() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'BBDD',
    port: Number(process.env.DB_PORT) || 3306,
  });

  try {
    const [tablesDev] = await connection.query("SHOW TABLES IN BBDD_DEV;");
    const [tablesPrueba] = await connection.query("SHOW TABLES IN PRUEBA;");
    const [tablesCalidad] = await connection.query("SHOW TABLES IN CALIDAD;");
    console.log("BBDD_DEV:", tablesDev.map(t => Object.values(t)[0]).includes('USER_FILTRO'));
    console.log("PRUEBA:", tablesPrueba.map(t => Object.values(t)[0]).includes('USER_FILTRO'));
    console.log("CALIDAD:", tablesCalidad.map(t => Object.values(t)[0]).includes('USER_FILTRO'));
  } catch (error) {
    console.error("Error en la operación:", error.message);
  } finally {
    await connection.end();
  }
}

checkOtherDbs();
