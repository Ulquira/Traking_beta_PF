// server/index.ts
import express from "express";
import cors from "cors";
import dotenv2 from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { z } from "zod";

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

// server/index.ts
import path from "path";
import { fileURLToPath } from "url";
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
dotenv2.config();
var app = express();
var port = parseInt(process.env.PORT || "3001", 10);
var CAPA_INTERMEDIA_URL = process.env.CAPA_INTERMEDIA_URL || "http://localhost:4001";
var SECRET_API_KEY = process.env.SECRET_API_KEY || "LLAVE_SECRETA_DEL_TERCERO_123";
app.set("trust proxy", 1);
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || "*",
  methods: ["GET", "POST"]
}));
app.use(express.json());
var apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1e3,
  max: 150,
  message: { success: false, message: "Demasiadas peticiones, intenta m\xE1s tarde" }
});
app.use("/api/", apiLimiter);
var reprogramarSchema = z.object({
  token: z.string().min(5).max(150),
  fecha: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  turno: z.enum(["Ma\xF1ana", "Tarde"]),
  motivo: z.string().max(500).optional().default("")
});
app.post("/api/reprogramar", async (req, res) => {
  const parseResult = reprogramarSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ success: false, message: "Datos inv\xE1lidos", errors: parseResult.error.format() });
  }
  const { token, fecha, turno, motivo } = parseResult.data;
  try {
    const query = `
      INSERT INTO REPROGRAMACIONES (token, fecha_solicitada, turno, motivo)
      VALUES (?, ?, ?, ?)
    `;
    await db_default.query(query, [token, fecha, turno, motivo || ""]);
    res.json({ success: true, message: "Reprogramaci\xF3n guardada con \xE9xito" });
  } catch (error) {
    console.error("Error guardando en BD:", error);
    res.status(500).json({ success: false, message: "Error interno guardando la solicitud" });
  }
});
var encuestaSchema = z.object({
  token: z.string().min(5).max(150),
  instalacion_concretada: z.enum(["Si", "No"]),
  tecnico_trato: z.number().int().min(1).max(5).optional(),
  tecnico_puntualidad: z.number().int().min(1).max(5).optional(),
  tecnico_claridad: z.number().int().min(1).max(5).optional(),
  tecnico_orden: z.number().int().min(1).max(5).optional(),
  tecnico_efectividad: z.number().int().min(1).max(5).optional(),
  satisfaccion_general: z.number().int().min(1).max(5),
  satisfaccion_comentario: z.string().max(1e3).optional().default(""),
  facilidad_gestion: z.number().int().min(1).max(5).optional(),
  facilidad_motivo: z.string().max(500).optional().default("")
});
app.post("/api/encuesta", async (req, res) => {
  const parseResult = encuestaSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ success: false, message: "Faltan datos obligatorios o son inv\xE1lidos", errors: parseResult.error.format() });
  }
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
  } = parseResult.data;
  try {
    const query = `
      INSERT INTO ENCUESTAS (token, instalacion_concretada, tecnico_trato, tecnico_puntualidad, tecnico_claridad, tecnico_orden, tecnico_efectividad, satisfaccion_general, satisfaccion_comentario, facilidad_gestion, facilidad_motivo)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    await db_default.query(query, [
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
    ]);
    res.json({ success: true, message: "Encuesta guardada con \xE9xito" });
  } catch (error) {
    console.error("Error guardando encuesta en BD:", error);
    res.status(500).json({ success: false, message: "Error interno guardando la encuesta" });
  }
});
app.get("/api/encuesta/verificar/:token", async (req, res) => {
  const { token } = req.params;
  try {
    const [rows] = await db_default.query("SELECT id FROM ENCUESTAS WHERE token = ? LIMIT 1", [token]);
    const completada = rows.length > 0;
    res.json({ success: true, completada });
  } catch (error) {
    console.error("Error verificando encuesta en BD:", error);
    res.status(500).json({ success: false, completada: false });
  }
});
var getLimaDateTime = () => {
  const formatter = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "America/Lima",
    year: "numeric",
    month: "2-digit",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
  return formatter.format(/* @__PURE__ */ new Date());
};
var parseUserAgent = (ua) => {
  let sistema_operativo = "Otro";
  let navegador = "Otro";
  if (!ua) return { sistema_operativo, navegador };
  if (/Windows/i.test(ua)) sistema_operativo = "Windows";
  else if (/iPhone|iPad|iPod/i.test(ua)) sistema_operativo = "iOS";
  else if (/Android/i.test(ua)) sistema_operativo = "Android";
  else if (/Macintosh|Mac OS X/i.test(ua)) sistema_operativo = "macOS";
  else if (/Linux/i.test(ua)) sistema_operativo = "Linux";
  if (/WhatsApp/i.test(ua)) navegador = "WhatsApp WebView";
  else if (/Edg/i.test(ua)) navegador = "Edge";
  else if (/Chrome/i.test(ua) && /Safari/i.test(ua)) navegador = "Chrome";
  else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) navegador = "Safari";
  else if (/Firefox/i.test(ua)) navegador = "Firefox";
  return { sistema_operativo, navegador };
};
var logSchema = z.object({
  token: z.string().min(5).max(150),
  evento: z.string().max(100),
  detalles: z.any().optional(),
  dispositivo: z.any().optional()
});
app.post("/api/log", async (req, res) => {
  const parseResult = logSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ success: false, message: "Datos inv\xE1lidos", errors: parseResult.error.format() });
  }
  const { token, evento, detalles, dispositivo } = parseResult.data;
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "";
  const ip_address = Array.isArray(ip) ? ip[0] : typeof ip === "string" ? ip.split(",")[0].trim() : "";
  const userAgentHeader = req.headers["user-agent"] || "";
  const { navegador, sistema_operativo } = parseUserAgent(userAgentHeader);
  const limaTime = getLimaDateTime();
  try {
    let esPrimeraVisita = false;
    if (evento === "ver_seguimiento_instalacion") {
      const [rows] = await db_default.query(
        "SELECT id FROM LOGS_TRAKING WHERE token = ? AND evento = 'primera_visita' LIMIT 1",
        [token]
      );
      if (rows.length === 0) {
        esPrimeraVisita = true;
      }
    }
    if (esPrimeraVisita) {
      const insertPrimeraQuery = `
        INSERT INTO LOGS_TRAKING (token, evento, ip_address, detalles, sistema_operativo, timestamp, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      await db_default.query(insertPrimeraQuery, [
        token,
        "primera_visita",
        ip_address,
        detalles ? JSON.stringify(detalles) : null,
        sistema_operativo,
        limaTime,
        limaTime
      ]);
    }
    const query = `
      INSERT INTO LOGS_TRAKING (token, evento, ip_address, detalles, sistema_operativo, timestamp, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    await db_default.query(query, [
      token,
      evento,
      ip_address,
      detalles ? JSON.stringify(detalles) : null,
      sistema_operativo,
      limaTime,
      limaTime
    ]);
    res.json({ success: true });
  } catch (error) {
    console.error("Error guardando log en BD:", error);
    res.status(500).json({ success: false, message: "Error interno guardando el log" });
  }
});
app.get("/api/instalaciones/:token", async (req, res) => {
  const { token } = req.params;
  try {
    const response = await fetch(`${CAPA_INTERMEDIA_URL}/api/v1/terceros/instalaciones/${token}`, {
      headers: {
        "Authorization": `Bearer ${SECRET_API_KEY}`
      }
    });
    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json(errorData);
    }
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Error al conectar con la capa intermedia:", error);
    res.status(500).json({ success: false, message: "Error interno del servidor", error });
  }
});
app.post("/api/route", async (req, res) => {
  const { start, end } = req.body;
  if (!start || !end) {
    return res.status(400).json({ success: false, message: "Faltan coordenadas de inicio y fin" });
  }
  try {
    const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
    if (!GOOGLE_API_KEY) {
      return res.status(500).json({ success: false, message: "API Key de Google Maps no configurada" });
    }
    const url = `https://routes.googleapis.com/directions/v2:computeRoutes`;
    const requestBody = {
      origin: {
        location: {
          latLng: {
            latitude: start[0],
            longitude: start[1]
          }
        }
      },
      destination: {
        location: {
          latLng: {
            latitude: end[0],
            longitude: end[1]
          }
        }
      },
      travelMode: "DRIVE",
      routingPreference: "TRAFFIC_AWARE",
      computeAlternativeRoutes: false,
      routeModifiers: {
        avoidTolls: false,
        avoidHighways: false,
        avoidFerries: false
      },
      languageCode: "es-419",
      units: "METRIC"
    };
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": GOOGLE_API_KEY,
        // Field mask required by Routes API to specify exactly what we want back
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
  console.log(`\u{1F680} Servidor API corriendo en http://0.0.0.0:${port}`);
});
