import { supabase } from '../config.js';

// Registrar nueva compra
export const registrarCompra = async (req, res) => {
  const { proveedor_id, detalles } = req.body; // detalles = [{ producto_id, cantidad, precio_entrada_usd }]
  try {
    // 1️Calcular totales
    let total_usd = 0;
    let total_bs = 0;
    const tasa_bs = 25; 

    const detallesConSubtotales = detalles.map(item => {
      const subtotal_usd = item.precio_entrada_usd * item.cantidad;
      const subtotal_bs = subtotal_usd * tasa_bs;
      total_usd += subtotal_usd;
      total_bs += subtotal_bs;
      return { ...item, subtotal_usd, subtotal_bs };
    });

    // 2️ Insertar encabezado
    const { data: compraData, error: errorEncabezado } = await supabase
      .from('compra_encabezado')
      .insert([{ proveedor_id, total_usd, total_bs }])
      .select()
      .single();
    if (errorEncabezado) throw errorEncabezado;

    const compra_id = compraData.id;

    // 3️nsertar detalles y actualizar inventario
    for (const item of detallesConSubtotales) {
      // Insertar detalle
      const { error: errorDetalle } = await supabase
        .from('compra_detalle')
        .insert([{
          compra_id,
          producto_id: item.producto_id,
          cantidad: item.cantidad,
          precio_entrada_usd: item.precio_entrada_usd,
          precio_entrada_bs: item.precio_entrada_usd * tasa_bs,
          precio_final_usd: item.precio_entrada_usd,
          precio_final_bs: item.precio_entrada_usd * tasa_bs,
          subtotal_usd: item.subtotal_usd,
          subtotal_bs: item.subtotal_bs
        }]);
      if (errorDetalle) throw errorDetalle;

      // Actualizar inventario
      const { data: inventarioExistente } = await supabase
        .from('inventario')
        .select('*')
        .eq('producto_id', item.producto_id)
        .single();

      if (inventarioExistente) {
        // Actualizar stock y precios
        const nuevoStock = inventarioExistente.stock + item.cantidad;
        await supabase
          .from('inventario')
          .update({
            stock: nuevoStock,
            precio_usd: item.precio_entrada_usd,
            precio_bs: item.precio_entrada_usd * tasa_bs,
            precio_venta_usd: item.precio_entrada_usd * 1.2, // margen 20% por defecto
            precio_venta_bs: item.precio_entrada_usd * 1.2 * tasa_bs
          })
          .eq('producto_id', item.producto_id);
      } else {
        // Crear nuevo registro en inventario
        await supabase
          .from('inventario')
          .insert([{
            producto_id: item.producto_id,
            stock: item.cantidad,
            precio_usd: item.precio_entrada_usd,
            precio_bs: item.precio_entrada_usd * tasa_bs,
            margen_porcentaje: 20,
            precio_venta_usd: item.precio_entrada_usd * 1.2,
            precio_venta_bs: item.precio_entrada_usd * 1.2 * tasa_bs
          }]);
      }
    }

    res.status(201).json({ compra: compraData, detalles: detallesConSubtotales });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al registrar compra' });
  }
};

// Listar todas las compras
export const getCompras = async (req, res) => {
  try {
    const { data, error } = await supabase.from('compra_encabezado').select('*');
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener compras' });
  }
};

// Obtener compra por ID
export const getCompraPorId = async (req, res) => {
  const { id } = req.params;
  try {
    const { data, error } = await supabase
      .from('compra_encabezado')
      .select('*')
      .eq('id', id)
      .single();
    if (error) return res.status(404).json({ message: 'Compra no encontrada' });
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al obtener compra' });
  }
};

// Actualizar compra
export const actualizarCompra = async (req, res) => {
  const { id } = req.params;
  const { proveedor_id, total_usd, total_bs } = req.body;
  try {
    const { data, error } = await supabase
      .from('compra_encabezado')
      .update({ proveedor_id, total_usd, total_bs })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al actualizar compra' });
  }
};

// Eliminar compra
export const eliminarCompra = async (req, res) => {
  const { id } = req.params;
  try {
    // Primero eliminar detalles
    const { error: errorDetalles } = await supabase
      .from('compra_detalle')
      .delete()
      .eq('compra_id', id);
    if (errorDetalles) throw errorDetalles;

    // Luego eliminar encabezado
    const { error: errorEncabezado } = await supabase
      .from('compra_encabezado')
      .delete()
      .eq('id', id);
    if (errorEncabezado) throw errorEncabezado;

    res.json({ message: 'Compra eliminada' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al eliminar compra' });
  }
};
