/**
 * js/login.js
 * Lógica de Persona 1 - Adaptada para soportar credenciales cortas de prueba
 * y redirección condicional estricta por roles.
 */

const $loginForm = document.getElementById('loginForm');
const $registerForm = document.getElementById('registerForm');
const $password = document.getElementById('password');
const $username = document.getElementById('username'); // Captura el input de usuario/correo
const $passwordConfirmed = document.getElementById('confirmedPassword');
const $email = document.getElementById('email'); // Usado en registro.html

const $activeForm = $loginForm || $registerForm;

let $authMessage = document.getElementById('authMessage');
if (!$authMessage && $activeForm) {
    $authMessage = document.createElement('p');
    $authMessage.id = 'authMessage';
    $authMessage.className = 'mt-3 fw-bold small text-center';
    $activeForm.appendChild($authMessage);
}

// Inicialización de entidades con los datos de prueba oficiales
const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [
    {
        id_usuario: "U001",
        nombre_usuario: "admin",
        mail_usuario: "fiama@ticketapp.com", //
        contraseña_usuario: "admin123", //
        rol: "admin" //
    },
    {
        id_usuario: "U002",
        nombre_usuario: "user",
        mail_usuario: "lourdes@mail.com", //
        contraseña_usuario: "user123", //
        rol: "user" //
    }
];

if (!localStorage.getItem('usuarios')) {
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
}

// VALIDACIÓN FLEXIBLE: Compara contra alias corto O correo electrónico
const validateLogin = (identificador, password) => {
    return usuarios.find(u => 
        (u.nombre_usuario === identificador || u.mail_usuario === identificador) && 
        u.contraseña_usuario === password
    ) || null;
};

