// Persona 5
import { guardarSeleccion } from "../storage.js";

// Datos de prueba (coincidentes con los de los PDF de diseño)
export const SEATS_MOCK = [
    { idAsiento: "A11-8-1", sector: "Sector A11", fila: 8, numero: 1, precio: 270000 },
    { idAsiento: "A11-8-2", sector: "Sector A11", fila: 8, numero: 2, precio: 270000 },
    { idAsiento: "B5-3-7", sector: "Sector B5", fila: 3, numero: 7, precio: 190000 }
];

// Funciones locales para interactuar con localStorage y evitar importar de seating.js (que está vacío)
export function obtenerAsientosSeleccionados() {
    try {
        const data = localStorage.getItem("ticketapp_asientos_seleccionados");
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error("Error al obtener asientos", error);
        return [];
    }
}

export function alternarSeleccionAsiento(idAsiento) {
    try {
        const actual = obtenerAsientosSeleccionados();
        const filtrado = actual.filter(a => a.idAsiento !== idAsiento);
        localStorage.setItem("ticketapp_asientos_seleccionados", JSON.stringify(filtrado));
    } catch (error) {
        console.error("Error al quitar asiento", error);
    }
}

// Inicialización de un temporizador de reserva global
let timerInterval = null;
function iniciarTemporizador(duracionSegundos) {
    if (timerInterval) clearInterval(timerInterval);
    
    let tiempoRestante = duracionSegundos;
    
    function actualizarTimer() {
        const timerElement = document.getElementById("countdown-timer");
        if (!timerElement) {
            clearInterval(timerInterval);
            return;
        }
        const minutos = Math.floor(tiempoRestante / 60);
        const segundos = tiempoRestante % 60;
        timerElement.textContent = `${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
        
        if (tiempoRestante <= 0) {
            clearInterval(timerInterval);
            alert("El tiempo de tu reserva ha expirado.");
            localStorage.setItem('ticketapp_asientos_seleccionados', JSON.stringify([]));
            window.location.reload();
        }
        tiempoRestante--;
    }
    actualizarTimer();
    timerInterval = setInterval(actualizarTimer, 1000);
}

// Progreso superior del checkout
function obtenerHTMLPasos(pasoActivo) {
    return `
    <div class="d-flex justify-content-center align-items-center mb-5 font-montserrat flex-wrap gap-2 text-nowrap">
        <!-- Paso 1 -->
        <div class="d-flex align-items-center gap-2">
            <span class="d-flex align-items-center justify-content-center rounded-circle border fw-bold ${pasoActivo >= 1 ? 'bg-brand border-brand text-white' : 'bg-light text-muted border-secondary-subtle'}" style="width: 32px; height: 32px; font-size: 0.85rem;">
                ${pasoActivo > 1 ? '<i class="bi bi-check-lg"></i>' : '1'}
            </span>
            <span class="small fw-semibold ${pasoActivo === 1 ? 'text-brand' : 'text-muted'}">Entradas</span>
        </div>
        <div class="mx-2 border-bottom d-none d-sm-block" style="width: 50px; border-color: ${pasoActivo >= 2 ? 'var(--primary-color)' : '#dee2e6'} !important; border-width: 2px !important;"></div>
        
        <!-- Paso 2 -->
        <div class="d-flex align-items-center gap-2">
            <span class="d-flex align-items-center justify-content-center rounded-circle border fw-bold ${pasoActivo >= 2 ? 'bg-brand border-brand text-white' : 'bg-light text-muted border-secondary-subtle'}" style="width: 32px; height: 32px; font-size: 0.85rem;">
                ${pasoActivo > 2 ? '<i class="bi bi-check-lg"></i>' : '2'}
            </span>
            <span class="small fw-semibold ${pasoActivo === 2 ? 'text-brand' : 'text-muted'}">Resumen</span>
        </div>
        <div class="mx-2 border-bottom d-none d-sm-block" style="width: 50px; border-color: ${pasoActivo >= 3 ? 'var(--primary-color)' : '#dee2e6'} !important; border-width: 2px !important;"></div>
        
        <!-- Paso 3 -->
        <div class="d-flex align-items-center gap-2">
            <span class="d-flex align-items-center justify-content-center rounded-circle border fw-bold ${pasoActivo >= 3 ? 'bg-brand border-brand text-white' : 'bg-light text-muted border-secondary-subtle'}" style="width: 32px; height: 32px; font-size: 0.85rem;">
                ${pasoActivo > 3 ? '<i class="bi bi-check-lg"></i>' : '3'}
            </span>
            <span class="small fw-semibold ${pasoActivo === 3 ? 'text-brand' : 'text-muted'}">Pago</span>
        </div>
        <div class="mx-2 border-bottom d-none d-sm-block" style="width: 50px; border-color: ${pasoActivo >= 4 ? 'var(--primary-color)' : '#dee2e6'} !important; border-width: 2px !important;"></div>
        
        <!-- Paso 4 -->
        <div class="d-flex align-items-center gap-2">
            <span class="d-flex align-items-center justify-content-center rounded-circle border fw-bold ${pasoActivo >= 4 ? 'bg-brand border-brand text-white' : 'bg-light text-muted border-secondary-subtle'}" style="width: 32px; height: 32px; font-size: 0.85rem;">
                4
            </span>
            <span class="small fw-semibold ${pasoActivo === 4 ? 'text-brand' : 'text-muted'}">Confirmación</span>
        </div>
    </div>
    `;
}

/**
 * PANTALLA 1: Listado de Entradas Seleccionadas
 */
export function renderizarCarrito(contenedor, onIrAlResumen) {
    if (!contenedor) return;
    contenedor.innerHTML = "";

    const seleccionados = obtenerAsientosSeleccionados();

    // 1. Inyectamos la barra de pasos
    contenedor.innerHTML += obtenerHTMLPasos(1);

    const card = document.createElement("div");
    card.classList.add("card", "border-0", "shadow-sm", "p-4", "p-md-5", "rounded-4", "bg-white");

    // Si no hay asientos, renderizar carrito vacío de la captura 1
    if (seleccionados.length === 0) {
        card.innerHTML = `
            <div class="text-center py-5">
                <div class="d-inline-flex align-items-center justify-content-center rounded-circle bg-light mb-4" style="width: 80px; height: 80px;">
                    <i class="bx bx-cart text-muted" style="font-size: 2.5rem;"></i>
                </div>
                <h3 class="fw-bold text-dark mb-2 fs-4">Tu carrito está vacío</h3>
                <p class="text-muted col-md-10 mx-auto mb-4">Todavía no seleccionaste ninguna entrada.<br>Volvé al mapa del estadio y elegí tus asientos.</p>
                
                <div class="mb-4">
                    <button type="button" id="btn-cargar-demo" class="btn btn-link text-brand btn-sm text-decoration-none fw-bold">[ Cargar entradas de prueba (Demo) ]</button>
                </div>
                
                <div class="mb-4">
                    <span class="d-inline-flex align-items-center justify-content-center rounded-circle bg-light border border-light-subtle p-3" style="width: 50px; height: 50px;">
                        <i class="bx bx-map fs-4 text-brand"></i>
                    </span>
                </div>
                
                <a href="home.html" class="btn btn-brand btn-lg rounded-pill px-5 fw-bold text-uppercase mb-5">
                    <i class="bi bi-arrow-left me-1"></i> Volver al mapa del estadio
                </a>
                
                <div class="alert bg-danger bg-opacity-10 border-0 rounded-3 p-4 text-start mx-auto col-md-10" style="border: 1px dashed rgba(237, 25, 77, 0.25) !important;">
                    <div class="d-flex gap-3 text-dark small">
                        <i class="bx bx-info-circle text-brand fs-4 flex-shrink-0"></i>
                        <div>
                            Podés seleccionar hasta <b>4 entradas</b> por partido. Los asientos quedan reservados temporalmente mientras completás la compra.
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        const btnCargarDemo = card.querySelector("#btn-cargar-demo");
        btnCargarDemo?.addEventListener("click", () => {
            localStorage.setItem('ticketapp_asientos_seleccionados', JSON.stringify(SEATS_MOCK));
            window.location.reload();
        });

        contenedor.appendChild(card);
        return;
    }

    // Cabecera con botón volver
    const headerRow = document.createElement("div");
    headerRow.classList.add("d-flex", "align-items-center", "mb-4");
    headerRow.innerHTML = `
        <a href="home.html" class="btn btn-outline-dark btn-sm rounded-pill px-3 py-1 me-3"><i class="bi bi-chevron-left"></i> Volver</a>
        <h2 class="text-brand h4 fw-bold m-0 text-uppercase">Entradas Seleccionadas</h2>
    `;
    card.appendChild(headerRow);

    // Encabezado de la tabla de cápsulas
    const tableHeader = document.createElement("div");
    tableHeader.classList.add("row", "text-secondary", "small", "text-uppercase", "mb-3", "px-3", "d-none", "d-sm-flex");
    tableHeader.innerHTML = `
        <div class="col-4">Sector</div>
        <div class="col-2 text-center">Fila</div>
        <div class="col-2 text-center">Butaca</div>
        <div class="col-3 text-end">Precio</div>
        <div class="col-1"></div>
    `;
    card.appendChild(tableHeader);

    // Listado de Butacas Seleccionadas como cápsulas
    seleccionados.forEach((asiento) => {
        const cap = document.createElement("div");
        cap.classList.add("card", "border", "rounded-3", "p-3", "mb-3", "shadow-sm");
        cap.innerHTML = `
            <div class="row align-items-center text-center text-sm-start g-2">
                <div class="col-12 col-sm-4 d-flex align-items-center justify-content-center justify-content-sm-start gap-2">
                    <span class="badge badge-brand-subtle rounded-pill px-3 py-2 small fw-bold">${asiento.sector.replace("Sector ", "")}</span>
                    <span class="fw-bold text-dark text-truncate">${asiento.sector}</span>
                </div>
                <div class="col-4 col-sm-2 text-center text-secondary"><span class="d-sm-none text-muted d-block small">FILA</span>${asiento.fila}</div>
                <div class="col-4 col-sm-2 text-center text-secondary"><span class="d-sm-none text-muted d-block small">BUTACA</span>${asiento.numero}</div>
                <div class="col-4 col-sm-3 text-end text-sm-end fw-bold text-dark"><span class="d-sm-none text-muted d-block text-center small">PRECIO</span>$${asiento.precio.toLocaleString("es-AR")}</div>
                <div class="col-12 col-sm-1 text-end">
                    <button class="btn btn-sm btn-outline-danger border-0 rounded-circle btn-quitar py-1 px-2" data-id="${asiento.idAsiento}">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </div>
        `;
        cap.querySelector(".btn-quitar").addEventListener("click", () => {
            alternarSeleccionAsiento(asiento.idAsiento);
            renderizarCarrito(contenedor, onIrAlResumen);
        });
        card.appendChild(cap);
    });

    // Alerta de Reserva Temporal
    const alertTemp = document.createElement("div");
    alertTemp.classList.add("alert", "bg-warning", "bg-opacity-10", "border-0", "rounded-3", "p-3", "d-flex", "align-items-center", "justify-content-between", "mb-4");
    alertTemp.innerHTML = `
        <div class="d-flex align-items-center small text-dark">
            <i class="bi bi-lock-fill text-brand fs-5 me-2 flex-shrink-0"></i>
            <span>Tus asientos están reservados temporalmente. Completá la compra antes de que expire el tiempo.</span>
        </div>
        <span class="fw-bold text-brand ms-2" id="countdown-timer">10:00</span>
    `;
    card.appendChild(alertTemp);

    // Botón Continuar
    const footerRow = document.createElement("div");
    footerRow.classList.add("d-flex", "justify-content-end", "mt-4");
    footerRow.innerHTML = `
        <button id="btn-continuar" class="btn btn-brand btn-lg rounded-pill px-5 fw-bold text-uppercase">Continuar <i class="bi bi-arrow-right ms-1"></i></button>
    `;
    footerRow.querySelector("#btn-continuar").addEventListener("click", onIrAlResumen);
    card.appendChild(footerRow);

    contenedor.appendChild(card);
    
    // Lanzar temporizador (10 minutos)
    iniciarTemporizador(600);
}

