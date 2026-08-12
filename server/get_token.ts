import pool from './db.ts';

async function test() {
  const [rows] = await pool.query('SELECT token_seguimiento, idoperacion FROM OPERACION LIMIT 5');
  console.log('TOKENS GENERADOS:', rows);
  process.exit(0);
}
test();