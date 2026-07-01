/**
 * cart.js — Persona 5
 * ---------------------------------------------------------------------------
 * Pantallas del flujo de checkout: Resumen -> Pago -> Compra exitosa.
 * Orquestado por checkout.js, que decide qué pantalla mostrar y le pasa
 * los callbacks de navegación.
 * ---------------------------------------------------------------------------
 */

import { obtenerAsientosSeleccionados } from "./seating.js";

// ============================================================================
// 1. CONFIGURACIÓN Y UTILIDADES (SESSION / FORMATTERS)
// ============================================================================

/**
 * Formatea un número de tarjeta agregando un espacio cada 4 dígitos.
 * @param {string} valor - Número de tarjeta crudo.
 * @returns {string} Número de tarjeta formateado.
 */
function formatearNumeroTarjeta(valor) {
    const digitos = valor.replace(/\D/g, "");
    const matches = digitos.match(/\d{1,4}/g);
    return matches ? matches.join(" ") : "";
}

/**
 * Formatea una fecha de vencimiento (MM/AA) agregando la barra diagonal correspondientemente.
 * @param {string} valor - Fecha cruda.
 * @returns {string} Fecha formateada.
 */
function formatearFechaVencimiento(valor) {
    const digitos = valor.replace(/\D/g, "");
    if (digitos.length >= 2) {
        const mes = digitos.substring(0, 2);
        const anio = digitos.substring(2, 4);
        return `${mes}/${anio}`;
    }
    return digitos;
}

/**
 * Cancela cualquier temporizador de expiración de reserva de asientos que
 * pudiera estar activo (placeholder para una futura funcionalidad de
 * "reserva temporal"). Hoy no hay ningún timer corriendo en la app, así
 * que se deja como no-op seguro para no romper las llamadas existentes.
 */
function limpiarExpiracion() {
    if (window.__ticketAppExpiracionTimeoutId) {
        clearTimeout(window.__ticketAppExpiracionTimeoutId);
        window.__ticketAppExpiracionTimeoutId = null;
    }
}

// ============================================================================
// 2. COMPONENTES COMUNES DEL DOM
// ============================================================================

/**
 * Renderiza el stepper de progreso (actualizado a 3 pasos).
 * @param {HTMLElement} contenedor - Contenedor principal.
 * @param {number} pasoActivo - Paso actual activo (1, 2 o 3).
 */
function renderizarStepper(contenedor, pasoActivo) {
    const stepperContainer = document.createElement("div");
    stepperContainer.classList.add("stepper-container");

    const line = document.createElement("div");
    line.classList.add("stepper-line");
    stepperContainer.appendChild(line);

    const progress = document.createElement("div");
    progress.classList.add("stepper-line-progress");
    const pct = ((pasoActivo - 1) / 2) * 100;
    progress.style.width = `${pct}%`;
    stepperContainer.appendChild(progress);

    const pasos = [
        { num: 1, label: "Resumen" },
        { num: 2, label: "Pago" },
        { num: 3, label: "Confirmación" }
    ];

    pasos.forEach((p) => {
        const stepDiv = document.createElement("div");
        stepDiv.classList.add("stepper-step");
        if (p.num === pasoActivo) {
            stepDiv.classList.add("active");
        } else if (p.num < pasoActivo) {
            stepDiv.classList.add("completed");
        }

        const circle = document.createElement("div");
        circle.classList.add("stepper-circle");

        if (p.num < pasoActivo) {
            circle.innerHTML = '<i class="bi bi-check-lg"></i>';
        } else {
            circle.textContent = String(p.num);
        }

        const label = document.createElement("div");
        label.classList.add("stepper-label");
        label.textContent = p.label;

        stepDiv.appendChild(circle);
        stepDiv.appendChild(label);
        stepperContainer.appendChild(stepDiv);
    });

    contenedor.appendChild(stepperContainer);
}

/**
 * Renderiza el encabezado del paso con el botón de volver atrás.
 * @param {HTMLElement} contenedor - Contenedor principal.
 * @param {string} tituloTxt - Título de la pantalla actual.
 * @param {Function} [onVolver] - Callback opcional al hacer clic en volver.
 */
