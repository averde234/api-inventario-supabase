// Cargar variables de entorno ANTES de cualquier import
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";

// Importar la configuración de Supabase (que ahora también carga dotenv internamente)
import "./db/supabase.js";

import categoriasRoutes from "./backend/routes/categoriasRoutes.js";
import productosRoutes from "./backend/routes/productosRoutes.js";
import proveedorRoutes from "./backend/routes/proveedorRoutes.js";
import dolarRoutes from "./backend/routes/dolarRoutes.js";
import inventarioRoutes from "./backend/routes/inventarioRoutes.js";



const app = express();

app.use(cors());
app.use(express.json());

// Rutas
app.use("/categorias", categoriasRoutes);
app.use("/productos", productosRoutes);
app.use('/proveedores', proveedorRoutes);
app.use("/dolar", dolarRoutes);
app.use("/inventario", inventarioRoutes);





// Puerto del servidor
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
