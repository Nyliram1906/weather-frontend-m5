import WeatherApp from './WeatherApp.js';

// Gestión de navegación activa
const enlaces = document.querySelectorAll('.nav-link');
enlaces.forEach((enlace) => {
  if (enlace.href === window.location.href) {
    enlace.classList.add('active');
  } else {
    enlace.classList.remove('active');
  }
});

// Obtener ID desde la URL
const urlParams   = new URLSearchParams(window.location.search);
const locationId  = parseInt(urlParams.get('id'));

// Validar que el ID sea válido
if (!locationId || locationId < 1 || locationId > 10) {
  document.getElementById('lugar').innerHTML = `
    <div class="alert alert-danger">
      Lugar no encontrado. <a href="./index.html">Volver al inicio</a>
    </div>
  `;
  throw new Error('ID de lugar inválido');
}

// Iniciar la app y cargar el detalle
const app = new WeatherApp();
app.cargarDetalleLugar(locationId);