import express from "express";
import cors from "cors";
import pg from "pg";
import "dotenv/config";

// Si falta la variable, avisar con un mensaje claro y detener el arranque
if (!process.env.DATABASE_URL) {
  console.error("Falta la variable DATABASE_URL. Revisa server/.env o las variables de Render.");
  process.exit(1);
}

// Que las fechas lleguen como texto "2026-11-10" y no como objeto Date
pg.types.setTypeParser(1082, (valor) => valor);

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  // La URL externa (desde tu PC) necesita SSL; la interna de Render no
  ssl: process.env.DATABASE_URL.includes("render.com")
    ? { rejectUnauthorized: false }
    : false,
});

// Crear la tabla si no existe
try {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS eventos (
      id              SERIAL PRIMARY KEY,
      nombre          TEXT    NOT NULL,
      fecha           DATE    NOT NULL,
      lugar           TEXT    NOT NULL,
      organizador     TEXT    NOT NULL,
      invitados       INTEGER NOT NULL,
      confirmados     INTEGER NOT NULL DEFAULT 0,
      minima          INTEGER NOT NULL,
      costo           INTEGER NOT NULL,
      pago_anticipado BOOLEAN NOT NULL DEFAULT false,
      realizado       BOOLEAN NOT NULL DEFAULT false,
      creado_en       TIMESTAMP DEFAULT now()
    )
  `);
  console.log("Base de datos lista");
} catch (error) {
  console.error("No se pudo conectar con la base de datos:", error.message);
  process.exit(1);
}

const app = express();
app.use(cors());
app.use(express.json());

// Envuelve cada ruta para que un error no tumbe el servidor
const manejar = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

app.get("/", (req, res) => res.send("API de Plan Fest funcionando"));

// Listar eventos
app.get(
  "/api/eventos",
  manejar(async (req, res) => {
    const r = await pool.query("SELECT * FROM eventos ORDER BY id");
    res.json(r.rows);
  })
);

// Crear evento
app.post(
  "/api/eventos",
  manejar(async (req, res) => {
    const {
      nombre,
      fecha,
      lugar,
      organizador,
      invitados,
      confirmados,
      minima,
      costo,
      pagoAnticipado,
    } = req.body;

    if (
      !nombre ||
      !fecha ||
      !lugar ||
      !organizador ||
      invitados === undefined ||
      minima === undefined ||
      costo === undefined
    ) {
      return res.status(400).json({ mensaje: "Faltan datos obligatorios del evento" });
    }

    const r = await pool.query(
      `INSERT INTO eventos (nombre, fecha, lugar, organizador, invitados, confirmados, minima, costo, pago_anticipado)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [
        nombre,
        fecha,
        lugar,
        organizador,
        invitados,
        confirmados || 0,
        minima,
        costo,
        Boolean(pagoAnticipado),
      ]
    );
    res.status(201).json(r.rows[0]);
  })
);

// Cambiar pendiente <-> realizado
app.patch(
  "/api/eventos/:id/estado",
  manejar(async (req, res) => {
    const r = await pool.query(
      "UPDATE eventos SET realizado = NOT realizado WHERE id = $1 RETURNING *",
      [req.params.id]
    );

    if (r.rows.length === 0) {
      return res.status(404).json({ mensaje: "Evento no encontrado" });
    }

    res.json(r.rows[0]);
  })
);

// Eliminar evento
app.delete(
  "/api/eventos/:id",
  manejar(async (req, res) => {
    const r = await pool.query("DELETE FROM eventos WHERE id = $1", [req.params.id]);

    if (r.rowCount === 0) {
      return res.status(404).json({ mensaje: "Evento no encontrado" });
    }

    res.sendStatus(204);
  })
);

// Manejador de errores (debe ir después de todas las rutas)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ mensaje: "Error en el servidor" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => console.log("Servidor en puerto " + PORT));