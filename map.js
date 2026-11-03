const STOPS = [
  { id: "rincon", n: "★", group: "centro", name: "IES El Rincón", label: "Centro anfitrión", lat: 28.12848, lng: -15.44674 },
  { id: "catedral", n: 1, group: "trabajo", name: "Catedral de Santa Ana", label: "Idea para la tarde", lat: 28.10083, lng: -15.41473, img: "images/catedral-santa-ana.jpg" },
  { id: "colon", n: 2, group: "trabajo", name: "Casa de Colón", label: "Idea para la tarde", lat: 28.10138, lng: -15.41411, img: "images/calle-vegueta.jpg" },
  { id: "jardin", n: 3, group: "trabajo", name: "Jardín Botánico Viera y Clavijo", label: "Idea para la tarde", lat: 28.06441, lng: -15.46231, img: "images/jardin-botanico.jpg" },
  { id: "bandama", n: 4, group: "trabajo", name: "Caldera de Bandama", label: "Idea para la tarde", lat: 28.03751, lng: -15.45785, img: "images/caldera-bandama.jpg" },
  { id: "mercado", n: 5, group: "trabajo", name: "Mercado del Puerto", label: "Idea para la tarde", lat: 28.14766, lng: -15.42911, img: "images/mercado-puerto.jpg" },
  { id: "canteras", n: 6, group: "trabajo", name: "Paseo de Las Canteras", label: "Idea para la tarde", lat: 28.13955, lng: -15.43663, img: "images/las-canteras.jpg" },
  { id: "teror", n: 7, group: "finde", name: "Teror", label: "Fin de semana", lat: 28.0593, lng: -15.54781, img: "images/teror-basilica.jpg" },
  { id: "arucas", n: 8, group: "finde", name: "Catedral de Arucas", label: "Fin de semana", lat: 28.11857, lng: -15.52306, img: "images/arucas-catedral.jpg" },
  { id: "cenobio", n: 9, group: "finde", name: "Cenobio de Valerón", label: "Fin de semana", lat: 28.13896, lng: -15.60444, img: "images/cenobio-valeron.jpg" },
  { id: "galdar", n: 10, group: "finde", name: "Cueva Pintada, Gáldar", label: "Fin de semana", lat: 28.14402, lng: -15.65508, img: "images/cueva-pintada.jpg" },
  { id: "agaete", n: 11, group: "finde", name: "Agaete y Puerto de las Nieves", label: "Fin de semana", lat: 28.10014, lng: -15.71303, img: "images/agaete-dedo-de-dios.jpg" },
];

// Zonas aproximadas que se muestran sombreadas en el mapa
const ZONES = {
  trabajo: {
    name: "Las Palmas y alrededores",
    points: [[28.165, -15.445], [28.15, -15.405], [28.095, -15.4], [28.03, -15.43], [28.025, -15.475], [28.07, -15.48], [28.13, -15.46]],
  },
  finde: {
    name: "Zona norte",
    points: [[28.05, -15.565], [28.105, -15.505], [28.135, -15.51], [28.16, -15.6], [28.165, -15.67], [28.12, -15.735], [28.085, -15.72], [28.07, -15.62]],
  },
};

const ROUTE = ["rincon", "teror", "arucas", "cenobio", "galdar", "agaete"];

