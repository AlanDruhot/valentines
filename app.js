// ---------- helpers ----------
function normalize(s) {
  return (s || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

document.getElementById("resetBtn").addEventListener("click", hardReset);

function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

// ---------- QUIZ GATE ----------
const quizForm = document.getElementById("quizForm");
const gateMsg = document.getElementById("gateMsg");

// EDIT THESE ANSWERS:
const ANSWERS = {
  q1: ["the cafe", "starbucks", "chipotle"], // acceptable answers (normalized)
  q2: ["our inside joke", "banana phone"],   // acceptable answers
  q3: "b"                                    // correct radio value
};

quizForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const q1 = normalize(document.getElementById("q1").value);
  const q2 = normalize(document.getElementById("q2").value);
  const q3 = (new FormData(quizForm).get("q3") || "").toString();

  const q1Ok = ANSWERS.q1.map(normalize).includes(q1);
  const q2Ok = ANSWERS.q2.map(normalize).includes(q2);
  const q3Ok = q3 === ANSWERS.q3;

  if (q1Ok && q2Ok && q3Ok) {
    gateMsg.textContent = "Unlocked ✅";
    localStorage.setItem("unlocked", "true");
    startWrapped();
    showScreen("screen-wrapped");
  } else {
    gateMsg.textContent = "Nope 😈 Try again (spelling counts).";
  }
});

// ---------- WRAPPED SLIDES ----------
const slideEl = document.getElementById("slide");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

// EDIT THESE SLIDES:
const slides = [
  { title: "Top Moment", body: "That day we ______. Still undefeated." },
  { title: "Top Place", body: "Apparently we kept ending up at ______." },
  { title: "Most Replayed", body: "The thing you said that I still quote: “______”" },
  { title: "Best Duo Stat", body: "Laughs per hour: suspiciously high." },
  { title: "Summary", body: "You made my year better. That’s the whole report." }
];

let slideIndex = 0;

function renderSlide() {
  const s = slides[slideIndex];
  slideEl.innerHTML = `
    <h2>${s.title}</h2>
    <p>${s.body}</p>
    <p class="msg">Slide ${slideIndex + 1} / ${slides.length}</p>
  `;

  prevBtn.disabled = slideIndex === 0;
  nextBtn.textContent = (slideIndex === slides.length - 1) ? "Finish" : "Next";
}

function startWrapped() {
  slideIndex = 0;
  renderSlide();
}

prevBtn.addEventListener("click", () => {
  if (slideIndex > 0) {
    slideIndex--;
    renderSlide();
  }
});

nextBtn.addEventListener("click", () => {
  if (slideIndex < slides.length - 1) {
    slideIndex++;
    renderSlide();
  } else {
    showScreen("screen-question");
  }
});

// ---------- FINAL QUESTION BUTTONS ----------
const yesBtn = document.getElementById("yesBtn");
const noBtn = document.getElementById("noBtn");
const softNoBtn = document.getElementById("softNoBtn");
const finalMsg = document.getElementById("finalMsg");
const buttonArea = document.getElementById("buttonArea");

let noCount = 0;

// Place "No" initially somewhere reasonable
function placeNoRandom() {
  const area = buttonArea.getBoundingClientRect();
  const btn = noBtn.getBoundingClientRect();

  const maxX = Math.max(0, area.width - btn.width);
  const maxY = Math.max(0, area.height - btn.height);

  const x = Math.random() * maxX;
  const y = Math.random() * maxY;

  noBtn.style.position = "absolute";
  noBtn.style.left = `${x}px`;
  noBtn.style.top = `${y}px`;
}

function growYes() {
  const scale = Math.min(1 + noCount * 0.12, 2.0); // cap it so it doesn't get stupid
  yesBtn.style.transform = `scale(${scale})`;
}

// “No runs away” on hover/move
noBtn.addEventListener("mouseenter", () => {
  // After a few tries, let her click it if she wants (less pressure)
  if (noCount >= 6) return;
  placeNoRandom();
});

noBtn.addEventListener("click", () => {
  noCount++;
  growYes();

  if (noCount < 6) {
    finalMsg.textContent = "Nope. Try again 😈";
    placeNoRandom();
  } else {
    // At this point, stop running away so "No" is a real option.
    finalMsg.textContent = "Okay okay. Real answer is allowed now.";
  }
});

yesBtn.addEventListener("click", () => {
  finalMsg.textContent = "YAY 💜 (Screenshot this and send it to me.)";
  yesBtn.disabled = true;
  noBtn.disabled = true;
  softNoBtn.disabled = true;
});

//reset
function hardReset() {
  localStorage.clear();
  location.reload();
}


// “Not right now” is always available and ends politely
softNoBtn.addEventListener("click", () => {
  finalMsg.textContent = "All good. I’m just happy you made it this far.";
  yesBtn.disabled = true;
  noBtn.disabled = true;
  softNoBtn.disabled = true;
});

// ---------- resume state ----------
(function init() {
  const unlocked = localStorage.getItem("unlocked") === "true";
  if (unlocked) {
    startWrapped();
    showScreen("screen-wrapped");
  } else {
    showScreen("screen-gate");
  }

  // Initial layout for "No"
  setTimeout(placeNoRandom, 50);
})();
