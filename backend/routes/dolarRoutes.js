// backend/routes/dolarRoutes.js
import express from "express";
import { obtenerTipoCambio } from "../controllers/cambiobcv.js";

const router = express.Router();

// GET /dolar
router.get("/", obtenerTipoCambio);

export default router;