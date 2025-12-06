import supabase from '../../db/supabase.js';

// Obtener todas las categorías
export const getCategorias = async (req, res) => {
  const { data, error } = await supabase.from('categorias').select('*');
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
};

// Obtener una categoría por ID
export const getCategoriaById = async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase.from('categorias').select('*').eq('id', id).single();
  if (error) return res.status(404).json({ error: error.message });
  res.json(data);
};

// Crear nueva categoría
export const createCategoria = async (req, res) => {
  const { nombre } = req.body;
  const { data, error } = await supabase.from('categorias').insert([{ nombre }]).select();
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
};

// Actualizar categoría
export const updateCategoria = async (req, res) => {
  const { id } = req.params;
  const { nombre } = req.body;
  const { data, error } = await supabase.from('categorias').update({ nombre }).eq('id', id).select();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
};

// Eliminar categoría
export const deleteCategoria = async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from('categorias').delete().eq('id', id);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: 'Categoría eliminada correctamente' });
};