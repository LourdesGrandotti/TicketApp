/**
 * storage.js — Funciones auxiliares para localStorage
 * Se completará en la siguiente fase del proyecto.
 *
 * Exportará utilidades como:
 *  - getItem(key)
 *  - setItem(key, value)
 *  - removeItem(key)
 *  - getMatches(), saveMatches(), etc.
 */

// Stub vacío — sin errores de importación.
export { };

/**
 * storage.js
 * ---------------------------------------------------------------------------
 * Capa de persistencia local (auxiliar) para TicketApp.
 *
 * Responsabilidad única: leer/escribir en localStorage.
 * Ningún otro módulo debe llamar a `localStorage` directamente: todos pasan
 * por estas funciones. Esto es lo que permite que, el día que migremos a un
 * servidor API real, solo haya que reescribir ESTE archivo (cambiando los
 * `localStorage.getItem/setItem` por `fetch(...)`) sin tocar seating.js.
 *
 * Clave usada en localStorage: "ticketapp_asientos_seleccionados"
 * Valor guardado: array de idAsiento (strings) seleccionados GLOBALMENTE,
 * es decir, por cualquier usuario/pestaña que esté usando la app en este navegador.
 * ---------------------------------------------------------------------------
 */

const CLAVE_SELECCION = "ticketapp_asientos_seleccionados";

/**
 * Devuelve el array de idAsiento actualmente marcados como seleccionados
 * (ocupados en el "carrito" global, simulando bloqueo entre usuarios).
 * @returns {string[]}
 */
export function obtenerSeleccionGuardada() {
    try {
        const data = localStorage.getItem(CLAVE_SELECCION);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error("storage.js: error al leer la selección guardada", error);
        return [];
    }
}

/**
 * Sobrescribe en localStorage el array completo de asientos seleccionados.
 * Disparar este método ES lo que provoca el evento 'storage' en OTRAS pestañas
 * (en la pestaña que ejecuta el set NO se dispara el evento 'storage' a sí misma,
 * por eso seating.js actualiza su propio DOM de forma directa además de llamar acá).
 * @param {string[]} listaIds
 */
export function guardarSeleccion(listaIds) {
    try {
        localStorage.setItem(CLAVE_SELECCION, JSON.stringify(listaIds));
    } catch (error) {
        console.error("storage.js: error al guardar la selección", error);
    }
}

/**
 * Agrega un idAsiento a la selección guardada (si no estaba ya).
 * @param {string} idAsiento
 */
export function agregarAsientoALaSeleccion(idAsiento) {
    const actual = obtenerSeleccionGuardada();
    if (!actual.includes(idAsiento)) {
        actual.push(idAsiento);
        guardarSeleccion(actual);
    }
}

/**
 * Quita un idAsiento de la selección guardada.
 * @param {string} idAsiento
 */
export function quitarAsientoDeLaSeleccion(idAsiento) {
    const actual = obtenerSeleccionGuardada();
    guardarSeleccion(actual.filter((id) => id !== idAsiento));
}

/**
 * Nombre de la clave expuesto para que seating.js pueda filtrar
 * eventos 'storage' que no le correspondan (otros módulos podrían
 * usar localStorage para otras cosas, ej: datos de usuario logueado).
 */
export const CLAVE_SELECCION_ASIENTOS = CLAVE_SELECCION;