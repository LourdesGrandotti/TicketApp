import { obtenerAsientosSeleccionados, alternarSeleccionAsiento } from "./seating.js";

// Variable global para limpiar el intervalo del temporizador
let timerIntervalId = null;

/**
 * Helper: Obtiene o inicializa la hora de expiración en sessionStorage (10 minutos)
 */
function obtenerOInicializarExpiracion() {
    let expiracion = sessionStorage.getItem("cart_expiry");
    if (!expiracion) {
        const ahora = Date.now();
        expiracion = ahora + 10 * 60 * 1000;
        sessionStorage.setItem("cart_expiry", expiracion.toString());
    }
    return parseInt(expiracion, 10);
}

/**
 * Helper: Limpia la hora de expiración del sessionStorage
 */
function limpiarExpiracion() {
    sessionStorage.removeItem("cart_expiry");
    if (timerIntervalId) {
        clearInterval(timerIntervalId);
        timerIntervalId = null;
    }
}

/**
 * Helper: Inicia el temporizador de cuenta regresiva
 */
function iniciarTimer(elementoTimer) {
    if (timerIntervalId) {
        clearInterval(timerIntervalId);
    }

    const expiracion = obtenerOInicializarExpiracion();

    function actualizar() {
        const ahora = Date.now();
        const restante = expiracion - ahora;

        if (restante <= 0) {
            elementoTimer.textContent = "00:00";
            clearInterval(timerIntervalId);
            return;
        }

        const minutos = Math.floor(restante / 60000);
        const segundos = Math.floor((restante % 60000) / 1000);
        const minStr = minutos.toString().padStart(2, "0");
        const segStr = segundos.toString().padStart(2, "0");
        elementoTimer.textContent = `${minStr}:${segStr}`;
    }

    actualizar();
    timerIntervalId = setInterval(actualizar, 1000);
}

/**
 * Helper: Renderiza el stepper de progreso de 4 pasos
 */
