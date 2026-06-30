/**
 * seating.js
 * ---------------------------------------------------------------------------
 * Módulo de PERSONA 4 — TicketApp
 *
 * Pantallas cubiertas:
 *   - Ver asientos de un sector  -> renderizarListaAsientos()
 *   - Seleccionar asientos       -> (incluido en renderizarListaAsientos, vía clicks)
 *   - Mostrar asientos seleccionados -> renderizarResumenSeleccion()
 *
 * Nota: La pantalla de mapa de sectores ya está resuelta por Persona 3 en
 *   estadio.html + matches.js, por lo que renderizarMapaSectores() fue
 *   eliminada de este módulo para evitar dos sistemas de sectores en paralelo.
 *
 * Reglas de oro aplicadas:
 *   1. DOM 100% dinámico (createElement + appendChild + dataset), sin innerHTML
 *      para los nodos de asientos.
 *   2. Sincronización entre pestañas con window.addEventListener('storage', ...).
 *      Cero setInterval, cero polling.
 *   3. Todos los filtros de disponibilidad se aplican con .filter()/.find()
 *      sobre el array `_asientos` en memoria. Nunca se filtra recorriendo el DOM.
 *   4. Funciones puras y exportadas, pensadas para recibir en el futuro un
 *      array de asientos que venga de fetch() a una API real.
 * ---------------------------------------------------------------------------
 */

import {
    obtenerSeleccionGuardada,
    agregarAsientoALaSeleccion,
    quitarAsientoDeLaSeleccion,
    CLAVE_SELECCION_ASIENTOS,
} from "../storage.js";

/* ============================================================================
 * 1. MODELO DE DATOS
 * ==========================================================================*/

/**
 * Precios por "zona" del estadio, derivados de la primera letra del ID de sector.
 * Esto espeja exactamente el objeto SECTOR_PRICES de matches.js:
 *   A = $270.000, B = $180.000, C = $140.000, D = $350.000
 * @type {Record<string, number>}
 */
const PRECIOS_POR_ZONA = {
    A: 270000,
    B: 180000,
    C: 140000,
    D: 350000,
};

/**
 * Configuración de filas y asientos por fila para cada zona.
 * Al tener muchos sectores pequeños (A1..A30, D1..D26, etc.), cada sector
 * individual tiene pocos asientos; definimos la grilla por zona.
 *
 * @type {Record<string, { filas: number, asientosPorFila: number }>}
 */
const CONFIG_ZONA = {
    A: { filas: 8, asientosPorFila: 6 },   // sectores del anillo interior
    B: { filas: 8, asientosPorFila: 6 },  // sectores de tribuna norte/sur
    C: { filas: 8, asientosPorFila: 6 },  // sectores de tribuna exterior
    D: { filas: 8, asientosPorFila: 6 },   // sectores de curva exterior
};

/**
 * @typedef {{\
 *   idAsiento: string,
 *   idSector: string,
 *   sector: string,
 *   fila: string,
 *   numero: number,
 *   precio: number,
 *   estado: "disponible" | "seleccionado" | "ocupado"
 * }} Asiento
 */

/**
 * Array en memoria con TODOS los asientos del sector activo.
 * Es la "fuente de verdad" del módulo.
 * @type {Asiento[]}
 */
let _asientos = [];

/**
 * Extrae la letra de zona de un ID de sector (ej: "A11" → "A", "D3" → "D").
 * @param {string} idSector
 * @returns {string}
 */
function obtenerZona(idSector) {
    return idSector.charAt(0).toUpperCase();
}

/**
 * Genera el array mock de asientos para un sector del SVG (ej: "A11", "D3").
 * Si no se pasa idSector, retorna un array vacío (los asientos se generan
 * bajo demanda, sector por sector, al navegar a asientos.html).
 * @param {string} idSector  — ID del sector tal como está en el SVG (ej: "A11")
 * @returns {Asiento[]}
 */
export function generarAsientosMock(idSector) {
    if (!idSector) return [];

    const zona = obtenerZona(idSector);
    const config = CONFIG_ZONA[zona] ?? { filas: 8, asientosPorFila: 6 };
    const precio = PRECIOS_POR_ZONA[zona] ?? 270000;

    const nuevosAsientos = [];

    for (let f = 0; f < config.filas; f++) {
        const numeroFila = String(f + 1); // Filas numeradas: 1, 2, 3...
        for (let n = 1; n <= config.asientosPorFila; n++) {
            // Un ~12% de los asientos arrancan "ocupados" para simular ventas previas.
            const yaOcupado = Math.random() < 0.12;

            nuevosAsientos.push({
                idAsiento: `${idSector}-${numeroFila}-${n}`,
                idSector: idSector,
                sector: idSector,
                fila: numeroFila,
                numero: n,
                precio: precio,
                estado: yaOcupado ? "ocupado" : "disponible",
            });
        }
    }

    return nuevosAsientos;
}

