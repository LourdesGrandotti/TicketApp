/**
 * seating.js
 * ---------------------------------------------------------------------------
 * Módulo de PERSONA 4 — TicketApp
 *
 * Pantallas cubiertas:
 *   - Secciones disponibles   -> renderizarMapaSectores()
 *   - Ver sección             -> renderizarListaAsientos()
 *   - Seleccionar asientos    -> (incluido en renderizarListaAsientos, vía clicks)
 *   - Mostrar asientos seleccionados -> renderizarResumenSeleccion()
 *
 * Reglas de oro aplicadas:
 *   1. DOM 100% dinámico (createElement + appendChild + dataset), sin innerHTML
 *      para los nodos de asientos/sectores.
 *   2. Sincronización entre pestañas con window.addEventListener('storage', ...).
 *      Cero setInterval, cero polling.
 *   3. Todos los filtros de disponibilidad se aplican con .filter()/.find()
 *      sobre el array `_asientos` en memoria. Nunca se filtra recorriendo el DOM.
 *   4. Funciones puras y exportadas, pensadas para recibir en el futuro un
 *      array de asientos que venga de fetch() a una API real en lugar de
 *      generarAsientosMock().
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
 * Catálogo de sectores del estadio. Esto es lo más parecido a una tabla
 * "Sectores" que vendría del backend (GET /api/sectores).
 * @typedef {{ idSector: number, nombre: string, filas: number, asientosPorFila: number, precio: number }} Sector
 */
export const SECTORES = [
    { idSector: 1, nombre: "Norte", filas: 5, asientosPorFila: 10, precio: 15000 },
    { idSector: 2, nombre: "Sur", filas: 5, asientosPorFila: 10, precio: 15000 },
    { idSector: 3, nombre: "Platea", filas: 4, asientosPorFila: 8, precio: 35000 },
    { idSector: 4, nombre: "Palco", filas: 2, asientosPorFila: 6, precio: 60000 },
];

/**
 * Array en memoria con TODOS los asientos de TODOS los sectores.
 * Es la "fuente de verdad" del módulo. Se inicializa con generarAsientosMock()
 * y, el día de mañana, se puede reemplazar por el resultado de:
 *   const _asientos = await fetch('/api/asientos').then(r => r.json());
 * sin que el resto del módulo cambie una sola línea, porque la forma del
 * objeto Asiento se mantiene igual.
 * @type {Asiento[]}
 */
let _asientos = [];

/**
 * @typedef {{
 *   idAsiento: string,
 *   idSector: number,
 *   sector: string,
 *   fila: string,
 *   numero: number,
 *   precio: number,
 *   estado: "disponible" | "seleccionado" | "ocupado"
 * }} Asiento
 */

/**
 * Genera el array mock de asientos para un sector dado, simulando lo que
 * en el futuro será la respuesta de GET /api/sectores/:id/asientos.
 * Si no se pasa idSector, genera los asientos de TODOS los sectores.
 * @param {number} [idSector]
 * @returns {Asiento[]}
 */
export function generarAsientosMock(idSector) {
    const sectoresAGenerar = idSector
        ? SECTORES.filter((s) => s.idSector === idSector)
        : SECTORES;

    const nuevosAsientos = [];

    sectoresAGenerar.forEach((sector) => {
        for (let f = 0; f < sector.filas; f++) {
            const letraFila = String.fromCharCode(65 + f); // A, B, C...
            for (let n = 1; n <= sector.asientosPorFila; n++) {
                // Un ~12% de los asientos arrancan "ocupados" para simular
                // ventas previas reales que vendrían del backend.
                const yaOcupado = Math.random() < 0.12;

                nuevosAsientos.push({
                    idAsiento: `${sector.nombre.slice(0, 1).toUpperCase()}-${letraFila}-${n}`,
                    idSector: sector.idSector,
                    sector: sector.nombre,
                    fila: letraFila,
                    numero: n,
                    precio: sector.precio,
                    estado: yaOcupado ? "ocupado" : "disponible",
                });
            }
        }
    });

    return nuevosAsientos;
}

