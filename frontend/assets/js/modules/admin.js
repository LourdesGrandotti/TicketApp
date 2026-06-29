// ==========================================
// CONFIGURACIÓN INICIAL: ELEMENTOS DEL HTML
// ==========================================
const selectEquipo1 = document.getElementById('select-equipo-1');
const selectEquipo2 = document.getElementById('select-equipo-2');
const flagContainer1 = document.getElementById('flag-container-1');
const flagContainer2 = document.getElementById('flag-container-2');

// --- ELEMENTOS CAPTURADOS PARA EL FORMULARIO Y LA TABLA ---
const formularioPartido = document.getElementById('form-partido');
const inputFecha = document.getElementById('input-fecha');
const tablaPartidosCuerpo = document.getElementById('tabla-partidos-cuerpo');
const contadorPartidos = document.getElementById('contador-partidos');

// --- NUEVOS ELEMENTOS PARA SECTORES DINÁMICOS ---
const contenedorSectores = document.getElementById('contenedor-sectores');
const btnAgregarSector = document.getElementById('btn-agregar-sector');

// --- NUEVOS ELEMENTOS CAPTURADOS PARA LA EDICIÓN DE PARTIDOS ---
const tituloFormulario = document.getElementById('form-partido-titulo');
const botonGuardar = document.getElementById('btn-guardar-partido');
const botonCancelarEdicion = document.getElementById('btn-cancelar-edicion');

// Variable global para guardar el ID del partido que estamos editando.
// Si no estamos editando ninguno, su valor será null.
let idPartidoEnEdicion = null;