function renderizarVolver(contenedor, tituloTxt, onVolver) {
    const headerDiv = document.createElement("div");
    headerDiv.classList.add("btn-volver-container");

    if (onVolver) {
        const btn = document.createElement("a");
        btn.href = "#";
        btn.classList.add("btn-volver");
        btn.innerHTML = '<i class="bi bi-chevron-left"></i>';
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            onVolver();
        });
        headerDiv.appendChild(btn);
    }

    const titleEl = document.createElement("h2");
    titleEl.classList.add("page-title");
    titleEl.textContent = tituloTxt;
    headerDiv.appendChild(titleEl);

    contenedor.appendChild(headerDiv);
}

/**
 * Renderiza la interfaz para cuando no hay asientos seleccionados.
 * @param {HTMLElement} contenedor - Contenedor principal.
 */
function renderizarEstadoVacio(contenedor) {
    limpiarExpiracion();

    const emptyContainer = document.createElement("div");
    emptyContainer.classList.add("empty-cart-container");

    emptyContainer.innerHTML = `
        <div class="empty-cart-icon-wrapper">
            <i class="bi bi-cart"></i>
        </div>
        <h2 class="empty-cart-title">Tu carrito está vacío</h2>
        <p class="empty-cart-subtitle">Todavía no seleccionaste ninguna entrada. Volvé al mapa del estadio y elegí tus asientos.</p>
        <div class="empty-cart-divider">
            <div class="empty-cart-divider-icon">
                <i class="bi bi-geo-alt-fill"></i>
            </div>
        </div>
        <div class="d-flex flex-column gap-3 align-items-center mb-4">
            <a href="partidos.html" class="btn-volver-mapa">
                <i class="bi bi-chevron-left"></i> Volver al mapa del estadio
            </a>
        </div>
        <div class="limits-card">
            <i class="bi bi-cart-dash-fill"></i>
            <div>
                Podés seleccionar hasta <b>4 entradas</b> por partido. Los asientos quedan reservados temporalmente mientras completás la compra.
            </div>
        </div>
    `;

    contenedor.appendChild(emptyContainer);
}

// ============================================================================
// 3. PANTALLAS DEL FLUJO DE PAGO (CHECKOUT SCREENS)
// ============================================================================

/**
 * PANTALLA 1: Resumen de Compra
 * @param {HTMLElement} contenedor - Contenedor principal.
 * @param {Function} onIrAPagar - Callback para avanzar a la pantalla de pago.
 * @param {Function} onVolver - Callback para regresar a la pantalla de sectores.
 * @param {{equipos: string, fechaHora: string, estadio: string} | null} [datosPartido] - Info del partido para el encabezado.
 */
export function renderizarResumen(contenedor, onIrAPagar, onVolver, datosPartido) {
    if (!contenedor) return;
    contenedor.innerHTML = "";

    const seleccionados = obtenerAsientosSeleccionados();

    // Si no hay asientos, mostrar estado vacío
    if (seleccionados.length === 0) {
        renderizarEstadoVacio(contenedor);
        return;
    }

    renderizarStepper(contenedor, 1);
    renderizarVolver(contenedor, "RESUMEN DE COMPRA", onVolver);

    // Agrupar entradas por sector
    const sectoresAgrupados = {};
    seleccionados.forEach((asiento) => {
        if (!sectoresAgrupados[asiento.sector]) {
            sectoresAgrupados[asiento.sector] = {
                asientos: [],
                subtotal: 0
            };
        }
        sectoresAgrupados[asiento.sector].asientos.push(asiento);
        sectoresAgrupados[asiento.sector].subtotal += asiento.precio;
    });

    const subtotalGral = seleccionados.reduce((sum, a) => sum + a.precio, 0);
    const cargoServicio = Math.round(subtotalGral * 0.1); // 10% Cargo por servicio
    const totalGral = subtotalGral + cargoServicio;

    // Tarjeta del Resumen
    const summaryCard = document.createElement("div");
    summaryCard.classList.add("match-summary-card");

    const headerHtml = `
        <div class="match-summary-header">
            <span class="match-teams">${datosPartido?.equipos || "Partido"}</span>
            <span class="match-date-location">${datosPartido?.fechaHora || ""}${datosPartido?.estadio ? ` · ${datosPartido.estadio}` : ""}</span>
        </div>
    `;
    let bodyHtml = `<div class="match-summary-body">`;

    Object.keys(sectoresAgrupados).forEach((sectorName) => {
        const grupo = sectoresAgrupados[sectorName];
        const entradasTexto = grupo.asientos.length === 1 ? "1 entrada" : `${grupo.asientos.length} entradas`;

        bodyHtml += `
            <div class="summary-sector-group">
                <div class="summary-sector-header">
                    <span>Sector ${sectorName}</span>
                    <span class="count-badge">${entradasTexto}</span>
                </div>
        `;

        grupo.asientos.forEach((asiento) => {
            bodyHtml += `
                <div class="summary-seat-row">
                    <span class="summary-seat-desc">Fila ${asiento.fila} · Butaca ${asiento.numero}</span>
                    <span class="summary-seat-price">$${asiento.precio.toLocaleString("es-AR")}</span>
                </div>
            `;
        });

        bodyHtml += `
                <div class="summary-sector-subtotal">
                    <span>Subtotal Sector ${sectorName}</span>
                    <span>$${grupo.subtotal.toLocaleString("es-AR")}</span>
                </div>
            </div>
        `;
    });

    // Fila del cargo por servicio y Total
    bodyHtml += `
        <div class="summary-charge-row">
            <span class="summary-charge-label">Cargo por servicio</span>
            <span class="summary-charge-val">$${cargoServicio.toLocaleString("es-AR")}</span>
        </div>
        <div class="summary-total-row">
            <span class="summary-total-label">TOTAL</span>
            <span class="summary-total-val">$${totalGral.toLocaleString("es-AR")}</span>
        </div>
    </div>`;

    summaryCard.innerHTML = headerHtml + bodyHtml;
    contenedor.appendChild(summaryCard);

    // Botón de acción principal
    const footerDiv = document.createElement("div");
    footerDiv.classList.add("clearfix", "mt-4");
    footerDiv.innerHTML = `
        <button id="btn-ir-al-pago" class="btn-primary-action">
            Ir al pago <i class="bi bi-arrow-right"></i>
        </button>
    `;
    footerDiv.querySelector("#btn-ir-al-pago").addEventListener("click", onIrAPagar);
    contenedor.appendChild(footerDiv);
}

