/**
 * auth.js — Módulo de Autenticación
 * ============================================================
 * Responsabilidades:
 *  1. Credenciales hardcodeadas (sin backend ni BD).
 *  2. Login: valida credenciales, guarda sesión en localStorage.
 *  3. Logout: limpia la sesión y redirige a index.html.
 *  4. Guardas de ruta: protege admin.html y user.html.
 *  5. Gestión de UI del formulario de login.
 *
 * Restricciones respetadas:
 *  - Vanilla JS (ES6+ módulos).
 *  - Estado en localStorage (clave: "ta_session").
 *  - Sin polling ni setInterval.
 * ============================================================
 */

// ─────────────────────────────────────────────────────────────
// 1. CONSTANTES Y CREDENCIALES HARDCODEADAS
// ─────────────────────────────────────────────────────────────

/** Clave usada en localStorage para la sesión activa. */
const SESSION_KEY = 'ta_session';

/**
 * Base de "usuarios" hardcodeados.
 * Cada objeto define: username, password y role.
 * Roles posibles: 'admin' | 'user'
 */
const USERS_DB = [
  {
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    displayName: 'Administrador',
  },
  {
    username: 'user',
    password: 'user123',
    role: 'user',
    displayName: 'Cliente',
  },
];

/**
 * Mapa de redirección por rol.
 * Al hacer login exitoso, cada rol lleva a su vista exclusiva.
 */
const ROLE_REDIRECT = {
  admin: 'admin.html',
  user: 'user.html',
};

/**
 * Páginas protegidas y el rol que les corresponde.
 * Si un usuario intenta acceder a una página sin el rol correcto,
 * es expulsado a index.html.
 */
const PROTECTED_ROUTES = {
  'admin.html': 'admin',
  'user.html': 'user',
};

// ─────────────────────────────────────────────────────────────
// 2. API DE SESIÓN (localStorage)
// ─────────────────────────────────────────────────────────────

/**
 * Devuelve el objeto de sesión activa o null si no existe.
 * @returns {{ username: string, role: string, displayName: string } | null}
 */
export function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    // Si el JSON está corrupto, limpiamos y devolvemos null.
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

/**
 * Persiste la sesión en localStorage.
 * @param {{ username: string, role: string, displayName: string }} sessionData
 */
function saveSession(sessionData) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
}

/**
 * Elimina la sesión del localStorage.
 */
export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

// ─────────────────────────────────────────────────────────────
// 3. LÓGICA DE AUTENTICACIÓN
// ─────────────────────────────────────────────────────────────

/**
 * Valida las credenciales contra USERS_DB.
 * @param {string} username
 * @param {string} password
 * @returns {{ username: string, role: string, displayName: string } | null}
 *          Retorna el objeto de usuario sin contraseña, o null si falla.
 */
function authenticate(username, password) {
  const found = USERS_DB.find(
    (u) => u.username === username.trim() && u.password === password
  );
  if (!found) return null;

  // Devolvemos SOLO los datos seguros (sin password).
  return {
    username: found.username,
    role: found.role,
    displayName: found.displayName,
  };
}

/**
 * Realiza el login: valida, guarda sesión y redirige.
 * @param {string} username
 * @param {string} password
 * @returns {{ success: boolean, error?: string }}
 */
export function login(username, password) {
  const session = authenticate(username, password);

  if (!session) {
    return { success: false, error: 'Usuario o contraseña incorrectos.' };
  }

  saveSession(session);

  const destination = ROLE_REDIRECT[session.role] ?? 'index.html';
  window.location.href = destination;

  return { success: true };
}

/**
 * Cierra la sesión: limpia localStorage y redirige al login.
 */
export function logout() {
  clearSession();
  window.location.href = 'index.html';
}

// ─────────────────────────────────────────────────────────────
// 4. GUARDAS DE RUTA (Route Guards)
// ─────────────────────────────────────────────────────────────

/**
 * Obtiene el nombre del archivo actual (ej: "admin.html").
 * @returns {string}
 */
function getCurrentPage() {
  // pathname puede ser "/TicketApp/admin.html" → extraemos solo el nombre
  return window.location.pathname.split('/').pop() || 'index.html';
}

/**
 * Guarda de ruta para páginas protegidas (admin.html, user.html).
 *
 * Reglas:
 *  - Si no hay sesión activa → redirige a index.html.
 *  - Si el rol no coincide con la página → redirige a index.html.
 *  - Si la sesión es válida → no hace nada (deja pasar).
 *
 * Debe llamarse al inicio de cada página protegida.
 */