function renderizarStepper(contenedor, pasoActivo) {
    const stepperContainer = document.createElement("div");
    stepperContainer.classList.add("stepper-container");

    const line = document.createElement("div");
    line.classList.add("stepper-line");
    stepperContainer.appendChild(line);

    const progress = document.createElement("div");
    progress.classList.add("stepper-line-progress");
    const pct = ((pasoActivo - 1) / 3) * 100;
    progress.style.width = `${pct}%`;
    stepperContainer.appendChild(progress);

    const pasos = [
        { num: 1, label: "Entradas" },
        { num: 2, label: "Resumen" },
        { num: 3, label: "Pago" },
        { num: 4, label: "Confirmación" }
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
            circle.innerHTML = `<i class="bi bi-check-lg"></i>`;
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
 * Helper: Renderiza el encabezado del paso con el botón Volver
 */
function renderizarVolver(contenedor, tituloTxt, onVolver) {
    const headerDiv = document.createElement("div");
    headerDiv.classList.add("btn-volver-container");

    if (onVolver) {
        const btn = document.createElement("a");
        btn.href = "#";
        btn.classList.add("btn-volver");
        btn.innerHTML = `<i class="bi bi-chevron-left"></i>`;
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
 * PANTALLA 1: El Carrito de Compras (Entradas Seleccionadas)
 */
export function renderizarCarrito(contenedor, onIrAPagar) {
    if (!contenedor) return;
    contenedor.innerHTML = "";

    // Limpiar temporizadores viejos
    if (timerIntervalId) {
        clearInterval(timerIntervalId);
    }

    const seleccionados = obtenerAsientosSeleccionados();

    // Si no hay asientos, renderizar estado vacío según el PDF
    if (seleccionados.length === 0) {
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
                <button id="btn-simular" class="btn btn-outline-danger px-4 py-2" style="border-radius: 50px; font-weight: 700;">
                    ⚡ Simular Carga de Entradas (Prueba)
                </button>
            </div>
            <div class="limits-card">
                <i class="bi bi-cart-dash-fill"></i>
                <div>
                    Podés seleccionar hasta <b>4 entradas</b> por partido. Los asientos quedan reservados temporalmente mientras completás la compra.
                </div>
            </div>
        `;

        emptyContainer.querySelector("#btn-simular").addEventListener("click", () => {
            // Cargar entradas de prueba para la simulación
            const mockAsientos = ["P-A-1", "P-A-2", "P-B-5"];
            localStorage.setItem("ticketapp_asientos_seleccionados", JSON.stringify(mockAsientos));
            // Recargar el módulo
            window.location.reload();
        });

        contenedor.appendChild(emptyContainer);
        return;
    }

    // Stepper Paso 1
    renderizarStepper(contenedor, 1);

    // Título y Volver
    renderizarVolver(contenedor, "ENTRADAS SELECCIONADAS", () => {
        window.location.href = "partidos.html";
    });

    // Contenedor de la tabla / lista
    const listaContainer = document.createElement("div");
    
    // Encabezado de la tabla tipo grilla
    const tableHeader = document.createElement("div");
    tableHeader.classList.add("table-header-custom");
    tableHeader.innerHTML = `
        <div></div>
        <div>Sector</div>
        <div>Fila</div>
        <div>Butaca</div>
        <div>Precio</div>
        <div></div>
    `;
    listaContainer.appendChild(tableHeader);

    // Elementos de la lista
    seleccionados.forEach((asiento) => {
        const card = document.createElement("div");
        card.classList.add("ticket-card");

        // Identificador del sector (ej. Platea -> PL, Palco -> PA, etc.)
        const sectorLetra = asiento.idAsiento.split("-")[0] || asiento.sector.slice(0, 2).toUpperCase();
        
        card.innerHTML = `
            <div>
                <span class="ticket-sector-badge">${sectorLetra}</span>
            </div>
            <div class="ticket-sector-title">Sector ${asiento.sector}</div>
            <div class="ticket-cell-val">${asiento.fila}</div>
            <div class="ticket-cell-val">${asiento.numero}</div>
            <div class="ticket-price-val">$${asiento.precio.toLocaleString('es-AR')}</div>
            <div>
                <button class="btn-ticket-delete" title="Quitar Entrada">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
        `;

        card.querySelector(".btn-ticket-delete").addEventListener("click", () => {
            alternarSeleccionAsiento(asiento.idAsiento);
            renderizarCarrito(contenedor, onIrAPagar);
        });

        listaContainer.appendChild(card);
    });

    contenedor.appendChild(listaContainer);

    // Banner del temporizador
    const timerBanner = document.createElement("div");
    timerBanner.classList.add("timer-banner");
    timerBanner.innerHTML = `
        <div class="timer-banner-text">
            <i class="bi bi-shield-lock-fill"></i>
            <span>Tus asientos están reservados temporalmente. Completá la compra antes de que expire el tiempo.</span>
        </div>
        <div class="timer-banner-clock" id="timer-clock">10:00</div>
    `;
    contenedor.appendChild(timerBanner);
    
    // Iniciar temporizador regresivo real en el banner
    iniciarTimer(timerBanner.querySelector("#timer-clock"));

    // Botón Continuar
    const footerDiv = document.createElement("div");
    footerDiv.classList.add("clearfix", "mt-4");
    footerDiv.innerHTML = `
        <button id="btn-continuar" class="btn-primary-action">
            Continuar <i class="bi bi-arrow-right"></i>
        </button>
    `;
    footerDiv.querySelector("#btn-continuar").addEventListener("click", onIrAPagar);
    contenedor.appendChild(footerDiv);
}

/**
 * PANTALLA 2: Resumen de Compra
 */
export function renderizarResumen(contenedor, onIrAPagar, onVolver) {
    if (!contenedor) return;
    contenedor.innerHTML = "";

    const seleccionados = obtenerAsientosSeleccionados();

    // Stepper Paso 2
    renderizarStepper(contenedor, 2);

    // Encabezado
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

    // Header del Partido (Argentina vs Argelia)
    const headerHtml = `
        <div class="match-summary-header">
            <span class="match-teams">🇦🇷 vs 🇩🇿 Argentina vs Argelia</span>
            <span class="match-date-location">Martes 16 junio - 22:00 HS · Estadio Mario A. Kempes</span>
        </div>
    `;
    
    // Cuerpo del Resumen
    let bodyHtml = `<div class="match-summary-body">`;

    // Renderizar grupos de sectores
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
                    <span class="summary-seat-price">$${asiento.precio.toLocaleString('es-AR')}</span>
                </div>
            `;
        });

        bodyHtml += `
                <div class="summary-sector-subtotal">
                    <span>Subtotal Sector ${sectorName}</span>
                    <span>$${grupo.subtotal.toLocaleString('es-AR')}</span>
                </div>
            </div>
        `;
    });

    // Fila del cargo por servicio
    bodyHtml += `
        <div class="summary-charge-row">
            <span class="summary-charge-label">Cargo por servicio</span>
            <span class="summary-charge-val">$${cargoServicio.toLocaleString('es-AR')}</span>
        </div>
    `;

    // Fila del Total
    bodyHtml += `
        <div class="summary-total-row">
            <span class="summary-total-label">TOTAL</span>
            <span class="summary-total-val">$${totalGral.toLocaleString('es-AR')}</span>
        </div>
    `;

    bodyHtml += `</div>`; // Cerrar body

    summaryCard.innerHTML = headerHtml + bodyHtml;
    contenedor.appendChild(summaryCard);

    // Botón Ir al Pago
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
 * PANTALLA 3: Formulario de Datos de Pago con Tarjeta Interactiva
 */
export function renderizarFormularioPago(contenedor, onConfirmarCompra, onVolver) {
    if (!contenedor) return;
    contenedor.innerHTML = "";

    const seleccionados = obtenerAsientosSeleccionados();
    const subtotalGral = seleccionados.reduce((sum, a) => sum + a.precio, 0);
    const cargoServicio = Math.round(subtotalGral * 0.1);
    const totalGral = subtotalGral + cargoServicio;

    // Stepper Paso 3
    renderizarStepper(contenedor, 3);

    // Encabezado
    renderizarVolver(contenedor, "DATOS DE PAGO", onVolver);

    const layout = document.createElement("div");
    layout.classList.add("payment-layout");

    // Tarjeta gráfica interactiva
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

    // Formulario de entrada
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

    // Enlazar eventos para actualizar la tarjeta interactiva
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

    // Formatear número de tarjeta (0000 0000 0000 0000)
    inputTarjeta.addEventListener("input", (e) => {
        let val = e.target.value.replace(/\D/g, "");
        if (val.length > 16) val = val.substring(0, 16);
        
        // Agregar espacios cada 4 dígitos
        const matches = val.match(/\d{1,4}/g);
        const formatted = matches ? matches.join(" ") : "";
        e.target.value = formatted;

        // Rellenar con puntos hasta 16
        const pad = "•••• •••• •••• ••••";
        const totalLen = formatted.length;
        mockTarjeta.textContent = totalLen > 0 
            ? formatted + pad.substring(totalLen) 
            : pad;
    });

    // Formatear fecha de vencimiento (MM/AA)
    inputExp.addEventListener("input", (e) => {
        let val = e.target.value.replace(/\D/g, "");
        if (val.length > 4) val = val.substring(0, 4);

        if (val.length >= 2) {
            const mes = val.substring(0, 2);
            const anio = val.substring(2);
            e.target.value = `${mes}/${anio}`;
            mockExp.textContent = `${mes}/${anio}`;
        } else {
            e.target.value = val;
            mockExp.textContent = val.trim() !== "" ? val : "MM/AA";
        }
    });

    // Evento de envío del formulario
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const btn = form.querySelector("#btn-finalizar");
        btn.disabled = true;
        btn.innerHTML = `<span class="spinner-border spinner-border-sm me-2" role="status"></span> Procesando pago...`;

        const datosCompraMock = {
            monto_total: totalGral,
            id_partido: "P01",
            id_usuario: "U002",
            asientos_comprados: seleccionados.map(a => a.idAsiento)
        };

        // Detener temporizador
        limpiarExpiracion();

        onConfirmarCompra(datosCompraMock);
    });

    layout.appendChild(form);
    contenedor.appendChild(layout);
}