// ==========================================
// MISIÓN 1: CARGAR LOS PAÍSES AUTOMÁTICAMENTE
// ==========================================
function cargarPaisesDelMundial() {
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


// ==========================================
// MISIÓN 2: ESCUCHAR CAMBIOS Y PINTAR BANDERAS
// ==========================================
selectEquipo1.addEventListener('change', function () {
  const codigoSeleccionado = selectEquipo1.value;
  flagContainer1.innerHTML = `
    <img src="https://flagcdn.com/w40/${codigoSeleccionado}.png" alt="Bandera" class="img-fluid">
  `;
});

selectEquipo2.addEventListener('change', function () {
  const codigoSeleccionado = selectEquipo2.value;
  flagContainer2.innerHTML = `
    <img src="https://flagcdn.com/w40/${codigoSeleccionado}.png" alt="Bandera" class="img-fluid">
  `;
});


// ==========================================
// MISIÓN 3: MANEJO DEL LOCALSTORAGE
// ==========================================
function obtenerPartidosDeStorage() {
  const partidosTexto = localStorage.getItem('partidos');
  if (partidosTexto) {
    return JSON.parse(partidosTexto);
  } else {
    return [];
  }
}

function guardarPartidosEnStorage(listaPartidos) {
  localStorage.setItem('partidos', JSON.stringify(listaPartidos));
}


// ==========================================
// NUEVA MISIÓN 5: DIBUJAR LOS PARTIDOS EN LA TABLA
// ==========================================
function actualizarTablaPartidos() {
  // 1. Traemos la lista de partidos actualizados desde el storage
  const partidos = obtenerPartidosDeStorage();

  // --- NUEVO: Para la gestión activa, sólo mostramos partidos que no estén cancelados ---
  const partidosActivos = partidos.filter(function (partido) {
    return partido.estado !== 'cancelado';
  });

  // --- NUEVO: Actualizamos el contador de partidos activos en la pantalla ---
  if (contadorPartidos) {
    contadorPartidos.textContent = `Total: ${partidosActivos.length} partido${partidosActivos.length === 1 ? '' : 's'}`;
  }

  // 2. Vaciamos la tabla por completo antes de volver a dibujar para que no se dupliquen
  tablaPartidosCuerpo.innerHTML = '';

  // 3. Recorremos cada partido activo guardado para fabricar su fila HTML real
  partidosActivos.forEach(function (partido) {

    // Separamos la fecha y la hora para que quede más estético (ej: 2026-06-29T18:30 -> Fecha y Hora separadas)
    const partesFecha = partido.fecha.split('T');
    const fechaFormateada = partesFecha[0] || '---';
    const horaFormateada = partesFecha[1] || '00:00';
    const estadoReal = obtenerEstadoReal(partido);

    // Creamos la etiqueta de la fila (tr)
    const fila = document.createElement('tr');

    // Deshabilitamos los botones si el partido ya finalizó
    const estaFinalizado = (estadoReal === 'finalizado');
    const botonEditarHTML = estaFinalizado
      ? `<button class="btn btn-sm btn-outline-warning text-dark border me-1" disabled title="No se puede editar un partido ya finalizado"><i class="bi bi-pencil-square"></i></button>`
      : `<button class="btn btn-sm btn-outline-warning text-dark border me-1 btn-editar" data-id="${partido.id}" title="Editar Partido"><i class="bi bi-pencil-square"></i></button>`;

    const botonEliminarHTML = estaFinalizado
      ? `<button class="btn btn-sm btn-outline-danger" disabled title="No se puede cancelar un partido ya finalizado"><i class="bi bi-x-square"></i></button>`
      : `<button class="btn btn-sm btn-outline-danger btn-eliminar" data-id="${partido.id}" title="Cancelar Partido"><i class="bi bi-x-square"></i></button>`;

    // Le inyectamos las celdas usando tus mismas clases estéticas de Bootstrap
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

    // Metemos la fila terminada dentro del cuerpo de la tabla
    tablaPartidosCuerpo.appendChild(fila);
  });
}


// ==========================================
// MISIÓN 4: ESCUCHAR EL ENVÍO DEL FORMULARIO
// ==========================================
formularioPartido.addEventListener('submit', function (evento) {
  evento.preventDefault();

  if (selectEquipo1.value === selectEquipo2.value) {
    alert("❌ ¡Error! Un equipo no puede jugar contra sí mismo.");
    return;
  }

  const nombreEquipo1 = selectEquipo1.options[selectEquipo1.selectedIndex].text;
  const nombreEquipo2 = selectEquipo2.options[selectEquipo2.selectedIndex].text;

  // Traemos todos los partidos que ya están guardados en localStorage
  const partidosActuales = obtenerPartidosDeStorage();

  // Obtenemos los sectores y precios cargados dinámicamente en el formulario
  const sectoresDelFormulario = obtenerSectoresDelFormulario();

  // Validación básica: requerimos que al menos haya un sector cargado
  if (sectoresDelFormulario.length === 0) {
    alert("❌ ¡Error! Debe haber al menos un sector definido para el partido.");
    return;
  }

  if (idPartidoEnEdicion !== null) {
    // --- MODO EDICIÓN ---
    // Buscamos el partido que estamos editando en el listado y actualizamos sus datos
    partidosActuales.forEach(function (partido) {
      if (partido.id === idPartidoEnEdicion) {
        partido.codigoEquipo1 = selectEquipo1.value;
        partido.nombreEquipo1 = nombreEquipo1;
        partido.codigoEquipo2 = selectEquipo2.value;
        partido.nombreEquipo2 = nombreEquipo2;
        partido.fecha = inputFecha.value;
        partido.sectores = sectoresDelFormulario;
        partido.estado = 'reprogramado'; // --- NUEVO: Estado reprogramado al editar ---
        // Limpiamos la propiedad antigua "precios" si existía
        if (partido.precios) {
          delete partido.precios;
        }
      }
    });

    // Guardamos la lista de partidos con los cambios de vuelta en localStorage
    guardarPartidosEnStorage(partidosActuales);

    // Mostramos un mensaje de confirmación
    alert("✅ ¡Partido actualizado correctamente!");
  } else {
    // --- MODO CREACIÓN (Cargar Nuevo Partido) ---
    const nuevoPartido = {
      id: Date.now(), // Usamos la fecha y hora actual en milisegundos como ID único del partido
      codigoEquipo1: selectEquipo1.value,
      nombreEquipo1: nombreEquipo1,
      codigoEquipo2: selectEquipo2.value,
      nombreEquipo2: nombreEquipo2,
      fecha: inputFecha.value,
      sectores: sectoresDelFormulario,
      estado: 'nuevo' // --- NUEVO: Estado inicial nuevo ---
    };

    // Agregamos el nuevo partido a nuestra lista existente
    partidosActuales.push(nuevoPartido);
    // Guardamos la lista actualizada en localStorage
    guardarPartidosEnStorage(partidosActuales);

    // Mostramos un mensaje de confirmación
    alert("✅ ¡Partido guardado y añadido a la tabla!");
  }

  // --- Limpieza y Reestablecimiento del Formulario ---
  // Volvemos el formulario a su estado original (vacío, sin modo edición)
  limpiarFormularioYEdicion();

  // Redibujamos las tablas y KPIs inmediatamente para ver los cambios reflejados
  actualizarTablaPartidos();
  actualizarTablaDashboard();
  actualizarKpiProximoPartido();
});


// ==========================================
// INICIO: ACTIVAMOS TODO
// ==========================================
cargarPaisesDelMundial();

// ==========================================
// NUEVA MISIÓN 6: ELIMINAR / CANCELAR PARTIDO
// ==========================================

// Escuchamos los clicks en todo el cuerpo de la tabla (tanto para editar como para eliminar)
tablaPartidosCuerpo.addEventListener('click', function (evento) {

  // 1. Buscamos si el click ocurrió en el botón de Editar (o en su icono de adentro)
  const botonEditar = evento.target.closest('.btn-editar');
  if (botonEditar) {
    // Capturamos el ID del partido guardado en el botón
    const idPartidoAEditar = Number(botonEditar.getAttribute('data-id'));

    // Llamamos a la función que copia los datos de este partido al formulario
    cargarPartidoEnFormulario(idPartidoAEditar);
    return; // Terminamos acá
  }

  // 2. Buscamos si el click ocurrió en el botón de eliminar (o en su icono de adentro)
  const botonEliminar = evento.target.closest('.btn-eliminar');
  if (botonEliminar) {
    // Capturamos el ID único del partido a cancelar
    const idPartidoABorrar = Number(botonEliminar.getAttribute('data-id'));
    cancelarPartidoDesdeID(idPartidoABorrar);
    return;
  }
});

// ==========================================
// NUEVA MISIÓN 7: CARGAR DATOS EN EL FORMULARIO PARA EDITAR
// ==========================================
function cargarPartidoEnFormulario(id) {
  // Traemos los partidos del storage
  const partidos = obtenerPartidosDeStorage();

  // Buscamos el partido correspondiente al ID
  const partidoAEditar = partidos.find(function (partido) {
    return partido.id === id;
  });

  // Si por alguna razón no lo encuentra, salimos sin hacer nada
  if (!partidoAEditar) return;

  // Copiamos los valores del partido a los campos del formulario
  selectEquipo1.value = partidoAEditar.codigoEquipo1;
  selectEquipo2.value = partidoAEditar.codigoEquipo2;
  inputFecha.value = partidoAEditar.fecha;

  // Actualizamos los contenedores de las banderas con la bandera del país seleccionado
  flagContainer1.innerHTML = `
    <img src="https://flagcdn.com/w40/${partidoAEditar.codigoEquipo1}.png" alt="Bandera" class="img-fluid">
  `;
  flagContainer2.innerHTML = `
    <img src="https://flagcdn.com/w40/${partidoAEditar.codigoEquipo2}.png" alt="Bandera" class="img-fluid">
  `;

  // --- NUEVO: Cargamos los sectores específicos de este partido ---
  // Limpiamos los sectores que estén cargados en el formulario actualmente
  contenedorSectores.innerHTML = '';

  // Soporte para partidos creados anteriormente con el formato viejo (precios)
  const sectoresACargar = partidoAEditar.sectores || [
    { nombre: "Sector VIP", precio: partidoAEditar.precios?.vip || '' },
    { nombre: "Sector Platea", precio: partidoAEditar.precios?.platea || '' },
    { nombre: "Sector General", precio: partidoAEditar.precios?.general || '' },
    { nombre: "Sector Popular", precio: partidoAEditar.precios?.popular || '' }
  ];

  // Agregamos cada sector al formulario
  sectoresACargar.forEach(function (sector) {
    crearInputSectorHTML(sector.nombre, sector.precio);
  });

  // Cambiamos el título del formulario y el texto del botón de enviar
  tituloFormulario.innerHTML = `<i class="bi bi-pencil-square me-2"></i>Editar Partido`;
  botonGuardar.textContent = "Actualizar Partido";

  // Hacemos que aparezca el botón de "Cancelar Edición" quitándole la clase 'd-none' de Bootstrap
  botonCancelarEdicion.classList.remove('d-none');

  // Guardamos el ID del partido en nuestra variable de edición
  idPartidoEnEdicion = partidoAEditar.id;
}

// ==========================================
// NUEVA MISIÓN 8: LIMPIAR FORMULARIO Y RESETEAR ESTADOS
// ==========================================
function limpiarFormularioYEdicion() {
  // Resetear la variable de edición para indicar que ya no estamos editando nada
  idPartidoEnEdicion = null;

  // Vaciamos todos los campos del formulario
  formularioPartido.reset();

  // Escondemos de nuevo el botón de "Cancelar Edición"
  botonCancelarEdicion.classList.add('d-none');

  // Restauramos el título original del formulario
  tituloFormulario.innerHTML = `<i class="bi bi-plus-circle-fill me-2"></i>Cargar Nuevo Partido`;

  // Restauramos el texto original del botón de enviar
  botonGuardar.textContent = "Guardar Partido";

  // Volvemos a colocar los iconos del globo en los contenedores de bandera
  flagContainer1.innerHTML = `<i class="bi bi-globe text-muted small"></i>`;
  flagContainer2.innerHTML = `<i class="bi bi-globe text-muted small"></i>`;

  // --- NUEVO: Limpiamos y recargamos los sectores predeterminados ---
  cargarSectoresPredeterminados();
}

// Escuchamos el click en el botón de cancelar edición para volver al estado normal
botonCancelarEdicion.addEventListener('click', function () {
  limpiarFormularioYEdicion();
});

// ==========================================
// NUEVA MISIÓN 9: LEER LOS SECTORES DEL FORMULARIO
// ==========================================
function obtenerSectoresDelFormulario() {
  // Buscamos todas las cajas de precios de sectores dentro del contenedor dinámico
  const inputsSectores = contenedorSectores.querySelectorAll('.input-precio-sector');
  const listaSectores = [];

  inputsSectores.forEach(function (input) {
    listaSectores.push({
      nombre: input.getAttribute('data-nombre'), // Recuperamos el nombre del sector
      precio: Number(input.value) // Recuperamos su precio y lo convertimos a número
    });
  });

  return listaSectores;
}

// ==========================================
// NUEVA MISIÓN 10: CREAR INPUT PARA UN SECTOR DINÁMICAMENTE
// ==========================================
function crearInputSectorHTML(nombre, precio = '') {
  // Creamos la columna contenedora (col-6) con Bootstrap
  const columna = document.createElement('div');
  columna.className = 'col-6 mb-2';

  // Le inyectamos el HTML correspondiente con un botón de eliminar
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

  // Agregamos el comportamiento del botón eliminar de este sector
  const botonEliminarSector = columna.querySelector('.btn-eliminar-sector');
  botonEliminarSector.addEventListener('click', function () {
    columna.remove(); // Remueve el elemento HTML del formulario
  });

  // Lo añadimos al contenedor de sectores en el HTML
  contenedorSectores.appendChild(columna);
}

// ==========================================
// NUEVA MISIÓN 11: CARGAR LOS 4 SECTORES PREDETERMINADOS
// ==========================================
function cargarSectoresPredeterminados() {
  // Limpiamos el contenedor por completo
  contenedorSectores.innerHTML = '';

  // Creamos los inputs por defecto
  crearInputSectorHTML('Sector VIP');
  crearInputSectorHTML('Sector Platea');
  crearInputSectorHTML('Sector General');
  crearInputSectorHTML('Sector Popular');
}

// ==========================================
// NUEVA MISIÓN 12: ESCUCHAR BOTÓN AGREGAR SECTOR
// ==========================================
btnAgregarSector.addEventListener('click', function () {
  // Mostramos una ventana emergente nativa para ingresar el nombre del nuevo sector
  const nombreNuevoSector = prompt("📝 Ingrese el nombre del nuevo sector (ejemplo: Platea Alta):");

  // Si el usuario ingresó algo válido y no canceló el prompt
  if (nombreNuevoSector && nombreNuevoSector.trim() !== "") {
    // Validamos que no exista un sector con el mismo nombre ya cargado para no confundir
    const sectoresExistentes = obtenerSectoresDelFormulario();
    const existe = sectoresExistentes.some(function (sector) {
      return sector.nombre.toLowerCase() === nombreNuevoSector.trim().toLowerCase();
    });

    if (existe) {
      alert("❌ ¡Error! Ya existe un sector con ese nombre.");
      return;
    }

    // Si todo está bien, creamos su input correspondiente
    crearInputSectorHTML(nombreNuevoSector.trim());
  }
});

// ==========================================
// NUEVA MISIÓN 13: OBTENER EL ESTADO REAL DE UN PARTIDO
// ==========================================
function obtenerEstadoReal(partido) {
  // Si fue cancelado manualmente, ese estado tiene máxima prioridad
  if (partido.estado === 'cancelado') {
    return 'cancelado';
  }

  // Comparamos la fecha del partido con el momento actual en milisegundos
  const ahora = new Date();
  const fechaPartido = new Date(partido.fecha);

  if (fechaPartido < ahora) {
    return 'finalizado';
  }

  // Si no se canceló ni pasó la fecha, devolvemos el estado registrado (nuevo o reprogramado)
  return partido.estado || 'nuevo';
}

// ==========================================
// NUEVA MISIÓN 14: RETORNAR BADGE DE ESTADO CON ESTILO
// ==========================================
function obtenerBadgeEstadoHTML(estado) {
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

// ==========================================
// NUEVA MISIÓN 15: CANCELAR / DESACTIVAR UN PARTIDO POR SU ID
// ==========================================
function cancelarPartidoDesdeID(idPartido) {
  // Cartel literal de confirmación requerido
  const confirmar = confirm("⚠️ ¿Está seguro que desea cancelar este partido?");

  if (confirmar) {
    const partidosActuales = obtenerPartidosDeStorage();

    // Actualizamos el estado a 'cancelado' en vez de borrar el partido del array
    partidosActuales.forEach(function (partido) {
      if (partido.id === idPartido) {
        partido.estado = 'cancelado';
      }
    });

    // Guardamos los cambios
    guardarPartidosEnStorage(partidosActuales);

    // Si el partido cancelado era el que se estaba editando, limpiamos el formulario
    if (idPartidoEnEdicion === idPartido) {
      limpiarFormularioYEdicion();
    }

    // Redibujamos la tabla de gestión, la tabla del dashboard y el KPI del próximo partido
    actualizarTablaPartidos();
    actualizarTablaDashboard();
    actualizarKpiProximoPartido();

    alert("❌ Partido cancelado del listado correctamente.");
  }
}

// ==========================================
// NUEVA MISIÓN 16: DIBUJAR LA TABLA DEL PANEL DE CONTROL
// ==========================================
function actualizarTablaDashboard() {
  const tablaDashboardCuerpo = document.getElementById('tabla-dashboard-cuerpo');
  if (!tablaDashboardCuerpo) return;

  const partidos = obtenerPartidosDeStorage();
  const filtroVal = document.getElementById('filtro-partidos-dashboard')?.value || 'todos';

  // Vaciamos la tabla por completo
  tablaDashboardCuerpo.innerHTML = '';

  // Filtramos la lista según el valor del desplegable
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

  // Dibujamos cada fila
  partidosFiltrados.forEach(function (partido) {
    const partesFecha = partido.fecha.split('T');
    const fechaFormateada = partesFecha[0] || '---';
    const horaFormateada = partesFecha[1] || '00:00';
    const estadoReal = obtenerEstadoReal(partido);

    const fila = document.createElement('tr');

    // Deshabilitamos los botones si el partido ya finalizó o fue cancelado
    const estaDeshabilitado = (estadoReal === 'finalizado' || estadoReal === 'cancelado');
    const botonEditarHTML = estaDeshabilitado
      ? `<button class="btn btn-sm btn-light border text-muted" disabled title="No se puede editar un partido finalizado o cancelado"><i class="bi bi-pencil"></i></button>`
      : `<button class="btn btn-sm btn-light border btn-editar-dash" data-id="${partido.id}" title="Editar Partido"><i class="bi bi-pencil"></i></button>`;

    const botonCancelarHTML = estaDeshabilitado
      ? `<button class="btn btn-sm btn-light border text-muted" disabled title="No se puede cancelar un partido finalizado o cancelado"><i class="bi bi-x-square"></i></button>`
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

// ==========================================
// NUEVA MISIÓN 17: ACTUALIZAR EL CARD DEL PRÓXIMO PARTIDO (KPI)
// ==========================================
function actualizarKpiProximoPartido() {
  const kpiTiempo = document.getElementById('kpi-proximo-partido-tiempo');
  const kpiHora = document.getElementById('kpi-proximo-partido-hora');
  const kpiEquipos = document.getElementById('kpi-proximo-partido-equipos');

  if (!kpiTiempo || !kpiHora || !kpiEquipos) return;

  const partidos = obtenerPartidosDeStorage();
  const ahora = new Date();

  // Filtramos partidos: activos y con fecha a futuro
  const proximosPartidos = partidos.filter(function (partido) {
    const estadoReal = obtenerEstadoReal(partido);
    return estadoReal !== 'cancelado' && estadoReal !== 'finalizado';
  });

  // Ordenamos de más cercano en fecha a más lejano
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

  // Calculamos la diferencia
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

// ==========================================
// NUEVA MISIÓN 18: PROGRAMAR ACCIONES Y FILTROS EN EL DASHBOARD
// ==========================================
const tablaDashboardCuerpo = document.getElementById('tabla-dashboard-cuerpo');
if (tablaDashboardCuerpo) {
  tablaDashboardCuerpo.addEventListener('click', function (evento) {
    // 1. Editar
    const botonEditar = evento.target.closest('.btn-editar-dash');
    if (botonEditar) {
      const idPartido = Number(botonEditar.getAttribute('data-id'));
      // Simulamos click en la pestaña de partidos para ir al gestor
      document.getElementById('partidos-tab').click();
      // Cargamos el partido en el formulario
      cargarPartidoEnFormulario(idPartido);
      return;
    }

    // 2. Cancelar
    const botonCancelar = evento.target.closest('.btn-eliminar-dash');
    if (botonCancelar) {
      const idPartido = Number(botonCancelar.getAttribute('data-id'));
      cancelarPartidoDesdeID(idPartido);
      return;
    }
  });
}

// Escuchamos el cambio de filtro en el deslizable
const filtroDashboard = document.getElementById('filtro-partidos-dashboard');
if (filtroDashboard) {
  filtroDashboard.addEventListener('change', function () {
    actualizarTablaDashboard();
  });
}

// --- NUEVO: Inicializamos los sectores por defecto, cargamos datos en las tablas y KPIs al iniciar ---
cargarSectoresPredeterminados();
actualizarTablaPartidos();
actualizarTablaDashboard();
actualizarKpiProximoPartido();