export function requireAuth() {
  const page = getCurrentPage();
  const requiredRole = PROTECTED_ROUTES[page];

  // Si la página no está en el mapa, no es protegida → salir.
  if (!requiredRole) return;

  const session = getSession();

  if (!session) {
    // Sin sesión: redirige al login.
    window.location.replace('index.html');
    return;
  }

  if (session.role !== requiredRole) {
    // Rol incorrecto: redirige al login (no al portal del otro rol).
    window.location.replace('index.html');
  }
}

/**
 * Guarda inversa para index.html (login).
 * Si el usuario ya tiene sesión activa, lo manda a su vista.
 * Evita que vuelva al login innecesariamente.
 */
function redirectIfAlreadyLogged() {
  const session = getSession();
  if (!session) return;

  const destination = ROLE_REDIRECT[session.role] ?? 'index.html';
  window.location.replace(destination);
}

// ─────────────────────────────────────────────────────────────
// 5. CONTROLADOR DEL FORMULARIO DE LOGIN
// ─────────────────────────────────────────────────────────────

/**
 * Muestra u oculta el mensaje de error en el formulario.
 * @param {string|null} message  null para ocultar.
 */
function setLoginError(message) {
  const alert = document.getElementById('login-alert');
  const alertMsg = document.getElementById('login-alert-msg');

  if (!alert || !alertMsg) return;

  if (message) {
    alertMsg.textContent = message;
    alert.classList.remove('d-none');
  } else {
    alert.classList.add('d-none');
    alertMsg.textContent = '';
  }
}

/**
 * Activa/desactiva el estado de carga del botón de login.
 * @param {boolean} loading
 */
function setLoginLoading(loading) {
  const btn = document.getElementById('btn-login');
  const btnText = document.getElementById('btn-login-text');
  const spinner = document.getElementById('btn-login-spinner');

  if (!btn) return;
  btn.disabled = loading;
  btnText?.classList.toggle('d-none', loading);
  spinner?.classList.toggle('d-none', !loading);
}

/**
 * Inicializa el toggle de visibilidad de contraseña.
 */
function initPasswordToggle() {
  const toggleBtn = document.getElementById('toggle-password');
  const passwordInput = document.getElementById('password');
  const icon = document.getElementById('toggle-icon');

  if (!toggleBtn || !passwordInput) return;

  toggleBtn.addEventListener('click', () => {
    const isPassword = passwordInput.type === 'password';
    passwordInput.type = isPassword ? 'text' : 'password';
    icon.className = isPassword ? 'bi bi-eye-slash-fill' : 'bi bi-eye-fill';
    toggleBtn.setAttribute('title', isPassword ? 'Ocultar contraseña' : 'Ver contraseña');
  });
}

/**
 * Inicializa el formulario de login y sus listeners.
 * Solo se ejecuta si estamos en index.html y el form existe.
 */
function initLoginForm() {
  const form = document.getElementById('login-form');
  if (!form) return; // No estamos en la página de login.

  initPasswordToggle();

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    event.stopPropagation();

    // Resetear errores previos.
    setLoginError(null);

    // Validación nativa de Bootstrap 5.
    if (!form.checkValidity()) {
      form.classList.add('was-validated');
      return;
    }

    const username = document.getElementById('username')?.value ?? '';
    const password = document.getElementById('password')?.value ?? '';

    setLoginLoading(true);

    // Simulamos un breve delay para UX (sin setTimeout/setInterval real de negocio).
    // Este único uso de setTimeout es estético (feedback visual de 400ms).
    setTimeout(() => {
      const result = login(username, password);

      if (!result.success) {
        setLoginLoading(false);
        setLoginError(result.error);
        // Marca el campo inválido visualmente.
        form.classList.add('was-validated');
      }
      // Si success=true, login() ya disparó window.location.href → la página cambia.
    }, 400);
  });

  // Limpia el error al escribir en cualquier input.
  form.querySelectorAll('input').forEach((input) => {
    input.addEventListener('input', () => setLoginError(null));
  });
}

// ─────────────────────────────────────────────────────────────
// 6. PUNTO DE ENTRADA — Se ejecuta automáticamente al cargar
// ─────────────────────────────────────────────────────────────

(function init() {
  const page = getCurrentPage();

  if (page === 'index.html' || page === '') {
    // En la página de login: si ya hay sesión, redirigir directamente.
    redirectIfAlreadyLogged();
    // Si no hay sesión, inicializar el formulario.
    initLoginForm();
  } else {
    // En cualquier página protegida: verificar autenticación y rol.
    requireAuth();
  }
})();
