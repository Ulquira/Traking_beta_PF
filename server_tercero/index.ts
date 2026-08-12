import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = 3002; // Servidor del Tercero

app.use(cors({ origin: '*' }));
app.use(express.json());

const URL_CAPA_INTERMEDIA = "http://localhost:4001";
const SECRET_API_KEY = process.env.SECRET_API_KEY || "LLAVE_SECRETA_DEL_TERCERO_123";

// Función Proxy para no repetir código
const proxyRequest = async (req: any, res: any, path: string) => {
  try {
    const options: any = {
      method: req.method,
      headers: {
        'Authorization': `Bearer ${SECRET_API_KEY}`,
        'Content-Type': 'application/json'
      }
    };
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      options.body = JSON.stringify(req.body);
    }
    
    const response = await fetch(`${URL_CAPA_INTERMEDIA}${path}`, options);
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    console.error('Error comunicándose con Peru Fibra:', error);
    res.status(500).json({ success: false, message: 'Error de conexión con el proveedor' });
  }
};

app.get('/api/instalaciones/:token', (req, res) => proxyRequest(req, res, `/api/v1/terceros/instalaciones/${req.params.token}`));
app.post('/api/encuesta', (req, res) => proxyRequest(req, res, '/api/encuesta'));
app.get('/api/encuesta/verificar/:token', (req, res) => proxyRequest(req, res, `/api/encuesta/verificar/${req.params.token}`));
app.post('/api/route', (req, res) => proxyRequest(req, res, '/api/route'));
app.post('/api/reprogramar', (req, res) => proxyRequest(req, res, '/api/reprogramar'));

app.listen(port, () => {
  console.log(`🤝 Servidor del Tercero (El Vendor) corriendo en puerto ${port}`);
});