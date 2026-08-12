import pool from './db.ts';
async function test() {
    const [cols] = await pool.query('SHOW COLUMNS FROM OPERACION');
    console.log(cols.map((c) => c.Field).join(', '));
    process.exit(0);
}
test();
