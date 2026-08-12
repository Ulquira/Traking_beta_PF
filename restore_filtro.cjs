const mysql = require('mysql2/promise');
require('dotenv').config();

async function restoreFiltro() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'BBDD',
    port: Number(process.env.DB_PORT) || 3306,
  });

  try {
    console.log("Eliminando USER_FILTRO actual...");
    await connection.query("DROP TABLE IF EXISTS USER_FILTRO;");

    console.log("Recreando USER_FILTRO con la estructura básica...");
    // Creamos la tabla solo con los campos principales
    await connection.query(`
      CREATE TABLE USER_FILTRO (
        UserID INT,
        Email VARCHAR(255),
        Nombre VARCHAR(255),
        Rol VARCHAR(100),
        Partner VARCHAR(100),
        Zona VARCHAR(100)
      );
    `);

    console.log("Copiando valores de Email, Nombre, Rol, etc. desde USER_2...");
    const [result] = await connection.query(`
      INSERT INTO USER_FILTRO (UserID, Email, Nombre, Rol, Partner, Zona)
      SELECT UserID, Email, Nombre, Rol, Partner, Zona FROM USER_2;
    `);

    console.log(`Listo. ${result.affectedRows} filas insertadas en USER_FILTRO con los datos solicitados.`);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await connection.end();
  }
}

restoreFiltro();