/**
 * Inicializa (o reinicializa) el array en memoria `_asientos` para
 * un sector específico. Útil para cuando llega la data real del backend:
 *   inicializarAsientos(await fetchAsientosDesdeAPI(idSector));
 * @param {Asiento[]} [asientosIniciales] - si no se pasa, genera el mock.
 * @param {string} [idSector] - necesario para generar el mock correcto.
 */
export function inicializarAsientos(asientosIniciales, idSector) {
    _asientos = asientosIniciales ?? generarAsientosMock(idSector);

    // Al iniciar, sincronizamos contra lo que ya estaba seleccionado
    // en otras pestañas/sesiones (ej: si recargamos la página).
    const seleccionPrevia = obtenerSeleccionGuardada();
    _asientos.forEach((asiento) => {
        if (seleccionPrevia.includes(asiento.idAsiento) && asiento.estado !== "ocupado") {
            asiento.estado = "seleccionado";
        }
    });

    return _asientos;
}

/* ============================================================================
 * 2. FILTROS SOBRE EL ARRAY (regla de oro #3: nunca sobre el DOM)
 * ==========================================================================*/

/** @returns {Asiento[]} todos los asientos de un sector puntual */
function filtrarPorSector(idSector) {
    return _asientos.filter((a) => a.idSector === idSector);
}

/** @returns {Asiento[]} todos los asientos en estado "seleccionado" (global) */
export function obtenerAsientosSeleccionados() {
    return _asientos.filter((a) => a.estado === "seleccionado");
}

/* ============================================================================
 * 3. RENDER DINÁMICO — Pantalla "Ver sección" / "Seleccionar asientos"
 * ==========================================================================*/

/**
 * Pinta la grilla de asientos de UN sector dentro del contenedor.
 * Cada asiento es un <button> con dataset.idAsiento y dataset.estado,
 * clickeable para alternar entre "disponible" <-> "seleccionado".
 * @param {HTMLElement} contenedor
 * @param {string} idSector   — ID del sector SVG (ej: "A11")
 * @param {object} [opciones]
 * @param {() => void} [opciones.onCambioSeleccion] - callback tras cada click válido
 */
export function renderizarListaAsientos(contenedor, idSector, opciones = {}) {
    if (!contenedor) return;
    const { onCambioSeleccion } = opciones;

    // Limpiamos el contenedor de forma controlada (sin innerHTML = "")
    while (contenedor.firstChild) {
        contenedor.removeChild(contenedor.firstChild);
    }

    const asientosDelSector = filtrarPorSector(idSector);

    if (asientosDelSector.length === 0) {
        const aviso = document.createElement("p");
        aviso.classList.add("text-muted");
        aviso.textContent = "No hay asientos cargados para este sector.";
        contenedor.appendChild(aviso);
        return;
    }

    // Agrupamos por fila para pintar la grilla (operación sobre el array, no el DOM)
    const filas = [...new Set(asientosDelSector.map((a) => a.fila))].sort((a, b) => Number(a) - Number(b));

    const grilla = document.createElement("div");
    grilla.classList.add("grilla-asientos");
    grilla.dataset.idSector = String(idSector);

    filas.forEach((numeroFila) => {
        const filaWrapper = document.createElement("div");
        filaWrapper.classList.add("fila-asientos");

        // Etiqueta de fila a la izquierda (ej: "1", "2", ...)
        const etiquetaFila = document.createElement("span");
        etiquetaFila.classList.add("etiqueta-fila");
        etiquetaFila.textContent = numeroFila;
        filaWrapper.appendChild(etiquetaFila);

        const asientosDeFila = asientosDelSector
            .filter((a) => a.fila === numeroFila)
            .sort((a, b) => a.numero - b.numero);

        asientosDeFila.forEach((asiento) => {
            const boton = crearBotonAsiento(asiento, onCambioSeleccion);
            filaWrapper.appendChild(boton);
        });

        grilla.appendChild(filaWrapper);
    });

    contenedor.appendChild(grilla);
}

/**
 * Crea el <button> dinámico de un asiento individual, con su dataset y
 * su listener de click para alternar selección.
 * @param {Asiento} asiento
 * @param {() => void} [onCambioSeleccion]
 * @returns {HTMLButtonElement}
 */