/**
 * PANTALLA 2: Resumen de Compra
 */
export function renderizarResumenCompra(contenedor, onIrAlPago, onVolver) {
    if (!contenedor) return;
    contenedor.innerHTML = "";

    const seleccionados = obtenerAsientosSeleccionados();
    const totalTickets = seleccionados.reduce((sum, a) => sum + a.precio, 0);
    const cargoServicio = Math.round(totalTickets * 0.1); // 10% de service charge
    const totalGeneral = totalTickets + cargoServicio;

    // 1. Inyectamos la barra de pasos
    contenedor.innerHTML += obtenerHTMLPasos(2);

    const card = document.createElement("div");
    card.classList.add("card", "border-0", "shadow-sm", "p-4", "p-md-5", "rounded-4", "bg-white");

    // Cabecera con botón volver
    const headerRow = document.createElement("div");
    headerRow.classList.add("d-flex", "align-items-center", "mb-4");
    headerRow.innerHTML = `
        <button id="btn-back" class="btn btn-outline-dark btn-sm rounded-pill px-3 py-1 me-3"><i class="bi bi-chevron-left"></i> Volver</button>
        <h2 class="text-brand h4 fw-bold m-0 text-uppercase">Resumen de Compra</h2>
    `;
    headerRow.querySelector("#btn-back").addEventListener("click", onVolver);
    card.appendChild(headerRow);

    // Banner del Partido (Rojo)
    const partyBanner = document.createElement("div");
    partyBanner.classList.add("card", "bg-brand", "text-white", "border-0", "rounded-3", "p-4", "mb-4", "shadow-sm", "text-start");
    partyBanner.innerHTML = `
        <div class="d-flex align-items-center gap-3 mb-2 flex-wrap">
            <div class="d-flex align-items-center gap-2">
                <span class="rounded-circle overflow-hidden border border-white" style="width: 32px; height: 32px; display: inline-block;">
                    <span class="fi fi-ar fis w-100 h-100 d-block"></span>
                </span>
                <span class="small fw-bold">VS</span>
                <span class="rounded-circle overflow-hidden border border-white" style="width: 32px; height: 32px; display: inline-block;">
                    <span class="fi fi-dz fis w-100 h-100 d-block"></span>
                </span>
            </div>
            <h4 class="fw-bold m-0 fs-5 text-uppercase">Argentina vs Argelia</h4>
        </div>
        <p class="mb-0 small opacity-75"><i class="bi bi-calendar3 me-1"></i> Martes 16 junio - 22:00 HS - Kansas City</p>
    `;
    card.appendChild(partyBanner);

    // Agrupar asientos por sector
    const sectoresAgrupados = {};
    seleccionados.forEach(asiento => {
        if (!sectoresAgrupados[asiento.sector]) {
            sectoresAgrupados[asiento.sector] = [];
        }
        sectoresAgrupados[asiento.sector].push(asiento);
    });

    // Renderizar desglose por sectores
    const listadoDesglose = document.createElement("div");
    listadoDesglose.classList.add("text-start", "mb-4");

    Object.keys(sectoresAgrupados).forEach(sector => {
        const asientosSector = sectoresAgrupados[sector];
        const subtotalSector = asientosSector.reduce((sum, a) => sum + a.precio, 0);

        const groupDiv = document.createElement("div");
        groupDiv.classList.add("mb-4", "pb-3", "border-bottom");

        groupDiv.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-2">
                <h5 class="fw-bold text-dark fs-6 m-0">${sector}</h5>
                <span class="badge badge-brand-subtle rounded-pill px-3">${asientosSector.length} ${asientosSector.length === 1 ? 'entrada' : 'entradas'}</span>
            </div>
            <div class="ps-3 mb-3 text-secondary small">
                ${asientosSector.map(a => `
                    <div class="d-flex justify-content-between py-1">
                        <span>Fila ${a.fila} · Butaca ${a.numero}</span>
                        <span class="fw-semibold text-dark">$${a.precio.toLocaleString("es-AR")}</span>
                    </div>
                `).join('')}
            </div>
            <div class="d-flex justify-content-between text-dark fw-bold small">
                <span>Subtotal ${sector}</span>
                <span>$${subtotalSector.toLocaleString("es-AR")}</span>
            </div>
        `;
        listadoDesglose.appendChild(groupDiv);
    });

    // Cargo por servicio
    const divServicio = document.createElement("div");
    divServicio.classList.add("d-flex", "justify-content-between", "text-secondary", "small", "pb-3", "mb-4", "border-bottom");
    divServicio.innerHTML = `
        <span>Cargo por servicio</span>
        <span class="fw-semibold text-dark">$${cargoServicio.toLocaleString("es-AR")}</span>
    `;
    listadoDesglose.appendChild(divServicio);

    // Total General (Con diseño del screenshot)
    const divTotal = document.createElement("div");
    divTotal.classList.add("d-flex", "justify-content-between", "align-items-center", "bg-light", "p-4", "rounded-3", "mb-4");
    divTotal.innerHTML = `
        <span class="fw-bold text-dark fs-5 text-uppercase">Total</span>
        <span class="fs-2 fw-bold text-brand">$${totalGeneral.toLocaleString("es-AR")}</span>
    `;
    listadoDesglose.appendChild(divTotal);

    card.appendChild(listadoDesglose);

    // Botón Ir al Pago
    const footerRow = document.createElement("div");
    footerRow.classList.add("d-flex", "justify-content-end", "mt-4");
    footerRow.innerHTML = `
        <button id="btn-pago" class="btn btn-brand btn-lg rounded-pill px-5 fw-bold text-uppercase">Ir al pago <i class="bi bi-arrow-right ms-1"></i></button>
    `;
    footerRow.querySelector("#btn-pago").addEventListener("click", onIrAlPago);
    card.appendChild(footerRow);

    contenedor.appendChild(card);
}

/**
 * PANTALLA 3: Formulario de Datos de Pago
 */
export function renderizarFormularioPago(contenedor, onConfirmarCompra, onVolver) {
    if (!contenedor) return;
    contenedor.innerHTML = "";

    const seleccionados = obtenerAsientosSeleccionados();
    const totalTickets = seleccionados.reduce((sum, a) => sum + a.precio, 0);
    const cargoServicio = Math.round(totalTickets * 0.1);
    const totalGeneral = totalTickets + cargoServicio;
    const currentUser = localStorage.getItem('currentUser') || "user";

    // 1. Inyectamos la barra de pasos
    contenedor.innerHTML += obtenerHTMLPasos(3);

    const card = document.createElement("div");
    card.classList.add("card", "border-0", "shadow-sm", "p-4", "p-md-5", "rounded-4", "bg-white");

    // Cabecera con botón volver
    const headerRow = document.createElement("div");
    headerRow.classList.add("d-flex", "align-items-center", "mb-4");
    headerRow.innerHTML = `
        <button id="btn-back" class="btn btn-outline-dark btn-sm rounded-pill px-3 py-1 me-3"><i class="bi bi-chevron-left"></i> Volver</button>
        <h2 class="text-brand h4 fw-bold m-0 text-uppercase">Datos de Pago</h2>
    `;
    headerRow.querySelector("#btn-back").addEventListener("click", onVolver);
    card.appendChild(headerRow);

    // Maqueta visual de la tarjeta de crédito (Estilo Premium)
    const cardMock = document.createElement("div");
    cardMock.classList.add("card", "border-0", "rounded-4", "p-4", "text-white", "mb-4", "shadow");
    cardMock.style.cssText = "background: linear-gradient(135deg, #ed194d 0%, #a20f32 100%); min-height: 190px; max-width: 420px; margin: 0 auto;";
    cardMock.innerHTML = `
        <div class="d-flex justify-content-between align-items-start mb-4">
            <i class="bi bi-credit-card-2-front fs-2"></i>
            <span class="small fw-bold opacity-75" style="letter-spacing: 1px;">TICKETAPP</span>
        </div>
        <!-- Card number -->
        <h4 class="mb-4 text-center fs-5" id="mock-card-number" style="letter-spacing: 3px;">•••• •••• •••• ••••</h4>
        <div class="d-flex justify-content-between align-items-end small">
            <div>
                <span class="d-block opacity-75" style="font-size: 0.65rem; letter-spacing: 0.5px;">TITULAR</span>
                <span id="mock-card-name" class="fw-bold text-uppercase">NOMBRE APELLIDO</span>
            </div>
            <div>
                <span class="d-block opacity-75" style="font-size: 0.65rem; letter-spacing: 0.5px;">VENCE</span>
                <span id="mock-card-expiry" class="fw-bold">MM/AA</span>
            </div>
        </div>
    `;
    card.appendChild(cardMock);

    // Formulario de Inputs
    const form = document.createElement("form");
    form.setAttribute("novalidate", "true");
    form.innerHTML = `
        <div class="mb-3 text-start">
            <label class="form-label small fw-semibold text-secondary">Nombre del titular</label>
            <input type="text" class="form-control form-control-lg bg-light border-0 py-2 shadow-none small" required id="pago-nombre" placeholder="Como figura en la tarjeta">
            <div class="invalid-feedback">El nombre es obligatorio.</div>
        </div>
        
        <div class="mb-3 text-start">
            <label class="form-label small fw-semibold text-secondary">Número de tarjeta</label>
            <input type="text" class="form-control form-control-lg bg-light border-0 py-2 shadow-none small" required id="pago-tarjeta" placeholder="0000 0000 0000 0000" maxlength="19">
            <div class="invalid-feedback">Número de tarjeta requerido.</div>
        </div>
        
        <div class="row text-start">
            <div class="col-6 mb-4">
                <label class="form-label small fw-semibold text-secondary">Vencimiento</label>
                <input type="text" class="form-control form-control-lg bg-light border-0 py-2 shadow-none small" placeholder="MM/AA" maxlength="5" required id="pago-vencimiento">
                <div class="invalid-feedback">Requerido.</div>
            </div>
            <div class="col-6 mb-4">
                <label class="form-label small fw-semibold text-secondary">CVV</label>
                <input type="password" class="form-control form-control-lg bg-light border-0 py-2 shadow-none small" maxlength="3" required id="pago-cvv" placeholder="•••">
                <div class="invalid-feedback">Inválido.</div>
            </div>
        </div>

        <div class="text-muted small text-center mt-2 mb-4">
            <i class="bi bi-lock-fill text-secondary me-1"></i> Tus datos están protegidos con cifrado SSL de 256 bits
        </div>
        
        <button type="submit" id="btn-finalizar" class="btn btn-brand btn-lg w-100 py-3 fw-bold text-uppercase rounded-pill shadow-sm fs-6">
            Confirmar pago
        </button>
    `;

    // Vincular listeners para la tarjeta dinámica
    const inputNombre = form.querySelector("#pago-nombre");
    const inputTarjeta = form.querySelector("#pago-tarjeta");
    const inputVencimiento = form.querySelector("#pago-vencimiento");
    const mockNombre = cardMock.querySelector("#mock-card-name");
    const mockTarjeta = cardMock.querySelector("#mock-card-number");
    const mockExpiry = cardMock.querySelector("#mock-card-expiry");

    inputNombre.addEventListener("input", (e) => {
        mockNombre.textContent = e.target.value.toUpperCase() || "NOMBRE APELLIDO";
    });

    inputTarjeta.addEventListener("input", (e) => {
        let value = e.target.value.replace(/\D/g, ""); // solo numeros
        let formatted = value.match(/.{1,4}/g)?.join(" ") || "";
        e.target.value = formatted.slice(0, 19);
        mockTarjeta.textContent = formatted || "•••• •••• •••• ••••";
    });

    inputVencimiento.addEventListener("input", (e) => {
        let value = e.target.value.replace(/\D/g, "");
        if (value.length > 2) {
            value = value.slice(0, 2) + "/" + value.slice(2, 4);
        }
        e.target.value = value.slice(0, 5);
        mockExpiry.textContent = e.target.value || "MM/AA";
    });

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        if (!form.checkValidity()) {
            e.stopPropagation();
            form.classList.add("was-validated");
            return;
        }

        const btn = form.querySelector("#btn-finalizar");
        btn.disabled = true;
        btn.innerHTML = `<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Procesando pago...`;

        const datosCompraMock = {
            monto_total: totalGeneral,
            id_partido: "P01",
            id_usuario: currentUser,
            asientos_comprados: seleccionados.map(a => a.idAsiento)
        };

        onConfirmarCompra(datosCompraMock);
    });

    card.appendChild(form);
    contenedor.appendChild(card);
}

/**
 * PANTALLA 4: Compra Exitosa
 */
export function renderizarCompraExitosa(contenedor, numeroOrden) {
    if (!contenedor) return;
    contenedor.innerHTML = "";

    const seleccionados = obtenerAsientosSeleccionados();

    // Vaciamos el carrito global de asientos bloqueados
    guardarSeleccion([]);

    // 1. Inyectamos la barra de pasos
    contenedor.innerHTML += obtenerHTMLPasos(4);

    const card = document.createElement("div");
    card.classList.add("card", "border-0", "shadow-sm", "p-4", "p-md-5", "rounded-4", "bg-white");

    card.innerHTML = `
        <div class="text-center py-4">
            <div class="mb-4">
                <span class="d-inline-flex align-items-center justify-content-center bg-brand text-white rounded-circle shadow-sm" style="width: 80px; height: 80px;">
                    <i class="bi bi-check2-circle fs-1" style="font-size: 2.75rem !important;"></i>
                </span>
            </div>
            <h2 class="fw-bold text-brand mb-2 fs-3">¡COMPRA EXITOSA!</h2>
            <p class="text-secondary col-md-10 mx-auto mb-4">Tu pago fue procesado correctamente. Ya podés disfrutar del partido.</p>
            
            <!-- Caja de número de orden -->
            <div class="bg-brand bg-opacity-10 border border-brand border-dashed rounded-3 p-4 mb-4 d-inline-block px-5 mx-auto" style="border-style: dashed !important; border-width: 1px !important;">
                <span class="text-secondary small text-uppercase fw-bold d-block mb-1">Número de orden</span>
                <span class="fs-2 text-brand fw-bold">#${numeroOrden}</span>
                <span class="text-muted small d-block mt-2">Guardá este número para tus registros</span>
            </div>
            
            <!-- Desglose de Entradas Compradas -->
            <div class="card border rounded-3 p-0 col-md-9 mx-auto text-start mb-4 shadow-sm overflow-hidden">
                <div class="bg-brand text-white p-3 d-flex align-items-center gap-2">
                    <span class="rounded-circle overflow-hidden border border-white" style="width: 24px; height: 24px; display: inline-block;">
                        <span class="fi fi-ar fis w-100 h-100 d-block"></span>
                    </span>
                    <span class="small fw-bold">VS</span>
                    <span class="rounded-circle overflow-hidden border border-white" style="width: 24px; height: 24px; display: inline-block;">
                        <span class="fi fi-dz fis w-100 h-100 d-block"></span>
                    </span>
                    <span class="small fw-bold ms-1 text-uppercase">Argentina vs Argelia</span>
                </div>
                <div class="p-3 bg-white">
                    ${seleccionados.map(asiento => `
                        <div class="d-flex justify-content-between align-items-center py-2 border-bottom border-light">
                            <span class="text-dark small fw-medium">${asiento.sector} · Fila ${asiento.fila} · Butaca ${asiento.numero}</span>
                            <span class="fw-bold text-dark small">$${asiento.precio.toLocaleString("es-AR")}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <a href="home.html" class="btn btn-brand btn-lg rounded-pill px-5 fw-bold text-uppercase mb-4">Volver al inicio</a>
            <p class="small text-muted mb-0">Recibirás una confirmación en tu correo electrónico</p>
        </div>
    `;

    contenedor.appendChild(card);
}