import express from 'express';
import {
  registrarVenta,
  getVentas,
  getVentaPorId,
  actualizarVenta,
  eliminarVenta
} from '../controllers/ventaController.js';

const router = express.Router();

// Registrar nueva venta
router.post('/nuevo', registrarVenta);

// Listar todas las ventas
router.get('/', getVentas);

// Obtener venta por ID
router.get('/:id', getVentaPorId);

// Actualizar venta
router.put('/:id', actualizarVenta);

// Eliminar venta
router.delete('/:id', eliminarVenta);

export default router;