function crearBotonAsiento(asiento, onCambioSeleccion) {
    const boton = document.createElement("button");
    boton.type = "button";
    boton.classList.add("btn-asiento");
    boton.dataset.idAsiento = asiento.idAsiento;
    boton.dataset.idSector = String(asiento.idSector);
    boton.dataset.estado = asiento.estado;
    boton.setAttribute(
        "aria-label",
        `Asiento ${asiento.numero}, Fila ${asiento.fila} — Sector ${asiento.sector}`
    );

    aplicarEstiloSegunEstado(boton, asiento.estado);

    if (asiento.estado === "ocupado") {
        boton.disabled = true;
    } else {
        boton.addEventListener("click", () => {
            alternarSeleccionAsiento(asiento.idAsiento);
            // Actualizamos solo el botón tocado, sin re-renderizar toda la grilla
            const actualizado = _asientos.find((a) => a.idAsiento === asiento.idAsiento);
            if (actualizado) {
                boton.dataset.estado = actualizado.estado;
                aplicarEstiloSegunEstado(boton, actualizado.estado);
            }
            if (typeof onCambioSeleccion === "function") {
                onCambioSeleccion();
            }
        });
    }

    return boton;
}

/** Aplica/quita clases visuales según el estado del asiento (estilos en asientos.html <style>). */
function aplicarEstiloSegunEstado(boton, estado) {
    boton.classList.remove("btn-disponible", "btn-seleccionado", "btn-ocupado");
    if (estado === "disponible") boton.classList.add("btn-disponible");
    if (estado === "seleccionado") boton.classList.add("btn-seleccionado");
    if (estado === "ocupado") boton.classList.add("btn-ocupado");
}

/* ============================================================================
 * 4. LÓGICA DE SELECCIÓN
 * ==========================================================================*/

/**
 * Alterna el estado de un asiento entre "disponible" y "seleccionado",
 * actualiza el array en memoria Y persiste el cambio en storage.js
 * (lo cual dispara el evento 'storage' en otras pestañas).
 * No hace nada si el asiento está "ocupado".
 * @param {string} idAsiento
 */
export function alternarSeleccionAsiento(idAsiento) {
    const asiento = _asientos.find((a) => a.idAsiento === idAsiento);
    if (!asiento || asiento.estado === "ocupado") return;

    if (asiento.estado === "disponible") {
        asiento.estado = "seleccionado";
        agregarAsientoALaSeleccion(idAsiento);
    } else if (asiento.estado === "seleccionado") {
        asiento.estado = "disponible";
        quitarAsientoDeLaSeleccion(idAsiento);
    }
}

/* ============================================================================
 * 5. RENDER DINÁMICO — Pantalla "Resumen de selección"
 * ==========================================================================*/

/**
 * Pinta el resumen de selección actual: tabla de asientos elegidos + total.
 * Pensado para ser llamado de nuevo cada vez que cambia la selección
 * (después de cada click, o al recibir un evento 'storage').
 *
 * @param {HTMLElement} contenedor  — el tbody de la tabla de detalle
 * @param {HTMLElement} totalEl     — elemento donde mostrar el total
 * @param {HTMLElement} btnContinuar — botón que se habilita/deshabilita
 * @param {object} [opciones]
 * @param {(idAsiento: string) => void} [opciones.onQuitarAsiento]
 */
