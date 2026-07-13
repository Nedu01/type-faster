// Sentence Typing practice mode.

const SentenceGame = (() => {
  let display, input, wrap, focusHint;
  let difficulty = "easy";
  let current = "";
  let combo, correctChars, incorrectChars, sessionStart, sentenceStart;
  let completedCount, sessionScore, maxCombo;
  let running = false;
  let lastTypedLength = 0;
  const SESSION_TARGET = 5; // sentences per session before results

  function init() {
    display = document.getElementById("sentence-display");
    input = document.getElementById("sentences-input");
    wrap = document.querySelector(".sentence-wrap");
    focusHint = document.getElementById("sentences-focus-hint");

    input.addEventListener("input", onInput);
    input.addEventListener("blur", () => {
      if (running) focusHint.classList.remove("hidden");
    });
    input.addEventListener("focus", () => {
      focusHint.classList.add("hidden");
    });
    wrap.addEventListener("click", () => {
      if (running) input.focus();
    });
  }

  function setDifficulty(d) {
    difficulty = d;
  }

  function start() {
    combo = new ComboTracker();
    correctChars = 0;
    incorrectChars = 0;
    completedCount = 0;
    sessionScore = 0;
    maxCombo = 0;
    sessionStart = performance.now();
    running = true;
    focusHint.classList.add("hidden");
    nextSentence();
    updateHUD();
    input.focus();
  }

  function stop() {
    running = false;
    focusHint.classList.add("hidden");
  }

  function nextSentence() {
    current = getSentence(difficulty);
    sentenceStart = null;
    lastTypedLength = 0;
    input.value = "";
    renderSentence("");
  }

  function renderSentence(typed) {
    let html = "";
    for (let i = 0; i < current.length; i++) {
      const ch = current[i];
      let cls = "char";
      if (i < typed.length) {
        cls += typed[i] === ch ? " correct" : " incorrect";
      } else if (i === typed.length) {
        cls += " current";
      }
      html += `<span class="${cls}">${escapeHtml(ch)}</span>`;
    }
    display.innerHTML = html;
  }

  function onInput() {
    if (!running) return;
    if (sentenceStart === null) sentenceStart = performance.now();
    const typed = input.value;
    renderSentence(typed);

    // Track only the newly-added character (ignores backspaces) so per-key
    // stats reflect real keystroke cadence for the keyboard-mastery heatmap.
    if (typed.length > lastTypedLength) {
      const idx = typed.length - 1;
      if (idx < current.length) {
        trackKeystroke(current[idx], typed[idx] === current[idx]);
      }
    }
    lastTypedLength = typed.length;

    if (typed.length >= current.length) {
      // score this sentence
      let correct = 0, incorrect = 0;
      for (let i = 0; i < current.length; i++) {
        if (typed[i] === current[i]) correct++; else incorrect++;
      }
      correctChars += correct;
      incorrectChars += incorrect;

      if (incorrect === 0) {
        const mult = combo.hit();
        sessionScore += current.length * 10 * mult;
      } else {
        combo.miss();
      }
      maxCombo = Math.max(maxCombo, combo.maxCombo);
      completedCount += 1;

      const hudCombo = document.getElementById("sentences-combo");
      hudCombo.classList.remove("pulse");
      void hudCombo.offsetWidth;
      hudCombo.classList.add("pulse");

      updateHUD();

      if (completedCount >= SESSION_TARGET) {
        finish();
      } else {
        nextSentence();
      }
    }
  }

  function updateHUD() {
    const elapsed = performance.now() - sessionStart;
    document.getElementById("sentences-wpm").textContent = calcWPM(correctChars, elapsed);
    document.getElementById("sentences-accuracy").textContent = calcAccuracy(correctChars, incorrectChars) + "%";
    document.getElementById("sentences-combo").textContent = "x" + comboMultiplier(combo.combo);
    document.getElementById("sentences-completed").textContent = completedCount;
  }

  function finish() {
    stop();
    const elapsed = performance.now() - sessionStart;
    const totalHistory = getStatsHistory().filter((s) => s.mode === "sentences");
    const result = {
      mode: "sentences",
      score: sessionScore,
      wpm: calcWPM(correctChars, elapsed),
      accuracy: calcAccuracy(correctChars, incorrectChars),
      maxCombo,
      sentencesCompletedTotal: totalHistory.length + completedCount,
    };
    App.onGameFinished(result);
  }

  // Called when the player quits mid-session: records whatever progress was
  // made instead of silently discarding it. Requires at least one completed
  // sentence so an empty/instant quit doesn't pollute stats with a 0 WPM run.
  function finishEarly() {
    if (!running) return false;
    if (completedCount > 0) {
      finish();
      return true;
    }
    stop();
    return false;
  }

  return { init, start, stop, finishEarly, setDifficulty };
})();
