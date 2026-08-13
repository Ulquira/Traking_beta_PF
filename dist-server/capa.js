// capa_intermedia/index.ts
import express from "express";
import cors from "cors";
import dotenv2 from "dotenv";

// server/db.ts
import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();
var isCloudRun = process.env.K_SERVICE !== void 0;
var poolConfig = {
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "win_instalaciones",
  timezone: "-05:00",
  // Configurar la zona horaria de la sesión a Lima, Perú (UTC-5)
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};
if (isCloudRun) {
  poolConfig.socketPath = "/cloudsql/dynamic-radar-470920-g9:us-east4:quantum-vn";
} else {
  poolConfig.host = process.env.DB_HOST || "localhost";
  poolConfig.port = Number(process.env.DB_PORT) || 3306;
}
var pool = mysql.createPool(poolConfig);
var db_default = pool;

// capa_intermedia/index.ts
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
dotenv2.config();
var app = express();
var port = parseInt(process.env.PORT || "4001", 10);
app.use(cors());
app.use(express.json());
var SECRET_API_KEY = process.env.SECRET_API_KEY || "LLAVE_SECRETA_DEL_TERCERO_123";
var verificarTercero = (req, res, next) => {
  const token = req.headers["authorization"];
  if (token !== `Bearer ${SECRET_API_KEY}`) {
    return res.status(401).json({ error: "Acceso denegado. Tercero no autorizado." });
  }
  next();
};
app.get("/api/v1/terceros/instalaciones/:token", verificarTercero, async (req, res) => {
  const { token } = req.params;
  try {
    const [rows] = await db_default.query(
      `SELECT idoperacion, Estado, SubEstado, Cuadrilla, coordenadas_direccion, Ubi_TEC, telefono, fecha_programacion, Tramo_Atencio, nom_cliente, direccion_cliente, Campa\xF1a, Token_inicio 
       FROM OPERACION 
       WHERE token_seguimiento = ? 
       ORDER BY fecha_programacion DESC LIMIT 1`,
      [token]
    );
    const instalaciones = rows;
    let op = null;
    let isTicket = false;
    if (instalaciones.length > 0) {
      op = instalaciones[0];
    } else {
      const [ticketRows] = await db_default.query(
        `SELECT IDticket, Estado, SubEstado, Cuadrilla_v, coordenadas_direccion, Ubi_TEC, telefono, Fecha_Gestion_v, Fecha_programacion, Tramo, nom_cliente, direccion_cliente, Token_inicio 
         FROM TICKETS 
         WHERE token_seguimiento = ? 
         ORDER BY Fecha_Gestion_v DESC LIMIT 1`,
        [token]
      );
      const tickets = ticketRows;
      if (tickets.length === 0) {
        return res.status(404).json({ success: false, message: "Operaci\xF3n o Ticket no encontrado" });
      }
      const tk = tickets[0];
      isTicket = true;
      const fechaFinal = tk.Fecha_Gestion_v ? tk.Fecha_Gestion_v : tk.Fecha_programacion;
      op = {
        idoperacion: tk.IDticket,
        Estado: tk.Estado,
        SubEstado: tk.SubEstado,
        Cuadrilla: tk.Cuadrilla_v,
        // En tickets usamos Cuadrilla_v
        coordenadas_direccion: tk.coordenadas_direccion,
        Ubi_TEC: tk.Ubi_TEC,
        telefono: tk.telefono,
        fecha_programacion: fechaFinal,
        Tramo_Atencio: tk.Tramo,
        nom_cliente: tk.nom_cliente,
        direccion_cliente: tk.direccion_cliente,
        Campa\u00F1a: null,
        // En caso de ticket no usar Campaña
        Token_inicio: tk.Token_inicio
      };
    }
    let statusFront = "programada";
    const estadoDB = (op.Estado || "").toUpperCase();
    if (estadoDB === "PENDIENTE") {
      statusFront = "programada";
    } else if (estadoDB === "PROGRAMADO") {
      if (op.Cuadrilla && op.Cuadrilla.trim() !== "") {
        statusFront = "asignado";
      } else {
        statusFront = "programada";
      }
    } else if (estadoDB === "EN CAMINO") {
      statusFront = "en_camino";
    } else if (estadoDB === "EN PROCESO") {
      statusFront = "en_proceso";
    } else if (estadoDB === "FINALIZADO") {
      statusFront = "finalizada";
    } else if (["AUSENTE", "CANCELADO", "DULPLICADO", "INASISTENCIA", "PEXT", "REPROGRAMA"].includes(estadoDB)) {
      statusFront = "cerrada";
    }
    let coordsCliente = null;
    let coordsTecnico = null;
    try {
      if (op.coordenadas_direccion) {
        const parts = op.coordenadas_direccion.split(",");
        if (parts.length === 2) coordsCliente = [parseFloat(parts[0]), parseFloat(parts[1])];
      }
      if (op.Ubi_TEC) {
        const parts = op.Ubi_TEC.split(",");
        if (parts.length === 2) coordsTecnico = [parseFloat(parts[0]), parseFloat(parts[1])];
      }
    } catch (e) {
    }
    let tokenInicio = op.Token_inicio;
    if (!tokenInicio) {
      tokenInicio = Math.floor(1e3 + Math.random() * 9e3).toString();
      try {
        if (isTicket) {
          await db_default.query("UPDATE TICKETS SET Token_inicio = ? WHERE IDticket = ?", [tokenInicio, op.idoperacion]);
        } else {
          await db_default.query("UPDATE OPERACION SET Token_inicio = ? WHERE idoperacion = ?", [tokenInicio, op.idoperacion]);
        }
      } catch (err) {
        console.error("Error al guardar el token de inicio:", err);
      }
    }
    const responseData = {
      idoperacion: op.idoperacion,
      status: statusFront,
      eta: op.SubEstado ? op.SubEstado : null,
      trafico: null,
      coordenadas_cliente: coordsCliente,
      coordenadas_tecnico: coordsTecnico,
      fecha_programacion: op.fecha_programacion,
      tramo: op.Tramo_Atencio,
      cliente_nombre: op.nom_cliente,
      direccion: op.direccion_cliente,
      campana: op.Campa\u00F1a,
      token_inicio: tokenInicio || null,
      tipo: isTicket ? "ticket" : "instalacion"
    };
    if (op.Cuadrilla) {
      responseData.tecnico = {
        nombre: op.Cuadrilla,
        cuadrilla: op.Cuadrilla,
        telefono: op.telefono || "Central"
      };
    }
    res.json({
      success: true,
      data: responseData
    });
  } catch (error) {
    console.error("Error DB en Capa Intermedia:", error);
    res.status(500).json({ success: false, message: "Error en la red corporativa" });
  }
});
app.post("/api/encuesta", verificarTercero, async (req, res) => {
  const {
    token,
    instalacion_concretada,
    tecnico_trato,
    tecnico_puntualidad,
    tecnico_claridad,
    tecnico_orden,
    tecnico_efectividad,
    satisfaccion_general,
    satisfaccion_comentario,
    facilidad_gestion,
    facilidad_motivo
  } = req.body;
  if (!token || !satisfaccion_general) {
    return res.status(400).json({ success: false, message: "Faltan datos obligatorios" });
  }
  try {
    const csvPath = path.join(__dirname, "../server/encuestas.csv");
    const timestamp = (/* @__PURE__ */ new Date()).toISOString();
    const cleanComments = (satisfaccion_comentario || "").replace(/,/g, " ");
    if (!fs.existsSync(csvPath)) {
      await fs.promises.writeFile(csvPath, "FECHA_REGISTRO,TOKEN,CONCRETO_INSTALACION,TRATO,PUNTUALIDAD,CLARIDAD,ORDEN,EFECTIVIDAD,SATISFACCION_GENERAL,SATISFACCION_COMENTARIO,FACILIDAD,FACILIDAD_MOTIVO\n", "utf8");
    }
    const csvLine = `${timestamp},${token},${instalacion_concretada},${tecnico_trato},${tecnico_puntualidad},${tecnico_claridad},${tecnico_orden},${tecnico_efectividad},${satisfaccion_general},${cleanComments},${facilidad_gestion},${facilidad_motivo || ""}
`;
    await fs.promises.appendFile(csvPath, csvLine, "utf8");
    res.json({ success: true, message: "Encuesta guardada con \xE9xito" });
  } catch (error) {
    console.error("Error guardando encuesta en CSV:", error);
    res.status(500).json({ success: false, message: "Error interno guardando la encuesta" });
  }
});
app.get("/api/encuesta/verificar/:token", verificarTercero, async (req, res) => {
  const { token } = req.params;
  try {
    const csvPath = path.join(__dirname, "../server/encuestas.csv");
    if (!fs.existsSync(csvPath)) {
      return res.json({ success: true, completada: false });
    }
    const content = await fs.promises.readFile(csvPath, "utf8");
    const lineas = content.split("\n");
    const completada = lineas.some((linea) => linea.includes(`,${token},`));
    res.json({ success: true, completada });
  } catch (error) {
    console.error("Error verificando encuesta:", error);
    res.status(500).json({ success: false, completada: false });
  }
});
app.post("/api/reprogramar", verificarTercero, async (req, res) => {
  const { token, fecha, turno, motivo } = req.body;
  if (!token || !fecha || !turno) {
    return res.status(400).json({ success: false, message: "Faltan datos obligatorios" });
  }
  try {
    const csvPath = path.join(__dirname, "../server/reprogramaciones.csv");
    const timestamp = (/* @__PURE__ */ new Date()).toISOString();
    const cleanMotivo = (motivo || "").replace(/,/g, " ");
    if (!fs.existsSync(csvPath)) {
      await fs.promises.writeFile(csvPath, "FECHA_REGISTRO,TOKEN,NUEVA_FECHA_SOLICITADA,TURNO,MOTIVO\n", "utf8");
    }
    const csvLine = `${timestamp},${token},${fecha},${turno},${cleanMotivo}
`;
    await fs.promises.appendFile(csvPath, csvLine, "utf8");
    res.json({ success: true, message: "Reprogramaci\xF3n guardada con \xE9xito" });
  } catch (error) {
    console.error("Error guardando en CSV:", error);
    res.status(500).json({ success: false, message: "Error interno guardando la solicitud" });
  }
});
app.post("/api/route", verificarTercero, async (req, res) => {
  const { start, end } = req.body;
  if (!start || !end) {
    return res.status(400).json({ success: false, message: "Faltan coordenadas de inicio y fin" });
  }
  try {
    const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY?.trim();
    if (!GOOGLE_API_KEY) {
      return res.status(500).json({ success: false, message: "API Key de Google Maps no configurada" });
    }
    const url = `https://routes.googleapis.com/directions/v2:computeRoutes`;
    const requestBody = {
      origin: { location: { latLng: { latitude: start[0], longitude: start[1] } } },
      destination: { location: { latLng: { latitude: end[0], longitude: end[1] } } },
      travelMode: "DRIVE",
      routingPreference: "TRAFFIC_AWARE",
      computeAlternativeRoutes: false,
      routeModifiers: { avoidTolls: false, avoidHighways: false, avoidFerries: false },
      languageCode: "es-419",
      units: "METRIC"
    };
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": GOOGLE_API_KEY,
        "X-Goog-FieldMask": "routes.duration,routes.polyline.encodedPolyline"
      },
      body: JSON.stringify(requestBody)
    });
    const data = await response.json();
    if (response.ok && data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      const durationStr = route.duration || "0s";
      const durationSeconds = parseInt(durationStr.replace("s", ""), 10);
      const polyline = route.polyline.encodedPolyline;
      res.json({ success: true, durationSeconds, polyline });
    } else {
      res.status(400).json({ success: false, message: data.error?.message || "Error en Google Routes API" });
    }
  } catch (error) {
    console.error("Error calculando ruta:", error);
    res.status(500).json({ success: false, message: "Error interno calculando ruta" });
  }
});
app.listen(port, "0.0.0.0", () => {
  console.log(`\u{1F6E1}\uFE0F Capa Intermedia de tu Empresa (Segura) corriendo en puerto ${port}`);
});