export function renderizarResumenSeleccion(contenedor, totalEl, btnContinuar, opciones = {}) {
    if (!contenedor) return;
    const { onQuitarAsiento } = opciones;

    // Limpiamos filas previas
    while (contenedor.firstChild) {
        contenedor.removeChild(contenedor.firstChild);
    }

    const seleccionados = obtenerAsientosSeleccionados();

    // Habilitamos/deshabilitamos el botón Continuar según si hay selección
    if (btnContinuar) {
        btnContinuar.disabled = seleccionados.length === 0;
    }

    if (seleccionados.length === 0) {
        // Fila vacía para indicar que no hay selección
        const trVacio = document.createElement("tr");
        const tdVacio = document.createElement("td");
        tdVacio.colSpan = 5;
        tdVacio.classList.add("text-center", "text-muted", "py-3");
        tdVacio.textContent = "Ningún asiento seleccionado.";
        trVacio.appendChild(tdVacio);
        contenedor.appendChild(trVacio);

        if (totalEl) totalEl.textContent = "$0";
        return;
    }

    let total = 0;

    seleccionados.forEach((asiento) => {
        total += asiento.precio;

        // Fila de tabla: Asiento | Fila | Cantidad | Precio | Quitar
        const tr = document.createElement("tr");
        tr.dataset.idAsiento = asiento.idAsiento;
        tr.classList.add("ta-detalle-fila");

        // Celda: número de asiento
        const tdAsiento = document.createElement("td");
        tdAsiento.classList.add("tr-asiento");
        tdAsiento.textContent = String(asiento.numero);
        tr.appendChild(tdAsiento);

        // Celda: fila (letra)
        const tdFila = document.createElement("td");
        tdFila.classList.add("tr-fila");
        tdFila.textContent = asiento.fila;
        tr.appendChild(tdFila);

        // Celda: cantidad (siempre 1 porque cada asiento es una entrada)
        const tdCantidad = document.createElement("td");
        tdCantidad.classList.add("tr-qty");
        tdCantidad.textContent = "1";
        tr.appendChild(tdCantidad);

        // Celda: precio formateado en AR$
        const tdPrecio = document.createElement("td");
        tdPrecio.classList.add("tr-price");
        tdPrecio.textContent = `$${asiento.precio.toLocaleString("es-AR")}`;
        tr.appendChild(tdPrecio);

        // Celda: botón carrito para quitar el asiento
        const tdCart = document.createElement("td");
        tdCart.classList.add("tr-cart");
        if (typeof onQuitarAsiento === "function") {
            const botonQuitar = document.createElement("button");
            botonQuitar.type = "button";
            botonQuitar.classList.add("ta-cart-btn");
            botonQuitar.setAttribute("aria-label", `Quitar asiento ${asiento.numero}`);

            const icono = document.createElement("i");
            icono.classList.add("bi", "bi-cart-fill");
            icono.style.color = "#ed194d";
            botonQuitar.appendChild(icono);

            botonQuitar.addEventListener("click", () => {
                alternarSeleccionAsiento(asiento.idAsiento);
                onQuitarAsiento(asiento.idAsiento);
            });
            tdCart.appendChild(botonQuitar);
        }
        tr.appendChild(tdCart);

        contenedor.appendChild(tr);
    });

    // Actualizamos el total
    if (totalEl) {
        totalEl.textContent = `$${total.toLocaleString("es-AR")}`;
    }
}

/* ============================================================================
 * 6. SINCRONIZACIÓN ENTRE PESTAÑAS (regla de oro #2)
 * ==========================================================================*/

/**
 * Activa el listener del evento 'storage'. Debe llamarse UNA sola vez
 * al iniciar la página de asientos.
 *
 * El evento 'storage' SOLO se dispara en pestañas distintas a la que
 * hizo el cambio (limitación nativa del navegador). Por eso sirve para
 * enterarse de selecciones hechas por OTROS, mientras que los cambios
 * propios se reflejan directamente en alternarSeleccionAsiento().
 *
 * @param {object} [opciones]
 * @param {() => void} [opciones.onSincronizar] - callback para re-renderizar
 */
export function inicializarSincronizacion(opciones = {}) {
    const { onSincronizar } = opciones;

    window.addEventListener("storage", (evento) => {
        // Solo nos interesa la clave de selección de asientos
        if (evento.key !== CLAVE_SELECCION_ASIENTOS) return;

        const seleccionActualizada = evento.newValue ? JSON.parse(evento.newValue) : [];

        // Reconciliamos el array en memoria con lo que llegó de otra pestaña
        _asientos.forEach((asiento) => {
            const estaSeleccionadoAhora = seleccionActualizada.includes(asiento.idAsiento);

            if (estaSeleccionadoAhora && asiento.estado === "disponible") {
                // Otra pestaña lo tomó: lo mostramos como ocupado (bloqueo inmediato)
                asiento.estado = "ocupado";
            } else if (!estaSeleccionadoAhora && asiento.estado === "seleccionado") {
                // Otra pestaña liberó un asiento que aquí figuraba seleccionado
                asiento.estado = "disponible";
            } else if (!estaSeleccionadoAhora && asiento.estado === "ocupado") {
                // Se liberó un asiento bloqueado por otra pestaña
                asiento.estado = "disponible";
            }
        });

        if (typeof onSincronizar === "function") {
            onSincronizar();
        }
    });
}

/* ============================================================================
 * 7. UTILIDAD (para debug/testing desde consola)
 * ==========================================================================*/

/** @returns {Asiento[]} copia del array completo, para debug */
export function obtenerTodosLosAsientos() {
    return [..._asientos];
}
