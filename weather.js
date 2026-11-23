// Coordenadas de Las Palmas de Gran Canaria
const LAT = 28.1235;
const LON = -15.4363;

// Días del viaje: jornadas del 20 al 22 de enero y excursión el sábado 23
const TRIP_DAYS = ["2027-01-20", "2027-01-21", "2027-01-22", "2027-01-23"];
const DAY_NAMES = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

// Valores habituales de enero en Las Palmas, para cuando aún no hay previsión
const TYPICAL = { max: 21, min: 15, rain: 20 };

function dayLabel(dateStr) {
  const date = new Date(dateStr + "T12:00:00");
  return `${DAY_NAMES[date.getDay()]} ${date.getDate()}`;
}

function todayCard(max, min, rain) {
  return `
    <div class="weather-card" style="background: var(--sky-soft); padding: 1rem; border-radius: 12px; text-align: center;">
      <p style="margin: 0 0 0.5rem; font-size: 0.9rem; font-weight: 600; color: var(--navy);">Hoy en Las Palmas</p>
      <p style="margin: 0.25rem 0; font-size: 1.8rem; color: var(--coral);">${Math.round(max)}°</p>
      <p style="margin: 0.25rem 0; font-size: 0.85rem; color: var(--muted);">Mín: ${Math.round(min)}°</p>
      <p style="margin: 0.5rem 0 0; font-size: 0.75rem; color: var(--teal);">Lluvia: ${rain ?? 0}%</p>
    </div>
  `;
}

function dayCard(dateStr, max, min, rain, typical) {
  const prefix = typical ? "≈ " : "";
  return `
    <div class="weather-card" style="background: var(--sky-soft); padding: 0.75rem; border-radius: 12px; text-align: center; font-size: 0.9rem;">
      <p style="margin: 0 0 0.25rem; font-weight: 600; color: var(--navy); font-size: 0.85rem;">${dayLabel(dateStr)}</p>
      <p style="margin: 0.25rem 0; font-size: 1.3rem; color: var(--coral);">${prefix}${Math.round(max)}°</p>
      <p style="margin: 0.1rem 0; font-size: 0.75rem; color: var(--muted);">${prefix}${Math.round(min)}°</p>
      <p style="margin: 0.25rem 0 0; font-size: 0.7rem; color: var(--teal);">💧 ${prefix}${rain ?? 0}%</p>
    </div>
  `;
}

function render(daily) {
  const todayEl = document.getElementById("today-weather");
  const weekEl = document.getElementById("week-weather");
  const noteEl = document.getElementById("weather-note");

  if (daily) {
    todayEl.innerHTML = todayCard(daily.temperature_2m_max[0], daily.temperature_2m_min[0], daily.precipitation_probability_max[0]);
  } else {
    todayEl.innerHTML = `
      <div class="weather-card" style="background: var(--sky-soft); padding: 1rem; border-radius: 12px; text-align: center;">
        <p style="margin: 0; font-size: 0.85rem; color: var(--muted);">No se ha podido cargar el tiempo de hoy.</p>
      </div>
    `;
  }

  // Para cada día del viaje, la previsión real si ya existe; si no, el valor habitual
  let realDays = 0;
  weekEl.innerHTML = TRIP_DAYS.map((dateStr) => {
    const i = daily ? daily.time.indexOf(dateStr) : -1;
    if (i === -1) return dayCard(dateStr, TYPICAL.max, TYPICAL.min, TYPICAL.rain, true);
    realDays += 1;
    return dayCard(dateStr, daily.temperature_2m_max[i], daily.temperature_2m_min[i], daily.precipitation_probability_max[i], false);
  }).join("");

  if (realDays === TRIP_DAYS.length) {
    noteEl.textContent = "Previsión real de Open-Meteo, actualizada a diario.";
  } else if (realDays > 0) {
    noteEl.textContent = "Previsión real de Open-Meteo para los primeros días; los marcados con ≈ son valores habituales de enero.";
  } else {
    noteEl.textContent = "Valores habituales de enero (≈). La previsión real aparecerá aquí unas dos semanas antes del viaje."
      + (daily ? " El tiempo de hoy sí es real, de Open-Meteo." : "");
  }
}

async function loadWeather() {
  let daily = null;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    const params = new URLSearchParams({
      latitude: LAT,
      longitude: LON,
      daily: "temperature_2m_max,temperature_2m_min,precipitation_probability_max",
      timezone: "Atlantic/Canary",
      forecast_days: 16,
    });
    const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) throw new Error("API error: " + response.status);
    const data = await response.json();
    if (!data.daily || !data.daily.time) throw new Error("Respuesta inesperada");
    daily = data.daily;
  } catch (error) {
    console.warn("Tiempo no disponible:", error.message);
  }
  render(daily);
}

// Cargar el clima cuando la página esté lista
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", loadWeather);
} else {
  loadWeather();
}
