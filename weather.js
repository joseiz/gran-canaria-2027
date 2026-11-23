// Coordenadas de Las Palmas de Gran Canaria
const LAT = 28.1235;
const LON = -15.4363;

// Datos fallback realistas para enero en Gran Canaria
const fallbackData = {
  today: { max: 20, min: 15, rain: 10 },
  week: [
    { day: 20, max: 20, min: 15, rain: 20 },
    { day: 21, max: 19, min: 14, rain: 10 },
    { day: 22, max: 18, min: 13, rain: 25 },
    { day: 23, max: 19, min: 14, rain: 15 }
  ]
};

function showFallbackWeather() {
  // Mostrar datos fallback
  const todayHTML = `
    <div class="weather-card" style="background: var(--sky-soft); padding: 1rem; border-radius: 12px; text-align: center;">
      <p style="margin: 0 0 0.5rem; font-size: 0.9rem; font-weight: 600; color: var(--navy);">Hoy</p>
      <p style="margin: 0.25rem 0; font-size: 1.8rem; color: var(--coral);">${fallbackData.today.max}°</p>
      <p style="margin: 0.25rem 0; font-size: 0.85rem; color: var(--muted);">Mín: ${fallbackData.today.min}°</p>
      <p style="margin: 0.5rem 0 0; font-size: 0.75rem; color: var(--teal);">Lluvia: ${fallbackData.today.rain}%</p>
    </div>
  `;
  document.getElementById('today-weather').innerHTML = todayHTML;

  // Semana
  let weekHTML = '';
  fallbackData.week.forEach(day => {
    weekHTML += `
      <div class="weather-card" style="background: var(--sky-soft); padding: 0.75rem; border-radius: 12px; text-align: center; font-size: 0.9rem;">
        <p style="margin: 0 0 0.25rem; font-weight: 600; color: var(--navy); font-size: 0.85rem;">Día ${day.day}</p>
        <p style="margin: 0.25rem 0; font-size: 1.3rem; color: var(--coral);">${day.max}°</p>
        <p style="margin: 0.1rem 0; font-size: 0.75rem; color: var(--muted);">${day.min}°</p>
        <p style="margin: 0.25rem 0 0; font-size: 0.7rem; color: var(--teal);">💧 ${day.rain}%</p>
      </div>
    `;
  });
  document.getElementById('week-weather').innerHTML = weekHTML;
}

async function loadWeather() {
  try {
    // Intentar obtener previsión de Open-Meteo
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&daily=temperature_2m_max,temperature_2m_min,precipitation_probability,weather_code&temperature_unit=celsius&timezone=Europe/Madrid`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error('API error: ' + response.status);
    }

    const data = await response.json();
    if (!data.daily || !data.daily.time) {
      throw new Error('Invalid API response');
    }

    const daily = data.daily;

    // Hoy (índice 0 = hoy)
    if (daily.time.length > 0) {
      const todayIndex = 0;
      const todayTemp = daily.temperature_2m_max[todayIndex];
      const todayMin = daily.temperature_2m_min[todayIndex];
      const todayRain = daily.precipitation_probability[todayIndex];

      const todayHTML = `
        <div class="weather-card" style="background: var(--sky-soft); padding: 1rem; border-radius: 12px; text-align: center;">
          <p style="margin: 0 0 0.5rem; font-size: 0.9rem; font-weight: 600; color: var(--navy);">Hoy</p>
          <p style="margin: 0.25rem 0; font-size: 1.8rem; color: var(--coral);">${Math.round(todayTemp)}°</p>
          <p style="margin: 0.25rem 0; font-size: 0.85rem; color: var(--muted);">Mín: ${Math.round(todayMin)}°</p>
          <p style="margin: 0.5rem 0 0; font-size: 0.75rem; color: var(--teal);">Lluvia: ${todayRain}%</p>
        </div>
      `;
      document.getElementById('today-weather').innerHTML = todayHTML;
    }

    // Jornadas del 20 al 22 de enero y excursión del sábado 23
    const targetStart = new Date(2027, 0, 20);
    const targetEnd = new Date(2027, 0, 23);

    let weekHTML = '';
    for (let i = 0; i < daily.time.length; i++) {
      const dateStr = daily.time[i];
      const date = new Date(dateStr + 'T00:00:00');

      if (date >= targetStart && date <= targetEnd) {
        const max = daily.temperature_2m_max[i];
        const min = daily.temperature_2m_min[i];
        const rain = daily.precipitation_probability[i];
        const day = date.getDate();

        weekHTML += `
          <div class="weather-card" style="background: var(--sky-soft); padding: 0.75rem; border-radius: 12px; text-align: center; font-size: 0.9rem;">
            <p style="margin: 0 0 0.25rem; font-weight: 600; color: var(--navy); font-size: 0.85rem;">Día ${day}</p>
            <p style="margin: 0.25rem 0; font-size: 1.3rem; color: var(--coral);">${Math.round(max)}°</p>
            <p style="margin: 0.1rem 0; font-size: 0.75rem; color: var(--muted);">${Math.round(min)}°</p>
            <p style="margin: 0.25rem 0 0; font-size: 0.7rem; color: var(--teal);">💧 ${rain}%</p>
          </div>
        `;
      }
    }

    if (weekHTML) {
      document.getElementById('week-weather').innerHTML = weekHTML;
    } else {
      // Si no hay datos específicos para esas fechas, mostrar próximos 5 días
      weekHTML = '';
      for (let i = 1; i <= 5 && i < daily.time.length; i++) {
        const max = daily.temperature_2m_max[i];
        const min = daily.temperature_2m_min[i];
        const rain = daily.precipitation_probability[i];
        const dateStr = daily.time[i];
        const date = new Date(dateStr + 'T00:00:00');
        const dayName = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sab'][date.getDay()];

        weekHTML += `
          <div class="weather-card" style="background: var(--sky-soft); padding: 0.75rem; border-radius: 12px; text-align: center; font-size: 0.9rem;">
            <p style="margin: 0 0 0.25rem; font-weight: 600; color: var(--navy); font-size: 0.8rem;">${dayName}</p>
            <p style="margin: 0.25rem 0; font-size: 1.3rem; color: var(--coral);">${Math.round(max)}°</p>
            <p style="margin: 0.1rem 0; font-size: 0.75rem; color: var(--muted);">${Math.round(min)}°</p>
            <p style="margin: 0.25rem 0 0; font-size: 0.7rem; color: var(--teal);">💧 ${rain}%</p>
          </div>
        `;
      }
      document.getElementById('week-weather').innerHTML = weekHTML;
    }
  } catch (error) {
    console.log('Usando datos fallback:', error.message);
    showFallbackWeather();
  }
}

// Cargar el clima cuando la página esté lista
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadWeather);
} else {
  loadWeather();
}
