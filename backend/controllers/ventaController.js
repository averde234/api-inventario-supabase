import { supabase } from '../config.js';

// Registrar nueva venta
export const registrarVenta = async (req, res) => {
  const { cliente_id, vendedor_id, detalles } = req.body; // detalles = [{ producto_id, cantidad, precio_unitario_usd }]
  try {
    let total_usd = 0;
    let total_bs = 0;
    const tasa_bs = 25; // dummy, luego reemplazar con tasa real

    const detallesConSubtotales = detalles.map(item => {
      const subtotal_usd = item.precio_unitario_usd * item.cantidad;
      const subtotal_bs = subtotal_usd * tasa_bs;
      total_usd += subtotal_usd;
      total_bs += subtotal_bs;
      return { ...item, subtotal_usd, subtotal_bs };
    });

    // Insertar encabezado
    const { data: ventaData, error: errorEncabezado } = await supabase
      .from('venta_encabezado')
      .insert([{ cliente_id, vendedor_id, total_usd, total_bs }])
      .select()
      .single();
    if (errorEncabezado) throw errorEncabezado;

    const venta_id = ventaData.id;

    // Insertar detalles y actualizar inventario
    for (const item of detallesConSubtotales) {
      // Insertar detalle
      const { error: errorDetalle } = await supabase
        .from('venta_detalle')
        .insert([{
          venta_id,
          producto_id: item.producto_id,
          cantidad: item.cantidad,
          precio_unitario_usd: item.precio_unitario_usd,
          precio_unitario_bs: item.precio_unitario_usd * tasa_bs,
          subtotal_usd: item.subtotal_usd,
          subtotal_bs: item.subtotal_bs
        }]);
      if (errorDetalle) throw errorDetalle;

      // Actualizar stock inventario
      const { data: inventarioExistente } = await supabase
        .from('inventario')
        .select('*')
        .eq('producto_id', item.producto_id)
        .single();

      if (inventarioExistente) {
        const nuevoStock = inventarioExistente.stock - item.cantidad;
        await supabase
          .from('inventario')
          .update({ stock: nuevoStock })
          .eq('producto_id', item.producto_id);
      }
    }

    res.status(201).json({ venta: ventaData, detalles: detallesConSubtotales });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al registrar venta' });
  }
};

// Listar todas las ventas
export const getVentas = async (req, res) => {
  try {
    const { data, error } = await supabase.from('venta_encabezado').select('*, venta_detalle(*)');
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener ventas' });
  }
};

// Obtener venta por ID
export const getVentaPorId = async (req, res) => {
  const { id } = req.params;
  try {
    const { data, error } = await supabase
      .from('venta_encabezado')
      .select('*, venta_detalle(*)')
      .eq('id', id)
      .single();
    if (error) return res.status(404).json({ message: 'Venta no encontrada' });
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener venta' });
  }
};

// Actualizar venta
export const actualizarVenta = async (req, res) => {
  const { id } = req.params;
  const { cliente_id, vendedor_id, total_usd, total_bs } = req.body;
  try {
    const { data, error } = await supabase
      .from('venta_encabezado')
      .update({ cliente_id, vendedor_id, total_usd, total_bs })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al actualizar venta' });
  }
};

// Eliminar venta
export const eliminarVenta = async (req, res) => {
  const { id } = req.params;
  try {
    // Eliminar detalles primero
    const { error: errorDetalles } = await supabase
      .from('venta_detalle')
      .delete()
      .eq('venta_id', id);
    if (errorDetalles) throw errorDetalles;

    // Luego eliminar encabezado
    const { error: errorEncabezado } = await supabase
      .from('venta_encabezado')
      .delete()
      .eq('id', id);
    if (errorEncabezado) throw errorEncabezado;

    res.json({ message: 'Venta eliminada' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al eliminar venta' });
  }
};
