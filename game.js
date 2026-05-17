// ================= DOM ELEMENTS =================
// UI elements used to display game state. Variable declaration

//CHANGE 1
/*
const displayScore = document.getElementById("displayScore");
const displayMisses = document.getElementById("displayMisses");
const displayTimeLeft = document.getElementById("displayTimeLeft");
const displayBestScore = document.getElementById("displayBestScore");
*/
// Replaced with
const displayScore = document.getElementById("displayScore");
const displayMisses = document.getElementById("displayMisses");
const displayHits = document.getElementById("displayHits");
const displayTimeLeft = document.getElementById("displayTimeLeft");
const displayBestScore = document.getElementById("displayBestScore");
const messageArea = document.getElementById("messageArea");
const logArea = document.getElementById("logArea");
// End Change 1


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

//CHANGE 2
/*
// Display player info
document.getElementById("displayPlayer").textContent = name;
document.getElementById("displayDifficulty").textContent = difficulty;

// Applys selected theme to page
document.body.setAttribute("data-theme", theme);
*/
// Replaced with
document.getElementById("displayPlayer").textContent = name;
document.getElementById("displayDifficulty").textContent = difficulty;
document.getElementById("displayGameLength").textContent = gameLength + "s";
document.getElementById("displayTheme").textContent = theme;
document.body.setAttribute("data-theme", theme);
// End Change 2

// ================= DIFFICULTY SETTINGS =================
//CHANGE 3
//***Difficulty is determined by the speed of the moles appearing, as indicated below.
/*Bonus mole is gold and has a white outline */
// This Controls how fast moles will appear
/*const speeds = {
  easy: 1800,
  medium: 1400,
  hard: 1000,
};*/
// Replaced with
const speeds = {
  easy: 2500,
  medium: 2000,
  hard: 1500,
};
// End Change 3
const moleSpeed = speeds[difficulty];


// ================= GAME STATE =================
//CHANGE 4
// Core game variables
let score = 0;
let misses = 0;
let hits = 0;
let timeLeft = gameLength;

// Tracks current active mole
let activeMole = null;

// Interval timers
let moleInterval = null;
let timerId = null;

// Game control states
let isPaused = false;
let gameRunning = false;

// ================= AUDIO =================
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playWhack() {
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }

  const bufferSize = audioCtx.sampleRate * 0.15;
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 3);
  }

  const source = audioCtx.createBufferSource();
  source.buffer = buffer;

  const filter = audioCtx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(300, audioCtx.currentTime);
  filter.frequency.exponentialRampToValueAtTime(1000, audioCtx.currentTime + 0.1);

  source.connect(filter);
  filter.connect(audioCtx.destination);
  source.start();
}
//END OF CHANGE 4

// ================= SHOW MOLE =================
//CHANGE 5: Code added
// Function to Randomly display a mole in one of the holes
function showMole() {

  // Removes previous mole
  if (activeMole) {
    activeMole.classList.remove("up", "bonus");
  }

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

  // Auto-hides mole after delay based on moleSpeed
  setTimeout(() => {
    if (mole.classList.contains("up")) {
      mole.classList.remove("up", "bonus");
    }
  }, moleSpeed * 0.6);
}
//END OF CHANGE 5

// ================= CLICK HANDLING =================
//CHANGE 6
// Handles scoring and misses when holes are clicked
holes.forEach(hole => {

  hole.addEventListener("click", (e) => {
    if (!gameRunning || isPaused) return;

    const mole = hole.querySelector(".mole");

    //Checks if mole or anything inside was clicked
    const hitMole = e.target === mole || mole.contains(e.target);

    if (hitMole && mole.classList.contains("up")) {
      //HIT
      let points = 1;

      // Bonus scoring rules
      if (mole.classList.contains("bonus")) {
        points = 3;
        addLog("Bonus mole hit! +3 points");
      } else if (options.doublePoints) {
        points = 2;
        showMultiplier(hole);
        addLog("Double points! +2 points");
      } else {
        points = 1;
        addLog("Hit! +1 point");
      }

      score += points;
      hits++;

      displayScore.textContent = score;
      displayHits.textContent = hits;

      // Hides mole after hit
      mole.classList.remove("up");
      activeMole = null;

      //sound effect
      if (options.sound !== false) {
        playWhack();
      }

    } else {
      // MISS condition
      misses++;
      displayMisses.textContent = misses;
      addLog("Miss!");
    }
  });
});

// ================= X2 INDICATOR =================
function showMultiplier(hole) {
  const indicator = document.createElement("span");
  indicator.textContent = "x2";
  indicator.className = "x2-indicator";
  hole.style.position = "relative";
  hole.appendChild(indicator);
  setTimeout(() => { indicator.remove(); }, 800);
}

// ================= GAME LOG =================
function addLog(message) {
  const entry = document.createElement("div");
  entry.className = "log-entry";
  entry.textContent = message;
  logArea.prepend(entry);
}
//ENF OF CHANGE 6

