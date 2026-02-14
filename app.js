// FORCE FULL RESET ON EVERY PAGE LOAD (GitHub Pages)
localStorage.clear();

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

let valentineMouseCleanup = null;

function stopValentineMode() {
  if (valentineMouseCleanup) {
    valentineMouseCleanup();
    valentineMouseCleanup = null;
  }
}

function startValentineRunaway() {
  const noBtn = document.getElementById("valNo");
  const yesBtn = document.getElementById("valYes");
  if (!noBtn || !yesBtn) return;

  const RUN_RADIUS = 120;
  const MOVE_DIST = 180;
  let yesScale = 1;

  const onMove = (e) => {
    const x = e.clientX, y = e.clientY;
    const rect = noBtn.getBoundingClientRect();
    const noCenterX = rect.left + rect.width / 2, noCenterY = rect.top + rect.height / 2;
    const dist = Math.hypot(x - noCenterX, y - noCenterY);
    if (dist < RUN_RADIUS) {
      const angle = Math.atan2(y - noCenterY, x - noCenterX);
      const newX = x + Math.cos(angle) * MOVE_DIST + (Math.random() - 0.5) * 80;
      const newY = y + Math.sin(angle) * MOVE_DIST + (Math.random() - 0.5) * 80;
      const boundedX = Math.max(20, Math.min(window.innerWidth - noBtn.offsetWidth - 20, newX));
      const boundedY = Math.max(20, Math.min(window.innerHeight - noBtn.offsetHeight - 20, newY));
      noBtn.style.left = boundedX + "px";
      noBtn.style.top = boundedY + "px";
      yesScale = Math.min(1.6, yesScale + 0.04);
      yesBtn.style.transform = "scale(" + yesScale + ")";
    }
  };

  noBtn.style.position = "fixed";
  noBtn.style.left = (window.innerWidth / 2 + 90) + "px";
  noBtn.style.top = (window.innerHeight / 2 - noBtn.offsetHeight / 2) + "px";
  noBtn.style.zIndex = "1000";
  const moveHandler = (e) => {
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    onMove({ clientX: clientX, clientY: clientY });
  };
  window.addEventListener("mousemove", onMove);
  window.addEventListener("touchmove", moveHandler, { passive: true });
  valentineMouseCleanup = () => {
    window.removeEventListener("mousemove", onMove);
    window.removeEventListener("touchmove", moveHandler);
    noBtn.style.position = "";
    noBtn.style.left = "";
    noBtn.style.top = "";
    noBtn.style.zIndex = "";
    if (yesBtn) yesBtn.style.transform = "";
  };
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
  { type: "text", prompt: "1) Where was the first place we met in person?", answers: ["sunfest"] },
  { type: "text", prompt: "2) What is my nik name?", answers: ["stinky, moop, babe"] },
  { type: "mc", prompt: "3) Pick the correct number:", choices: ["19", "67", "69"], correctIndex: 0 },
  { type: "text", prompt: "4) What month did we start dating?", answers: ["june"] },
  { type: "text", prompt: "5) favorite body part?", acceptAny: true },
  { type: "mc", prompt: "6) Which one is true?", choices: ["you love me", "I love you"], correctIndex: 0 | 1 },
  { type: "text", prompt: "7) Where was our best sex?", acceptAny: true },
  { type: "text", prompt: "8) What movie did you recommend we watch last?", answers: ["spirited away"] },
  { type: "text", prompt: "9) say something: ______", acceptAny: true },
  { type: "valentine", prompt: "10) Final question: Will you be my Valentine?", backgroundImage: "assets/valentine-bg.jpg" }
];

let qIndex = 0;

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
    quizSubmitBtn.disabled = true;
    quizSubmitBtn.textContent = "Submit";

    const quizScreen = document.getElementById("screen-quiz");
    quizScreen.classList.add("valentine-active");
    const bgUrl = (q.backgroundImage && q.backgroundImage.trim()) ? q.backgroundImage.trim() : "";
    quizScreen.style.backgroundImage = bgUrl ? "url(" + bgUrl + ")" : "none";

    const heartSvg = "<svg viewBox=\"0 0 24 24\" fill=\"currentColor\"><path d=\"M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z\"/></svg>";
    const heartsHtml = Array.from({ length: 24 }, (_, i) => "<span class=\"heart heart-" + (i % 6) + "\" aria-hidden=\"true\">" + heartSvg + "</span>").join("");
    questionArea.innerHTML = "<div class=\"valentine-wrap\"><div class=\"valentine-hearts\">" + heartsHtml + "</div><div class=\"valentine-content\"><p class=\"valentine-prompt\">" + q.prompt + "</p><p class=\"valentine-msg\">I dare you to press no.</p><div class=\"valentine-buttons\"><button id=\"valYes\" class=\"btn valentine-yes\" type=\"button\">Yes</button><button id=\"valNo\" class=\"btn valentine-no ghost\" type=\"button\">No</button></div></div></div>";

    document.getElementById("valYes").addEventListener("click", () => {
      stopValentineMode();
      showScreen("screen-congrats");
    });

    document.getElementById("valNo").addEventListener("click", () => {
      quizMsg.textContent = "Okay. Wrapped stays locked.";
    });

    startValentineRunaway();
    return;
  }

  if (q.type !== "valentine") {
    const quizScreenEl = document.getElementById("screen-quiz");
    if (quizScreenEl) {
      quizScreenEl.classList.remove("valentine-active");
      quizScreenEl.style.backgroundImage = "";
    }
    stopValentineMode();
  }
}

