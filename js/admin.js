/**
 * admin.js — Panel de Administración
 * Se completará en la siguiente fase del proyecto.
 *
 * Importará: { getSession, logout } de './auth.js'
 * Importará: helpers de './storage.js'
 *
 * Responsabilidades futuras:
 *  - Carga y creación de partidos.
 *  - Gestión de sectores y precios.
 *  - Bloqueo de asientos vendidos.
 */

import { logout } from './auth.js';

// Botón de logout disponible en admin.html
const btnLogout = document.getElementById('btn-logout');
if (btnLogout) {
  btnLogout.addEventListener('click', () => logout());
}
