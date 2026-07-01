/**
 * main.js (fragmento de ejemplo de integración)
 * ---------------------------------------------------------------------------
 * Esto NO reemplaza tu main.js real — es la referencia de cómo conectar
 * las funciones exportadas por seating.js con el DOM de home.html / partidos.html.
 *
 * Ajustá los selectores (#mapa-sectores, etc.) a los ids reales que ya
 * existan en tus HTML.
 * ---------------------------------------------------------------------------
 */

import {
    inicializarAsientos,
    renderizarMapaSectores,
    renderizarListaAsientos,
    renderizarResumenSeleccion,
    inicializarSincronizacion,
} from "./modules/seating.js";

// Contenedores del DOM (ajustar ids según el HTML real)
const contenedorMapa = document.querySelector("#mapa-sectores");
const contenedorAsientos = document.querySelector("#lista-asientos");
const contenedorResumen = document.querySelector("#resumen-seleccion");

let sectorActivo = null;

function pintarPantallaActiva() {
    if (contenedorMapa) {
        renderizarMapaSectores(contenedorMapa, (idSector) => {
            sectorActivo = idSector;
            pintarPantallaActiva();
        });
    }

    if (contenedorAsientos && sectorActivo) {
        renderizarListaAsientos(contenedorAsientos, sectorActivo, {
            onCambioSeleccion: pintarPantallaActiva,
        });
    }

    if (contenedorResumen) {
        renderizarResumenSeleccion(contenedorResumen, {
            onQuitarAsiento: pintarPantallaActiva,
        });
    }
}

document.addEventListener("DOMContentLoaded", () => {
    inicializarAsientos(); // genera el mock completo (todos los sectores)
    inicializarSincronizacion({ onSincronizar: pintarPantallaActiva });
    pintarPantallaActiva();
});