function checkAnswerCorrect() {
  const q = QUESTIONS[qIndex];

  if (q.type === "text") {
    const rawInput = document.getElementById("qInput")?.value;
    const val = normalize(rawInput);
    if (q.acceptAny) return val.length > 0;
    if (!q.answers || !q.answers.length) return false;
    // Treat each answer as possibly comma-separated (e.g. "stinky, moop, babe" -> any one matches)
    const accepted = [];
    for (const a of q.answers) {
      const parts = (a || "").split(",").map(p => normalize(p)).filter(Boolean);
      accepted.push(...parts);
    }
    const matched = accepted.includes(val);
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/06ba57d6-188c-4e16-835d-f4c85133e0c2',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'app.js:checkAnswerCorrect',message:'text answer check',data:{qIndex,val,accepted,matched,runId:'post-fix'},timestamp:Date.now(),hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    return matched;
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
    renderQuizQuestion();
  } else {
    // For the number question (67 or 69), show "Child" instead
    const checked = document.querySelector('input[name="mc"]:checked');
    const q = QUESTIONS[qIndex];
    const picked67or69 = q.type === "mc" && q.choices && checked != null &&
      (Number(checked.value) === 1 || Number(checked.value) === 2) &&
      (q.choices[1] === "67" && q.choices[2] === "69");
    quizMsg.textContent = picked67or69 ? "Child" : "Incorrect. Try again.";
  }
});

quizBackBtn.addEventListener("click", () => {
  if (qIndex <= 0) return;
  qIndex--;
  renderQuizQuestion();
});

// ----------------- WRAPPED -----------------
const slideEl = document.getElementById("slide");
const wrappedBackBtn = document.getElementById("wrappedBackBtn");
const wrappedNextBtn = document.getElementById("wrappedNextBtn");

// Wrapped: 4 image pages + 1 paragraph page. Titles in order: Formals, Pictures I like, Kissing over the years, Funny pictures, Happy valentines.
const WRAPPED_SLIDES = [
  { title: "Formals", images: ["assets/formal1.jpg", "assets/formal2.jpg", "assets/formal3.jpg"] },
  { title: "Pictures I like", images: ["assets/good1.jpg", "assets/good2.jpg", "assets/good3.jpg", "assets/good4.jpg", "assets/good5.jpg"] },
  { title: "Kissing over the years", images: ["assets/kiss1.jpg", "assets/kiss2.jpg", "assets/kiss3.jpg", "assets/kiss4.jpg", "assets/kiss5.jpg", "assets/kiss6.jpg"] },
  { title: "Funny pictures", images: ["assets/funny1.jpg", "assets/funny2.jpg", "assets/funny3.jpg"] },
  { type: "paragraph", title: "Happy valentines", text: "Happy Valentine’s Day pooks. I hope you liked my little project I have been working on and the questions weren’t that hard. I just wanted you to know how loved you are and that I am so happy to be able to be with you on Valentine’s Day (even though were not in person). You are my everything and you make me so happy every day just being able to be with you. You motivate me to be a better person and work towards my and our dreams. Alsoooo, you are the most beautiful, gorgeous, amazing, sexy, pretty, smart, wise, brain rotted person I know, and I love you so much for all of that. You make my day every single day and I love you. Happy Valentines Day.  " }
];

let slideIndex = 0;

function renderSlide() {
  const s = WRAPPED_SLIDES[slideIndex];
  const total = WRAPPED_SLIDES.length;

  if (s.type === "paragraph") {
    const paraText = (s.text || "").replace(/\n/g, "<br>");
    slideEl.innerHTML = `
      <h2>${s.title}</h2>
      <div class="slide-paragraph-wrap">
        <p class="slide-paragraph-text">${paraText}</p>
      </div>
    `;
  } else {
    const imagesHtml = (s.images || []).map(src => `<div class="wrapped-img-cell"><img class="wrapped-img" src="${src}" alt=""></div>`).join("");
    slideEl.innerHTML = `
      <h2>${s.title}</h2>
      <div class="wrapped-img-grid wrapped-img-grid-${(s.images || []).length}">
        ${imagesHtml}
      </div>
    `;
  }

  wrappedNextBtn.textContent = (slideIndex === total - 1) ? "Done" : "Next";
}

function startWrapped() {
  slideIndex = 0;
  renderSlide();
}

wrappedNextBtn.addEventListener("click", () => {
  if (slideIndex < WRAPPED_SLIDES.length - 1) {
    slideIndex++;
    renderSlide();
  } else {
    // End behavior: return to quiz start
    showScreen("screen-quiz");
    qIndex = 0;
    renderQuizQuestion();
  }
});

// Congrats: Back â†’ quiz, Next â†’ Wrapped
const congratsBackBtn = document.getElementById("congratsBackBtn");
const congratsNextBtn = document.getElementById("congratsNextBtn");

if (congratsBackBtn) {
  congratsBackBtn.addEventListener("click", () => {
    showScreen("screen-quiz");
    renderQuizQuestion();
  });
}

if (congratsNextBtn) {
  congratsNextBtn.addEventListener("click", () => {
    startWrapped();
    showScreen("screen-wrapped");
  });
}

// Back button on Wrapped goes to congrats
wrappedBackBtn.addEventListener("click", () => {
  showScreen("screen-congrats");
});

// ----------------- INTRO (must accept mission to play; wrapped only after full run) -----------------
const introStartBtn = document.getElementById("introStartBtn");
if (introStartBtn) {
  introStartBtn.addEventListener("click", () => {
    showScreen("screen-quiz");
    qIndex = 0;
    renderQuizQuestion();
  });
}

// ----------------- init -----------------
(function init() {
  showScreen("screen-intro");
  qIndex = 0;
})();
