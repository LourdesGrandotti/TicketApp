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

/**
 * js/storage.js
 * Capa de persistencia local unificada para la selección y bloqueo de asientos.
 */

const CLAVE_SELECCION = "ticketapp_asientos_seleccionados";
const CLAVE_PARTIDOS = "ticketapp_partidos";

export function obtenerSeleccionGuardada() {
    try {
        const data = localStorage.getItem(CLAVE_SELECCION);
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error("storage.js: error al leer la selección guardada", error);
        return [];
    }
}

export function guardarSeleccion(listaIds) {
    try {
        localStorage.setItem(CLAVE_SELECCION, JSON.stringify(listaIds));
    } catch (error) {
        console.error("storage.js: error al guardar la selección", error);
    }
}

export function agregarAsientoALaSeleccion(idAsiento) {
    const actual = obtenerSeleccionGuardada();
    if (!actual.includes(idAsiento)) {
        actual.push(idAsiento);
        guardarSeleccion(actual);
    }
}

export function quitarAsientoDeLaSeleccion(idAsiento) {
    const actual = obtenerSeleccionGuardada();
    guardarSeleccion(actual.filter((id) => id !== idAsiento));
}

export const CLAVE_SELECCION_ASIENTOS = CLAVE_SELECCION;

/* =========================================================================
   MÓDULO: ADMINISTRACIÓN DE PARTIDOS 
   ========================================================================= */

/** Trae la lista completa de partidos desde el LocalStorage */
export function obtenerPartidosDeStorage() {
    try {
        const partidosTexto = localStorage.getItem(CLAVE_PARTIDOS);
        return partidosTexto ? JSON.parse(partidosTexto) : [];
    } catch (error) {
        console.error("storage.js: error al leer los partidos", error);
        return [];
    }
}

/** Guarda la lista completa de partidos de vuelta en el LocalStorage */
export function guardarPartidosEnStorage(listaPartidos) {
    try {
        localStorage.setItem(CLAVE_PARTIDOS, JSON.stringify(listaPartidos));
    } catch (error) {
        console.error("storage.js: error al guardar los partidos", error);
    }
}
