// ================= DOM ELEMENTS =================
// UI elements used to display game state. Variable declaration
const displayScore = document.getElementById("displayScore");
const displayMisses = document.getElementById("displayMisses");
const displayTimeLeft = document.getElementById("displayTimeLeft");
const displayBestScore = document.getElementById("displayBestScore");

// Game area holes
const holes = document.querySelectorAll(".mole-hole");

// Control buttons
const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const saveBtn = document.getElementById("saveBtn");
const loadBtn = document.getElementById("loadBtn");
const resetBtn = document.getElementById("resetBtn");


// ================= PLAYER DATA =================
// Load player settings from sessionStorage
const playerData = JSON.parse(sessionStorage.getItem("player")) || {};

// Default values if nothing is stored
const name = playerData.name || "Guest";
const difficulty = playerData.difficulty || "medium";
const gameLength = playerData.gameLength || 30;
const options = playerData.options || {};
const theme = playerData.theme || "classic";

// Display player info
document.getElementById("displayPlayer").textContent = name;
document.getElementById("displayDifficulty").textContent = difficulty;

// Applys selected theme to page
document.body.setAttribute("data-theme", theme);

// ================= DIFFICULTY SETTINGS =================
//***Difficulty is determined by the speed of the moles appearing, as indicated below.
// 
/*Bonus mole is gold and has a white outline */
// This Controls how fast moles will appear
const speeds = {
  easy: 1800,
  medium: 1400,
  hard: 1000,
};

const moleSpeed = speeds[difficulty];


// ================= GAME STATE =================
// Core game variables
let score = 0;
let misses = 0;
let timeLeft = gameLength;

// Tracks current active mole
let activeMole = null;

// Interval timers
let moleInterval = null;
let timerId = null;

// Game control states
let isPaused = false;
let gameRunning = false;


// ================= SHOW MOLE =================
// Function to Randomly display a mole in one of the holes
function showMole() {

  // Removes previous mole
  if (activeMole) activeMole.classList.remove("up", "bonus");

  const randomIndex = Math.floor(Math.random() * holes.length);
  const mole = holes[randomIndex].querySelector(".mole");

  // Resets bonus state
  mole.classList.remove("bonus");

  // Applys bonus chance if enabled
  if (options.bonusMole && Math.random() < 0.2) {
    mole.classList.add("bonus");
  }

  // Shows mole
  mole.classList.add("up");
  activeMole = mole;

  // Auto-hides mole after delay
  setTimeout(() => {
    mole.classList.remove("up");
  }, 700);
}


// ================= CLICK HANDLING =================
// Handles scoring and misses when holes are clicked
holes.forEach(hole => {

  hole.addEventListener("click", () => {
    const mole = hole.querySelector(".mole");

    // HIT condition
    if (mole.classList.contains("up")) {

      let points = 1;

      // Bonus scoring rules
      if (mole.classList.contains("bonus")) {
        points = 3;
      } else if (options.doublePoints) {
        points = 2;
      }

      score += points;
      displayScore.textContent = score;

      // Hides mole after hit
      mole.classList.remove("up");

      // Optional sound effect
      if (options.sound) {
        new Audio("whack.mp3").play();
      }

    } else {
      // MISS condition
      misses++;
      displayMisses.textContent = misses;
    }
  });
});


// ================= START GAME =================
// Initializes and starts the game loop
startBtn.addEventListener("click", () => {

  score = 0;
  misses = 0;
  timeLeft = gameLength;

  displayScore.textContent = 0;
  displayMisses.textContent = 0;
  displayTimeLeft.textContent = timeLeft + " s";

  isPaused = false;
  gameRunning = true;
  pauseBtn.textContent = "Pause";

  clearInterval(moleInterval);
  clearInterval(timerId);

  alert("Game Started!");

  // Start mole spawning loop
  moleInterval = setInterval(showMole, moleSpeed);

  // Start countdown timer
  timerId = setInterval(() => {
    timeLeft--;
    displayTimeLeft.textContent = timeLeft + " s";

    if (timeLeft <= 0) {
      endGame();
    }
  }, 1000);
});


// ================= PAUSE GAME =================
// Pauses or resumes game timers
pauseBtn.addEventListener("click", () => {

  if (!gameRunning) return;

  if (!isPaused) {

    clearInterval(moleInterval);
    clearInterval(timerId);

    isPaused = true;
    pauseBtn.textContent = "Resume";

  } else {

    moleInterval = setInterval(showMole, moleSpeed);

    timerId = setInterval(() => {
      timeLeft--;
      displayTimeLeft.textContent = timeLeft + " s";

      if (timeLeft <= 0) endGame();
    }, 1000);

    isPaused = false;
    pauseBtn.textContent = "Pause";
  }
});


// ================= END GAME =================
// Stops all gameplay and updates best score
function endGame() {

  clearInterval(timerId);
  clearInterval(moleInterval);

  gameRunning = false;

  const bestScore = getCookie("bestScore");

  if (!bestScore || score > bestScore) {
    setCookie("bestScore", score, 30);
    displayBestScore.textContent = score;
  }

  alert("Game Over! Score: " + score);
}


// ================= SAVE / LOAD =================
// Saves current game state
saveBtn.addEventListener("click", () => {
  const gameData = { score, misses, timeLeft };
  sessionStorage.setItem("gameState", JSON.stringify(gameData));
  alert("Game saved!");
});

// Loads saved game state
loadBtn.addEventListener("click", () => {

  const savedData = JSON.parse(sessionStorage.getItem("gameState"));

  if (!savedData) {
    alert("No saved game found!");
    return;
  }

  score = savedData.score;
  misses = savedData.misses;
  timeLeft = savedData.timeLeft;

  displayScore.textContent = score;
  displayMisses.textContent = misses;
  displayTimeLeft.textContent = timeLeft + " s";

  alert("Game loaded!");
});


// ================= RESET =================
// Resets entire game state
resetBtn.addEventListener("click", () => {

  if (!confirm("Reset game?")) return;

  clearInterval(moleInterval);
  clearInterval(timerId);

  score = 0;
  misses = 0;
  timeLeft = gameLength;

  gameRunning = false;
  isPaused = false;

  if (activeMole) {
    activeMole.classList.remove("up", "bonus");
  }

  displayScore.textContent = 0;
  displayMisses.textContent = 0;
  displayTimeLeft.textContent = timeLeft + " s";

  pauseBtn.textContent = "Pause";

  sessionStorage.removeItem("gameState");

  alert("Game reset!");
});


// ================= COOKIES =================
// Save cookie
function setCookie(name, value, days) {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 86400000);
  document.cookie = name + "=" + value + ";expires=" + expires.toUTCString() + ";path=/";
}

// Read cookie
function getCookie(name) {
  const cookies = document.cookie.split(";");

  for (let c of cookies) {
    c = c.trim();
    if (c.startsWith(name + "=")) {
      return c.substring(name.length + 1);
    }
  }

  return null;
}


// ================= BEST SCORE =================
// Display saved best score on load
const bestScore = getCookie("bestScore");

if (bestScore) {
  displayBestScore.textContent = bestScore;
}

// Applys theme again (ensures consistency after reload)
document.body.setAttribute("data-theme", theme);