/**
 * 🚀 Acá se maneja el flujo principal del administrador y el inicio de la app.
 * Se encarga de escuchar los eventos (clicks, envíos de formularios) y coordinar el almacenamiento con el diseño.
 */

import { obtenerPartidosDeStorage, guardarPartidosEnStorage } from './storage.js';
import { obtenerEstadoReal } from './helpers.js';
import {
  cargarPaisesDelMundial,
  cargarSectoresPredeterminados,
  actualizarTablaPartidos,
  actualizarTablaDashboard,
  actualizarKpiProximoPartido,
  actualizarGraficosAuditoria,
  inicializarPartidosDeMuestra,
  cargarPartidoEnFormulario,
  limpiarFormularioYEdicion,
  obtenerSectoresDelFormulario,
  crearInputSectorHTML,
  selectEquipo1,
  selectEquipo2,
  flagContainer1,
  flagContainer2,
  formularioPartido,
  inputFecha,
  tablaPartidosCuerpo,
  btnAgregarSector,
  botonCancelarEdicion,
  tablaDashboardCuerpo,
  filtroDashboard,
  idPartidoEnEdicion,
  establecerPaginaActualDashboard
} from './ui.js';

// ==========================================
// CONTROLADORES DE ACCIONES (CANCELAR Y ELIMINAR PARTIDOS)
// ==========================================

function cancelarPartidoDesdeID(idPartido) {
  const confirmar = confirm("⚠️ ¿Está seguro que desea cancelar este partido?");
  if (confirmar) {
    const partidosActuales = obtenerPartidosDeStorage();
    partidosActuales.forEach(function (partido) {
      if (partido.id === idPartido) {
        partido.estado = 'cancelado';
      }
    });
    guardarPartidosEnStorage(partidosActuales);

    if (idPartidoEnEdicion === idPartido) {
      limpiarFormularioYEdicion();
    }

    actualizarVistas();
    alert("❌ Partido cancelado del listado correctamente.");
  }
}

function eliminarPartidoDefinitivamente(idPartido) {
  const confirmar = confirm("🗑️ ¿Está seguro que desea ELIMINAR DEFINITIVAMENTE este partido? Se borrará de forma permanente de sus registros.");
  if (confirmar) {
    const partidosActuales = obtenerPartidosDeStorage();
    const partidosFiltrados = partidosActuales.filter(function (partido) {
      return partido.id !== idPartido;
    });
    guardarPartidosEnStorage(partidosFiltrados);

    if (idPartidoEnEdicion === idPartido) {
      limpiarFormularioYEdicion();
    }

    actualizarVistas();
    alert("🗑️ Partido eliminado definitivamente del almacenamiento.");
  }
}

function actualizarVistas() {
  actualizarTablaPartidos();
  actualizarTablaDashboard();
  actualizarKpiProximoPartido();
  actualizarGraficosAuditoria();
}

// ==========================================
// REGISTRO DE EVENTOS (LISTENERS)
// ==========================================

// Banderas en tiempo real
if (selectEquipo1) {
  selectEquipo1.addEventListener('change', function () {
    const codigoSeleccionado = selectEquipo1.value;
    if (flagContainer1) {
      flagContainer1.innerHTML = `<img src="https://flagcdn.com/w40/${codigoSeleccionado}.png" alt="Bandera" class="img-fluid">`;
    }
  });
}

if (selectEquipo2) {
  selectEquipo2.addEventListener('change', function () {
    const codigoSeleccionado = selectEquipo2.value;
    if (flagContainer2) {
      flagContainer2.innerHTML = `<img src="https://flagcdn.com/w40/${codigoSeleccionado}.png" alt="Bandera" class="img-fluid">`;
    }
  });
}

// Guardar nuevo partido o editar existente
if (formularioPartido) {
  formularioPartido.addEventListener('submit', function (evento) {
    evento.preventDefault();

    if (selectEquipo1.value === selectEquipo2.value) {
      alert("❌ ¡Error! Un equipo no puede jugar contra sí mismo.");
      return;
    }

    const nombreEquipo1 = selectEquipo1.options[selectEquipo1.selectedIndex].text;
    const nombreEquipo2 = selectEquipo2.options[selectEquipo2.selectedIndex].text;
    const partidosActuales = obtenerPartidosDeStorage();
    const sectoresDelFormulario = obtenerSectoresDelFormulario();

    if (sectoresDelFormulario.length === 0) {
      alert("❌ ¡Error! Debe haber al menos un sector definido para el partido.");
      return;
    }

    if (idPartidoEnEdicion !== null) {
      // Modo Edición
      partidosActuales.forEach(function (partido) {
        if (partido.id === idPartidoEnEdicion) {
          partido.codigoEquipo1 = selectEquipo1.value;
          partido.nombreEquipo1 = nombreEquipo1;
          partido.codigoEquipo2 = selectEquipo2.value;
          partido.nombreEquipo2 = nombreEquipo2;
          partido.fecha = inputFecha.value;
          partido.sectores = sectoresDelFormulario;
          partido.estado = 'reprogramado';
          if (partido.precios) delete partido.precios;
        }
      });
      guardarPartidosEnStorage(partidosActuales);
      alert("✅ ¡Partido actualizado correctamente!");
    } else {
      // Modo Creación
      const nuevoPartido = {
        id: Date.now(),
        codigoEquipo1: selectEquipo1.value,
        nombreEquipo1: nombreEquipo1,
        codigoEquipo2: selectEquipo2.value,
        nombreEquipo2: nombreEquipo2,
        fecha: inputFecha.value,
        sectores: sectoresDelFormulario,
        estado: 'nuevo'
      };
      partidosActuales.push(nuevoPartido);
      guardarPartidosEnStorage(partidosActuales);
      alert("✅ ¡Partido guardado y añadido a la tabla!");
    }

    limpiarFormularioYEdicion();
    actualizarVistas();
  });
}