/**
 * Inicializa (o reinicializa) el array en memoria `_asientos`.
 * Útil para tests o para cuando llegue la data real del backend:
 *   inicializarAsientos(await fetchAsientosDesdeAPI());
 * @param {Asiento[]} [asientosIniciales] - si no se pasa, genera el mock completo.
 */
export function inicializarAsientos(asientosIniciales) {
    _asientos = asientosIniciales ?? generarAsientosMock();

    // Al iniciar, sincronizamos contra lo que ya estaba seleccionado por
    // otras pestañas/sesiones (ej: si recargamos la página).
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

/** @returns {Asiento[]} solo los disponibles de un sector */
function filtrarDisponiblesPorSector(idSector) {
    return _asientos.filter((a) => a.idSector === idSector && a.estado === "disponible");
}

/** @returns {Asiento[]} todos los asientos en estado "seleccionado" (global) */
export function obtenerAsientosSeleccionados() {
    return _asientos.filter((a) => a.estado === "seleccionado");
}

/** @returns {{ idSector:number, nombre:string, disponibles:number, total:number, precio:number }[]} */
function calcularResumenPorSector() {
    return SECTORES.map((sector) => {
        const asientosDelSector = filtrarPorSector(sector.idSector);
        const disponibles = asientosDelSector.filter((a) => a.estado === "disponible").length;
        return {
            idSector: sector.idSector,
            nombre: sector.nombre,
            disponibles,
            total: asientosDelSector.length,
            precio: sector.precio,
        };
    });
}

/* ============================================================================
 * 3. RENDER DINÁMICO — Pantalla "Secciones disponibles"
 * ==========================================================================*/

/**
 * Pinta el mapa general de sectores (Norte, Sur, Platea, Palco) dentro del
 * contenedor indicado. Cada sector es clickeable y dispara onSeleccionarSector.
 * @param {HTMLElement} contenedor
 * @param {(idSector: number) => void} [onSeleccionarSector]
 */
export function renderizarMapaSectores(contenedor, onSeleccionarSector) {
    if (!contenedor) return;

    // Limpiamos el contenedor de forma controlada (no innerHTML = "").
    while (contenedor.firstChild) {
        contenedor.removeChild(contenedor.firstChild);
    }

    const resumen = calcularResumenPorSector();

    const fila = document.createElement("div");
    fila.classList.add("row", "g-3", "mapa-sectores");

    resumen.forEach((sector) => {
        const columna = document.createElement("div");
        columna.classList.add("col-6", "col-md-3");

        const tarjeta = document.createElement("div");
        tarjeta.classList.add("card", "h-100", "sector-card", "text-center", "p-3");
        tarjeta.dataset.idSector = String(sector.idSector);
        tarjeta.dataset.estado = sector.disponibles === 0 ? "agotado" : "disponible";

        if (sector.disponibles === 0) {
            tarjeta.classList.add("sector-agotado");
        } else {
            tarjeta.style.cursor = "pointer";
            tarjeta.addEventListener("click", () => {
                if (typeof onSeleccionarSector === "function") {
                    onSeleccionarSector(sector.idSector);
                }
            });
        }

        const titulo = document.createElement("h5");
        titulo.classList.add("card-title");
        titulo.textContent = sector.nombre;

        const disponibilidad = document.createElement("p");
        disponibilidad.classList.add("card-text", "mb-1");
        disponibilidad.textContent =
            sector.disponibles === 0
                ? "Agotado"
                : `${sector.disponibles} de ${sector.total} disponibles`;

        const precio = document.createElement("p");
        precio.classList.add("card-text", "fw-bold");
        precio.textContent = `$${sector.precio.toLocaleString("es-AR")}`;

        tarjeta.appendChild(titulo);
        tarjeta.appendChild(disponibilidad);
        tarjeta.appendChild(precio);
        columna.appendChild(tarjeta);
        fila.appendChild(columna);
    });

    contenedor.appendChild(fila);
}

/* ============================================================================
 * 4. RENDER DINÁMICO — Pantallas "Ver sección" / "Seleccionar asientos"
 * ==========================================================================*/

/**
 * Pinta la grilla de asientos de UN sector dentro del contenedor.
 * Cada asiento es un <button> o <div> con dataset.idAsiento y dataset.estado,
 * clickeable para alternar entre "disponible" <-> "seleccionado".
 * @param {HTMLElement} contenedor
 * @param {number} idSector
 * @param {object} [opciones]
 * @param {() => void} [opciones.onCambioSeleccion] - callback tras cada click válido
 */
export function renderizarListaAsientos(contenedor, idSector, opciones = {}) {
    if (!contenedor) return;
    const { onCambioSeleccion } = opciones;

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

    // Agrupamos por fila para pintar una grilla prolija (array en JS, no DOM).
    const filas = [...new Set(asientosDelSector.map((a) => a.fila))];

    const grilla = document.createElement("div");
    grilla.classList.add("grilla-asientos");
    grilla.dataset.idSector = String(idSector);

    filas.forEach((letraFila) => {
        const filaWrapper = document.createElement("div");
        filaWrapper.classList.add("fila-asientos", "d-flex", "align-items-center", "gap-2", "mb-2");

        const etiquetaFila = document.createElement("span");
        etiquetaFila.classList.add("etiqueta-fila", "fw-bold", "me-2");
        etiquetaFila.textContent = letraFila;
        filaWrapper.appendChild(etiquetaFila);

        const asientosDeFila = asientosDelSector
            .filter((a) => a.fila === letraFila)
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
    boton.classList.add("btn", "btn-asiento");
    boton.dataset.idAsiento = asiento.idAsiento;
    boton.dataset.idSector = String(asiento.idSector);
    boton.dataset.estado = asiento.estado;
    boton.textContent = String(asiento.numero);
    boton.setAttribute("aria-label", `Asiento ${asiento.fila}${asiento.numero} - ${asiento.sector}`);

    aplicarEstiloSegunEstado(boton, asiento.estado);

    if (asiento.estado === "ocupado") {
        boton.disabled = true;
    } else {
        boton.addEventListener("click", () => {
            alternarSeleccionAsiento(asiento.idAsiento);
            // Reflejamos el nuevo estado en el botón sin re-renderizar toda la grilla.
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

/** Aplica clases visuales según el estado (CSS real va en styles.css). */
function aplicarEstiloSegunEstado(boton, estado) {
    boton.classList.remove("btn-disponible", "btn-seleccionado", "btn-ocupado");
    if (estado === "disponible") boton.classList.add("btn-disponible");
    if (estado === "seleccionado") boton.classList.add("btn-seleccionado");
    if (estado === "ocupado") boton.classList.add("btn-ocupado");
}

/* ============================================================================
 * 5. LÓGICA DE SELECCIÓN
 * ==========================================================================*/

/**
 * Alterna el estado de un asiento entre "disponible" y "seleccionado",
 * actualiza el array en memoria Y persiste el cambio en storage.js
 * (lo cual es lo que dispara el evento 'storage' en otras pestañas).
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
 * 6. RENDER DINÁMICO — Pantalla "Mostrar asientos seleccionados" (Resumen)
 * ==========================================================================*/

/**
 * Pinta el resumen de selección actual: lista de asientos elegidos + total.
 * Pensado para ser llamado de nuevo cada vez que cambia la selección
 * (después de cada click, o al recibir un evento 'storage').
 * @param {HTMLElement} contenedor
 * @param {object} [opciones]
 * @param {(idAsiento: string) => void} [opciones.onQuitarAsiento] - callback al quitar desde el resumen
 */
export function renderizarResumenSeleccion(contenedor, opciones = {}) {
    if (!contenedor) return;
    const { onQuitarAsiento } = opciones;

    while (contenedor.firstChild) {
        contenedor.removeChild(contenedor.firstChild);
    }

    const seleccionados = obtenerAsientosSeleccionados();

    const titulo = document.createElement("h5");
    titulo.textContent = "Asientos seleccionados";
    contenedor.appendChild(titulo);

    if (seleccionados.length === 0) {
        const vacio = document.createElement("p");
        vacio.classList.add("text-muted");
        vacio.textContent = "Todavía no seleccionaste ningún asiento.";
        contenedor.appendChild(vacio);
        return;
    }

    const lista = document.createElement("ul");
    lista.classList.add("list-group", "mb-3");

    let total = 0;

    seleccionados.forEach((asiento) => {
        total += asiento.precio;

        const item = document.createElement("li");
        item.classList.add(
            "list-group-item",
            "d-flex",
            "justify-content-between",
            "align-items-center"
        );
        item.dataset.idAsiento = asiento.idAsiento;

        const texto = document.createElement("span");
        texto.textContent = `${asiento.sector} - Fila ${asiento.fila}, Asiento ${asiento.numero} ($${asiento.precio.toLocaleString("es-AR")})`;

        item.appendChild(texto);

        if (typeof onQuitarAsiento === "function") {
            const botonQuitar = document.createElement("button");
            botonQuitar.type = "button";
            botonQuitar.classList.add("btn", "btn-sm", "btn-outline-danger");
            botonQuitar.textContent = "Quitar";
            botonQuitar.addEventListener("click", () => {
                alternarSeleccionAsiento(asiento.idAsiento);
                onQuitarAsiento(asiento.idAsiento);
            });
            item.appendChild(botonQuitar);
        }

        lista.appendChild(item);
    });

    contenedor.appendChild(lista);

    const totalElemento = document.createElement("p");
    totalElemento.classList.add("fw-bold", "fs-5");
    totalElemento.textContent = `Total: $${total.toLocaleString("es-AR")}`;
    contenedor.appendChild(totalElemento);
}

/* ============================================================================
 * 7. SINCRONIZACIÓN ENTRE PESTAÑAS (regla de oro #2)
 * ==========================================================================*/

/**
 * Activa el listener del evento 'storage'. Debe llamarse UNA sola vez,
 * típicamente desde main.js al iniciar la app.
 *
 * Importante: el evento 'storage' SOLO se dispara en pestañas distintas
 * a la que hizo el cambio (es una limitación nativa del navegador, no un
 * bug). Por eso este listener sirve para enterarse de selecciones hechas
 * por OTROS usuarios/pestañas, mientras que los cambios propios ya se
 * reflejan de forma directa en alternarSeleccionAsiento().
 *
 * @param {object} [opciones]
 * @param {() => void} [opciones.onSincronizar] - callback para que quien llamó
 *   pueda re-renderizar la pantalla que tenga activa (mapa, lista o resumen).
 */
export function inicializarSincronizacion(opciones = {}) {
    const { onSincronizar } = opciones;

    window.addEventListener("storage", (evento) => {
        // Filtramos: solo nos interesa la clave de selección de asientos.
        if (evento.key !== CLAVE_SELECCION_ASIENTOS) return;

        const seleccionActualizada = evento.newValue ? JSON.parse(evento.newValue) : [];

        // Reconciliamos el array en memoria con lo que llegó de otra pestaña.
        _asientos.forEach((asiento) => {
            const estaSeleccionadoAhora = seleccionActualizada.includes(asiento.idAsiento);

            if (estaSeleccionadoAhora && asiento.estado === "disponible") {
                // Otra pestaña lo tomó: para esta pestaña pasa a verse como ocupado
                // (bloqueo inmediato), no como "seleccionado" (que implica que YO lo elegí).
                asiento.estado = "ocupado";
            } else if (!estaSeleccionadoAhora && asiento.estado === "seleccionado") {
                // Otra pestaña liberó un asiento que en este array figuraba seleccionado
                // (caso borde: multi-pestaña del mismo usuario). Lo liberamos.
                asiento.estado = "disponible";
            } else if (!estaSeleccionadoAhora && asiento.estado === "ocupado") {
                // Se liberó un asiento que estaba bloqueado por otra pestaña.
                asiento.estado = "disponible";
            }
        });

        if (typeof onSincronizar === "function") {
            onSincronizar();
        }
    });
}

/* ============================================================================
 * 8. UTILIDAD INTERNA (uso en main.js si se necesita debug)
 * ==========================================================================*/

/** @returns {Asiento[]} copia de seguridad del array completo, para debug/testing */
export function obtenerTodosLosAsientos() {
    return [..._asientos];
}
