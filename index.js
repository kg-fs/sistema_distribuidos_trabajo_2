require('dotenv').config();
const express = require("express");
const os = require("os");
const { createClient } = require("@supabase/supabase-js");

const app = express();
const PORT = process.env.PORT || 3000;

// 🔐 Conexión a Supabase usando variables de entorno
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// 📌 Ruta base
app.get("/", (req, res) => {
  res.json({
    message: "API HA funcionando 🚀"
  });
});

// 📊 Estado del servidor (clave para HA)
app.get("/status", (req, res) => {
  res.json({
    status: "OK",
    server: os.hostname(),
    timestamp: new Date()
  });
});

// 💻 Información del sistema
app.get("/info", (req, res) => {
  res.json({
    hostname: os.hostname(),
    uptime: os.uptime(),
    platform: os.platform()
  });
});

// 🗄️ Obtener notas desde Supabase
app.get("/notes", async (req, res) => {
  const { data, error } = await supabase
    .from("Notes")
    .select("*");

  if (error) {
    return res.status(500).json({
      error: error.message
    });
  }

  res.json({
    server: os.hostname(),
    notes: data
  });
});

// 🚀 Levantar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});