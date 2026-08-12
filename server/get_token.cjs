import pool from './db.js';
async function test() {
  const [rows] = await pool.query('SELECT token_seguimiento FROM OPERACION LIMIT 5');
  console.log(rows);
  process.exit(0);
}
test();