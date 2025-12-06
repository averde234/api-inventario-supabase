import { supabase } from '../config.js';

export async function getClientes(req, res) {
  const { data, error } = await supabase.from('cliente').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
}

export async function crearCliente(req, res) {
  const { nombre, rif_ci, direccion, telefono } = req.body;
  const { data, error } = await supabase
    .from('cliente')
    .insert([{ nombre, rif_ci, direccion, telefono }])
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
}

export async function actualizarCliente(req, res) {
  const { id } = req.params;
  const { nombre, rif_ci, direccion, telefono } = req.body;
  const { data, error } = await supabase
    .from('cliente')
    .update({ nombre, rif_ci, direccion, telefono })
    .eq('id', id)
    .select()
    .single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
}

export async function eliminarCliente(req, res) {
  const { id } = req.params;
  const { data, error } = await supabase.from('cliente').delete().eq('id', id);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: 'Cliente eliminado', data });
}
