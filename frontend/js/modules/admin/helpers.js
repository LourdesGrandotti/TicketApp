/**
 * 🛠️ Acá se guardan las funciones auxiliares y utilidades generales.
 * Ayudan a calcular estados, dar formato visual a los badges o simular datos.
 */

// Calcula el estado real de un partido basándose en su fecha actual y si fue cancelado manualmente.
export function obtenerEstadoReal(partido) {
  if (partido.estado === 'cancelado') {
    return 'cancelado';
  }

  const ahora = new Date();
  const fechaPartido = new Date(partido.fecha);

  if (fechaPartido < ahora) {
    return 'finalizado';
  }

  return partido.estado || 'nuevo';
}

// Retorna el badge de Bootstrap coloreado según el estado del partido.
export function obtenerBadgeEstadoHTML(estado) {
  if (estado === 'nuevo') {
    return `<span class="badge bg-success-subtle text-success border border-success-subtle">● Nuevo</span>`;
  }
  if (estado === 'reprogramado') {
    return `<span class="badge bg-warning-subtle text-warning border border-warning-subtle">● Reprogramado</span>`;
  }
  if (estado === 'cancelado') {
    return `<span class="badge bg-danger-subtle text-danger border border-danger-subtle">● Cancelado</span>`;
  }
  if (estado === 'finalizado') {
    return `<span class="badge bg-secondary-subtle text-secondary border border-secondary-subtle">● Finalizado</span>`;
  }
  return `<span class="badge bg-light text-dark border">● ${estado}</span>`;
}

// Simula la cantidad de entradas vendidas por sector para renderizar gráficos de auditoría.
export function obtenerSimulacionVentasSector(nombreSector) {
  const semillas = {
    'sector vip': 85,
    'sector platea': 120,
    'sector general': 240,
    'sector popular': 310
  };
  const clave = nombreSector.toLowerCase().trim();
  return semillas[clave] || 150;
}
