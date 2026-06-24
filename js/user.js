/**
 * user.js — Vista del Cliente
 * Se completará en la siguiente fase del proyecto.
 *
 * Importará: { getSession, logout } de './auth.js'
 * Importará: helpers de './storage.js'
 * Importará: lógica de './cart.js'
 *
 * Responsabilidades futuras:
 *  - Filtrado de partidos (sobre arrays JS, nunca sobre DOM).
 *  - Generación dinámica del mapa de asientos (createElement + dataset).
 *  - Suscripción al evento 'storage' para sincronización entre pestañas.
 */

import { logout } from './auth.js';

// Botón de logout disponible en user.html
const btnLogout = document.getElementById('btn-logout');
if (btnLogout) {
  btnLogout.addEventListener('click', () => logout());
}

// Sincronización entre pestañas — sin polling, usando evento 'storage'.
window.addEventListener('storage', (event) => {
  if (event.key === 'ta_seats' || event.key === 'ta_orders') {
    // Próxima fase: refrescar el mapa de asientos al detectar cambios.
    console.log('[user.js] Cambio detectado en storage:', event.key);
  }
});