// Agregar sector personalizado
if (btnAgregarSector) {
  btnAgregarSector.addEventListener('click', function () {
    const nombreNuevoSector = prompt("📝 Ingrese el nombre del nuevo sector (ejemplo: Platea Alta):");
    if (nombreNuevoSector && nombreNuevoSector.trim() !== "") {
      const sectoresExistentes = obtenerSectoresDelFormulario();
      const existe = sectoresExistentes.some(function (sector) {
        return sector.nombre.toLowerCase() === nombreNuevoSector.trim().toLowerCase();
      });

      if (existe) {
        alert("❌ ¡Error! Ya existe un sector con ese nombre.");
        return;
      }
      crearInputSectorHTML(nombreNuevoSector.trim());
    }
  });
}

// Cancelar edición
if (botonCancelarEdicion) {
  botonCancelarEdicion.addEventListener('click', function () {
    limpiarFormularioYEdicion();
  });
}

// Clicks en la tabla del gestor (Editar / Cancelar / Eliminar Definitivo)
if (tablaPartidosCuerpo) {
  tablaPartidosCuerpo.addEventListener('click', function (evento) {
    const botonEditar = evento.target.closest('.btn-editar');
    if (botonEditar) {
      const idPartidoAEditar = Number(botonEditar.getAttribute('data-id'));
      cargarPartidoEnFormulario(idPartidoAEditar);
      return;
    }

    const botonEliminar = evento.target.closest('.btn-eliminar');
    if (botonEliminar) {
      const idPartidoABorrar = Number(botonEliminar.getAttribute('data-id'));
      cancelarPartidoDesdeID(idPartidoABorrar);
      return;
    }

    const botonEliminarDefinitivo = evento.target.closest('.btn-eliminar-definitivo');
    if (botonEliminarDefinitivo) {
      const idPartidoABorrar = Number(botonEliminarDefinitivo.getAttribute('data-id'));
      eliminarPartidoDefinitivamente(idPartidoABorrar);
      return;
    }
  });
}

// Clicks en la tabla del Dashboard
if (tablaDashboardCuerpo) {
  tablaDashboardCuerpo.addEventListener('click', function (evento) {
    const botonEditar = evento.target.closest('.btn-editar-dash');
    if (botonEditar) {
      const idPartido = Number(botonEditar.getAttribute('data-id'));
      document.getElementById('partidos-tab').click();
      cargarPartidoEnFormulario(idPartido);
      return;
    }

    const botonCancelar = evento.target.closest('.btn-eliminar-dash');
    if (botonCancelar) {
      const idPartido = Number(botonCancelar.getAttribute('data-id'));
      cancelarPartidoDesdeID(idPartido);
      return;
    }

    const botonEliminarDefinitivoDash = evento.target.closest('.btn-eliminar-definitivo-dash');
    if (botonEliminarDefinitivoDash) {
      const idPartido = Number(botonEliminarDefinitivoDash.getAttribute('data-id'));
      eliminarPartidoDefinitivamente(idPartido);
      return;
    }
  });
}

// Filtro del Dashboard
if (filtroDashboard) {
  filtroDashboard.addEventListener('change', function () {
    establecerPaginaActualDashboard(1);
    actualizarTablaDashboard();
  });
}

// Cerrar Sesión con Confirmación
const btnCerrarSesion = document.getElementById('btn-cerrar-sesion');
if (btnCerrarSesion) {
  btnCerrarSesion.addEventListener('click', function () {
    const confirmar = confirm("¿Seguro que desea cerrar sesión?");
    if (confirmar) {
      window.location.href = 'home.html';
    }
  });
}

// ==========================================
// INICIALIZACIÓN AL CARGAR LA PÁGINA
// ==========================================
cargarPaisesDelMundial();
inicializarPartidosDeMuestra();
cargarSectoresPredeterminados();
actualizarVistas();
