/**
 * 📦 Acá se guardan las funciones que sirven para interactuar con la base de datos local (LocalStorage).
 * Permiten guardar y traer la lista de partidos de forma permanente en el navegador.
 */

// Trae los partidos desde el LocalStorage. Si no hay ninguno, devuelve un array vacío [].
export function obtenerPartidosDeStorage() {
  const partidosTexto = localStorage.getItem('partidos');
  if (partidosTexto) {
    return JSON.parse(partidosTexto);
  } else {
    return [];
  }
}

// Guarda la lista completa de partidos de vuelta en el LocalStorage convertida en texto.
export function guardarPartidosEnStorage(listaPartidos) {
  localStorage.setItem('partidos', JSON.stringify(listaPartidos));
}
