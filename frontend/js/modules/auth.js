// Definimos la función encargada de verificar los accesos
function verificarAccesoUsuario() {
    // 1. Obtener los datos de sesión desde el localStorage
    const token = localStorage.getItem('userToken');
    const role = localStorage.getItem('userRole');

    // 2. Detectar en qué página está parado el usuario actual
    const currentPath = window.location.pathname;

    // 3. Definir qué páginas requieren qué condiciones (Adaptado a las rutas de main)
    const isAdminPage = currentPath.includes('admin.html') || currentPath.includes('panel');
    const isLoginPage = currentPath.includes('index.html') || currentPath.includes('registro.html');
    const isPublicPage = isLoginPage || currentPath.includes('home.html') || currentPath.endsWith('/') || currentPath === '';

    // CASO 1: Si no está logueado e intenta entrar a una zona protegida
    if (!token && !isPublicPage) {
        alert('Debés iniciar sesión para acceder a esta sección.');
        window.location.href = 'index.html'; // Redirige a la raíz
        return;
    }

    // CASO 2: Si ya está logueado pero intenta volver al Login o Registro
    if (token && isLoginPage) {
        if (role === 'admin') {
            window.location.href = 'admin.html';
        } else {
            window.location.href = 'home.html';
        }
        return;
    }

    // CASO 3: Si intenta entrar al panel de administración pero NO es admin
    if (isAdminPage && role !== 'admin') {
        alert('Acceso denegado. No tenés permisos de administrador.');
        window.location.href = 'home.html';
        return;
    }
}

// Ejecutamos la función inmediatamente al cargar el archivo script
verificarAccesoUsuario();