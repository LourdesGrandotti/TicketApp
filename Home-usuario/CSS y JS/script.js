// Obtenemos las referencias a los elementos del DOM necesarios para el funcionamiento del carrusel
const carousel = document.getElementById('matches-carousel'); // Contenedor principal que hace scroll horizontal
const actionBtnRight = document.querySelector('.carousel-btn-overlay a.btn'); // Botón flotante de la derecha ("Ver más" o avanzar)
const actionBtnLeft = document.querySelector('.carousel-btn-overlay-left button'); // Botón flotante de la izquierda para retroceder
const overlayLeft = document.querySelector('.carousel-btn-overlay-left'); // Contenedor del botón izquierdo para poder ocultarlo/mostrarlo

// Verificamos que todos los elementos existan en la página actual antes de agregar eventos para evitar errores
if (carousel && actionBtnRight && actionBtnLeft) {

    // Botón Derecho (Avanzar / Navegar)
    // Escuchamos el evento 'click' en el botón derecho
    actionBtnRight.addEventListener('click', (e) => {
        // Calculamos el límite máximo de scroll hacia la derecha (ancho total del contenido - ancho visible)
        const maxScrollLeft = carousel.scrollWidth - carousel.clientWidth;

        // Comprobamos si aún hay espacio para hacer scroll a la derecha (dejamos un margen de 10px por precaución)
        if (carousel.scrollLeft < maxScrollLeft - 10) {
            e.preventDefault(); // Prevenimos la acción por defecto del enlace (navegar a otra página) para que solo haga scroll

            // Calculamos la cantidad de scroll: el ancho de una tarjeta (.card) más el espacio entre ellas (gap de 24px)
            const scrollAmount = carousel.querySelector('.card').offsetWidth + 24;

            // Hacemos que el carrusel se desplace horizontalmente la cantidad calculada, con una animación suave ('smooth')
            carousel.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
        // Si el carrusel ya llegó al final, no prevenimos el comportamiento por defecto (e.preventDefault()),
        // por lo que el botón actuará como un enlace normal y navegará a la página del calendario completo.
    });

    // Botón Izquierdo (Retroceder)
    // Escuchamos el evento 'click' en el botón izquierdo
    actionBtnLeft.addEventListener('click', () => {
        // Calculamos la cantidad a desplazar, igual que el botón derecho (ancho de tarjeta + margen)
        const scrollAmount = carousel.querySelector('.card').offsetWidth + 24;

        // Hacemos que el carrusel se desplace hacia la izquierda (valor negativo), con animación suave
        carousel.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    });

    // Mostrar u ocultar el botón izquierdo dependiendo de la posición del scroll
    // Escuchamos el evento 'scroll', que se dispara cada vez que el carrusel se mueve (ya sea por botones o con el dedo/mouse)
    carousel.addEventListener('scroll', () => {
        // Comprobamos si el carrusel está en la posición inicial (o muy cerca del borde izquierdo, <= 5px)
        if (carousel.scrollLeft <= 5) {
            // Si estamos al principio, ocultamos el contenedor del botón izquierdo añadiendo la clase 'hidden'
            overlayLeft.classList.add('hidden');
        } else {
            // Si nos hemos desplazado hacia la derecha, mostramos el contenedor del botón izquierdo removiendo la clase 'hidden'
            overlayLeft.classList.remove('hidden');
        }
    });
}

// --- Lógica de Autenticación y Navbar ---
document.addEventListener('DOMContentLoaded', () => {
    // Referencias a los elementos del navbar y modal
    const navSearch = document.getElementById('nav-search');
    const navAccount = document.getElementById('nav-account');
    const navCart = document.getElementById('nav-cart');
    const navAuthBtn = document.getElementById('nav-auth-btn');
    const navDivider = document.getElementById('nav-divider');
    const confirmLogoutBtn = document.getElementById('confirm-logout-btn');

    // Leemos el estado de sesión guardado en localStorage
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

    // Si el botón de autenticación existe en esta página (ej: index.html)
    if (navAuthBtn) {
        if (isLoggedIn) {
            // Usuario LOGUEADO: Mostrar opciones completas
            if (navSearch) navSearch.classList.remove('d-none');
            if (navAccount) navAccount.classList.remove('d-none');
            if (navCart) navCart.classList.remove('d-none');
            if (navDivider) navDivider.classList.remove('d-none');

            // Cambiar el botón principal a "Cerrar sesión" y abrir el modal
            navAuthBtn.textContent = 'Cerrar sesión';
            navAuthBtn.href = 'javascript:void(0)';
            navAuthBtn.removeAttribute('data-bs-toggle');
            navAuthBtn.removeAttribute('data-bs-target');

            // Usamos exclusivamente la API de JS para evitar conflictos con data-attributes
            navAuthBtn.onclick = (e) => {
                e.preventDefault();
                const modalElement = document.getElementById('logoutModal');
                if (modalElement) {
                    const modal = new bootstrap.Modal(modalElement);
                    modal.show();
                }
            };

        } else {
            // Usuario NO LOGUEADO: Ocultar opciones (Buscador, cuenta, carrito)
            if (navSearch) navSearch.classList.add('d-none');
            if (navAccount) navAccount.classList.add('d-none');
            if (navCart) navCart.classList.add('d-none');
            if (navDivider) navDivider.classList.add('d-none');

            // Cambiar el botón principal a "Iniciar sesión"
            navAuthBtn.textContent = 'Iniciar sesión';
            navAuthBtn.href = 'login.html';
            navAuthBtn.removeAttribute('data-bs-toggle');
            navAuthBtn.removeAttribute('data-bs-target');
            navAuthBtn.onclick = null; // Limpiar cualquier evento programático previo
        }
    }

    // Evento para el botón rojo de confirmar cierre de sesión dentro del modal
    if (confirmLogoutBtn) {
        confirmLogoutBtn.addEventListener('click', () => {
            // Cambiamos el estado de sesión a 'false'
            localStorage.setItem('isLoggedIn', 'false');

            // Redirigimos siempre al home (index.html) sin sesión
            window.location.href = 'index.html';
        });
    }
});
