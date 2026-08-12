import pool from './db.ts';
async function test() {
  const [cols]: any = await pool.query('SHOW COLUMNS FROM OPERACION');
  console.log(cols.map((c: any) => c.Field).join(', '));
  process.exit(0);
}
test();