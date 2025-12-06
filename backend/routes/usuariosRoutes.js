import { Router } from 'express';
import {
  getUsuarios,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario
} from '../controllers/usuariosController.js';

const router = Router();

// Listar todos los usuarios
router.get('/', getUsuarios);

// Crear nuevo usuario
router.post('/nuevo', crearUsuario);

// Actualizar usuario
router.put('/:id', actualizarUsuario);

// Eliminar usuario
router.delete('/:id', eliminarUsuario);

export default router;
