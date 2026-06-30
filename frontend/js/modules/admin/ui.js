/**
 * 🎨 Acá se guardan las funciones que controlan el diseño y la interfaz de usuario (HTML).
 * Se encargan de capturar elementos del DOM, dibujar las tablas, actualizar los gráficos de Chart.js y los KPIs.
 */

import { obtenerPartidosDeStorage, guardarPartidosEnStorage } from './storage.js';
import { obtenerEstadoReal, obtenerBadgeEstadoHTML, obtenerSimulacionVentasSector } from './helpers.js';

// --- CAPTURA DE ELEMENTOS DEL HTML ---
export const selectEquipo1 = document.getElementById('select-equipo-1');
export const selectEquipo2 = document.getElementById('select-equipo-2');
export const flagContainer1 = document.getElementById('flag-container-1');
export const flagContainer2 = document.getElementById('flag-container-2');
export const formularioPartido = document.getElementById('form-partido');
export const inputFecha = document.getElementById('input-fecha');
export const tablaPartidosCuerpo = document.getElementById('tabla-partidos-cuerpo');
export const contadorPartidos = document.getElementById('contador-partidos');
export const contenedorSectores = document.getElementById('contenedor-sectores');
export const btnAgregarSector = document.getElementById('btn-agregar-sector');
export const tituloFormulario = document.getElementById('form-partido-titulo');
export const botonGuardar = document.getElementById('btn-guardar-partido');
export const botonCancelarEdicion = document.getElementById('btn-cancelar-edicion');
export const tablaDashboardCuerpo = document.getElementById('tabla-dashboard-cuerpo');
export const filtroDashboard = document.getElementById('filtro-partidos-dashboard');

// Variable de estado para la edición del partido
export let idPartidoEnEdicion = null;

// Función para cambiar el valor del partido en edición
export function establecerIdPartidoEnEdicion(valor) {
  idPartidoEnEdicion = valor;
}

// Variables para guardar las instancias de los gráficos de Chart.js
let instanciaGraficoBarras = null;
let instanciaGraficoDona = null;

// Carga de países del mundial en los selectores
export function cargarPaisesDelMundial() {
  const paises = [
    { codigo: 'de', nombre: 'Alemania' }, { codigo: 'dz', nombre: 'Argelia' },
    { codigo: 'ar', nombre: 'Argentina' }, { codigo: 'au', nombre: 'Australia' },
    { codigo: 'at', nombre: 'Austria' }, { codigo: 'be', nombre: 'Bélgica' },
    { codigo: 'ba', nombre: 'Bosnia y Herzegovina' }, { codigo: 'br', nombre: 'Brasil' },
    { codigo: 'cv', nombre: 'Cabo Verde' }, { codigo: 'ca', nombre: 'Canadá' },
    { codigo: 'co', nombre: 'Colombia' }, { codigo: 'ci', nombre: 'Costa de Marfil' },
    { codigo: 'hr', nombre: 'Croacia' }, { codigo: 'ec', nombre: 'Ecuador' },
    { codigo: 'eg', nombre: 'Egipto' }, { codigo: 'es', nombre: 'España' },
    { codigo: 'us', nombre: 'Estados Unidos' }, { codigo: 'fr', nombre: 'Francia' },
    { codigo: 'gh', nombre: 'Ghana' }, { codigo: 'gb-eng', nombre: 'Inglaterra' },
    { codigo: 'jp', nombre: 'Japón' }, { codigo: 'ma', nombre: 'Marruecos' },
    { codigo: 'mx', nombre: 'México' }, { codigo: 'no', nombre: 'Noruega' },
    { codigo: 'nl', nombre: 'Países Bajos' }, { codigo: 'py', nombre: 'Paraguay' },
    { codigo: 'pt', nombre: 'Portugal' }, { codigo: 'cd', nombre: 'RD Congo' },
    { codigo: 'sn', nombre: 'Senegal' }, { codigo: 'za', nombre: 'Sudáfrica' },
    { codigo: 'se', nombre: 'Suecia' }, { codigo: 'ch', nombre: 'Suiza' }
  ];

  paises.forEach(function (pais) {
    const opcion1 = document.createElement('option');
    opcion1.value = pais.codigo;
    opcion1.textContent = pais.nombre;
    selectEquipo1.appendChild(opcion1);

    const opcion2 = document.createElement('option');
    opcion2.value = pais.codigo;
    opcion2.textContent = pais.nombre;
    selectEquipo2.appendChild(opcion2);
  });
}

