import pool from './db.ts';
async function test() {
    const [rows] = await pool.query('SELECT token_seguimiento FROM OPERACION WHERE DATE(fecha_programacion) = CURDATE() AND token_seguimiento IS NOT NULL LIMIT 5');
    console.log('TOKENS ACTIVOS DE HOY:');
    rows.forEach((r) => console.log('http://localhost:5173/seguimiento/' + r.token_seguimiento));
    process.exit(0);
}
test();
