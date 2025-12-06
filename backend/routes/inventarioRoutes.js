import express from "express";
import {
  listarInventario,
  obtenerInventarioPorId,
  crearInventario,
  actualizarInventario,
  eliminarInventario
} from "../controllers/inventarioController.js";

const router = express.Router();

router.get("/", listarInventario);
router.get("/:id", obtenerInventarioPorId);
router.post("/", crearInventario);
router.put("/:id", actualizarInventario);
router.delete("/:id", eliminarInventario);

export default router;