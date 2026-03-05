// Clase principal de la aplicación
class WeatherApp {
  constructor() {
    this.lugares = [];
    this.apiBaseUrl = 'https://api.open-meteo.com/v1/forecast';
  }

  // Método para obtener coordenadas de cada ciudad
  getCoordenadas(nombreLugar = 'Luthadel') {
    const coordenadas = {
      'Luthadel':             { lat: -33.45, lon: -70.67 },
      'Fadrex City':          { lat: -33.03, lon: -71.63 },
      'Urteau':               { lat: -36.82, lon: -73.05 },
      'Tremredare':           { lat: -38.74, lon: -72.60 },
      'Mantiz':               { lat: -29.90, lon: -71.25 },
      'Conventical of Seran': { lat: -41.47, lon: -72.94 },
      'Vetitan':              { lat: -45.57, lon: -72.07 },
      'Pits of Hathsin':      { lat: -53.16, lon: -70.91 },
      'Tathingdwen':          { lat: -27.36, lon: -70.33 },
      'Lakeside':             { lat: -39.81, lon: -73.24 },
    };
    return coordenadas[nombreLugar] || { lat: -33.45, lon: -70.67 };
  }

  // Método para traducir código WMO a estado de clima Scadrial
  traducirEstado(codigo = 0) {
    if (codigo === 0)  return 'Neblina matutina';
    if (codigo <= 3)   return 'Ceniza ligera';
    if (codigo <= 48)  return 'Niebla densa';
    if (codigo <= 67)  return 'Ceniza moderada';
    if (codigo <= 77)  return 'Ceniza pesada';
    if (codigo <= 82)  return 'Tormenta de ceniza';
    if (codigo <= 99)  return 'Oscuridad y ceniza';
    return 'Ceniza constante';
  }

  // Método para obtener datos de la API para un lugar
  async obtenerClima(nombreLugar) {
    const { lat, lon } = this.getCoordenadas(nombreLugar);
    const url = `${this.apiBaseUrl}?latitude=${lat}&longitude=${lon}&daily=weathercode,temperature_2m_max,temperature_2m_min&current_weather=true&timezone=auto`;

    const respuesta = await fetch(url);
    if (!respuesta.ok) throw new Error('Error al obtener datos de la API');
    return await respuesta.json();
  }