/**
 * PANTALLA 2: Formulario de Datos de Pago con Tarjeta Interactiva
 * @param {HTMLElement} contenedor - Contenedor principal.
 * @param {Function} onConfirmarCompra - Callback ejecutado con los datos de compra.
 * @param {Function} onVolver - Callback para regresar al resumen.
 * @param {string} [idPartido] - ID del partido, para dejarlo registrado en la orden.
 */
export function renderizarFormularioPago(contenedor, onConfirmarCompra, onVolver, idPartido) {
    if (!contenedor) return;
    contenedor.innerHTML = "";

    const seleccionados = obtenerAsientosSeleccionados();
    const subtotalGral = seleccionados.reduce((sum, a) => sum + a.precio, 0);
    const cargoServicio = Math.round(subtotalGral * 0.1);
    const totalGral = subtotalGral + cargoServicio;

    renderizarStepper(contenedor, 2);
    renderizarVolver(contenedor, "DATOS DE PAGO", onVolver);

    const layout = document.createElement("div");
    layout.classList.add("payment-layout");

    // Tarjeta gráfica interactiva (Previsualización)
    const cardGraphic = document.createElement("div");
    cardGraphic.classList.add("card-graphic-wrapper");
    cardGraphic.innerHTML = `
        <div class="credit-card-mock" id="credit-card-mock">
            <div class="card-mock-chip">
                <i class="bi bi-credit-card-2-front"></i>
            </div>
            <div class="card-mock-number" id="mock-number">•••• •••• •••• ••••</div>
            <div class="card-mock-bottom">
                <div>
                    <div class="card-mock-label">Titular</div>
                    <div class="card-mock-value" id="mock-name">Nombre Apellido</div>
                </div>
                <div>
                    <div class="card-mock-label">Vence</div>
                    <div class="card-mock-value" id="mock-expiry">MM/AA</div>
                </div>
            </div>
        </div>
    `;
    layout.appendChild(cardGraphic);

    // Formulario de Pago
    const form = document.createElement("form");
    form.classList.add("payment-form-container");
    form.innerHTML = `
        <div class="form-group-custom">
            <label for="pago-nombre">Nombre del titular</label>
            <input type="text" id="pago-nombre" class="input-custom" placeholder="Como figura en la tarjeta" required />
        </div>
        <div class="form-group-custom">
            <label for="pago-tarjeta">Número de tarjeta</label>
            <input type="text" id="pago-tarjeta" class="input-custom" placeholder="0000 0000 0000 0000" maxlength="19" required />
        </div>
        <div class="row">
            <div class="col-6">
                <div class="form-group-custom">
                    <label for="pago-exp">Vencimiento</label>
                    <input type="text" id="pago-exp" class="input-custom" placeholder="MM/AA" maxlength="5" required />
                </div>
            </div>
            <div class="col-6">
                <div class="form-group-custom">
                    <label for="pago-cvv">CVV</label>
                    <input type="password" id="pago-cvv" class="input-custom" placeholder="•••" maxlength="3" required />
                </div>
            </div>
        </div>
        <div class="secure-ssl-text">
            <i class="bi bi-lock-fill"></i>
            <span>Tus datos están protegidos con cifrado SSL de 256 bits</span>
        </div>
        <button type="submit" id="btn-finalizar" class="btn-pago-wide">
            Confirmar pago
        </button>
    `;

    // Vinculación de eventos e inputs de tarjeta interactiva
    const inputNombre = form.querySelector("#pago-nombre");
    const inputTarjeta = form.querySelector("#pago-tarjeta");
    const inputExp = form.querySelector("#pago-exp");

    const mockNombre = cardGraphic.querySelector("#mock-name");
    const mockTarjeta = cardGraphic.querySelector("#mock-number");
    const mockExp = cardGraphic.querySelector("#mock-expiry");

    // Nombre
    inputNombre.addEventListener("input", (e) => {
        const val = e.target.value;
        mockNombre.textContent = val.trim() !== "" ? val : "Nombre Apellido";
    });

    // Formatear número de tarjeta en tiempo real
    inputTarjeta.addEventListener("input", (e) => {
        const valorLimpio = e.target.value.substring(0, 19);
        const formatted = formatearNumeroTarjeta(valorLimpio);
        e.target.value = formatted;

        const pad = "•••• •••• •••• ••••";
        const totalLen = formatted.length;
        mockTarjeta.textContent = totalLen > 0
            ? formatted + pad.substring(totalLen)
            : pad;
    });

    // Formatear fecha de vencimiento en tiempo real
    inputExp.addEventListener("input", (e) => {
        const formatted = formatearFechaVencimiento(e.target.value);
        e.target.value = formatted;
        mockExp.textContent = formatted.trim() !== "" ? formatted : "MM/AA";
    });

    // Evento submit de pago
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const btn = form.querySelector("#btn-finalizar");
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status"></span> Procesando pago...';

        const datosCompraMock = {
            monto_total: totalGral,
            id_partido: idPartido || null,
            id_usuario: localStorage.getItem("currentUser") || null,
            asientos_comprados: seleccionados.map((a) => a.idAsiento)
        };

        limpiarExpiracion();

        // Pequeño delay para simular el procesamiento del pago.
        setTimeout(() => onConfirmarCompra(datosCompraMock), 900);
    });

    layout.appendChild(form);
    contenedor.appendChild(layout);
}

