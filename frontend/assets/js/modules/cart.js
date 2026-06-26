import { obtenerAsientosSeleccionados, alternarSeleccionAsiento } from "./seating.js";

/**
 * PANTALLA 1: El Carrito de Compras 
 */
export function renderizarCarrito(contenedor, onIrAPagar) {
    if (!contenedor) return;
    contenedor.innerHTML = "";

    const seleccionados = obtenerAsientosSeleccionados();

    const titulo = document.createElement("h2");
    titulo.textContent = "Tu Carrito de Compras";
    contenedor.appendChild(titulo);

    if (seleccionados.length === 0) {
        const vacio = document.createElement("p");
        vacio.textContent = "El carrito está vacío. Volvé a la cartelera para elegir tus butacas.";
        contenedor.appendChild(vacio);
        return;
    }

    // Tabla sin clases de Bootstrap
    const tabla = document.createElement("table");
    tabla.border = "1"; // Atributo HTML clásico para ver los bordes

    // Cabecera estándar
    const thead = document.createElement("thead");
    thead.innerHTML = `
        <tr>
            <th>Sector</th>
            <th>Ubicación</th>
            <th>Precio</th>
            <th>Acción</th>
        </tr>
    `;
    tabla.appendChild(thead);

    const tbody = document.createElement("tbody");
    let total = 0;

    seleccionados.forEach((asiento) => {
        total += asiento.precio;
        const fila = document.createElement("tr");

        fila.innerHTML = `
            <td><b>${asiento.sector}</b></td>
            <td>Fila ${asiento.fila} - Asiento ${asiento.numero}</td>
            <td>$${asiento.precio}</td>
            <td>
                <button class="btn-quitar" data-id="${asiento.idAsiento}">Quitar</button>
            </td>
        `;

        fila.querySelector(".btn-quitar").addEventListener("click", () => {
            alternarSeleccionAsiento(asiento.idAsiento);
            renderizarCarrito(contenedor, onIrAPagar);
        });

        tbody.appendChild(fila);
    });

    tabla.appendChild(tbody);
    contenedor.appendChild(tabla);

    // Salto de línea estructural
    contenedor.appendChild(document.createElement("br"));

    // Contenedor de cierre plano
    const footer = document.createElement("div");
    footer.innerHTML = `
        <p><b>Total Acumulado: $${total}</b></p>
        <button id="btn-proceder">Proceder al Pago</button>
    `;

    footer.querySelector("#btn-proceder").addEventListener("click", onIrAPagar);
    contenedor.appendChild(footer);
}

/**
 * PANTALLA 2: Formulario de Datos de Pago (Inputs sin diseño)
 */
export function renderizarFormularioPago(contenedor, onConfirmarCompra) {
    if (!contenedor) return;
    contenedor.innerHTML = "";

    const seleccionados = obtenerAsientosSeleccionados();
    const total = seleccionados.reduce((sum, a) => sum + a.precio, 0);

    const titulo = document.createElement("h3");
    titulo.textContent = "Datos de Pago y Confirmación";
    contenedor.appendChild(titulo);

    const form = document.createElement("form");
    form.innerHTML = `
        <div>
            <label>Nombre del Titular:</label><br>
            <input type="text" required id="pago-nombre">
        </div>
        <br>
        <div>
            <label>Número de Tarjeta:</label><br>
            <input type="text" required id="pago-tarjeta">
        </div>
        <br>
        <div>
            <label>Vencimiento:</label><br>
            <input type="text" placeholder="MM/AA" required>
        </div>
        <br>
        <div>
            <label>Código de Seguridad (CVV):</label><br>
            <input type="password" maxlength="3" required>
        </div>
        <br>
        <button type="submit" id="btn-finalizar">
            Pagar $${total} y Finalizar Compra
        </button>
    `;

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const btn = form.querySelector("#btn-finalizar");
        btn.disabled = true;
        btn.textContent = "Procesando pago en el servidor (Simulado)...";

        const datosCompraMock = {
            monto_total: total,
            id_partido: "P01",
            id_usuario: "U002",
            asientos_comprados: seleccionados.map(a => a.idAsiento)
        };

        onConfirmarCompra(datosCompraMock);
    });

    contenedor.appendChild(form);
}

/**
 * PANTALLA 3: Compra Exitosa (Texto plano)
 */
export function renderizarCompraExitosa(contenedor, numeroOrden) {
    if (!contenedor) return;
    contenedor.innerHTML = "";

    const box = document.createElement("div");
    box.innerHTML = `
        <h1>¡Compra Confirmada con Éxito!</h1>
        <p>Tu orden ha sido registrada e impactada correctamente en el sistema.</p>
        <hr>
        <p style="font-size: 24px; color: green;">
            <b>Número de Orden: ${numeroOrden}</b> 
        </p>
        <p>Guardá este número para presentarlo en el acceso al Estadio Mario Alberto Kempes.</p>
    `;
    const btnVolver = document.createElement("a");
    btnVolver.href = "home.html"; // Redirección física al home del usuario
    btnVolver.classList.add("btn", "btn-primary", "btn-lg", "px-5", "fw-bold", "mt-3", "shadow-sm");
    btnVolver.textContent = "Volver al Inicio";

    box.appendChild(btnVolver);
    contenedor.appendChild(box);
}