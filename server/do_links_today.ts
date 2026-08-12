import pool from './db.ts';
import crypto from 'crypto';

const DOMINIO_FRONTEND = 'http://localhost:5173';

async function main() {
  try {
    // Para las operaciones de HOY o si no hay hoy, agarramos las más recientes.
    const [rows]: any = await pool.query('SELECT idoperacion FROM OPERACION WHERE DATE(fecha_programacion) = CURDATE() LIMIT 10');
    
    if (rows.length === 0) {
      console.log('No hay instalaciones PARA HOY (CURDATE). Generando link para la última instalación que exista en la BD para que puedas probar.');
      const [fallback]: any = await pool.query('SELECT idoperacion FROM OPERACION ORDER BY fecha_programacion DESC LIMIT 2');
      for(let i=0; i<fallback.length; i++) {
        const token = `PF-${crypto.randomBytes(4).toString('hex')}`;
        await pool.query('UPDATE OPERACION SET token_seguimiento = ? WHERE idoperacion = ?', [token, fallback[i].idoperacion]);
        console.log(`Link generado para ${fallback[i].idoperacion}: ${DOMINIO_FRONTEND}/seguimiento/${token}`);
      }
    } else {
      console.log(`Operaciones de HOY encontradas: ${rows.length}`);
      for(let i=0; i<rows.length; i++) {
          const token = `PF-${crypto.randomBytes(4).toString('hex')}`;
          await pool.query('UPDATE OPERACION SET token_seguimiento = ? WHERE idoperacion = ?', [token, rows[i].idoperacion]);
          console.log(`Link generado para HOY (${rows[i].idoperacion}): ${DOMINIO_FRONTEND}/seguimiento/${token}`);
      }
    }
  } catch(e) {
      console.error(e);
  } finally {
      process.exit(0);
  }
}
main();