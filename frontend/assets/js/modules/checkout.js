import { inicializarAsientos, generarAsientosMock } from "./seating.js";
import { obtenerSeleccionGuardada } from "../storage.js";
import { obtenerInfoPartido } from "./matchInfo.js";
import {
    renderizarResumen,
    renderizarFormularioPago,
    renderizarCompraExitosa
} from "./cart.js";

// --- Configuración y Estado ---
const CONFIG = {
    // login.js (el que setea userToken al iniciar sesión) vive en login.html,
    // no en index.html — corregido para que la redirección funcione.
    loginPageUrl: "login.html",
    mapaAsientosUrl: "partidos.html"
};

const contenedor = document.getElementById("modulo-checkout");
let ordenGenerada = null;

// El ID del partido viaja por query string desde asientos.html
// (?partido=X), igual que en estadio.html/asientos.html.
const params = new URLSearchParams(location.search);
const idPartido = params.get("partido") || "";
const datosPartido = obtenerInfoPartido(idPartido);

/**
 * Verifica si el usuario inició sesión. Redirige si no tiene token.
 */
function verificarAutenticacion() {
    const token = localStorage.getItem("userToken");
    if (!token) {
        alert("Debés iniciar sesión para acceder a esta sección.");
        window.location.href = CONFIG.loginPageUrl;
    }
}

/**
 * Reconstruye en memoria (dentro de seating.js) los objetos de asiento
 * completos (precio, sector, fila, número) a partir de los IDs guardados
 * en localStorage por storage.js.
 *
 * seating.js solo mantiene su array `_asientos` en memoria durante la
 * sesión de UNA página de un sector puntual (asientos.html?sector=X), así
 * que al llegar acá —una página nueva— ese array está vacío. Como el
 * idAsiento tiene el formato "<idSector>-<fila>-<numero>" (ej: "A11-2-5"),
 * podemos deducir de qué sector(es) son los asientos guardados y regenerar
 * su grilla completa con generarAsientosMock(), para que
 * inicializarAsientos() los reconozca y los marque como "seleccionado".
 */
function reconstruirAsientosSeleccionados() {
    const idsGuardados = obtenerSeleccionGuardada();

    const sectoresUnicos = [
        ...new Set(idsGuardados.map((id) => id.split("-")[0]))
    ];

    const asientosCompletos = sectoresUnicos.flatMap((sector) =>
        generarAsientosMock(sector)
    );

    inicializarAsientos(asientosCompletos);
}

/**
 * Manejador del flujo de vistas del checkout.
 * @param {string} vista - Nombre de la vista ("resumen", "pago", "exito")
 */
function navegarFlujoCheckout(vista) {
    switch (vista) {
        case "resumen":
            renderizarResumen(
                contenedor,
                () => navegarFlujoCheckout("pago"),
                () => {
                    const idsGuardados = obtenerSeleccionGuardada();
                    let sector = "A1";
                    let cant = 1;
                    if (idsGuardados.length > 0) {
                        sector = idsGuardados[0].split("-")[0];
                        cant = idsGuardados.length;
                    }
                    const urlParams = new URLSearchParams();
                    urlParams.set("sector", sector);
                    if (idPartido) {
                        urlParams.set("partido", idPartido);
                    }
                    urlParams.set("cant", cant);
                    window.location.href = `asientos.html?${urlParams.toString()}`;
                },
                datosPartido
            );
            break;
        case "pago":
            renderizarFormularioPago(
                contenedor,
                (datosCompra) => {
                    // Genera código siguiendo la nomenclatura C-XXXXX que definió el grupo
                    ordenGenerada = `C-${Math.floor(Math.random() * 90000 + 10000)}`;
                    navegarFlujoCheckout("exito");
                },
                () => navegarFlujoCheckout("resumen"),
                idPartido
            );
            break;
        case "exito":
            renderizarCompraExitosa(contenedor, ordenGenerada);
            break;
        default:
            console.warn(`Vista desconocida en el flujo: ${vista}`);
    }
}

/**
 * Configura el comportamiento del botón de cerrar sesión.
 */
function configurarLogout() {
    const btnLogout = document.getElementById("btn-logout");
    if (!btnLogout) return;

    btnLogout.addEventListener("click", (e) => {
        e.preventDefault();
        const confirmar = confirm("¿Seguro que desea cerrar sesión?");
        if (confirmar) {
            localStorage.removeItem("userToken");
            localStorage.removeItem("currentUser");
            localStorage.removeItem("currentUsername");
            localStorage.removeItem("userRole");
            window.location.href = CONFIG.loginPageUrl;
        }
    });
}

// --- Inicialización de la aplicación ---
verificarAutenticacion();

document.addEventListener("DOMContentLoaded", () => {
    configurarLogout();
    reconstruirAsientosSeleccionados();
    navegarFlujoCheckout("resumen");
});
