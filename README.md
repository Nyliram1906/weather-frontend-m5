# 🌫️ El Tiempo en Scadrial

Aplicación web de clima temática basada en el universo **Mistborn** de Brandon Sanderson. Muestra el estado meteorológico real de 10 ciudades del Imperio Final, consumiendo datos en tiempo real desde la API de [Open-Meteo](https://open-meteo.com/).

---

## 🗺️ Ciudades del Imperio Final

Cada ciudad de Scadrial está mapeada a una ciudad real de Chile:

| Ciudad (Scadrial)       | Ciudad real (Chile)  |
|-------------------------|----------------------|
| Luthadel                | Santiago             |
| Fadrex City             | Valparaíso           |
| Urteau                  | Concepción           |
| Tremredare              | Temuco               |
| Mantiz                  | La Serena            |
| Conventical of Seran    | Puerto Montt         |
| Vetitan                 | Coyhaique            |
| Pits of Hathsin         | Punta Arenas         |
| Tathingdwen             | Copiapó              |
| Lakeside                | Valdivia             |

---

## ✨ Funcionalidades

- **Home:** muestra tarjetas con el clima actual de las 10 ciudades obtenido desde la API.
- **Detalle:** al hacer clic en una ciudad, se muestra:
  - Clima actual con icono temático
  - Pronóstico semanal día a día
  - Estadísticas de la semana (temperatura mínima, máxima y promedio)
  - Tabla de estados del clima predominantes
  - Alertas automáticas según las condiciones (frío extremo, calor inusual, tormentas, oscuridad)
- **Acerca de nosotros:** presentación del equipo del Imperio Final.

---

## 🛠️ Tecnologías utilizadas

- **HTML5** semántico
- **CSS3** con **SCSS/BEM**
- **Bootstrap 5.3** (grid, componentes, iconos)
- **JavaScript ES6+** (clases, módulos, arrow functions, template literals, async/await)
- **API Open-Meteo** (gratuita, sin API key)

---

## 📁 Estructura del proyecto

```
weather-frontend/
├── index.html
├── detalle.html
├── acerca.html
├── README.md
└── assets/
    ├── css/
    │   └── main.css
    ├── scss/
    │   └── main.scss
    └── js/
        ├── WeatherApp.js   ← Clase principal (POO)
        ├── script.js       ← Inicializa el Home
        ├── detalle.js      ← Inicializa la página de detalle
        └── lugares.js      ← Datos estáticos de respaldo (módulo 4)
```

---

## ⚙️ Cómo ejecutar el proyecto

1. Clona el repositorio:
   ```bash
   git clone https://github.com/Nyliram1906/weather-frontend-m4.git
   cd weather-frontend-m4
   ```

2. Abre el proyecto con un servidor local. Se recomienda la extensión **Live Server** de VS Code.

3. Navega a `index.html`. La aplicación cargará automáticamente los datos desde la API.

> ⚠️ **Nota:** no abrir los archivos directamente desde el sistema de archivos (`file://`), ya que los módulos ES6 requieren un servidor HTTP para funcionar correctamente.

---

## 🌐 API de clima utilizada

**Nombre:** Open-Meteo  
**URL base:** `https://api.open-meteo.com/v1/forecast`  
**Documentación oficial:** [https://open-meteo.com/en/docs](https://open-meteo.com/en/docs)  
**Autenticación:** no requiere API key, es completamente gratuita.

### Parámetros utilizados en cada petición

```
latitude={lat}&longitude={lon}
&daily=weathercode,temperature_2m_max,temperature_2m_min
&current_weather=true
&timezone=auto
```

La API responde con un objeto JSON que incluye:
- `current_weather.temperature` → temperatura actual
- `current_weather.weathercode` → código WMO del estado actual
- `daily.time` → array con las fechas de los próximos 7 días
- `daily.temperature_2m_max` → temperaturas máximas diarias
- `daily.temperature_2m_min` → temperaturas mínimas diarias
- `daily.weathercode` → códigos WMO por día

Los códigos WMO se traducen al clima temático de Scadrial mediante el método `traducirEstado(codigo)`.

---

## 📊 Cálculo de estadísticas (versión Módulo 5)

En esta versión las estadísticas se calculan a partir de los datos reales obtenidos desde la API, a diferencia del Módulo 4 donde los datos eran estáticos.

El método `calcularEstadisticas(pronosticoSemanal = [])` recibe el array de 7 días procesado desde la respuesta JSON y calcula:

- **Temperatura mínima semanal:** `Math.min()` aplicado sobre todas las temperaturas mínimas diarias.
- **Temperatura máxima semanal:** `Math.max()` aplicado sobre todas las temperaturas máximas diarias.
- **Temperatura promedio semanal:** suma de las máximas diarias dividida por la cantidad de días, usando `.reduce()`.
- **Conteo de estados:** objeto que acumula cuántos días tuvo cada tipo de clima, construido con `.forEach()`.
- **Estado predominante:** el tipo de clima con más días en la semana, obtenido con `Object.entries().reduce()`.

```javascript
// Ejemplo simplificado del cálculo
const maximas = pronosticoSemanal.map(d => d.max);
const minimas = pronosticoSemanal.map(d => d.min);

const maximaSemanal   = Math.max(...maximas);
const minimaSemanal   = Math.min(...minimas);
const promedioSemanal = (maximas.reduce((a, b) => a + b, 0) / maximas.length).toFixed(2);
```

---

## 🏗️ Arquitectura del código

La aplicación está construida con una **clase principal `WeatherApp`** que centraliza toda la lógica:

```javascript
const app = new WeatherApp();
app.cargarLugares(nombresCiudades);     // Home
app.cargarDetalleLugar(locationId);    // Detalle
```

### Métodos principales

| Método                        | Descripción                                          |
|-------------------------------|------------------------------------------------------|
| `getCoordenadas(nombre)`      | Retorna lat/lon de cada ciudad de Scadrial           |
| `traducirEstado(codigoWMO)`   | Convierte código meteorológico a estado temático     |
| `obtenerClima(nombre)`        | Fetch a la API Open-Meteo (async/await)              |
| `cargarLugares(nombres)`      | Carga y renderiza todas las tarjetas del Home        |
| `cargarDetalleLugar(id)`      | Carga y renderiza el detalle de una ciudad           |
| `calcularEstadisticas(datos)` | Calcula min, max, promedio y conteo de estados       |
| `generarAlertas(estadisticas)`| Genera alertas según reglas del Imperio Final        |
| `renderizarLugares()`         | Actualiza el DOM del Home                            |
| `renderizarDetalle()`         | Actualiza el DOM del detalle                         |
| `renderizarEstadisticas()`    | Actualiza la tabla de estadísticas                   |
| `renderizarAlertas()`         | Actualiza el contenedor de alertas                   |

---

## 🌡️ Alertas del clima

La aplicación genera alertas automáticas basadas en las estadísticas semanales:

| Condición                              | Alerta                                          |
|----------------------------------------|-------------------------------------------------|
| Temperatura mínima ≤ 5°C              | ⚠️ Alerta de frío extremo                      |
| Temperatura máxima ≥ 15°C             | 🌡️ Alerta de calor inusual para Scadrial       |
| 3 o más días con tormenta de ceniza   | 🌪️ Semana con tormentas de ceniza intensas     |
| 2 o más días con oscuridad y ceniza   | 🌑 Oscuridad prolongada detectada               |
| Sin condiciones anteriores             | ✅ Condiciones estables para el Imperio Final  |

---

## 👩‍💻 Autora

**Marilyn Villalobos** — Desarrolladora Frontend  
Proyecto académico — Módulo 5: JavaScript y Consumo de APIs  
© 2025 Mistborn Edition