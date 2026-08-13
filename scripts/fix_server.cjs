const fs = require('fs');
let ser = fs.readFileSync('server/index.ts', 'utf8');

// Buscamos explícitamente el endpoint de la encuesta y lo reemplazamos
const startIdx = ser.indexOf("app.post('/api/encuesta'");
const endIdx = ser.indexOf("app.get('/api/encuesta/verificar");

if (startIdx !== -1 && endIdx !== -1) {
  const newEndpoint = `app.post('/api/encuesta', async (req, res) => {
  const { 
    token, instalacion_concretada, tecnico_trato, tecnico_puntualidad, tecnico_claridad, 
    tecnico_orden, tecnico_efectividad, satisfaccion_general, satisfaccion_comentario, 
    facilidad_gestion, facilidad_motivo 
  } = req.body;

  if (!token || !satisfaccion_general) {
    return res.status(400).json({ success: false, message: 'Faltan datos obligatorios' });
  }

  try {
    const query = \`
      INSERT INTO ENCUESTAS (token, instalacion_concretada, tecnico_trato, tecnico_puntualidad, tecnico_claridad, tecnico_orden, tecnico_efectividad, satisfaccion_general, satisfaccion_comentario, facilidad_gestion, facilidad_motivo)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    \`;
    await pool.query(query, [
      token, instalacion_concretada, tecnico_trato, tecnico_puntualidad, tecnico_claridad, 
      tecnico_orden, tecnico_efectividad, satisfaccion_general, satisfaccion_comentario, 
      facilidad_gestion, facilidad_motivo
    ]);

    res.json({ success: true, message: 'Encuesta guardada con éxito' });
  } catch (error) {
    console.error('Error guardando encuesta en BD:', error);
    res.status(500).json({ success: false, message: 'Error interno guardando la encuesta' });
  }
});

// Endpoint para verificar si un token ya llenó la encuesta en BD
`;

  ser = ser.substring(0, startIdx) + newEndpoint + ser.substring(endIdx + 73);
  fs.writeFileSync('server/index.ts', ser);
  console.log("Server fix aplicado.");
} else {
  console.log("No se encontraron los indices.");
}
