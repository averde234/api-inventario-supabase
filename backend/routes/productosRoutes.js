// routes/productos.routes.js
import { Router } from 'express';
import { 
  getProductos, 
  getProductoById, 
  createProducto, 
  updateProducto, 
  deleteProducto,
  getProductoByCodigo
} from '../controllers/productosController.js';

const router = Router();

router.get('/', getProductos);
router.get('/:id', getProductoById);
router.post('/', createProducto);
router.put('/:id', updateProducto);
router.delete('/:id', deleteProducto);
router.get('/codigo/:codigo', getProductoByCodigo);



export default router;