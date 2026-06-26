/**
 * main.js
 * ---------------------------------------------------------------------------
 * Orquestador central de la Selección de Entradas (Persona 4)
 * Integra el punto de salida hacia el Carrito Multipágina (Persona 5)
 * ---------------------------------------------------------------------------
 */

import {
    inicializarAsientos,
    renderizarMapaSectores,
    renderizarListaAsientos,
    renderizarResumenSeleccion,
    inicializarSincronizacion,
    obtenerAsientosSeleccionados // Importamos esto para verificar si habilitamos tu botón
} from "./modules/seating.js";

// Contenedores del DOM en partidos.html
const contenedorMapa = document.querySelector("#mapa-sectores");
const contenedorAsientos = document.querySelector("#lista-asientos");
const contenedorResumen = document.querySelector("#resumen-seleccion");

let sectorActivo = null;

function pintarPantallaActiva() {
    // 1. Renderizar el mapa de sectores generales
    if (contenedorMapa) {
        renderizarMapaSectores(contenedorMapa, (idSector) => {
            sectorActivo = idSector;
            pintarPantallaActiva();
        });
    }

    // 2. Renderizar la grilla de asientos del sector que esté clickeado
    if (contenedorAsientos && sectorActivo) {
        renderizarListaAsientos(contenedorAsientos, sectorActivo, {
            onCambioSeleccion: pintarPantallaActiva,
        });
    }

    // 3. Renderizar el resumen lateral de las entradas elegidas
    if (contenedorResumen) {
        renderizarResumenSeleccion(contenedorResumen, {
            onQuitarAsiento: pintarPantallaActiva,
        });

        // =======================================================================
        // INTERSECCIÓN PERSONA 4 Y 5: Inyección del botón de Checkout
        // =======================================================================
        const asientosElegidos = obtenerAsientosSeleccionados();

        // Si el usuario ya marcó al menos una butaca, le clavamos el botón para ir a tu página
        if (asientosElegidos.length > 0) {
            const btnIrAlCarrito = document.createElement("a");
            btnIrAlCarrito.href = "carrito.html"; // Tu archivo HTML físico [cite: 92]
            btnIrAlCarrito.classList.add("btn", "btn-success", "w-100", "mt-3", "fw-bold", "py-2", "shadow-sm");
            btnIrAlCarrito.innerHTML = 'Confirmar Asientos y Pagar 🛒';

            contenedorResumen.appendChild(btnIrAlCarrito);
        }
    }
}

// Inicialización de la App al cargar el DOM
document.addEventListener("DOMContentLoaded", () => {
    inicializarAsientos(); // Levanta el estado inicial/mock del estadio 
    inicializarSincronizacion({ onSincronizar: pintarPantallaActiva }); // Bloqueo en tiempo real multi-pestaña 
    pintarPantallaActiva();
});