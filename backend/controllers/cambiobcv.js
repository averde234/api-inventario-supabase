// backend/controllers/dolarController.js
import fetch from "node-fetch";

// Obtener tipo de cambio desde la API externa
export const obtenerTipoCambio = async (req, res) => {
  try {
    const response = await fetch("https://api.dolarvzla.com/public/exchange-rate");
    if (!response.ok) {
      throw new Error("Error al consultar la API de DólarVzla");
    }

    const data = await response.json();
    res.json(data); // ✅ devolvemos la respuesta tal cual
  } catch (error) {
    console.error("Error en obtenerTipoCambio:", error);
    res.status(500).json({ message: "Error al obtener tipo de cambio" });
  }
};