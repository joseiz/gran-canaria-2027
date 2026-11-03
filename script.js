const STORAGE_KEY = "gran-canaria-2027-checklist";

const GROUPS = [
  {
    title: "Llegada y viaje",
    items: [
      "Billetes de ida y vuelta y confirmación",
      "Confirmación del hotel en Las Palmas",
      "Carnet de conducir (si conducen alguna etapa)",
      "Tarjeta bancaria",
    ],
  },
  {
    title: "Ropa",
    items: [
      "Chaqueta o forro polar para las cumbres",
      "Chubasquero o cortavientos",
      "Camisetas y capas para cambiar de temperatura",
      "Calzado cómodo y cerrado para paseos cortos",
      "Gorro, bufanda y guantes ligeros para Tejeda",
    ],
  },
  {
    title: "Para las visitas",
    items: [
      "Gafas de sol y protector solar",
      "Botella de agua reutilizable",
      "Cámara o móvil con batería",
      "Mochila pequeña para el día",
      "Cargador portátil",
    ],
  },
  {
    title: "Salud y viaje",
    items: [
      "Medicación habitual",
      "Botiquín básico (tiritas, analgésicos)",
      "Tarjeta sanitaria o seguro de viaje",
    ],
  },
  {
    title: "Logística del grupo",
    items: [
      "Reparto de pasajeros por coche",
      "Hora de salida acordada cada día",
      "Teléfonos de contacto del grupo",
      "Lista de paradas impresa o guardada sin conexión",
    ],
  },
];

const ALL_ITEMS = GROUPS.flatMap((group) => group.items);

function loadChecked() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch (error) {
    return new Set();
  }
}

function saveChecked(checked) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...checked]));
  } catch (error) {
    // Sin almacenamiento disponible: la checklist sigue funcionando en la sesión actual.
  }
}

function slug(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const checked = loadChecked();
const container = document.getElementById("checklist-groups");

function render() {
  container.innerHTML = "";

  GROUPS.forEach((group) => {
    const card = document.createElement("div");
    card.className = "checklist-group";

    const heading = document.createElement("h3");
    heading.textContent = group.title;
    card.appendChild(heading);

    const list = document.createElement("ul");

    group.items.forEach((item) => {
      const id = `${slug(group.title)}-${slug(item)}`;
      const li = document.createElement("li");
      const label = document.createElement("label");
      const input = document.createElement("input");
      const text = document.createElement("span");

      input.type = "checkbox";
      input.id = id;
      input.checked = checked.has(id);
      text.textContent = item;
      text.className = input.checked ? "done" : "";

      input.addEventListener("change", () => {
        if (input.checked) {
          checked.add(id);
        } else {
          checked.delete(id);
        }
        text.className = input.checked ? "done" : "";
        saveChecked(checked);
        updateProgress();
      });

      label.append(input, text);
      li.appendChild(label);
      list.appendChild(li);
    });

    card.appendChild(list);
    container.appendChild(card);
  });

  updateProgress();
}

function allIds() {
  return GROUPS.flatMap((group) =>
    group.items.map((item) => `${slug(group.title)}-${slug(item)}`)
  );
}

function updateProgress() {
  const ids = allIds();
  const done = ids.filter((id) => checked.has(id)).length;
  const total = ALL_ITEMS.length;
  const percent = total ? Math.round((done / total) * 100) : 0;

  document.getElementById("progress-count").textContent = done;
  document.getElementById("progress-total").textContent = total;
  document.getElementById("progress-fill").style.width = `${percent}%`;
}

document.getElementById("reset-checklist").addEventListener("click", () => {
  checked.clear();
  saveChecked(checked);
  render();
});

render();
