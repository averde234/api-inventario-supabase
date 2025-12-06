import { supabase } from '../config.js';

export async function getUsuarios(req, res) {
  try {
    const { data, error } = await supabase.from('usuarios').select('*');
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function crearUsuario(req, res) {
  try {
    const { id, email, nombre_apellido, rol } = req.body;
    const { data, error } = await supabase
      .from('usuarios')
      .insert([{ id, email, nombre_apellido, rol }])
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function actualizarUsuario(req, res) {
  try {
    const { id } = req.params;
    const { nombre_apellido, rol, activo } = req.body;
    const { data, error } = await supabase
      .from('usuarios')
      .update({ nombre_apellido, rol, activo })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function eliminarUsuario(req, res) {
  try {
    const { id } = req.params;
    const { data, error } = await supabase.from('usuarios').delete().eq('id', id);
    if (error) throw error;
    res.json({ message: 'Usuario eliminado', data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
