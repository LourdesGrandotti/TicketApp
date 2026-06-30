/**
 * js/main.js
 * Orquestador central de la Selección de Entradas (Persona 4)
 * Integra el punto de salida hacia el Carrito de Compras (Persona 5)
 */

import {
    inicializarAsientos,
    renderizarMapaSectores,
    renderizarListaAsientos,
    renderizarResumenSeleccion,
    inicializarSincronizacion,
    obtenerAsientosSeleccionados
} from "./modules/seating.js"; // RUTA CORREGIDA

// Contenedores del DOM en partidos.html o la vista de selección
const contenedorMapa = document.querySelector("#mapa-sectores");
const contenedorAsientos = document.querySelector("#lista-asientos");
const contenedorResumen = document.querySelector("#resumen-seleccion");

let sectorActivo = null;

function pintarPantallaActiva() {
    // 1. Renderizar el mapa de sectores generales (Tribunas)
    if (contenedorMapa) {
        renderizarMapaSectores(contenedorMapa, (idSector) => {
            sectorActivo = idSector;
            pintarPantallaActiva();
        });
    }

    // 2. Renderizar la grilla de asientos individuales del sector seleccionado
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
        // INTERSECCIÓN PERSONA 4 Y 5: Enlace dinámico a tu Carrito de Compras
        // =======================================================================
        const asientosElegidos = obtenerAsientosSeleccionados();

        // Si el usuario marcó al menos una butaca, se inyecta el botón de Bootstrap 5 para ir a tu flujo
        if (asientosElegidos.length > 0) {
            const btnIrAlCarrito = document.createElement("a");
            btnIrAlCarrito.href = "carrito.html"; // Tu archivo HTML físico 
            btnIrAlCarrito.className = "btn btn-success w-100 mt-3 fw-bold py-2 shadow-sm text-uppercase small";
            btnIrAlCarrito.innerHTML = "<i class='bi bi-cart-check-fill me-1'></i> Confirmar Asientos y Pagar";

            contenedorResumen.appendChild(btnIrAlCarrito);
        }
    }
}

// Inicialización automática de la aplicación al cargar el DOM
document.addEventListener("DOMContentLoaded", () => {
    inicializarAsientos(); // Levanta el estado inicial del estadio
    inicializarSincronizacion({ onSincronizar: pintarPantallaActiva }); // Activa bloqueo multi-pestaña
    pintarPantallaActiva();
});