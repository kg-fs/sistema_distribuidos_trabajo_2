require('dotenv').config();
const express = require("express");
const os = require("os");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");

const app = express();
const PORT = process.env.PORT || 3000;

// ==================== MIDDLEWARE ====================
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// ==================== SUPABASE ====================
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// ==================== RUTAS ====================

app.get("/", (req, res) => {
  res.json({ message: "API funcionando 🚀", server: os.hostname() });
});

app.get("/status", (req, res) => {
  res.json({
    status: "OK",
    server: os.hostname(),
    timestamp: new Date().toISOString()
  });
});

// 1. Crear una nueva nota (POST) - Versión limpia
app.post("/notes", async (req, res) => {
  const { text } = req.body;

  if (!text || typeof text !== 'string' || text.trim() === '') {
    return res.status(400).json({ 
      error: "El campo 'text' es obligatorio y no puede estar vacío" 
    });
  }

  const { data, error } = await supabase
    .from("Notes")
    .insert([{ text: text.trim() }])   // Solo enviamos text
    .select()
    .single();

  if (error) {
    console.error("Error Supabase:", error);
    return res.status(500).json({ 
      error: error.message,
      details: error.details || error.hint || "Error en la base de datos"
    });
  }

  res.status(201).json({
    message: "Nota creada exitosamente",
    server: os.hostname(),
    note: data
  });
});

// 2. Obtener todas las notas
app.get("/notes", async (req, res) => {
  const { data, error } = await supabase
    .from("Notes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error al obtener notas:", error);
    return res.status(500).json({ error: error.message });
  }

  res.json({
    server: os.hostname(),
    count: data.length,
    notes: data
  });
});

// 3. Obtener nota por ID
app.get("/notes/:id", async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from("Notes")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    return res.status(404).json({ error: "Nota no encontrada" });
  }

  res.json({
    server: os.hostname(),
    note: data
  });
});

// 4. Actualizar nota
app.put("/notes/:id", async (req, res) => {
  const { id } = req.params;
  const { text } = req.body;

  if (!text || typeof text !== 'string' || text.trim() === '') {
    return res.status(400).json({ error: "El campo 'text' es obligatorio" });
  }

  const { data, error } = await supabase
    .from("Notes")
    .update({ text: text.trim() })
    .eq("id", id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: "Nota no encontrada" });

  res.json({
    message: "Nota actualizada exitosamente",
    server: os.hostname(),
    note: data
  });
});

// 5. Eliminar nota
app.delete("/notes/:id", async (req, res) => {
  const { id } = req.params;

  const { error } = await supabase
    .from("Notes")
    .delete()
    .eq("id", id);

  if (error) return res.status(500).json({ error: error.message });

  res.json({
    message: "Nota eliminada exitosamente",
    server: os.hostname()
  });
});

// ==================== INICIAR SERVIDOR ====================
app.listen(PORT, () => {
  console.log(`Servidor ${os.hostname()} corriendo en puerto ${PORT}`);
});