// Carga los inputs dinámicos en el formulario para precios
export function crearInputSectorHTML(nombre, precio = '') {
  const columna = document.createElement('div');
  columna.className = 'col-6 mb-2';
  columna.innerHTML = `
    <label class="form-label text-muted extra-small m-0">${nombre}</label>
    <div class="input-group input-group-sm">
      <span class="input-group-text">$</span>
      <input type="number" class="form-control input-precio-sector" data-nombre="${nombre}" placeholder="0.00" min="0" value="${precio}" required>
      <button type="button" class="btn btn-outline-danger btn-eliminar-sector" title="Eliminar este sector">
        <i class="bi bi-trash"></i>
      </button>
    </div>
  `;

  const botonEliminarSector = columna.querySelector('.btn-eliminar-sector');
  botonEliminarSector.addEventListener('click', function () {
    columna.remove();
  });

  contenedorSectores.appendChild(columna);
}

// Carga los sectores predeterminados del mundial
export function cargarSectoresPredeterminados() {
  contenedorSectores.innerHTML = '';
  crearInputSectorHTML('Sector VIP');
  crearInputSectorHTML('Sector Platea');
  crearInputSectorHTML('Sector General');
  crearInputSectorHTML('Sector Popular');
}

// Dibuja la tabla de gestión de partidos
export function actualizarTablaPartidos() {
  const partidos = obtenerPartidosDeStorage();
  const partidosActivos = partidos.filter(function (partido) {
    return partido.estado !== 'cancelado';
  });

  if (contadorPartidos) {
    contadorPartidos.textContent = `Total: ${partidosActivos.length} partido${partidosActivos.length === 1 ? '' : 's'}`;
  }

  tablaPartidosCuerpo.innerHTML = '';

  partidosActivos.forEach(function (partido) {
    const partesFecha = partido.fecha.split('T');
    const fechaFormateada = partesFecha[0] || '---';
    const horaFormateada = partesFecha[1] || '00:00';
    const estadoReal = obtenerEstadoReal(partido);

    const fila = document.createElement('tr');
    const estaFinalizado = (estadoReal === 'finalizado');
    
    const botonEditarHTML = estaFinalizado
      ? `<button class="btn btn-sm btn-outline-secondary border me-1" disabled title="No se puede editar un partido ya finalizado"><i class="bi bi-pencil-square"></i></button>`
      : `<button class="btn btn-sm btn-outline-warning text-dark border me-1 btn-editar" data-id="${partido.id}" title="Editar Partido"><i class="bi bi-pencil-square"></i></button>`;

    const botonEliminarHTML = estaFinalizado
      ? `<button class="btn btn-sm btn-outline-danger btn-eliminar-definitivo" data-id="${partido.id}" title="Eliminar definitivamente del almacenamiento"><i class="bi bi-trash"></i></button>`
      : `<button class="btn btn-sm btn-outline-danger btn-eliminar" data-id="${partido.id}" title="Cancelar Partido"><i class="bi bi-x-square"></i></button>`;

    fila.innerHTML = `
      <td>
        <div class="d-flex align-items-center gap-2">
          <div class="d-flex align-items-center gap-1">
            <img src="https://flagcdn.com/w20/${partido.codigoEquipo1}.png" alt="Bandera 1" width="20">
            <span class="fw-bold text-dark">${partido.nombreEquipo1}</span>
          </div>
          <span class="text-muted small">vs</span>
          <div class="d-flex align-items-center gap-1">
            <img src="https://flagcdn.com/w20/${partido.codigoEquipo2}.png" alt="Bandera 2" width="20">
            <span class="fw-bold text-dark">${partido.nombreEquipo2}</span>
          </div>
        </div>
      </td>
      <td>
        <span class="text-dark fw-semibold">${fechaFormateada}</span>
        <div class="text-muted extra-small">${horaFormateada} hs</div>
      </td>
      <td class="text-center">
        <span class="fw-bold text-dark">0%</span>
        <div class="text-muted extra-small">0 / Asientos Totales</div>
      </td>
      <td class="text-end">
        ${botonEditarHTML}
        ${botonEliminarHTML}
      </td>
    `;
    tablaPartidosCuerpo.appendChild(fila);
  });
}

