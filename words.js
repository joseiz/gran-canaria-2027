const WORDS = [
  { word: "Guagua", meaning: "Autobús", example: "«Cogemos la guagua en la parada de Santa Catalina.»" },
  { word: "Papas", meaning: "Patatas", example: "«Ponme unas papas arrugadas con mojo.»" },
  { word: "Millo", meaning: "Maíz", example: "«Gofio de millo tostado.»" },
  { word: "Cotufas", meaning: "Palomitas de maíz", example: "«¿Compramos cotufas para el cine?»" },
  { word: "Cholas", meaning: "Chanclas", example: "«Me dejé las cholas en la playa.»" },
  { word: "Queque", meaning: "Bizcocho", example: "«Mi abuela hace un queque buenísimo.»" },
  { word: "Fleje", meaning: "Mucho, gran cantidad", example: "«Había un fleje de gente en el mercado.»" },
  { word: "¡Chacho!", meaning: "Exclamación (de «muchacho»)", example: "«¡Chacho, qué vista más bonita!»" },
  { word: "¡Ños!", meaning: "Exclamación de sorpresa", example: "«¡Ños, qué calor hace hoy!»" },
  { word: "Jilorio", meaning: "Hambre", example: "«Tengo un jilorio que no veas.»" },
  { word: "Magua", meaning: "Pena, añoranza", example: "«Me da magua irme de la isla.»" },
  { word: "Enralado", meaning: "Nervioso, alterado", example: "«Los niños están enralados con la excursión.»" },
];

const wordsEl = document.getElementById("words");

WORDS.forEach((item, i) => {
  const card = document.createElement("button");
  card.type = "button";
  card.className = "word-card reveal";
  card.style.setProperty("--i", i % 4);
  card.setAttribute("aria-pressed", "false");
  card.setAttribute("aria-label", `${item.word}. Pulsen para ver el significado`);
  card.innerHTML = `
    <span class="word-inner">
      <span class="word-face word-front">
        <span class="word-term">${item.word}</span>
        <span class="word-hint">¿Qué significa?</span>
      </span>
      <span class="word-face word-back">
        <span class="word-meaning">${item.meaning}</span>
        <span class="word-example">${item.example}</span>
      </span>
    </span>`;
  card.addEventListener("click", () => {
    const flipped = card.classList.toggle("is-flipped");
    card.setAttribute("aria-pressed", String(flipped));
    card.setAttribute("aria-label", flipped ? `${item.word}: ${item.meaning}` : `${item.word}. Pulsen para ver el significado`);
  });
  wordsEl.appendChild(card);
});

// Minijuego: elegir el significado correcto entre tres opciones
const quizWord = document.getElementById("quiz-word");
const quizOptions = document.getElementById("quiz-options");
const quizFeedback = document.getElementById("quiz-feedback");
const quizScore = document.getElementById("quiz-score");
const quizTotal = document.getElementById("quiz-total");
let score = 0;
let total = 0;
let lastIndex = -1;

function shuffle(list) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function nextQuestion() {
  let index;
  do {
    index = Math.floor(Math.random() * WORDS.length);
  } while (index === lastIndex);
  lastIndex = index;

  const answer = WORDS[index];
  const others = shuffle(WORDS.filter((w) => w !== answer)).slice(0, 2);
  const options = shuffle([answer, ...others]);

  quizWord.textContent = answer.word;
  quizFeedback.textContent = "";
  quizFeedback.className = "quiz-feedback";
  quizOptions.innerHTML = "";

  options.forEach((option) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "quiz-option";
    button.textContent = option.meaning;
    button.addEventListener("click", () => {
      const correct = option === answer;
      total += 1;
      if (correct) score += 1;
      quizScore.textContent = score;
      quizTotal.textContent = total;

      quizOptions.querySelectorAll("button").forEach((b) => {
        b.disabled = true;
        if (b.textContent === answer.meaning) b.classList.add("is-correct");
      });
      if (!correct) button.classList.add("is-wrong");

      quizFeedback.textContent = correct ? `¡Muy bien! ${answer.example}` : `Casi. ${answer.word} es «${answer.meaning.toLowerCase()}».`;
      quizFeedback.classList.add(correct ? "is-correct" : "is-wrong");
    });
    quizOptions.appendChild(button);
  });
}

document.getElementById("quiz-next").addEventListener("click", nextQuestion);
nextQuestion();