// SVG de Bootstrap Icons
const svgEyeOpen = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-eye" viewBox="0 0 16 16"><path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13 13 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5s3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5s-3.879-1.168-5.168-2.457A13 13 0 0 1 1.172 8z"/><path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0"/></svg>`;
const svgEyeSlash = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-eye-slash" viewBox="0 0 16 16"><path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a10.5 10.5 0 0 0-2.738.366l.777.746P13.111 4.543a8.14 8.14 0 0 1 1.017 1.057A13 13 0 0 1 14.828 8c-.141.246-.357.573-.655.939a8.1 8.1 0 0 1-1.801 1.652zM10.03 8.637l.743.714a3.5 3.5 0 0 0-4.739-4.74l.743.715a2.5 2.5 0 0 1 3.253 3.311z"/><path d="M14 14.25L2.14 1.806l-.707.707 1.785 1.869C1.84 5.82 1 7.417 1 8s3 5.5 8 5.5a10.5 10.5 0 0 0 4.122-.816l1.386 1.452zm-10.895-3.32a12.86 12.86 0 0 1-1.933-2.93 12.97 12.97 0 0 1 1.932-2.932A8.09 8.09 0 0 1 8 4.5c.444 0 .864.043 1.257.117zM8 12.5c-1.879 0-3.51-.92-4.47-2.133L5.43 8.433a2.5 2.5 0 0 0 3.137 3.136l.98 1.03A8.14 8.14 0 0 1 8 12.5"/></svg>`;

document.querySelectorAll('.password-container').forEach(container => {
    const input = container.querySelector('.password-input');
    const button = container.querySelector('.toggle-password-btn');
    if (input && button) {
        button.innerHTML = svgEyeSlash;
        button.addEventListener('click', () => {
            const isPassword = input.type === 'password';
            input.type = isPassword ? 'text' : 'password';
            button.innerHTML = isPassword ? svgEyeSlash : svgEyeOpen;
        });
    }
});

// FLUJO DE INICIO DE SESIÓN
if ($loginForm) {
    $loginForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const identificador = $username.value.trim().toLowerCase();
        const password = $password.value;
        const usuarioLogueado = validateLogin(identificador, password);

        $authMessage.className = 'mt-2 fw-bold small text-center';

        if (usuarioLogueado) {
            // Persistencia de tokens y estado de sesión unificado
            localStorage.setItem('userToken', crypto.randomUUID());
            localStorage.setItem('currentUser', usuarioLogueado.id_usuario);
            localStorage.setItem('currentUsername', usuarioLogueado.nombre_usuario);
            localStorage.setItem('userEmail', usuarioLogueado.mail_usuario);
            localStorage.setItem('userRole', usuarioLogueado.rol); // Guarda el rol real ('admin' o 'user')

            $authMessage.className = 'mt-2 fw-bold small text-center text-success';
            $authMessage.textContent = '¡Inicio de sesión exitoso! Redirigiendo...';

            // REDIRECCIÓN CONDICIONAL ESTRICTA POR ROL (REPARADA)
            setTimeout(() => { 
                if (usuarioLogueado.rol === 'admin') {
                    window.location.href = 'admin.html'; // Redirige al panel avanzado de Persona 7
                } else {
                    window.location.href = 'home.html'; // Redirige a la vista de clientes de Persona 2
                }
            }, 1000);
        } else {
            $authMessage.className = 'mt-2 fw-bold small text-center text-danger';
            $authMessage.textContent = 'Usuario o contraseña incorrectos.';
        }
    });
}

// FLUJO DE REGISTRO
if ($registerForm) {
    $registerForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const username = $username.value.trim();
        const password = $password.value;
        const passwordConfirmed = $passwordConfirmed.value;
        const email = $email.value.trim().toLowerCase();

        $authMessage.className = 'mt-3 fw-bold small text-center';

        if (password !== passwordConfirmed) {
            $authMessage.className = 'mt-3 fw-bold small text-center text-danger';
            $authMessage.textContent = 'Las contraseñas no coinciden.';
            return;
        }

        if (usuarios.some(u => u.mail_usuario === email)) {
            $authMessage.className = 'mt-3 fw-bold small text-center text-danger';
            $authMessage.textContent = '¡Ups! Este correo electrónico ya está registrado.';
            return;
        }

        if (usuarios.some(u => u.nombre_usuario === username)) {
            $authMessage.className = 'mt-3 fw-bold small text-center text-danger';
            $authMessage.textContent = '¡Ups! Este nombre de usuario ya está en uso.';
            return;
        }

        const nuevoUsuario = {
            id_usuario: "U" + String(usuarios.length + 1).padStart(3, '0'),
            nombre_usuario: username,
            mail_usuario: email,
            contraseña_usuario: password,
            rol: "user"
        };

        usuarios.push(nuevoUsuario);
        localStorage.setItem('usuarios', JSON.stringify(usuarios));

        $authMessage.className = 'mt-3 fw-bold small text-center text-success';
        $authMessage.textContent = '¡Registro exitoso! Redirigiendo al login...';
        
        // CORRECCIÓN DE REDIRECCIÓN: Apunta a index.html que es el login real del servidor
        setTimeout(() => { window.location.href = 'index.html'; }, 1000);
    });
}

// TRANSICIÓN DE PASOS EN REGISTRO (FORMULARIO MULTI-PASO)
const $btnContinuar = document.getElementById('btn-continuar');
if ($btnContinuar) {
    $btnContinuar.addEventListener('click', (e) => {
        const stepIdentity = document.getElementById('step-identity-fields');
        const stepAccount = document.getElementById('step-account-fields');
        const sidebarStep2 = document.getElementById('sidebar-step-2');
        const sidebarStep3 = document.getElementById('sidebar-step-3');
        const formHeader = document.getElementById('form-header');
        const formSubtitle = document.getElementById('form-subtitle');

        // Obtenemos los campos del Paso 1
        const doc = document.getElementById('documento');
        const nac = document.getElementById('nacionalidad');
        const tipo = document.getElementById('tipo-documento');
        const term = document.getElementById('terminos');

        // Ejecutamos validación nativa de HTML5 en los campos del Paso 1
        if (!doc.checkValidity() || !nac.checkValidity() || !tipo.checkValidity() || !term.checkValidity()) {
            $registerForm.classList.add('was-validated');
            return;
        }

        // Si son válidos, evitamos envío nativo y pasamos al Paso 2
        e.preventDefault();
        $registerForm.classList.remove('was-validated');

        // Transición de paneles
        stepIdentity.classList.add('d-none');
        stepAccount.classList.remove('d-none');

        // Actualizar sidebar (Paso 2 completado, Paso 3 activo)
        if (sidebarStep2 && sidebarStep3) {
            sidebarStep2.parentElement.children[1].classList.remove('text-white', 'fw-bold');
            sidebarStep2.parentElement.children[1].classList.add('text-white-50', 'opacity-50');
            sidebarStep2.querySelector('span').classList.remove('bg-brand');
            sidebarStep2.querySelector('span').classList.add('bg-white', 'bg-opacity-10');

            sidebarStep3.classList.remove('text-white-50', 'opacity-50');
            sidebarStep3.classList.add('text-white', 'fw-bold');
            sidebarStep3.querySelector('span').classList.remove('bg-white', 'bg-opacity-10');
            sidebarStep3.querySelector('span').classList.add('bg-brand');
        }

        // Actualizar encabezados
        if (formHeader && formSubtitle) {
            formHeader.textContent = 'CREÁ TU CUENTA TICKETAPP';
            formSubtitle.textContent = 'Por favor completa los datos de tu cuenta para finalizar el registro:';
        }
    });
}