// Dibuja la tabla del Dashboard General de partidos
export function actualizarTablaDashboard() {
  if (!tablaDashboardCuerpo) return;

  const partidos = obtenerPartidosDeStorage();
  const filtroVal = filtroDashboard?.value || 'todos';

  tablaDashboardCuerpo.innerHTML = '';

  const partidosFiltrados = partidos.filter(function (partido) {
    const estadoReal = obtenerEstadoReal(partido);
    if (filtroVal === 'todos') return true;
    return estadoReal === filtroVal;
  });

  if (partidosFiltrados.length === 0) {
    tablaDashboardCuerpo.innerHTML = `
      <tr>
        <td colspan="5" class="text-center text-muted py-3">No hay partidos registrados para mostrar.</td>
      </tr>
    `;
    return;
  }

  partidosFiltrados.forEach(function (partido) {
    const partesFecha = partido.fecha.split('T');
    const fechaFormateada = partesFecha[0] || '---';
    const horaFormateada = partesFecha[1] || '00:00';
    const estadoReal = obtenerEstadoReal(partido);

    const fila = document.createElement('tr');
    const estaDeshabilitado = (estadoReal === 'finalizado' || estadoReal === 'cancelado');
    
    const botonEditarHTML = estaDeshabilitado
      ? `<button class="btn btn-sm btn-light border text-muted" disabled title="No se puede editar un partido finalizado o cancelado"><i class="bi bi-pencil"></i></button>`
      : `<button class="btn btn-sm btn-light border btn-editar-dash" data-id="${partido.id}" title="Editar Partido"><i class="bi bi-pencil"></i></button>`;

    const botonCancelarHTML = estaDeshabilitado
      ? `<button class="btn btn-sm btn-outline-danger btn-eliminar-definitivo-dash" data-id="${partido.id}" title="Eliminar definitivamente del almacenamiento"><i class="bi bi-trash"></i></button>`
      : `<button class="btn btn-sm btn-light border btn-eliminar-dash" data-id="${partido.id}" title="Cancelar Partido"><i class="bi bi-x-square"></i></button>`;

    fila.innerHTML = `
      <td>
        <div class="d-flex align-items-center gap-2">
          <div class="d-flex align-items-center gap-1">
            <img src="https://flagcdn.com/w20/${partido.codigoEquipo1}.png" alt="Bandera 1" width="20">
            <span class="fw-bold text-dark">${partido.nombreEquipo1}</span>
          </div>
          <span class="text-muted small">vs</span>
          <div class="d-flex align-items-center gap-1">
            <img src="https://flagcdn.com/w20/${partido.codigoEquipo2}.png" alt="Bandera 2" width="20">
            <span class="fw-bold text-dark">${partido.nombreEquipo2}</span>
          </div>
        </div>
      </td>
      <td>
        <span class="fw-bold text-dark">${fechaFormateada}</span>
        <div class="text-muted extra-small">${horaFormateada} hs</div>
      </td>
      <td><span class="fw-bold text-dark">0</span> / Asientos Totales</td>
      <td>${obtenerBadgeEstadoHTML(estadoReal)}</td>
      <td>
        ${botonEditarHTML}
        ${botonCancelarHTML}
      </td>
    `;
    tablaDashboardCuerpo.appendChild(fila);
  });
}

