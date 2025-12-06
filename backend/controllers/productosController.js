// controllers/productosController.js
import supabase from '../../db/supabase.js';

// Obtener todos los productos con paginación y filtros
export const getProductos = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const search = (req.query.search || '').trim();
  const categoriaId = req.query.categoria_id || '';

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from('productos')
    .select('*', { count: 'exact' })
    .order('id', { ascending: true });

  if (categoriaId) {
    query = query.eq('categoria_id', categoriaId);
  }

  if (search) {
    query = query.ilike('descripcion', `%${search}%`);
  }

  const { data, error, count } = await query.range(from, to);

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json({
    productos: data,
    total: count,
    page,
    limit,
    totalPages: Math.ceil(count / limit)
  });
};

// Obtener producto por ID
export const getProductoById = async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('productos')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return res.status(404).json({ error: error.message });
  }
  res.json(data);
};

export const getProductoByCodigo = async (req, res) => {
  const { codigo } = req.params;
  const { data, error } = await supabase
    .from('productos')
    .select('*')
    .eq('codigo_barra', codigo)
    .single();

  if (error || !data) {
    return res.status(404).json({ error: 'Producto no encontrado' });
  }
  res.json(data);
};



// Crear producto
export const createProducto = async (req, res) => {
  const producto = req.body;

  const { data, error } = await supabase
    .from('productos')
    .insert([producto]) // 👈 insert como array
    .select()
    .single(); // 👈 devuelve objeto único

  if (error) {
    console.error("Error Supabase:", error);
    return res.status(500).json({ error: error.message });
  }

  res.json(data); // 👈 responde con el objeto completo
};



// Actualizar producto
export const updateProducto = async (req, res) => {
  const { id } = req.params;
  const { codigo_barra, descripcion, categoria_id } = req.body;

  const { data, error } = await supabase
    .from('productos')
    .update({ codigo_barra, descripcion, categoria_id })
    .eq('id', id)
    .select();

  if (error) {
    return res.status(400).json({ error: error.message });
  }
  res.json(data);
};

// Eliminar producto
export const deleteProducto = async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from('productos').delete().eq('id', id);

  if (error) {
    return res.status(400).json({ error: error.message });
  }
  res.json({ message: 'Producto eliminado correctamente' });
};