function initMap() {
  const mapEl = document.getElementById("map");
  if (!mapEl) return;

  if (typeof L === "undefined") {
    mapEl.hidden = true;
    document.querySelector(".map-fallback").hidden = false;
    return;
  }

  const map = L.map(mapEl, {
    scrollWheelZoom: false,
    dragging: !L.Browser.mobile,
    tap: false,
    zoomSnap: 0.25,
  });

  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap</a>",
  }).addTo(map);

  // La rueda del ratón solo hace zoom tras pulsar en el mapa, para no secuestrar el scroll
  map.on("click", () => map.scrollWheelZoom.enable());
  mapEl.addEventListener("mouseleave", () => map.scrollWheelZoom.disable());

  const zoneLayers = {};
  Object.entries(ZONES).forEach(([group, zone]) => {
    zoneLayers[group] = L.polygon(zone.points, {
      className: `zone zone-${group}`,
      smoothFactor: 2,
    }).bindTooltip(zone.name, { sticky: true, className: "zone-tip" });
  });

  const byId = Object.fromEntries(STOPS.map((s) => [s.id, s]));
  const route = L.polyline(ROUTE.map((id) => [byId[id].lat, byId[id].lng]), {
    className: "route",
  });

  const markers = {};
  STOPS.forEach((stop) => {
    const icon = L.divIcon({
      className: "pin-wrap",
      html: `<span class="pin pin-${stop.group}">${stop.n}</span>`,
      iconSize: [34, 34],
      iconAnchor: [17, 17],
      popupAnchor: [0, -16],
    });

    const photo = stop.img ? `<img src="${stop.img}" alt="" loading="lazy">` : "";
    const details = stop.group === "centro" ? "" : `<a href="#stop-${stop.id}" class="popup-link">Ver detalles</a>`;
    const popup = `
      <div class="popup">
        ${photo}
        <p class="popup-label">${stop.label}</p>
        <p class="popup-name">${stop.name}</p>
        ${details}
      </div>`;

    markers[stop.id] = L.marker([stop.lat, stop.lng], { icon, title: stop.name, riseOnHover: true })
      .bindPopup(popup, { maxWidth: 240, minWidth: 200 });
  });

  const list = document.getElementById("stop-list");
  STOPS.forEach((stop) => {
    const li = document.createElement("li");
    li.dataset.group = stop.group;
    li.innerHTML = `
      <button type="button" data-stop="${stop.id}">
        <span class="pin pin-${stop.group}">${stop.n}</span>
        <span class="stop-list-text"><strong>${stop.name}</strong><small>${stop.label}</small></span>
      </button>`;
    li.querySelector("button").addEventListener("click", () => focusStop(stop.id));
    list.appendChild(li);
  });

  function focusStop(id) {
    const stop = byId[id];
    if (!stop) return;
    map.flyTo([stop.lat, stop.lng], 14, { duration: 1.2 });
    map.once("moveend", () => markers[id].openPopup());
    list.querySelectorAll("button").forEach((b) => b.classList.toggle("is-active", b.dataset.stop === id));
  }

  let current = "todo";
  function applyFilter(filter) {
    current = filter;
    const visible = STOPS.filter((s) => filter === "todo" || s.group === filter || s.group === "centro");

    STOPS.forEach((s) => {
      const show = visible.includes(s);
      if (show) markers[s.id].addTo(map);
      else markers[s.id].remove();
    });

    Object.entries(zoneLayers).forEach(([group, layer]) => {
      if (filter === "todo" || filter === group) layer.addTo(map);
      else layer.remove();
    });

    if (filter === "todo" || filter === "finde") route.addTo(map);
    else route.remove();

    list.querySelectorAll("li").forEach((li) => {
      li.hidden = !(filter === "todo" || li.dataset.group === filter || li.dataset.group === "centro");
    });

    const bounds = L.latLngBounds(visible.map((s) => [s.lat, s.lng]));
    map.flyToBounds(bounds, { padding: [40, 40], duration: 0.8 });

    document.querySelectorAll(".chip").forEach((chip) => {
      chip.classList.toggle("is-active", chip.dataset.filter === filter);
    });
  }

  document.querySelectorAll(".chip").forEach((chip) => {
    chip.addEventListener("click", () => applyFilter(chip.dataset.filter));
  });

  // Botones "Ver en el mapa" de cada parada
  document.querySelectorAll(".locate").forEach((button) => {
    button.addEventListener("click", () => {
      const id = button.dataset.stop;
      const stop = byId[id];
      if (current !== "todo" && stop.group !== current) applyFilter("todo");
      document.getElementById("mapa").scrollIntoView({ behavior: "smooth", block: "start" });
      setTimeout(() => focusStop(id), 700);
    });
  });

  map.fitBounds(L.latLngBounds(STOPS.map((s) => [s.lat, s.lng])), { padding: [40, 40] });
  applyFilter("todo");

  // Leaflet necesita recalcular el tamaño cuando el contenedor aparece con la animación
  new ResizeObserver(() => map.invalidateSize()).observe(mapEl);
}

initMap();
