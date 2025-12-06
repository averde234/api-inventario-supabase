import express from 'express';
import {
  registrarCompra,
  getCompras,
  getCompraPorId,
  actualizarCompra,
  eliminarCompra
} from '../controllers/compraController.js';

const router = express.Router();

// Registrar nueva compra
router.post('/nuevo', registrarCompra);

// Listar todas las compras
router.get('/', getCompras);

// Obtener compra por ID
router.get('/:id', getCompraPorId);

// Actualizar compra
router.put('/:id', actualizarCompra);

// Eliminar compra
router.delete('/:id', eliminarCompra);

export default router;
