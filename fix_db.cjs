const mysql = require('mysql2/promise');
require('dotenv').config();

async function run() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
  });

  try {
    console.log("Renombrando tabla antigua como backup...");
    await pool.query('RENAME TABLE ENCUESTAS TO ENCUESTAS_OLD_BACKUP;');

    console.log("Creando nueva tabla ENCUESTAS con el esquema CSAT actualizado...");
    await pool.query(`
      CREATE TABLE ENCUESTAS (
        id INT AUTO_INCREMENT PRIMARY KEY,
        token VARCHAR(50) NOT NULL,
        instalacion_concretada VARCHAR(50) DEFAULT NULL,
        tecnico_trato VARCHAR(50) DEFAULT NULL,
        tecnico_puntualidad VARCHAR(50) DEFAULT NULL,
        tecnico_claridad VARCHAR(50) DEFAULT NULL,
        tecnico_orden VARCHAR(50) DEFAULT NULL,
        tecnico_efectividad VARCHAR(50) DEFAULT NULL,
        satisfaccion_general VARCHAR(50) DEFAULT NULL,
        satisfaccion_comentario TEXT DEFAULT NULL,
        facilidad_gestion VARCHAR(50) DEFAULT NULL,
        facilidad_motivo VARCHAR(255) DEFAULT NULL,
        fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    console.log("¡Éxito! Nueva tabla creada y lista para recibir las encuestas.");
  } catch (err) {
    console.error("Error modificando la base de datos:", err);
  } finally {
    process.exit();
  }
}

run();