// Carga un partido en el formulario de edición
export function cargarPartidoEnFormulario(id) {
  const partidos = obtenerPartidosDeStorage();
  const partidoAEditar = partidos.find(function (partido) {
    return partido.id === id;
  });

  if (!partidoAEditar) return;

  selectEquipo1.value = partidoAEditar.codigoEquipo1;
  selectEquipo2.value = partidoAEditar.codigoEquipo2;
  inputFecha.value = partidoAEditar.fecha;

  flagContainer1.innerHTML = `
    <img src="https://flagcdn.com/w40/${partidoAEditar.codigoEquipo1}.png" alt="Bandera" class="img-fluid">
  `;
  flagContainer2.innerHTML = `
    <img src="https://flagcdn.com/w40/${partidoAEditar.codigoEquipo2}.png" alt="Bandera" class="img-fluid">
  `;

  contenedorSectores.innerHTML = '';
  const sectoresACargar = partidoAEditar.sectores || [
    { nombre: "Sector VIP", precio: partidoAEditar.precios?.vip || '' },
    { nombre: "Sector Platea", precio: partidoAEditar.precios?.platea || '' },
    { nombre: "Sector General", precio: partidoAEditar.precios?.general || '' },
    { nombre: "Sector Popular", precio: partidoAEditar.precios?.popular || '' }
  ];

  sectoresACargar.forEach(function (sector) {
    crearInputSectorHTML(sector.nombre, sector.precio);
  });

  tituloFormulario.innerHTML = `<i class="bi bi-pencil-square me-2"></i>Editar Partido`;
  botonGuardar.textContent = "Actualizar Partido";
  botonCancelarEdicion.classList.remove('d-none');
  establecerIdPartidoEnEdicion(partidoAEditar.id);
}

// Resetea el formulario de partidos
export function limpiarFormularioYEdicion() {
  establecerIdPartidoEnEdicion(null);
  formularioPartido.reset();
  botonCancelarEdicion.classList.add('d-none');
  tituloFormulario.innerHTML = `<i class="bi bi-plus-circle-fill me-2"></i>Cargar Nuevo Partido`;
  botonGuardar.textContent = "Guardar Partido";
  flagContainer1.innerHTML = `<i class="bi bi-globe text-muted small"></i>`;
  flagContainer2.innerHTML = `<i class="bi bi-globe text-muted small"></i>`;
  cargarSectoresPredeterminados();
}

// Obtiene los sectores y precios desde los inputs del formulario
export function obtenerSectoresDelFormulario() {
  const inputsSectores = contenedorSectores.querySelectorAll('.input-precio-sector');
  const listaSectores = [];

  inputsSectores.forEach(function (input) {
    listaSectores.push({
      nombre: input.getAttribute('data-nombre'),
      precio: Number(input.value)
    });
  });

  return listaSectores;
}

