// ----------------- helpers -----------------
function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

function normalize(s) {
  return (s || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

// ----------------- QUIZ (10 total; Q10 is Valentine) -----------------
const quizTitle = document.getElementById("quizTitle");
const quizSub = document.getElementById("quizSub");
const progressText = document.getElementById("progressText");
const questionArea = document.getElementById("questionArea");
const quizMsg = document.getElementById("quizMsg");
const quizBackBtn = document.getElementById("quizBackBtn");
const quizSubmitBtn = document.getElementById("quizSubmitBtn");

// EDIT THESE.
// Types: "text", "mc", "valentine"
const QUESTIONS = [
  { type: "text", prompt: "1) What was the first place we went together?", answers: ["the cafe", "starbucks", "chipotle"] },
  { type: "text", prompt: "2) Our inside joke word/phrase?", answers: ["banana phone", "our inside joke"] },
  { type: "mc", prompt: "3) Pick the correct one:", choices: ["Option A", "Option B", "Option C"], correctIndex: 1 },
  { type: "text", prompt: "4) What month did we ______?", answers: ["june"] },
  { type: "text", prompt: "5) What’s my go-to order?", answers: ["iced latte", "latte"] },
  { type: "mc", prompt: "6) Which one is true?", choices: ["A", "B", "C"], correctIndex: 0 },
  { type: "text", prompt: "7) Where was our best ______?", answers: ["beach"] },
  { type: "text", prompt: "8) What show/movie did we binge?", answers: ["______"] },
  { type: "text", prompt: "9) Finish this phrase: “______”", answers: ["______"] },
  { type: "valentine", prompt: "10) Final question: Will you be my Valentine?" }
];

let qIndex = 0;

function loadQuizState() {
  const saved = localStorage.getItem("quizState");
  if (!saved) return;
  try {
    const obj = JSON.parse(saved);
    if (typeof obj.qIndex === "number") qIndex = obj.qIndex;
  } catch {}
}

function saveQuizState() {
  localStorage.setItem("quizState", JSON.stringify({ qIndex }));
}

function renderQuizQuestion() {
  quizMsg.textContent = "";

  quizTitle.textContent = "Unlock Your Wrapped";
  quizSub.textContent = "Get each one right to move forward.";
  progressText.textContent = `Question ${qIndex + 1} / ${QUESTIONS.length}`;

  quizBackBtn.disabled = qIndex === 0;

  const q = QUESTIONS[qIndex];

  if (q.type === "text") {
    quizSubmitBtn.disabled = false;
    quizSubmitBtn.textContent = "Submit";
    questionArea.innerHTML = `
      <div class="q">
        <label for="qInput">${q.prompt}</label>
        <input id="qInput" type="text" autocomplete="off" placeholder="Type your answer" />
      </div>
    `;
    setTimeout(() => document.getElementById("qInput")?.focus(), 0);
    return;
  }

  if (q.type === "mc") {
    quizSubmitBtn.disabled = false;
    quizSubmitBtn.textContent = "Submit";

    const radios = q.choices.map((c, i) => `
      <label>
        <input type="radio" name="mc" value="${i}"> ${c}
      </label>
    `).join("");

    questionArea.innerHTML = `
      <div class="q">
        <label>${q.prompt}</label>
        <div class="choices">${radios}</div>
      </div>
    `;
    return;
  }

  if (q.type === "valentine") {
    // Q10: no Submit; use buttons
    quizSubmitBtn.disabled = true;
    quizSubmitBtn.textContent = "Submit";

    questionArea.innerHTML = `
      <div class="q">
        <label>${q.prompt}</label>
        <div class="row" style="margin-top:12px; flex-wrap:wrap;">
          <button id="valYes" class="btn" type="button">Yes</button>
          <button id="valNo" class="btn ghost" type="button">No</button>
        </div>
        <p class="msg" style="margin-top:10px;">If you press “Yes”, it unlocks your Wrapped.</p>
      </div>
    `;

    document.getElementById("valYes").addEventListener("click", () => {
      localStorage.setItem("unlocked", "true");
      // optional: store that she reached the end of quiz
      localStorage.setItem("quizState", JSON.stringify({ qIndex: qIndex }));
      startWrapped();
      showScreen("screen-wrapped");
    });

    document.getElementById("valNo").addEventListener("click", () => {
      quizMsg.textContent = "Okay. Wrapped stays locked.";
    });

    return;
  }
}

function checkAnswerCorrect() {
  const q = QUESTIONS[qIndex];

  if (q.type === "text") {
    const val = normalize(document.getElementById("qInput")?.value);
    return q.answers.map(normalize).includes(val);
  }

  if (q.type === "mc") {
    const checked = document.querySelector('input[name="mc"]:checked');
    if (!checked) return false;
    return Number(checked.value) === q.correctIndex;
  }

  return false;
}

quizSubmitBtn.addEventListener("click", () => {
  if (QUESTIONS[qIndex].type === "valentine") return;

  if (checkAnswerCorrect()) {
    quizMsg.textContent = "Correct ✅";
    qIndex = Math.min(qIndex + 1, QUESTIONS.length - 1);
    saveQuizState();
    renderQuizQuestion();
  } else {
    quizMsg.textContent = "Incorrect. Try again.";
  }
});

quizBackBtn.addEventListener("click", () => {
  if (qIndex <= 0) return;
  qIndex--;
  saveQuizState();
  renderQuizQuestion();
});

// ----------------- WRAPPED -----------------
const slideEl = document.getElementById("slide");
const wrappedBackBtn = document.getElementById("wrappedBackBtn");
const wrappedNextBtn = document.getElementById("wrappedNextBtn");

// EDIT THESE SLIDES (optionally add image: "assets/images/pic1.jpg")
const SLIDES = [
  { title: "Top Moment", body: "That day we ______. Still undefeated." },
  { title: "Top Place", body: "Somehow we always ended up at ______." },
  { title: "Most Replayed", body: "The thing you said that I still quote: “______”" },
  { title: "Best Duo Stat", body: "Laughs per hour: suspiciously high." },
  { title: "Summary", body: "You made my year better. That’s the whole report." }
];

let slideIndex = 0;

function renderSlide() {
  const s = SLIDES[slideIndex];

  slideEl.innerHTML = `
    <h2>${s.title}</h2>
    ${s.image ? `<img class="slide-img" src="${s.image}" alt="">` : ""}
    <p>${s.body}</p>
    <p class="msg">Slide ${slideIndex + 1} / ${SLIDES.length}</p>
  `;

  wrappedNextBtn.textContent = (slideIndex === SLIDES.length - 1) ? "Done" : "Next";
}

function startWrapped() {
  slideIndex = 0;
  renderSlide();
}

wrappedNextBtn.addEventListener("click", () => {
  if (slideIndex < SLIDES.length - 1) {
    slideIndex++;
    renderSlide();
  } else {
    // End behavior: return to quiz start (or keep on last slide)
    showScreen("screen-quiz");
    qIndex = 0;
    saveQuizState();
    renderQuizQuestion();
  }
});

// Back button on Wrapped goes to quiz page (your request)
wrappedBackBtn.addEventListener("click", () => {
  showScreen("screen-quiz");
  renderQuizQuestion();
});

// ----------------- init -----------------
(function init() {
  loadQuizState();

  // If you want the site to ALWAYS start fresh when you open it, uncomment:
  // localStorage.clear();

  const unlocked = localStorage.getItem("unlocked") === "true";
  if (unlocked) {
    startWrapped();
    showScreen("screen-wrapped");
  } else {
    showScreen("screen-quiz");
    renderQuizQuestion();
  }
})();
