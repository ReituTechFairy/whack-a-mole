// ================= THEME HELPER =================
// Reads the selected theme radio button from the form
function getSelectedTheme() {
  const options = document.querySelectorAll('input[name="theme"]');

  for (let option of options) {
    if (option.checked) {
      return option.value;
    }
  }

  // fallback theme if nothing selected
  return "classic";
}


// ================= OPEN GAME =================
// Collects all player settings and starts the game
const openGameBtn = document.getElementById("openGameBtn");

openGameBtn.addEventListener("click", () => {

  // Player name (fallback to prompt or Guest)
  const name =
    document.getElementById("playerName").value.trim() ||
    prompt("Enter player name:") ||
    "Guest";

  // Game settings from form
  const difficulty = document.getElementById("difficulty").value;
  const gameLength = Number(document.getElementById("gameLength").value);
  const theme = getSelectedTheme();

  // Game options (checkboxes)
  const sound = document.getElementById("soundEnabled").checked;
  const doublePoints = document.getElementById("doublePoints").checked;
  const bonusMole = document.getElementById("bonusMole").checked;

  // Creates player object to pass to game page
  const player = {
    name,
    difficulty,
    gameLength,
    theme,
    options: {
      sound,
      doublePoints,
      bonusMole
    }
  };

  // Stores player data in sessionStorage
  sessionStorage.setItem("player", JSON.stringify(player));
});


// ================= LIVE PREVIEW =================
// Updates preview text while user types/selects options
const previewText = document.getElementById("previewText");

function updatePreview() {

  const name = document.getElementById("playerName").value;
  const difficulty = document.getElementById("difficulty").value;
  const theme = getSelectedTheme();

  previewText.textContent =
    `Player: ${name || "-"} | Difficulty: ${difficulty} | Theme: ${theme}`;
}


// Listen for input changes
document.getElementById("playerName").addEventListener("input", updatePreview);
document.getElementById("difficulty").addEventListener("change", updatePreview);

document.querySelectorAll('input[name="theme"]').forEach(radio => {
  radio.addEventListener("change", updatePreview);
});


// ================= SAVE SETTINGS =================
// Saves settings without starting the game
const saveSettingsBtn = document.getElementById("saveSettingsBtn");

saveSettingsBtn.addEventListener("click", () => {

  const settings = {
    name: document.getElementById("playerName").value,
    difficulty: document.getElementById("difficulty").value,
    gameLength: document.getElementById("gameLength").value,
    theme: getSelectedTheme()
  };

  sessionStorage.setItem("settings", JSON.stringify(settings));

  alert("Settings saved!");
});


// ================= LOAD SETTINGS =================
// Loads previously saved settings into form
const loadSettingsBtn = document.getElementById("loadSettingsBtn");

loadSettingsBtn.addEventListener("click", () => {

  const settings = JSON.parse(sessionStorage.getItem("settings"));

  if (!settings) {
    alert("No saved settings found!");
    return;
  }

  // Restore form values
  document.getElementById("playerName").value = settings.name;
  document.getElementById("difficulty").value = settings.difficulty;
  document.getElementById("gameLength").value = settings.gameLength;

  document.querySelector(
    `input[name="theme"][value="${settings.theme}"]`
  ).checked = true;

  updatePreview();

  alert("Settings loaded!");
});

// ================= RESET SETTINGS =================
// Clears the form back to defaults
const resetSettingsBtn = document.getElementById("resetSettingsBtn");

resetSettingsBtn.addEventListener("click", () => {

  if (!confirm("Reset all settings to default?")) return;

  document.getElementById("playerName").value = "";
  document.getElementById("difficulty").value = "medium";
  document.getElementById("gameLength").value = "30";
  document.querySelector('input[name="theme"][value="classic"]').checked = true;
  document.getElementById("soundEnabled").checked = true;
  document.getElementById("doublePoints").checked = false;
  document.getElementById("bonusMole").checked = true;

  updatePreview();

  alert("Settings reset to default!");
});
