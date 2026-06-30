import { inicializarAsientos } from "./seating.js";
import { 
    renderizarResumen, 
    renderizarFormularioPago, 
    renderizarCompraExitosa 
} from "./cart.js";

// --- Configuración y Estado ---
const CONFIG = {
    loginPageUrl: "index.html",
    mapaAsientosUrl: "partidos.html"
};

const contenedor = document.getElementById("modulo-checkout");
let ordenGenerada = null;

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
 * Manejador del flujo de vistas del checkout.
 * @param {string} vista - Nombre de la vista ("resumen", "pago", "exito")
 */
function navegarFlujoCheckout(vista) {
    switch (vista) {
        case "resumen":
            renderizarResumen(
                contenedor, 
                () => navegarFlujoCheckout("pago"), 
                () => { window.location.href = CONFIG.mapaAsientosUrl; }
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
                () => navegarFlujoCheckout("resumen")
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
    inicializarAsientos();
    navegarFlujoCheckout("resumen");
});
