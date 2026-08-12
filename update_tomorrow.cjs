const mysql = require('mysql2/promise');
async function run() {
  const c = await mysql.createConnection({host: '34.186.62.43', user: 'Quantum', password: 'Tonoso.33', database: 'BBDD', port: 3306});
  
  // Create Link_traking if it doesn't exist (assuming renaming token_seguimiento or just adding a new one)
  // User said: "en doned va el token_seguimiento que es para el link ponle mejor de nombre Link_traking y quiero que generes el link completo"
  // So I'll rename the column `token_seguimiento` to `Link_traking` OR just add `Link_traking` and update it. Let's add it to be safe, since capa_intermedia queries token_seguimiento in WHERE clause. Wait, if I rename token_seguimiento, capa_intermedia will break.
  // User: "en doned va el token_seguimiento que es para el link ponle mejor de nombre Link_traking y quiero que generes el link completo."
  // It means: add a column `Link_traking` that holds the full URL. We keep `token_seguimiento` because that's the unique ID used for the where clause.
  
  try {
      await c.query('ALTER TABLE OPERACION ADD COLUMN Link_traking VARCHAR(255) DEFAULT NULL');
      console.log("Columna Link_traking agregada");
  } catch(e) {
      console.log("Columna Link_traking ya existe o error:", e.message);
  }

  // Generate tokens and links for tomorrow
  // user says "fecha_gestion de mañana", let's check the date columns. There is usually fecha_programacion
  const [cols] = await c.query('SHOW COLUMNS FROM OPERACION');
  const fieldNames = cols.map(col => col.Field);
  const fechaCol = fieldNames.includes('fecha_gestion') ? 'fecha_gestion' : 'fecha_programacion';
  
  console.log(`Usando columna de fecha: ${fechaCol}`);

  // Query rows for tomorrow
  const [rows] = await c.query(`SELECT idoperacion, token_seguimiento FROM OPERACION WHERE DATE(${fechaCol}) = CURDATE() + INTERVAL 1 DAY`);
  console.log(`Encontrados ${rows.length} casos para mañana`);

  let count = 0;
  for (const row of rows) {
      if (!row.token_seguimiento) continue;
      
      const pin = Math.floor(1000 + Math.random() * 9000).toString();
      const link = `https://dynamic-radar-470920-g9.web.app/seguimiento/${row.token_seguimiento}`;
      
      await c.query('UPDATE OPERACION SET Token_inicio = ?, Link_traking = ? WHERE idoperacion = ?', [pin, link, row.idoperacion]);
      count++;
  }
  
  console.log(`Actualizados ${count} registros exitosamente.`);
  await c.end();
}
run();