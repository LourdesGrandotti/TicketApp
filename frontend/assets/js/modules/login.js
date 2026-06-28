const $loginForm = document.getElementById('loginForm');
const $registerForm = document.getElementById('registerForm');
const $password = document.getElementById('password');
const $username = document.getElementById('username');
const $passwordConfirmed = document.getElementById('confirmedPassword');
const $email = document.getElementById('email');

// Determinamos qué formulario está activo en la pantalla actual
const $activeForm = $loginForm || $registerForm;

// Inicializamos o creamos dinámicamente $authMessage para evitar errores si no existe en el HTML
let $authMessage = document.getElementById('authMessage');
if (!$authMessage && $activeForm) {
    $authMessage = document.createElement('p');
    $authMessage.id = 'authMessage';
    $authMessage.className = 'mt-3 fw-bold small text-center';
    $activeForm.appendChild($authMessage);
}

// Inicialización de entidades
const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [
    {
        id_usuario: "U001",
        nombre_usuario: "admin_fiama",
        mail_usuario: "fiama@ticketapp.com",
        contraseña_usuario: "admin123",
        rol: "admin"
    }
];

// Validación de credenciales
const validateLogin = (email, password) => {
    const usuarioEncontrado = usuarios.find(u => u.mail_usuario === email && u.contraseña_usuario === password);
    return usuarioEncontrado ? usuarioEncontrado : null;
};

// SVG de Bootstrap Icons corregidos (xmlns completo)
const svgEyeOpen = `<svg xmlns="http://w3.org" width="16" height="16" fill="currentColor" class="bi bi-eye" viewBox="0 0 16 16">
  <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13 13 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5s3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5s-3.879-1.168-5.168-2.457A13 13 0 0 1 1.172 8z"/>
  <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0"/>
</svg>`;

const svgEyeSlash = `<svg xmlns="http://w3.org" width="16" height="16" fill="currentColor" class="bi bi-eye-slash" viewBox="0 0 16 16">
  <path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a10.5 10.5 0 0 0-2.738.366l.777.746P13.111 4.543a8.14 8.14 0 0 1 1.017 1.057A13 13 0 0 1 14.828 8c-.141.246-.357.573-.655.939a8.1 8.1 0 0 1-1.801 1.652zM10.03 8.637l.743.714a3.5 3.5 0 0 0-4.739-4.74l.743.715a2.5 2.5 0 0 1 3.253 3.311z"/>
  <path d="M14 14.25L2.14 1.806l-.707.707 1.785 1.869C1.84 5.82 1 7.417 1 8s3 5.5 8 5.5a10.5 10.5 0 0 0 4.122-.816l1.386 1.452zm-10.895-3.32a12.86 12.86 0 0 1-1.933-2.93 12.97 12.97 0 0 1 1.932-2.932A8.09 8.09 0 0 1 8 4.5c.444 0 .864.043 1.257.117zM8 12.5c-1.879 0-3.51-.92-4.47-2.133L5.43 8.433a2.5 2.5 0 0 0 3.137 3.136l.98 1.03A8.14 8.14 0 0 1 8 12.5"/>
</svg>`;

// Lógica de visibilidad de contraseña (para todos los inputs con botón de ojo)
document.querySelectorAll('.password-container').forEach(container => {
    const input = container.querySelector('.password-input');
    const button = container.querySelector('.toggle-password-btn');
    if (input && button) {
        // Inicializamos mostrando el ojo tachado (oculto por defecto)
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

        const email = $email.value.trim().toLowerCase();
        const password = $password.value;
        const usuarioLogueado = validateLogin(email, password);

        // Limpiamos estilos de alertas previas
        $authMessage.className = 'mt-3 fw-bold small text-center';

        if (usuarioLogueado) {
            localStorage.setItem('userToken', crypto.randomUUID());
            localStorage.setItem('currentUser', usuarioLogueado.nombre_usuario);
            localStorage.setItem('userEmail', usuarioLogueado.mail_usuario);
            localStorage.setItem('userRole', usuarioLogueado.rol);

            $authMessage.classList.add('text-success');
            $authMessage.textContent = '¡Inicio de sesión exitoso! Redirigiendo...';
            setTimeout(() => { window.location.href = 'home.html'; }, 1000);
        } else {
            $authMessage.classList.add('text-danger');
            $authMessage.textContent = 'Email o contraseña incorrectos.';
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

        // Limpiamos estilos de alertas previas
        $authMessage.className = 'mt-3 fw-bold small text-center';

        if (password !== passwordConfirmed) {
            $authMessage.classList.add('text-danger');
            $authMessage.textContent = 'Las contraseñas no coinciden.';
            return;
        }

        if (usuarios.some(u => u.mail_usuario === email)) {
            $authMessage.classList.add('text-danger');
            $authMessage.textContent = '¡Ups! Este correo electrónico ya está registrado.';
            return;
        }

        if (usuarios.some(u => u.nombre_usuario === username)) {
            $authMessage.classList.add('text-danger');
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

        $authMessage.classList.add('text-success');
        $authMessage.textContent = '¡Registro exitoso! Redirigiendo al login...';
        setTimeout(() => { window.location.href = 'login.html'; }, 1000);
    });
}