  // Método para cargar todos los lugares en el Home 
  async cargarLugares(nombresLugares) {
    const lugaresContainer = document.getElementById('lugares');
    lugaresContainer.innerHTML = '<p class="text-center col-12">Cargando datos del clima...</p>';

    try {
      const lugares = [];

      for (let i = 0; i < nombresLugares.length; i++) {
        const nombre = nombresLugares[i];
        const datos = await this.obtenerClima(nombre);

        lugares.push({
          id: i + 1,
          nombre,
          tempActual: Math.round(datos.current_weather.temperature),
          estadoActual: this.traducirEstado(datos.current_weather.weathercode),
          pronosticoSemanal: datos.daily.time.map((dia, j) => ({
            dia: new Date(dia).toLocaleDateString('es-CL', { weekday: 'long' }),
            min: Math.round(datos.daily.temperature_2m_min[j]),
            max: Math.round(datos.daily.temperature_2m_max[j]),
            estado: this.traducirEstado(datos.daily.weathercode[j]),
          })),
        });

        // Pausa entre peticiones para evitar error de límite de API
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      this.lugares = lugares;
      this.renderizarLugares(lugaresContainer);

    } catch (error) {
      lugaresContainer.innerHTML = `
        <div class="alert alert-danger w-100 text-center">
          Error al cargar los datos del clima. Intenta más tarde.
        </div>
      `;
    }
  }

  // ✅ NUEVO: Método para cargar el detalle de un lugar específico
  async cargarDetalleLugar(locationId) {
    const lugarContainer     = document.getElementById('lugar');
    const pronosticoContainer = document.getElementById('pronosticoSemanal');

    // Mostrar spinner de carga
    lugarContainer.innerHTML = `
      <div class="text-center my-4">
        <div class="spinner-border" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
        <p class="mt-2">Consultando los vientos de Scadrial...</p>
      </div>
    `;

    try {
      // Lista de nombres en el mismo orden que el Home (id = índice + 1)
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

      const nombre = nombresCiudades[locationId - 1];

      if (!nombre) {
        lugarContainer.innerHTML = `<div class="alert alert-danger">Lugar no encontrado.</div>`;
        return;
      }

      const datos = await this.obtenerClima(nombre);

      const lugar = {
        id: locationId,
        nombre,
        tempActual: Math.round(datos.current_weather.temperature),
        estadoActual: this.traducirEstado(datos.current_weather.weathercode),
        pronosticoSemanal: datos.daily.time.map((dia, j) => ({
          dia: new Date(dia).toLocaleDateString('es-CL', { weekday: 'long' }),
          min: Math.round(datos.daily.temperature_2m_min[j]),
          max: Math.round(datos.daily.temperature_2m_max[j]),
          estado: this.traducirEstado(datos.daily.weathercode[j]),
        })),
      };

      // Renderizar info principal
      this.renderizarDetalle(lugar);

      // Calcular y mostrar estadísticas + alertas
      const estadisticas = this.calcularEstadisticas(lugar.pronosticoSemanal);
      this.renderizarEstadisticas(estadisticas);

      const alertas = this.generarAlertas(estadisticas);
      this.renderizarAlertas(alertas);

    } catch (error) {
      lugarContainer.innerHTML = `
        <div class="alert alert-danger">
          Error al cargar el detalle del lugar. Intenta más tarde.
        </div>
      `;
    }
  }

  // Método para renderizar tarjetas en el Home
  renderizarLugares(contenedor) {
    const ICONOS = {
      'Ceniza constante':   'bi-cloud-haze',
      'Niebla densa':       'bi-cloud-fog',
      'Ceniza ligera':      'bi-cloud-drizzle',
      'Tormenta de ceniza': 'bi-cloud-lightning',
      'Neblina':            'bi-cloud-haze2',
      'Ceniza pesada':      'bi-clouds',
      'Niebla espesa':      'bi-cloud-fog2',
      'Oscuridad y ceniza': 'bi-cloud-moon',
      'Ceniza moderada':    'bi-cloud-rain',
      'Neblina matutina':   'bi-clouds-fill',
    };

    contenedor.innerHTML = this.lugares.map(lugar => `
      <div class="col">
        <article class="card weather-card h-100 text-center">
          <i class="bi ${ICONOS[lugar.estadoActual] || 'bi-cloud'} card__icon"></i>
          <div class="card-body">
            <h5 class="card-title">${lugar.nombre}</h5>
            <p class="card-text">${lugar.tempActual}°C</p>
            <p class="card-text">${lugar.estadoActual}</p>
          </div>
          <div class="card-footer bg-transparent border-0">
            <a class="card-link" href="./detalle.html?id=${lugar.id}">Ver detalle</a>
          </div>
        </article>
      </div>
    `).join('');
  }

  // ✅ NUEVO: Método para renderizar la página de detalle
  renderizarDetalle(lugar) {
    const ICONOS = {
      'Ceniza constante':   'bi-cloud-haze',
      'Niebla densa':       'bi-cloud-fog',
      'Ceniza ligera':      'bi-cloud-drizzle',
      'Tormenta de ceniza': 'bi-cloud-lightning',
      'Neblina':            'bi-cloud-haze2',
      'Ceniza pesada':      'bi-clouds',
      'Niebla espesa':      'bi-cloud-fog2',
      'Oscuridad y ceniza': 'bi-cloud-moon',
      'Ceniza moderada':    'bi-cloud-rain',
      'Neblina matutina':   'bi-clouds-fill',
    };

    const icono = ICONOS[lugar.estadoActual] || 'bi-cloud';

    // Tarjeta principal
    document.getElementById('lugar').innerHTML = `
      <div class="card mb-3">
        <div class="row g-0">
          <div class="col-lg-4 d-flex justify-content-center align-items-center">
            <i class="bi ${icono}" style="font-size: 90px"></i>
          </div>
          <div class="col-lg-8">
            <div class="card-body">
              <h2 class="card-title">${lugar.nombre}</h2>
              <ul class="list-group list-group-flush">
                <li class="list-group-item">${lugar.estadoActual}</li>
                <li class="list-group-item">Temperatura: ${lugar.tempActual}°C</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    `;

    // Pronóstico semanal
    const pronosticoContainer = document.getElementById('pronosticoSemanal');
    pronosticoContainer.innerHTML = lugar.pronosticoSemanal.map(dia => `
      <li class="list-group-item">
        <i class="bi ${ICONOS[dia.estado] || 'bi-cloud'}"></i>
        ${dia.dia}: ${dia.min}°C - ${dia.max}°C — ${dia.estado}
      </li>
    `).join('');
  }

  // Método para calcular estadísticas semanales
  calcularEstadisticas(pronosticoSemanal = []) {
    const maximas = pronosticoSemanal.map(d => d.max);
    const minimas = pronosticoSemanal.map(d => d.min);

    const maximaSemanal = Math.max(...maximas);
    const minimaSemanal = Math.min(...minimas);
    const promedioSemanal = (maximas.reduce((a, b) => a + b, 0) / maximas.length).toFixed(2);

    const conteoEstados = {};
    pronosticoSemanal.forEach(dia => {
      conteoEstados[dia.estado] = (conteoEstados[dia.estado] || 0) + 1;
    });

    const estadoPredominante = Object.entries(conteoEstados)
      .reduce((a, b) => a[1] > b[1] ? a : b)[0];

    return { maximaSemanal, minimaSemanal, promedioSemanal, conteoEstados, estadoPredominante };
  }

  // ✅ NUEVO: Método para renderizar estadísticas en el DOM
  renderizarEstadisticas(estadisticas) {
    document.getElementById('minTemp').textContent = estadisticas.minimaSemanal;
    document.getElementById('maxTemp').textContent = estadisticas.maximaSemanal;
    document.getElementById('avTemp').textContent   = estadisticas.promedioSemanal;

    document.getElementById('resumen').innerHTML = `
      <p>
        Semana con clima mayormente <strong>${estadisticas.estadoPredominante}</strong>.
        Máxima ${estadisticas.maximaSemanal}°C, mínima ${estadisticas.minimaSemanal}°C.
      </p>
    `;

    const encabezadosTabla = document.getElementById('titulosEstadisticas');
    const filaTabla         = document.getElementById('filaEstadistica');

    encabezadosTabla.innerHTML = '';
    filaTabla.innerHTML        = '';

    Object.entries(estadisticas.conteoEstados).forEach(([estado, cantidad]) => {
      encabezadosTabla.innerHTML += `<th>Días ${estado}</th>`;
      filaTabla.innerHTML        += `<td>${cantidad}</td>`;
    });
  }

  // Método para generar alertas
  generarAlertas(estadisticas) {
    const alertas = [];

    if (estadisticas.minimaSemanal <= 5) {
      alertas.push('⚠️ Alerta de frío extremo: temperaturas bajo 5°C.');
    }
    if (estadisticas.maximaSemanal >= 15) {
      alertas.push('🌡️ Alerta de calor inusual para Scadrial: temperatura sobre 15°C.');
    }
    const diasTormenta = estadisticas.conteoEstados['Tormenta de ceniza'] || 0;
    if (diasTormenta >= 3) {
      alertas.push('🌪️ Semana con tormentas de ceniza intensas.');
    }
    const diasOscuridad = estadisticas.conteoEstados['Oscuridad y ceniza'] || 0;
    if (diasOscuridad >= 2) {
      alertas.push('🌑 Oscuridad prolongada detectada.');
    }

    return alertas.length > 0 ? alertas : ['✅ Condiciones estables para el Imperio Final.'];
  }

  // ✅ NUEVO: Método para renderizar alertas en el DOM
  renderizarAlertas(alertas) {
    const alertasContainer = document.getElementById('alertas');
    if (!alertasContainer) return; // Si no existe el contenedor, no hacer nada

    alertasContainer.innerHTML = alertas.map(alerta => `
      <div class="alert alert-warning" role="alert">
        ${alerta}
      </div>
    `).join('');
  }
}

export default WeatherApp;