import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// En Cloud Run con Cloud SQL Connections habilitado, usar socket Unix
// En local, usar TCP con localhost
const isCloudRun = process.env.K_SERVICE !== undefined;

const poolConfig: any = {
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'win_instalaciones',
  timezone: '-05:00', // Configurar la zona horaria de la sesión a Lima, Perú (UTC-5)
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Si estamos en Cloud Run, usar socket Unix
if (isCloudRun) {
  poolConfig.socketPath = '/cloudsql/dynamic-radar-470920-g9:us-east4:quantum-vn';
} else {
  // En local o con Proxy manual, usar TCP
  poolConfig.host = process.env.DB_HOST || 'localhost';
  poolConfig.port = Number(process.env.DB_PORT) || 3306;
}

const pool = mysql.createPool(poolConfig);

export default pool;