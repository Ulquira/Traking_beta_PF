import pool from './db.ts';
import crypto from 'crypto';

const DOMINIO_FRONTEND = 'http://localhost:5174';

async function main() {
  try {
    console.log('Creando columna...');
    try {
      await pool.query('ALTER TABLE OPERACION ADD COLUMN token_seguimiento VARCHAR(50) UNIQUE');
      console.log('Columna creada.');
    } catch(e) { console.log('Ya existe o error:', e); }

    const [rows]: any = await pool.query('SELECT idoperacion FROM OPERACION LIMIT 5');
    console.log('Operaciones encontradas:', rows.length);

    for(let i=0; i<rows.length; i++) {
        const token = `PF-${crypto.randomBytes(4).toString('hex')}`;
        await pool.query('UPDATE OPERACION SET token_seguimiento = ? WHERE idoperacion = ?', [token, rows[i].idoperacion]);
        console.log(`Link generado para ${rows[i].idoperacion}: ${DOMINIO_FRONTEND}/seguimiento/${token}`);
    }
  } catch(e) {
      console.error(e);
  } finally {
      process.exit(0);
  }
}
main();