document.addEventListener("DOMContentLoaded", () => {
  const API_URL = "http://localhost:5000";

  // ELEMENTOS DEL FORMULARIO
  const codigoBarra = document.getElementById("codigoBarra");
  const buscarCodigo = document.getElementById("buscarCodigo");
  const productoInput = document.getElementById("producto");
  const proveedorSelect = document.getElementById("proveedor");
  const cantidadInput = document.getElementById("cantidad");
  const porcentajeInput = document.getElementById("porcentajeGanancia");
  const inputTasa = document.getElementById("tasa"); // Tasa interna opcional

  // BS
  const precioEntradaBs = document.getElementById("precioEntradaBs");
  const precioSalidaBs = document.getElementById("precioSalidaBs");
  const margenGananciaBs = document.getElementById("margenGananciaBs");
  const precioUnidadBs = document.getElementById("precioUnidadBs");

  // USD
  const precioEntradaUsd = document.getElementById("precioEntradaUsd");
  const precioSalidaUsd = document.getElementById("precioSalidaUsd");
  const margenGananciaUsd = document.getElementById("margenGananciaUsd");
  const precioUnidadUsd = document.getElementById("precioUnidadUsd");

  // Botones
  const btnGuardar = document.getElementById("guardarInventario");
  const btnLimpiar = document.getElementById("limpiar");

  // Tasa dólar
  const precioDolarLabel = document.getElementById("precio-dolar");
  let precioDolarActual = null;
  let inventarioId = null; // ID más alto del inventario

  // --- UTILIDADES ---
  function normalizarNumero(valor) {
    return parseFloat(valor.toString().replace(",", ".")) || 0;
  }

  function limpiarFormulario() {
    document.querySelectorAll("input").forEach(i => i.value = "");
    productoInput.dataset.id = "";
    proveedorSelect.selectedIndex = 0;
    inventarioId = null;
  }

  // --- CARGAR DÓLAR ---
  async function cargarPrecioDolar() {
    try {
      const res = await fetch(`${API_URL}/dolar`);
      const data = await res.json();
      precioDolarActual = data?.current?.usd ?? data?.usd ?? null;
      precioDolarLabel.textContent = precioDolarActual ? precioDolarActual.toFixed(2) : "N/D";
    } catch (error) {
      console.error("Error cargando dólar:", error);
      precioDolarLabel.textContent = "Error";
    }
  }

  // --- CARGAR PROVEEDORES ---
  async function cargarProveedores() {
    try {
      const res = await fetch(`${API_URL}/proveedores`);
      const proveedores = await res.json();
      proveedorSelect.innerHTML = "<option selected>Seleccione proveedor</option>";
      proveedores.forEach(p => {
        const opt = document.createElement("option");
        opt.value = p.id;
        opt.textContent = p.nombre;
        proveedorSelect.appendChild(opt);
      });
    } catch (error) {
      console.error("Error cargando proveedores:", error);
    }
  }

  // --- BUSCAR PRODUCTO Y TRAER INVENTARIO CON ID MÁS ALTO ---
  buscarCodigo.addEventListener("click", async () => {
    const codigo = codigoBarra.value.trim();
    if (!codigo) return;

    try {
      // Buscar producto
      const resProd = await fetch(`${API_URL}/productos/codigo/${codigo}`);
      if (!resProd.ok) {
        console.log("Producto no encontrado");
        inventarioId = null;
        productoInput.value = "";
        return;
      }
      const producto = await resProd.json();
      productoInput.value = producto.descripcion;
      productoInput.dataset.id = producto.id;

      // Traer inventario con ID más alto
      const resInv = await fetch(`${API_URL}/inventario/producto/${producto.id}?_sort=id&_order=desc&_limit=1`);
      if (!resInv.ok) {
        console.log("No se pudo obtener inventario");
        inventarioId = null;
        return;
      }

      const data = await resInv.json();
      if (data.length > 0) {
        const inv = data[0];
        inventarioId = inv.id;
        proveedorSelect.value = inv.proveedor.id;
        cantidadInput.value = inv.cantidad;
        porcentajeInput.value = inv.porcentaje_ganancia;
        precioEntradaUsd.value = inv.precio_entrada_usd;
        precioSalidaUsd.value = inv.precio_salida_usd;
        precioUnidadUsd.value = inv.precio_unidad_usd;
        margenGananciaUsd.value = inv.ganancia_usd;

        if (precioDolarActual) {
          precioEntradaBs.value = (inv.precio_entrada_usd * precioDolarActual).toFixed(2);
          precioSalidaBs.value = (inv.precio_salida_usd * precioDolarActual).toFixed(2);
          precioUnidadBs.value = (inv.precio_unidad_usd * precioDolarActual).toFixed(2);
          margenGananciaBs.value = (inv.ganancia_usd * precioDolarActual).toFixed(2);
        }
        console.log("Inventario cargado con ID más alto:", inventarioId);
      } else {
        inventarioId = null;
        console.log("No hay inventario existente, se puede crear uno nuevo");
      }
    } catch (error) {
      console.error("Error buscando producto/inventario:", error);
    }
  });

  // --- CÁLCULOS AUTOMÁTICOS ---
  function recalcular() {
    const cantidad = normalizarNumero(cantidadInput.value) || 0;
    const tasa = precioDolarActual || normalizarNumero(inputTasa.value) || 0;

    let pInBs = normalizarNumero(precioEntradaBs.value);
    let pInUsd = normalizarNumero(precioEntradaUsd.value);
    let pOutBs = normalizarNumero(precioSalidaBs.value);
    let pOutUsd = normalizarNumero(precioSalidaUsd.value);
    let margen = normalizarNumero(margenGananciaBs.value);

    if (document.activeElement === precioEntradaBs && tasa > 0) {
      precioEntradaUsd.value = (pInBs / tasa).toFixed(2);
    } else if (document.activeElement === precioEntradaUsd && tasa > 0) {
      precioEntradaBs.value = (pInUsd * tasa).toFixed(2);
    }

    pInBs = normalizarNumero(precioEntradaBs.value);
    pInUsd = normalizarNumero(precioEntradaUsd.value);

    if (document.activeElement === porcentajeInput) {
      const margenDecimal = (normalizarNumero(porcentajeInput.value) || 0) / 100;
      pOutBs = margenDecimal < 1 ? pInBs / (1 - margenDecimal) : 0;
      precioSalidaBs.value = pOutBs.toFixed(2);
      precioSalidaUsd.value = (pOutBs / tasa).toFixed(2);
      margen = pOutBs - pInBs;
      margenGananciaBs.value = margen.toFixed(2);
      margenGananciaUsd.value = (margen / tasa).toFixed(2);
    } else if (document.activeElement === precioSalidaBs) {
      margen = pOutBs - pInBs;
      margenGananciaBs.value = margen.toFixed(2);
      margenGananciaUsd.value = (margen / tasa).toFixed(2);
      precioSalidaUsd.value = (pOutBs / tasa).toFixed(2);
    } else if (document.activeElement === precioSalidaUsd) {
      pOutBs = pOutUsd * tasa;
      precioSalidaBs.value = pOutBs.toFixed(2);
      margen = pOutBs - pInBs;
      margenGananciaBs.value = margen.toFixed(2);
      margenGananciaUsd.value = (margen / tasa).toFixed(2);
    }

    if (cantidad > 0) {
      precioUnidadBs.value = (pOutBs / cantidad).toFixed(2);
      precioUnidadUsd.value = (pOutUsd / cantidad).toFixed(2);
    }
  }

  // --- EVENTOS DE ENTRADA ---
  cantidadInput.addEventListener("input", recalcular);
  precioEntradaBs.addEventListener("input", recalcular);
  precioEntradaUsd.addEventListener("input", recalcular);
  precioSalidaBs.addEventListener("input", recalcular);
  precioSalidaUsd.addEventListener("input", recalcular);
  porcentajeInput.addEventListener("input", recalcular);

  // --- LIMPIAR FORMULARIO ---
  btnLimpiar.addEventListener("click", limpiarFormulario);

  // --- INICIO ---
  (async () => {
    await cargarPrecioDolar();
    await cargarProveedores();
  })();
});
