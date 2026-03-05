import WeatherApp from './WeatherApp.js';

// Gestión de navegación activa
const enlacesMenu = document.querySelectorAll('.nav-link');
enlacesMenu.forEach((enlace) => {
  if (enlace.href === window.location.href) {
    enlace.classList.add('active');
  } else {
    enlace.classList.remove('active');
  }
});

// Nombres de las ciudades de Scadrial
const nombresCiudades = [
  'Luthadel',
  'Fadrex City',
  'Urteau',
  'Tremredare',
  'Mantiz',
  'Conventical of Seran',
  'Vetitan',
  'Pits of Hathsin',
  'Tathingdwen',
  'Lakeside',
];

// Iniciar la app
const app = new WeatherApp();
app.cargarLugares(nombresCiudades);