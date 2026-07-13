// App entry: screen management, mode selection, menu wiring.

const App = (() => {
  let currentMode = null; // "falling" | "sentences"
  let selectedDifficulty = "easy";

  function showScreen(id) {
    document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
    document.getElementById(id).classList.add("active");
  }

  function renderHighScores() {
    ["falling", "sentences"].forEach((mode) => {
      const list = document.getElementById(`score-list-${mode}`);
      const scores = getHighScores()[mode] || [];
      list.innerHTML = "";
      if (scores.length === 0) {
        list.innerHTML = `<li class="empty">No runs yet — play to set a record!</li>`;
        return;
      }
      scores.forEach((s) => {
        const li = document.createElement("li");
        li.innerHTML = `<span>${s.score} pts</span><span>${s.wpm} WPM · ${s.accuracy}%</span>`;
        list.appendChild(li);
      });
    });
  }

  function renderAchievements() {
    const grid = document.getElementById("achievement-grid");
    const unlocked = getUnlockedAchievements();
    grid.innerHTML = "";
    ACHIEVEMENTS.forEach((a) => {
      const badge = document.createElement("div");
      const isUnlocked = unlocked.includes(a.id);
      badge.className = "achievement-badge" + (isUnlocked ? " unlocked" : "");
      badge.textContent = a.icon;
      badge.setAttribute("data-tooltip", isUnlocked ? `${a.name}: ${a.desc}` : "???");
      grid.appendChild(badge);
    });
    document.getElementById("achievement-count").textContent =
      `(${unlocked.length}/${ACHIEVEMENTS.length})`;
  }

  function showToast(text) {
    const container = document.getElementById("toast-container");
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = text;
    container.appendChild(toast);
    setTimeout(() => {
      toast.classList.add("leaving");
      setTimeout(() => toast.remove(), 250);
    }, 3000);
  }

  function onGameFinished(result) {
    addStatsEntry(result);
    addHighScore(result.mode, {
      score: result.score,
      wpm: result.wpm,
      accuracy: result.accuracy,
    });
    const newlyUnlocked = checkAchievements(result);

    document.getElementById("results-title").textContent =
      result.mode === "falling" ? "Run Complete!" : "Session Complete!";
    document.getElementById("result-wpm").textContent = result.wpm;
    document.getElementById("result-accuracy").textContent = result.accuracy + "%";
    document.getElementById("result-score").textContent = result.score;
    document.getElementById("result-combo").textContent = result.maxCombo;

    const achWrap = document.getElementById("result-new-achievements");
    achWrap.innerHTML = "";
    newlyUnlocked.forEach((a) => {
      const div = document.createElement("div");
      div.className = "achievement-toast-inline";
      div.innerHTML = `<span style="font-size:1.4rem">${a.icon}</span><span><strong>${a.name}</strong><br>${a.desc}</span>`;
      achWrap.appendChild(div);
      showToast(`${a.icon} Achievement unlocked: ${a.name}`);
    });

    showScreen("screen-results");
  }

  function startGame(mode) {
    currentMode = mode;
    if (mode === "falling") {
      showScreen("screen-falling");
      FallingGame.start();
    } else {
      SentenceGame.setDifficulty(selectedDifficulty);
      showScreen("screen-sentences");
      SentenceGame.start();
    }
  }

  function quitToMenu() {
    // Record whatever progress was made instead of discarding it silently.
    // finishEarly() routes through onGameFinished -> results screen when
    // there's something to show; otherwise fall back to the menu directly.
    if (currentMode === "falling") {
      if (FallingGame.finishEarly() === false) goToMenu();
    } else if (currentMode === "sentences") {
      if (SentenceGame.finishEarly() === false) goToMenu();
    } else {
      goToMenu();
    }
  }

  function goToMenu() {
    renderHighScores();
    renderAchievements();
    document.getElementById("sentence-difficulty").classList.add("hidden");
    showScreen("screen-menu");
  }

  function wireMenu() {
    document.getElementById("btn-mode-falling").addEventListener("click", () => startGame("falling"));
    document.getElementById("btn-mode-sentences").addEventListener("click", () => {
      document.getElementById("sentence-difficulty").classList.remove("hidden");
    });

    document.querySelectorAll("#sentence-difficulty .chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        document.querySelectorAll("#sentence-difficulty .chip").forEach((c) => c.classList.remove("selected"));
        chip.classList.add("selected");
        selectedDifficulty = chip.dataset.diff;
        startGame("sentences");
      });
    });

    document.querySelectorAll(".score-tabs .tab").forEach((tab) => {
      tab.addEventListener("click", () => {
        document.querySelectorAll(".score-tabs .tab").forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");
        document.getElementById("score-list-falling").classList.toggle("hidden", tab.dataset.tab !== "falling");
        document.getElementById("score-list-sentences").classList.toggle("hidden", tab.dataset.tab !== "sentences");
      });
    });

    document.getElementById("btn-falling-quit").addEventListener("click", quitToMenu);
    document.getElementById("btn-sentences-quit").addEventListener("click", quitToMenu);
    document.getElementById("btn-back-menu").addEventListener("click", goToMenu);
    document.getElementById("btn-play-again").addEventListener("click", () => startGame(currentMode));
  }

  function init() {
    FallingGame.init();
    SentenceGame.init();
    wireMenu();
    goToMenu();
  }

  return { init, onGameFinished };
})();

document.addEventListener("DOMContentLoaded", App.init);
