require('dotenv').config();
const express = require("express");
const os = require("os");
const { createClient } = require("@supabase/supabase-js");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// ==================== RUTAS ====================

app.get("/", (req, res) => {
  res.json({
    message: "API HA funcionando 🚀",
    server: os.hostname()
  });
});

app.get("/status", (req, res) => {
  res.json({
    status: "OK",
    server: os.hostname(),
    timestamp: new Date().toISOString()
  });
});

// ==================== CRUD DE NOTES ====================

// 1. Crear una nueva nota (POST)
app.post("/notes", async (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ 
      error: "El campo 'text' es obligatorio" 
    });
  }

  const { data, error } = await supabase
    .from("Notes")
    .insert([{ text }])
    .select();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.status(201).json({
    message: "Nota creada exitosamente",
    server: os.hostname(),
    note: data[0]
  });
});

// 2. Obtener todas las notas (GET)
app.get("/notes", async (req, res) => {
  const { data, error } = await supabase
    .from("Notes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json({
    server: os.hostname(),
    count: data.length,
    notes: data
  });
});

// 3. Obtener una nota por ID
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

// 4. Actualizar una nota (PUT)
app.put("/notes/:id", async (req, res) => {
  const { id } = req.params;
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: "El campo 'text' es obligatorio" });
  }

  const { data, error } = await supabase
    .from("Notes")
    .update({ text })
    .eq("id", id)
    .select();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  if (data.length === 0) {
    return res.status(404).json({ error: "Nota no encontrada" });
  }

  res.json({
    message: "Nota actualizada exitosamente",
    server: os.hostname(),
    note: data[0]
  });
});

// 5. Eliminar una nota (DELETE)
app.delete("/notes/:id", async (req, res) => {
  const { id } = req.params;

  const { error } = await supabase
    .from("Notes")
    .delete()
    .eq("id", id);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json({
    message: "Nota eliminada exitosamente",
    server: os.hostname()
  });
});

// Levantar servidor
app.listen(PORT, () => {
  console.log(`Servidor ${os.hostname()} corriendo en puerto ${PORT}`);
});