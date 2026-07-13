// Falling Words arcade mode.

const FallingGame = (() => {
  let playarea, input, focusHint;
  let words = [];       // {el, text, x, y, speed}
  let combo, score, level, lives, correctChars, incorrectChars, startTime;
  let spawnTimer = null;
  let rafId = null, lastFrameTime = 0;
  let running = false;
  let pointsToNextLevel = 0;
  let lastTypedLength = 0;

  function init() {
    playarea = document.getElementById("falling-playarea");
    input = document.getElementById("falling-input");
    focusHint = document.getElementById("falling-focus-hint");

    input.addEventListener("input", onInput);
    input.addEventListener("blur", () => {
      if (running) focusHint.classList.remove("hidden");
    });
    input.addEventListener("focus", () => {
      focusHint.classList.add("hidden");
    });
    playarea.addEventListener("click", () => {
      if (running) input.focus();
    });
  }

  function start() {
    playarea.querySelectorAll(".falling-word").forEach((el) => el.remove());
    focusHint.classList.add("hidden");
    words = [];
    combo = new ComboTracker();
    score = 0;
    level = 1;
    lives = 3;
    correctChars = 0;
    incorrectChars = 0;
    pointsToNextLevel = 100;
    startTime = performance.now();
    running = true;
    input.value = "";
    lastTypedLength = 0;
    updateHUD();
    input.focus();

    spawnWord();
    spawnTimer = setInterval(spawnWord, spawnInterval());
    lastFrameTime = performance.now();
    rafId = requestAnimationFrame(tick);
  }

  function stop() {
    running = false;
    focusHint.classList.add("hidden");
    clearInterval(spawnTimer);
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
  }

  function spawnInterval() {
    return Math.max(700, 2200 - level * 130);
  }

  function fallSpeed() {
    return 35 + level * 6; // px per second
  }

  function spawnWord() {
    if (!running) return;
    const text = getWordForLevel(level);
    const el = document.createElement("div");
    el.className = "falling-word";
    el.textContent = text;
    playarea.appendChild(el);

    const maxX = Math.max(10, playarea.clientWidth - 120);
    const x = Math.random() * maxX;
    el.style.left = x + "px";
    el.style.top = "-30px";

    words.push({ el, text, y: -30, speed: fallSpeed() });
  }

  function tick(now) {
    if (!running) return;
    const dtSeconds = Math.min(0.1, (now - lastFrameTime) / 1000); // clamp to avoid huge jumps after a stall
    lastFrameTime = now;

    const areaHeight = playarea.clientHeight;
    for (let i = words.length - 1; i >= 0; i--) {
      const w = words[i];
      w.y += w.speed * dtSeconds;
      w.el.style.top = w.y + "px";
      if (w.y > areaHeight - 20) {
        missWord(i);
      }
    }
    rafId = requestAnimationFrame(tick);
  }

  function missWord(index) {
    const w = words[index];
    if (!w) return;
    w.el.classList.add("miss");
    setTimeout(() => w.el.remove(), 300);
    words.splice(index, 1);
    combo.miss();
    lives -= 1;
    playarea.classList.add("shake");
    setTimeout(() => playarea.classList.remove("shake"), 300);
    incorrectChars += w.text.length;
    input.value = "";
    lastTypedLength = 0;
    renderMatch("");
    updateHUD();
    if (lives <= 0) finish();
  }

  function onInput() {
    const raw = input.value;

    // Track only the newly-added character (ignores backspaces) for the
    // keyboard-mastery heatmap: correct if it still extends a valid prefix
    // of some falling word, incorrect otherwise.
    if (raw.length > lastTypedLength) {
      const idx = raw.length - 1;
      const prefix = raw.slice(0, idx + 1);
      const isCorrect = words.some((w) => w.text.startsWith(prefix));
      trackKeystroke(raw[idx], isCorrect);
    }
    lastTypedLength = raw.length;

    const typed = raw.trim();
    if (!typed) {
      words.forEach((w) => w.el.classList.remove("active"));
      renderMatch("");
      return;
    }
    renderMatch(typed);

    const exact = words.find((w) => w.text === typed);
    if (exact) {
      completeWord(exact);
      input.value = "";
      lastTypedLength = 0;
      renderMatch("");
    }
  }

  function renderMatch(typed) {
    words.forEach((w) => {
      if (typed && w.text.startsWith(typed)) {
        w.el.classList.add("active");
        w.el.innerHTML = `<span class="matched">${escapeHtml(typed)}</span>${escapeHtml(w.text.slice(typed.length))}`;
      } else {
        w.el.classList.remove("active");
        w.el.textContent = w.text;
      }
    });
  }

  function completeWord(w) {
    const idx = words.indexOf(w);
    if (idx === -1) return;
    words.splice(idx, 1);
    w.el.classList.add("pop");
    setTimeout(() => w.el.remove(), 250);

    correctChars += w.text.length;
    const mult = combo.hit();
    score += w.text.length * 10 * mult;

    if (score >= pointsToNextLevel) {
      level += 1;
      pointsToNextLevel += 100 + level * 40;
      clearInterval(spawnTimer);
      spawnTimer = setInterval(spawnWord, spawnInterval());
    }

    const hudCombo = document.getElementById("falling-combo");
    hudCombo.classList.remove("pulse");
    void hudCombo.offsetWidth;
    hudCombo.classList.add("pulse");

    updateHUD();
  }

  function updateHUD() {
    document.getElementById("falling-score").textContent = score;
    document.getElementById("falling-combo").textContent = "x" + comboMultiplier(combo.combo);
    document.getElementById("falling-level").textContent = level;
    document.getElementById("falling-lives").textContent = "❤️".repeat(Math.max(0, lives)) || "💀";
  }

  function finish() {
    stop();
    const elapsed = performance.now() - startTime;
    const result = {
      mode: "falling",
      score,
      wpm: calcWPM(correctChars, elapsed),
      accuracy: calcAccuracy(correctChars, incorrectChars),
      maxCombo: combo.maxCombo,
      level,
    };
    App.onGameFinished(result);
  }

  // Called when the player quits mid-run: records whatever progress was made
  // instead of silently discarding it. Returns false (and just stops) if no
  // words were ever completed, so an instant quit doesn't show an empty
  // results screen.
  function finishEarly() {
    if (!running) return false;
    if (score === 0 && correctChars === 0) {
      stop();
      return false;
    }
    finish();
    return true;
  }

  return { init, start, stop, finishEarly };
})();