/**
 * PANTALLA 4: Compra Exitosa (Confirmación)
 */
export function renderizarCompraExitosa(contenedor, numeroOrden) {
    if (!contenedor) return;
    contenedor.innerHTML = "";

    const seleccionados = obtenerAsientosSeleccionados();

    // Stepper Paso 4
    renderizarStepper(contenedor, 4);

    const successDiv = document.createElement("div");
    successDiv.classList.add("success-container");

    // Ícono de éxito, título y subtítulo
    const successHeaderHtml = `
        <div class="success-icon-wrapper">
            <i class="bi bi-check-lg"></i>
        </div>
        <h1 class="success-title">¡COMPRA EXITOSA!</h1>
        <p class="success-subtitle">Tu pago fue procesado correctamente. Ya podés disfrutar del partido.</p>
    `;

    // Tarjeta del número de orden
    const orderBoxHtml = `
        <div class="order-number-box">
            <div class="order-number-label">Número de orden</div>
            <div class="order-number-val">${numeroOrden}</div>
            <div class="order-number-note">Guardá este número para tus registros</div>
        </div>
    `;

    // Resumen del partido y asientos
    let summaryHtml = `
        <div class="success-match-card">
            <div class="success-match-header">
                <span>⚽ Argentina vs Argelia</span>
            </div>
            <div class="success-match-body">
    `;

    seleccionados.forEach((asiento) => {
        summaryHtml += `
            <div class="success-match-row">
                <span class="success-match-seat">Sector ${asiento.sector} · Fila ${asiento.fila} · Butaca ${asiento.numero}</span>
                <span class="success-match-price">$${asiento.precio.toLocaleString('es-AR')}</span>
            </div>
        `;
    });

    summaryHtml += `
            </div>
        </div>
    `;

    // Botón Volver y nota final
    const footerHtml = `
        <a href="home.html" class="btn-success-home">Volver al inicio</a>
        <div class="success-email-note">Recibirás una confirmación en tu correo electrónico</div>
    `;

    successDiv.innerHTML = successHeaderHtml + orderBoxHtml + summaryHtml + footerHtml;
    contenedor.appendChild(successDiv);

    // Como la compra fue exitosa, limpiamos el localStorage de los asientos seleccionados
    localStorage.removeItem("ticketapp_asientos_seleccionados");
}