// ============================================================================
// 4. CONFIRMACIÓN Y COMPRA EXITOSA
// ============================================================================

/**
 * PANTALLA 3: Compra Exitosa (Confirmación)
 * @param {HTMLElement} contenedor - Contenedor principal.
 * @param {string} numeroOrden - Número de orden de la compra efectuada (C-XXXXX).
 */
export function renderizarCompraExitosa(contenedor, numeroOrden) {
    if (!contenedor) return;
    contenedor.innerHTML = "";

    renderizarStepper(contenedor, 3);

    const successDiv = document.createElement("div");
    successDiv.classList.add("success-container");

    successDiv.innerHTML = `
        <div class="success-icon-wrapper">
            <i class="bi bi-check-lg"></i>
        </div>
        <h1 class="success-title">¡COMPRA EXITOSA!</h1>
        <p class="success-subtitle">Tu pago fue procesado correctamente. Ya podés disfrutar del partido.</p>

        <div class="order-number-box">
            <div class="order-number-label">Número de orden</div>
            <div class="order-number-val">${numeroOrden}</div>
            <div class="order-number-note">Guardá este número para tus registros</div>
        </div>

        <a href="home.html" class="btn-success-home">Volver al inicio</a>
        <div class="success-email-note">Recibirás una confirmación en tu correo electrónico</div>
    `;

    contenedor.appendChild(successDiv);

    // Limpieza de estados en localStorage: la compra ya se concretó,
    // no debe quedar ninguna selección de asientos "colgada".
    localStorage.removeItem("ticketapp_asientos_seleccionados");
}
