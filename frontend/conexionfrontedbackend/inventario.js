const API_URL = "http://localhost:5000";
const tbody = document.getElementById("tbody-productos");
const modal = new bootstrap.Modal(document.getElementById("detalleInventarioModal"));
const modalBody = document.getElementById("modal-body-inventario");
const precioDolarElement = document.getElementById("precio-dolar");

let precioDolarActual = null;

// 🔹 Cargar precio del dólar
async function cargarPrecioDolar() {
  try {
    const response = await fetch(`${API_URL}/dolar`);
    const data = await response.json();
    const precio = data?.current?.usd ?? data?.usd ?? null;

    if (precio) {
      precioDolarActual = precio;
      precioDolarElement.textContent = precio.toLocaleString("es-VE", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }) + " $";
    } else {
      precioDolarElement.textContent = "N/D";
    }
  } catch (error) {
    console.error("Error cargando precio del dólar:", error);
    precioDolarElement.textContent = "Error";
  }
}

// 🔹 Traer inventario y mostrar solo el registro con ID más alto por código de barra
// 🔹 Cantidad se suma
async function cargarInventario() {
  try {
    const response = await fetch(`${API_URL}/inventario`);
    const inventario = await response.json();

    tbody.innerHTML = "";

    // 🔹 Agrupar por código de barra
    const agrupado = {};

    inventario.forEach(item => {
      const codigo = item.productos?.codigo_barra ?? "N/D";

      if (!agrupado[codigo]) {
        agrupado[codigo] = { ...item };
      } else {
        // Sumar cantidades
        agrupado[codigo].cantidad += item.cantidad;
        agrupado[codigo].total_usd += item.total_usd;
        agrupado[codigo].ganancia_usd += item.ganancia_usd;

        // Mantener los datos de ID más alto
        if (item.id > agrupado[codigo].id) {
          agrupado[codigo] = { ...item, cantidad: agrupado[codigo].cantidad }; // conservar sumatoria cantidad
        }
      }
    });

    // 🔹 Renderizar tabla principal con los últimos registros
    Object.values(agrupado).forEach(item => {
      const precioUnidadBs = precioDolarActual ? item.precio_unidad_usd * precioDolarActual : null;

      const fila = document.createElement("tr");
      fila.innerHTML = `
        <!-- ID oculto, se usa solo internamente -->
        <!--<td>${item.id}</td>-->

        <td>${item.productos?.codigo_barra ?? "N/D"}</td>
        <td>
          <a href="#" onclick="mostrarDetalle(${item.id})" class="fw-bold text-dark text-decoration-none">
            ${item.productos?.descripcion ?? "Sin descripción"}
          </a>
        </td>
        <td>${item.cantidad}</td>
        <td>${precioUnidadBs ? precioUnidadBs.toLocaleString("es-VE", { minimumFractionDigits: 2 }) + " Bs" : "N/D"}</td>
        <td>${item.precio_unidad_usd?.toLocaleString("es-VE", { minimumFractionDigits: 2 })} $</td>
      `;
      tbody.appendChild(fila);
    });

  } catch (error) {
    console.error("Error cargando inventario:", error);
  }
}

// 🔹 Mostrar detalle en modal con cálculo en Bs
async function mostrarDetalle(id) {
  try {
    const response = await fetch(`${API_URL}/inventario/${id}`);
    const item = await response.json();

    if (!precioDolarActual) {
      console.warn("Precio del dólar no disponible. Los valores en Bs no se calcularán.");
    }

    // 🔹 Calcular precios en Bs
    const precio_entrada_bs = precioDolarActual ? item.precio_entrada_usd * precioDolarActual : null;
    const precio_salida_bs = precioDolarActual ? item.precio_salida_usd * precioDolarActual : null;
    const precio_unidad_bs = precioDolarActual ? item.precio_unidad_usd * precioDolarActual : null;
    const ganancia_bs = precioDolarActual ? item.ganancia_usd * precioDolarActual : null;
    const total_bs = precioDolarActual ? item.total_usd * precioDolarActual : null;

    modalBody.innerHTML = `
      <p><strong>Código de barra:</strong> ${item.productos?.codigo_barra ?? "N/D"}</p>
      <p><strong>Descripción:</strong> ${item.productos?.descripcion ?? "N/D"}</p>
      
      <hr>
      <h5>USD</h5>
      <p><strong>Cantidad:</strong> ${item.cantidad}</p>
      <p><strong>Precio entrada:</strong> ${item.precio_entrada_usd} $</p>
      <p><strong>Precio salida:</strong> ${item.precio_salida_usd} $</p>
      <p><strong>Precio por unidad:</strong> ${item.precio_unidad_usd} $</p>
      <p><strong>Ganancia:</strong> ${item.ganancia_usd} $ (${item.porcentaje_ganancia}%)</p>

      <hr>
      <h5>Bs</h5>
      <p><strong>Precio entrada:</strong> ${precio_entrada_bs?.toLocaleString("es-VE", { minimumFractionDigits: 2 }) ?? "N/D"} Bs</p>
      <p><strong>Precio salida:</strong> ${precio_salida_bs?.toLocaleString("es-VE", { minimumFractionDigits: 2 }) ?? "N/D"} Bs</p>
      <p><strong>Precio por unidad:</strong> ${precio_unidad_bs?.toLocaleString("es-VE", { minimumFractionDigits: 2 }) ?? "N/D"} Bs</p>
      <p><strong>Ganancia:</strong> ${ganancia_bs?.toLocaleString("es-VE", { minimumFractionDigits: 2 }) ?? "N/D"} Bs (${item.porcentaje_ganancia}%)</p>
    `;

    modal.show();
  } catch (error) {
    console.error("Error mostrando detalle:", error);
  }
}

// 🔹 Ejecutar al cargar
(async () => {
  await cargarPrecioDolar();
  await cargarInventario();
})();