// Actualiza la tarjeta KPI del próximo partido en tiempo real
export function actualizarKpiProximoPartido() {
  const kpiTiempo = document.getElementById('kpi-proximo-partido-tiempo');
  const kpiHora = document.getElementById('kpi-proximo-partido-hora');
  const kpiEquipos = document.getElementById('kpi-proximo-partido-equipos');

  if (!kpiTiempo || !kpiHora || !kpiEquipos) return;

  const partidos = obtenerPartidosDeStorage();
  const ahora = new Date();

  const proximosPartidos = partidos.filter(function (partido) {
    const estadoReal = obtenerEstadoReal(partido);
    return estadoReal !== 'cancelado' && estadoReal !== 'finalizado';
  });

  proximosPartidos.sort(function (a, b) {
    return new Date(a.fecha) - new Date(b.fecha);
  });

  const proximoPartido = proximosPartidos[0];

  if (!proximoPartido) {
    kpiTiempo.textContent = "SIN PARTIDOS PROGRAMADOS";
    kpiHora.textContent = "--:-- hs";
    kpiEquipos.innerHTML = `<span class="text-muted small">No hay eventos activos</span>`;
    return;
  }

  const fechaPartido = new Date(proximoPartido.fecha);
  const diferenciaMs = fechaPartido - ahora;

  const diasRestantes = Math.floor(diferenciaMs / (1000 * 60 * 60 * 24));
  const horasRestantes = Math.floor((diferenciaMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  let textoTiempo = "";
  if (diasRestantes > 0) {
    textoTiempo = `Próximo partido en ${diasRestantes} día${diasRestantes === 1 ? '' : 's'}`;
  } else if (horasRestantes > 0) {
    textoTiempo = `Próximo partido en ${horasRestantes} hora${horasRestantes === 1 ? '' : 's'}`;
  } else {
    textoTiempo = `¡Próximo partido es hoy!`;
  }

  const partesFecha = proximoPartido.fecha.split('T');
  const horaFormateada = partesFecha[1] || '00:00';

  kpiTiempo.textContent = textoTiempo.toUpperCase();
  kpiHora.textContent = `${horaFormateada} hs`;
  kpiEquipos.innerHTML = `
    <div class="d-flex align-items-center justify-content-center gap-2">
      <div class="d-flex align-items-center gap-1">
        <img src="https://flagcdn.com/w20/${proximoPartido.codigoEquipo1}.png" alt="Bandera 1" width="16">
        <span class="fw-bold text-dark">${proximoPartido.nombreEquipo1}</span>
      </div>
      <span class="text-muted extra-small">vs</span>
      <div class="d-flex align-items-center gap-1">
        <img src="https://flagcdn.com/w20/${proximoPartido.codigoEquipo2}.png" alt="Bandera 2" width="16">
        <span class="fw-bold text-dark">${proximoPartido.nombreEquipo2}</span>
      </div>
    </div>
  `;
}

// Dibuja y actualiza los gráficos de Auditoría (Chart.js)
export function actualizarGraficosAuditoria() {
  const canvasBarras = document.getElementById('grafico-barras');
  const canvasDona = document.getElementById('grafico-dona');

  if (!canvasBarras || !canvasDona) return;

  if (instanciaGraficoBarras) {
    instanciaGraficoBarras.destroy();
  }
  if (instanciaGraficoDona) {
    instanciaGraficoDona.destroy();
  }

  const partidos = obtenerPartidosDeStorage();
  const partidosActivos = partidos.filter(function (partido) {
    return obtenerEstadoReal(partido) !== 'cancelado';
  });

  // --- 1. CONFIGURACIÓN DEL GRÁFICO DE BARRAS ---
  const etiquetasBarras = [];
  const datosRecaudacion = [];

  partidosActivos.forEach(function (partido) {
    etiquetasBarras.push(`${partido.nombreEquipo1} vs ${partido.nombreEquipo2}`);
    
    const totalPartido = partido.sectores.reduce(function (acumulador, sector) {
      const ventasSimuladas = obtenerSimulacionVentasSector(sector.nombre);
      return acumulador + (sector.precio * ventasSimuladas);
    }, 0);
    
    datosRecaudacion.push(totalPartido);
  });

  instanciaGraficoBarras = new Chart(canvasBarras, {
    type: 'bar',
    data: {
      labels: etiquetasBarras,
      datasets: [{
        label: 'Recaudación ($)',
        data: datosRecaudacion,
        backgroundColor: '#ed194d',
        hoverBackgroundColor: '#d1103e',
        borderRadius: 6,
        borderSkipped: false
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { font: { family: 'Montserrat' } }
        },
        y: {
          beginAtZero: true,
          ticks: { font: { family: 'Montserrat' } }
        }
      }
    }
  });

  // --- 2. CONFIGURACIÓN DEL GRÁFICO DE DONA ---
  const resumenSectores = {};

  partidosActivos.forEach(function (partido) {
    partido.sectores.forEach(function (sector) {
      const nombre = sector.nombre;
      const ventas = obtenerSimulacionVentasSector(nombre);
      resumenSectores[nombre] = (resumenSectores[nombre] || 0) + ventas;
    });
  });

  const etiquetasDona = Object.keys(resumenSectores);
  const datosDona = Object.values(resumenSectores);
  const totalVentasGlobal = datosDona.reduce((a, b) => a + b, 0);
  const coloresDona = ['#ed194d', '#4d4d4d', '#999999', '#e6e6e6'];

  instanciaGraficoDona = new Chart(canvasDona, {
    type: 'doughnut',
    data: {
      labels: etiquetasDona,
      datasets: [{
        data: datosDona,
        backgroundColor: coloresDona,
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      cutout: '70%'
    }
  });

  // --- 3. DIBUJAR LEYENDA DINÁMICA ---
  const leyendaContenedor = document.getElementById('grafico-leyenda-sectores');
  if (leyendaContenedor) {
    leyendaContenedor.innerHTML = '';
    
    if (etiquetasDona.length === 0) {
      leyendaContenedor.innerHTML = `<li class="text-muted text-center py-2">No hay datos de sectores</li>`;
      return;
    }

    etiquetasDona.forEach(function (sectorNombre, indice) {
      const cantidad = datosDona[indice];
      const porcentaje = totalVentasGlobal > 0 ? Math.round((cantidad / totalVentasGlobal) * 100) : 0;
      const color = coloresDona[indice % coloresDona.length];

      const itemLeyenda = document.createElement('li');
      itemLeyenda.className = 'd-flex justify-content-between align-items-center py-1';
      itemLeyenda.innerHTML = `
        <div class="d-flex align-items-center gap-2">
          <span class="legend-color-dot" style="background-color: ${color};"></span>
          <span class="fw-semibold text-dark small">${sectorNombre}</span>
        </div>
        <span class="text-muted fw-bold small">${porcentaje}%</span>
      `;
      leyendaContenedor.appendChild(itemLeyenda);
    });
  }
}

// Inicializa partidos de muestra
export function inicializarPartidosDeMuestra() {
  const partidosExistentes = obtenerPartidosDeStorage();
  if (partidosExistentes.length === 0) {
    const ahora = new Date();
    
    const fechaProximo = new Date();
    fechaProximo.setDate(ahora.getDate() + 3);
    fechaProximo.setHours(19, 0, 0, 0);

    const fechaPasado = new Date();
    fechaPasado.setDate(ahora.getDate() - 2);
    fechaPasado.setHours(17, 30, 0, 0);

    const partidosMuestra = [
      {
        id: Date.now() - 1000,
        codigoEquipo1: 'ar',
        nombreEquipo1: 'Argentina',
        codigoEquipo2: 'br',
        nombreEquipo2: 'Brasil',
        fecha: fechaProximo.toISOString().slice(0, 16),
        sectores: [
          { nombre: 'Sector VIP', precio: 15000 },
          { nombre: 'Sector Platea', precio: 8000 },
          { nombre: 'Sector General', precio: 4000 },
          { nombre: 'Sector Popular', precio: 2000 }
        ],
        estado: 'nuevo'
      },
      {
        id: Date.now() - 2000,
        codigoEquipo1: 'de',
        nombreEquipo1: 'Alemania',
        codigoEquipo2: 'fr',
        nombreEquipo2: 'Francia',
        fecha: fechaPasado.toISOString().slice(0, 16),
        sectores: [
          { nombre: 'Sector VIP', precio: 12000 },
          { nombre: 'Sector Platea', precio: 6500 },
          { nombre: 'Sector General', precio: 3000 },
          { nombre: 'Sector Popular', precio: 1500 }
        ],
        estado: 'finalizado'
      }
    ];
    guardarPartidosEnStorage(partidosMuestra);
  }
}
