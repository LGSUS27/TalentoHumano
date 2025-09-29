// index.js (dev-friendly cors + login alias)
import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import path from "path";

import pool from "./db.js";
import empleadosRoutes from "./routes/empleados.js";
import informacionPersonalRoutes from "./routes/informacionPersonal.js";
import experienciaRoutes from "./routes/experiencia.js";
import formacionRoutes from "./routes/formacion.js";
import otrosDocumentosRouter from "./routes/otrosDocumentos.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret"; // evita crash si falta .env

// ---------- CORS ultra permisivo para DEV ----------
app.use(
  cors({
    origin: (origin, cb) => {
      // Permite localhost y 127.0.0.1 en cualquier puerto
      if (
        !origin ||
        /^http:\/\/localhost(:\d+)?$/.test(origin) ||
        /^http:\/\/127\.0\.0\.1(:\d+)?$/.test(origin)
      ) {
        return cb(null, true);
      }
      return cb(new Error("CORS no permitido"), false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
// Responder OPTIONS global (preflight)
app.options("*", cors());

// JSON
app.use(express.json());

// Servir archivos subidos
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Rutas modulares
app.use("/empleados", empleadosRoutes);
app.use("/api/informacion-personal", informacionPersonalRoutes);
app.use("/api/experiencia", experienciaRoutes);
app.use("/api/formacion", formacionRoutes);
app.use("/api/otros-documentos", otrosDocumentosRouter);

// Salud
app.get("/", (_req, res) => res.send("✅ Backend OK"));

// ------- JWT middleware (para rutas protegidas) -------
const verificarToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader)
    return res.status(401).json({ success: false, message: "Token no proporcionado" });

  const token = authHeader.split(" ")[1];
  if (!token)
    return res.status(401).json({ success: false, message: "Token no válido" });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err)
      return res.status(403).json({ success: false, message: "Token inválido o expirado" });
    req.user = decoded;
    next();
  });
};

// ------- LOGIN (alias /login y /api/login) -------
app.post(["/login", "/api/login"], async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password)
      return res.status(400).json({ success: false, message: "Faltan campos obligatorios" });

    const r = await pool.query(
      "SELECT * FROM usuarios WHERE username = $1 AND password = $2",
      [username, password]
    );
    if (!r.rows.length)
      return res.status(401).json({ success: false, message: "Credenciales incorrectas" });

    const user = r.rows[0];
    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, {
      expiresIn: "1h",
    });
    return res.json({ success: true, token });
  } catch (err) {
    console.error("Error en /login:", err);
    return res.status(500).json({ success: false, message: "Error en el servidor" });
  }
});

// ------- RUTA PROTEGIDA DE PRUEBA -------
app.get("/protected", verificarToken, (req, res) => {
  res.json({ success: true, message: "Ruta protegida OK", user: req.user });
});

// ------- ARRANQUE -------
app.listen(PORT, () => {
  console.log(`✅ Backend en http://localhost:${PORT}`);
});