// ================= START GAME =================
//CHANGE 7: Code added
// Initializes and starts the game loop
startBtn.addEventListener("click", () => {

  //Unlocks audio context on first interaction (required by some browsers)
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }

  score = 0;
  misses = 0;
  timeLeft = gameLength;
  isPaused = false;
  gameRunning = true;

  displayScore.textContent = 0;
  displayMisses.textContent = 0;
  displayHits.textContent = 0;
  displayTimeLeft.textContent = timeLeft + " s";
  pauseBtn.textContent = "Pause";
  logArea.innerHTML = "";

  clearInterval(moleInterval);
  clearInterval(timerId);

  //3...2...1 countdown before game starts
  let count = 3;
  messageArea.textContent = "Get ready! " + count;
  startBtn.disabled = true;

  const countdownTimer = setInterval(() => {
    count--;
    if (count > 0) {
      messageArea.textContent = count;
    } else {
      clearInterval(countdownTimer);
      messageArea.textContent = "GO! Whack those moles!";
      startBtn.disabled = false;
      gameRunning = true;

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
    }
  }, 1000);
});
//END OF CHANGE 7

// ================= PAUSE GAME =================
//CHANGE 8: Code added
// Pauses or resumes game timers
pauseBtn.addEventListener("click", () => {

  if (!gameRunning) return;

  if (!isPaused) {

    clearInterval(moleInterval);
    clearInterval(timerId);
    isPaused = true;
    pauseBtn.textContent = "Resume";
    messageArea.textContent = "Game paused. Click 'Resume' to continue.";
  } else {
    if (audioCtx.state === "suspended") audioCtx.resume();
    moleInterval = setInterval(showMole, moleSpeed);
    timerId = setInterval(() => {
      timeLeft--;
      displayTimeLeft.textContent = timeLeft + " s";
      if (timeLeft <= 0) endGame();
    }, 1000);
    isPaused = false;
    pauseBtn.textContent = "Pause";
    messageArea.textContent = "Game resumed!";
  }
});
// End Change 8

// ================= END GAME =================
//CHANGE 9
// Stops all gameplay and updates best score
/*
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
  */
// Replaced with
function endGame() {
  clearInterval(timerId);
  clearInterval(moleInterval);
  gameRunning = false;

  if (activeMole) {
    activeMole.classList.remove("up", "bonus");
    activeMole = null;
  }

  messageArea.textContent = "Game over!";

  const prevBest = getCookie("bestScore");
  const isNewBest = !prevBest || score > parseInt(prevBest);
  if (isNewBest) {
    setCookie("bestScore", score, 30);
    displayBestScore.textContent = score;
  }
  const bestDisplay = isNewBest ? score : prevBest;

  const overlay = document.getElementById("endGameOverlay");
  document.getElementById("popupScore").textContent = score;
  document.getElementById("popupBest").textContent = bestDisplay;
  document.getElementById("popupHits").textContent = hits;
  document.getElementById("popupMisses").textContent = misses;
  overlay.style.display = "flex";

  document.getElementById("closeEndPopup").onclick = () => {
    overlay.style.display = "none";
    score = 0; misses = 0; hits = 0;
    timeLeft = gameLength;
    displayScore.textContent = 0;
    displayMisses.textContent = 0;
    displayHits.textContent = 0;
    displayTimeLeft.textContent = timeLeft + " s";
    messageArea.textContent = "Click Start Game when ready.";
    logArea.innerHTML = "";
  };
}
// End Change 9

// ================= SAVE / LOAD =================
//CHANGE 10: Code added
// Saves current game state
saveBtn.addEventListener("click", () => {
  const gameData = { score, misses, hits, timeLeft };
  sessionStorage.setItem("gameState", JSON.stringify(gameData));
  messageArea.textContent = "Game saved!";
});

// Loads saved game state
loadBtn.addEventListener("click", () => {

  const savedData = JSON.parse(sessionStorage.getItem("gameState"));

  if (!savedData) {
    messageArea.textContent = "No saved game found!";
    return;
  }

  score = savedData.score;
  misses = savedData.misses;
  hits = savedData.hits || 0;
  timeLeft = savedData.timeLeft;

  displayScore.textContent = score;
  displayMisses.textContent = misses;
  displayHits.textContent = hits;
  displayTimeLeft.textContent = timeLeft + " s";

  messageArea.textContent = "Game loaded!";
});
//END OF CHANGE 10

// ================= RESET =================
//CHANGE 11: Code added
// Resets entire game state
resetBtn.addEventListener("click", () => {

  if (!confirm("Reset game?")) return;

  clearInterval(moleInterval);
  clearInterval(timerId);

  score = 0;
  misses = 0;
  hits = 0;
  timeLeft = gameLength;

  gameRunning = false;
  isPaused = false;

  if (activeMole) {
    activeMole.classList.remove("up", "bonus");
    activeMole = null;
  }

  displayScore.textContent = 0;
  displayMisses.textContent = 0;
  displayHits.textContent = 0;
  displayTimeLeft.textContent = timeLeft + " s";
  pauseBtn.textContent = "Pause";
  messageArea.textContent = "Click 'Start Game' when ready to play.";
  logArea.innerHTML = "";

  sessionStorage.removeItem("gameState");
});
//End of Change 11


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
