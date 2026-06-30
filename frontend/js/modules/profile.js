// Persona 6
document.addEventListener('DOMContentLoaded', () => {


    // 1. OBTENER DATOS DEL USUARIO LOGUEADO
    // =========================================================================


    const idUsuarioLogueado = localStorage.getItem('currentUser');


    if (!idUsuarioLogueado) return;


    const listaUsuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    const usuarioActual = listaUsuarios.find(u => u.id_usuario === idUsuarioLogueado);


    if (!usuarioActual) {
        console.error('profile.js: No se encontró el usuario logueado en la lista de usuarios.');
        return;
    }


    //  2. RENDERIZAR DATOS EN EL DOM
   


    const $perfilId = document.getElementById('perfil-id');
    const $perfilUsername = document.getElementById('perfil-username');
    const $perfilEmail = document.getElementById('perfil-email');
    const $perfilPassword = document.getElementById('perfil-password');
    const $perfilRol = document.getElementById('perfil-rol');
    const $perfilNombreHeader = document.getElementById('perfil-nombre-header');
    const $perfilRolBadge = document.getElementById('perfil-rol-badge');


    // Inputs de edición
    const $inputUsername = document.getElementById('input-username');
    const $inputEmail = document.getElementById('input-email');
    const $inputPassword = document.getElementById('input-password');


    // Botones
    const $btnEditar = document.getElementById('btn-editar-perfil');
    const $btnGuardar = document.getElementById('btn-guardar-cambios');
    const $btnCancelar = document.getElementById('btn-cancelar-edicion');
    const $btnEliminar = document.getElementById('btn-eliminar-cuenta');


    // Foto
    const $fotoEditBadge = document.getElementById('foto-edit-badge');
    const $fotoHint = document.getElementById('foto-hint');


    function renderizarDatos() {
        if ($perfilId) $perfilId.textContent = usuarioActual.id_usuario;
        if ($perfilUsername) $perfilUsername.textContent = usuarioActual.nombre_usuario;
        if ($perfilEmail) $perfilEmail.textContent = usuarioActual.mail_usuario;
        if ($perfilPassword) $perfilPassword.textContent = '••••••••';
        if ($perfilRol) $perfilRol.textContent = usuarioActual.rol === 'admin' ? 'Administrador' : 'Usuario';
        if ($perfilNombreHeader) $perfilNombreHeader.textContent = usuarioActual.nombre_usuario;
        if ($perfilRolBadge) $perfilRolBadge.textContent = usuarioActual.rol === 'admin' ? 'Administrador' : 'Usuario';
    }


    renderizarDatos();


    // =========================================================================
    //  3. FOTO DE PERFIL
    // =========================================================================


    const clavePhoto = 'profilePhoto_' + usuarioActual.id_usuario;
    const $fotoPerfil = document.getElementById('foto-perfil');
    const $inputFoto = document.getElementById('input-foto-perfil');
    const $fotoContainer = document.getElementById('foto-perfil-container');
    let modoEdicion = false;


    // Cargar foto guardada (si existe)
    const fotoGuardada = localStorage.getItem(clavePhoto);
    if (fotoGuardada && $fotoPerfil) {
        $fotoPerfil.src = fotoGuardada;
    }


    // Al hacer clic en el badge de cámara, disparar el input de archivo
    if ($fotoEditBadge && $inputFoto) {
        $fotoEditBadge.addEventListener('click', (e) => {
            e.stopPropagation();
            if (modoEdicion) $inputFoto.click();
        });
    }


    if ($inputFoto) {
        $inputFoto.addEventListener('change', (e) => {
            const archivo = e.target.files[0];
            if (!archivo) return;


            if (!archivo.type.startsWith('image/')) {
                alert('Por favor seleccioná un archivo de imagen válido.');
                return;
            }


            if (archivo.size > 2 * 1024 * 1024) {
                alert('La imagen es demasiado grande. El tamaño máximo es 2MB.');
                return;
            }


            const reader = new FileReader();
            reader.onload = (event) => {
                const base64 = event.target.result;
                if ($fotoPerfil) $fotoPerfil.src = base64;
                try {
                    localStorage.setItem(clavePhoto, base64);
                } catch (error) {
                    console.error('profile.js: Error al guardar la foto en localStorage', error);
                    alert('No se pudo guardar la foto. Es posible que el almacenamiento local esté lleno.');
                }
            };
            reader.readAsDataURL(archivo);
        });
    }


    // =========================================================================
    //  4. MODO EDICIÓN
    // =========================================================================


    function activarEdicion() {
        modoEdicion = true;


        // Rellenar inputs con valores actuales
        if ($inputUsername) $inputUsername.value = usuarioActual.nombre_usuario;
        if ($inputEmail) $inputEmail.value = usuarioActual.mail_usuario;
        if ($inputPassword) $inputPassword.value = '';


        // Mostrar inputs, ocultar spans
        document.querySelectorAll('.perfil-dato').forEach(el => el.classList.add('d-none'));
        document.querySelectorAll('.perfil-input').forEach(el => el.classList.remove('d-none'));


        // Toggle botones
        if ($btnEditar) $btnEditar.classList.add('d-none');
        if ($btnGuardar) $btnGuardar.classList.remove('d-none');
        if ($btnCancelar) $btnCancelar.classList.remove('d-none');


        // Mostrar badge de edición de foto
        if ($fotoEditBadge) $fotoEditBadge.classList.remove('d-none');
        if ($fotoEditBadge) $fotoEditBadge.classList.add('d-flex');
        if ($fotoHint) $fotoHint.classList.remove('d-none');
    }


    function desactivarEdicion() {
        modoEdicion = false;


        // Ocultar inputs, mostrar spans
        document.querySelectorAll('.perfil-dato').forEach(el => el.classList.remove('d-none'));
        document.querySelectorAll('.perfil-input').forEach(el => el.classList.add('d-none'));


        // Toggle botones
        if ($btnEditar) $btnEditar.classList.remove('d-none');
        if ($btnGuardar) $btnGuardar.classList.add('d-none');
        if ($btnCancelar) $btnCancelar.classList.add('d-none');


        // Ocultar badge de edición de foto
        if ($fotoEditBadge) $fotoEditBadge.classList.add('d-none');
        if ($fotoEditBadge) $fotoEditBadge.classList.remove('d-flex');
        if ($fotoHint) $fotoHint.classList.add('d-none');
    }


    // Botón "Editar perfil"
    if ($btnEditar) {
        $btnEditar.addEventListener('click', activarEdicion);
    }


    // Botón "Cancelar"
    if ($btnCancelar) {
        $btnCancelar.addEventListener('click', () => {
            // Restaurar datos originales en los spans
            renderizarDatos();
            desactivarEdicion();
        });
    }


    // Botón "Guardar cambios"
    if ($btnGuardar) {
        $btnGuardar.addEventListener('click', () => {
            const nuevoUsername = $inputUsername ? $inputUsername.value.trim() : '';
            const nuevoEmail = $inputEmail ? $inputEmail.value.trim() : '';
            const nuevaPassword = $inputPassword ? $inputPassword.value : '';


            // --- Validaciones (reutilizando las mismas reglas de login.js/registro) ---


            if (!nuevoUsername) {
                alert('El nombre de usuario no puede estar vacío.');
                return;
            }


            if (!nuevoEmail) {
                alert('El correo electrónico no puede estar vacío.');
                return;
            }


            // Validar formato de email básico
            if (!nuevoEmail.includes('@') || !nuevoEmail.includes('.')) {
                alert('Por favor ingresá un correo electrónico válido.');
                return;
            }


            // Validar que el username no esté en uso por OTRO usuario
            const listaActual = JSON.parse(localStorage.getItem('usuarios')) || [];
            const usernameEnUso = listaActual.some(u =>
                u.nombre_usuario === nuevoUsername && u.id_usuario !== idUsuarioLogueado
            );
            if (usernameEnUso) {
                alert('¡Ups! Este nombre de usuario ya está en uso por otro usuario.');
                return;
            }


            // Validar que el email no esté en uso por OTRO usuario
            const emailEnUso = listaActual.some(u =>
                u.mail_usuario === nuevoEmail.toLowerCase() && u.id_usuario !== idUsuarioLogueado
            );
            if (emailEnUso) {
                alert('¡Ups! Este correo electrónico ya está registrado por otro usuario.');
                return;
            }


            // --- Actualizar el usuario en memoria y en localStorage ---


            usuarioActual.nombre_usuario = nuevoUsername;
            usuarioActual.mail_usuario = nuevoEmail.toLowerCase();


            // Solo actualizar la contraseña si el usuario escribió una nueva
            if (nuevaPassword.length > 0) {
                usuarioActual.contraseña_usuario = nuevaPassword;
            }


            // Persistir en el array de usuarios
            const index = listaActual.findIndex(u => u.id_usuario === idUsuarioLogueado);
            if (index !== -1) {
                listaActual[index] = usuarioActual;
                localStorage.setItem('usuarios', JSON.stringify(listaActual));
            }


            // Actualizar tokens de sesión (para que reflejen los nuevos datos)
            localStorage.setItem('currentUsername', usuarioActual.nombre_usuario);
            localStorage.setItem('userEmail', usuarioActual.mail_usuario);


            // Actualizar la interfaz inmediatamente
            renderizarDatos();
            desactivarEdicion();


            // Feedback visual
            dispararModalGlobal({
                titulo: "Cambios guardados",
                mensaje: "Tus datos personales fueron actualizados correctamente.",
                ocultarCancelar: true,
                textoBotonOk: "Aceptar"
            });
        });
    }


    // =========================================================================
    //  5. MODAL GLOBAL
    // =========================================================================


    function dispararModalGlobal(config) {
        const contenedorModal = document.getElementById('modalGlobalAlert');
        if (!contenedorModal) return;


        const $titulo = document.getElementById('globalAlertTitulo');
        const $mensaje = document.getElementById('globalAlertMensaje');
        const $btnConfirmar = document.getElementById('globalAlertBtnConfirmar');
        const $btnCancelarModal = document.getElementById('globalAlertBtnCancelar');


        // Configurar título
        if ($titulo) {
            $titulo.textContent = config.titulo || '¿Confirmar acción?';
        }


        // Configurar mensaje
        if ($mensaje) {
            $mensaje.textContent = config.mensaje || '';
            $mensaje.classList.toggle('d-none', !config.mensaje);
        }


        // Configurar texto del botón de confirmar
        if ($btnConfirmar) {
            $btnConfirmar.textContent = config.textoBotonOk || 'Confirmar';
        }


        // Ocultar botón cancelar si se pide
        if ($btnCancelarModal) {
            if (config.ocultarCancelar) {
                $btnCancelarModal.classList.add('d-none');
            } else {
                $btnCancelarModal.classList.remove('d-none');
            }
        }


        // Abrir el modal con Bootstrap 5
        const modalInstancia = new bootstrap.Modal(contenedorModal, {
            backdrop: config.ocultarCancelar ? 'static' : true,
            keyboard: !config.ocultarCancelar
        });
        modalInstancia.show();


        // Limpiar listeners anteriores clonando el botón
        const $btnConfirmarNuevo = $btnConfirmar.cloneNode(true);
        $btnConfirmar.parentNode.replaceChild($btnConfirmarNuevo, $btnConfirmar);


        // Asignar nueva acción al botón confirmar
        $btnConfirmarNuevo.addEventListener('click', () => {
            modalInstancia.hide();
            if (typeof config.accion === 'function') {
                config.accion();
            }
        });
    }


    // =========================================================================
    //  6. ELIMINAR CUENTA
    // =========================================================================


    if ($btnEliminar) {
        $btnEliminar.addEventListener('click', (e) => {
            e.preventDefault();
            eliminarCuenta();
        });
    }


    function eliminarCuenta() {
        dispararModalGlobal({
            titulo: "¿ELIMINAR MI CUENTA?",
            mensaje: "Esta acción eliminará tu cuenta y todas tus compras de forma permanente.",
            accion: () => {


                // 1. Eliminar el usuario del array de usuarios
                const listaActualizada = JSON.parse(localStorage.getItem('usuarios')) || [];
                const usuariosFiltrados = listaActualizada.filter(u => u.id_usuario !== idUsuarioLogueado);
                localStorage.setItem('usuarios', JSON.stringify(usuariosFiltrados));


                // 2. Eliminar las compras asociadas al usuario
                const comprasHistoricas = JSON.parse(localStorage.getItem('compras')) || [];
                const comprasDeOtros = comprasHistoricas.filter(c => c.id_usuario !== idUsuarioLogueado);
                localStorage.setItem('compras', JSON.stringify(comprasDeOtros));


                // 3. Eliminar la foto de perfil del usuario
                localStorage.removeItem(clavePhoto);


                // 4. Mostrar modal de éxito antes de redirigir
                setTimeout(() => {
                    dispararModalGlobal({
                        titulo: "Cuenta eliminada",
                        mensaje: "Tu perfil y compras fueron borrados con éxito. ¡Gracias por usar TicketApp!",
                        ocultarCancelar: true,
                        textoBotonOk: "Entendido",
                        accion: () => {


                            // 5. Limpiar toda la sesión del usuario
                            localStorage.removeItem('userToken');
                            localStorage.removeItem('currentUser');
                            localStorage.removeItem('currentUsername');
                            localStorage.removeItem('userEmail');
                            localStorage.removeItem('userRole');


                            // 6. Redirigir al login
                            setTimeout(() => {
                                window.location.href = 'index.html';
                            }, 800);
                        }
                    });
                }, 150);
            }
        });
    }


});
