// Keyboard Mastery: guided touch-typing lessons. Structured like
// game-sentences.js (hidden-input + focus-hint + click-to-refocus), plus a
// mounted VirtualKeyboard showing the next key and finger to use.

const LessonMode = (() => {
  let display, input, wrap, focusHint, keyboardContainer, titleEl;
  let lessonId = "";
  let lesson = null;
  let current = "";
  let combo, correctChars, incorrectChars, sessionStart;
  let repsCompleted, lastTypedLength;
  let running = false;
  const REPS_PER_LESSON = 8;
  const PASS_ACCURACY = 90;

  function init() {
    display = document.getElementById("lesson-display");
    input = document.getElementById("lesson-input");
    wrap = document.querySelector(".lesson-wrap");
    focusHint = document.getElementById("lesson-focus-hint");
    keyboardContainer = document.getElementById("lesson-keyboard");
    titleEl = document.getElementById("lesson-title");

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

  function start(id) {
    lessonId = id;
    lesson = getLessonById(id);
    if (!lesson) return;

    VirtualKeyboard.mount(keyboardContainer);
    titleEl.textContent = lesson.title;

    combo = new ComboTracker();
    correctChars = 0;
    incorrectChars = 0;
    repsCompleted = 0;
    lastTypedLength = 0;
    sessionStart = performance.now();
    running = true;
    focusHint.classList.add("hidden");
    nextDrill();
    updateHUD();
    input.focus();
  }

  function stop() {
    running = false;
    focusHint.classList.add("hidden");
    VirtualKeyboard.clearHighlight();
  }

  function nextDrill() {
    current = getLessonDrillText(lessonId);
    lastTypedLength = 0;
    input.value = "";
    renderDrill("");
  }

  function renderDrill(typed) {
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
    VirtualKeyboard.highlightKey(current[typed.length] || null);
  }

  function onInput() {
    if (!running) return;
    const typed = input.value;
    renderDrill(typed);

    if (typed.length > lastTypedLength) {
      const idx = typed.length - 1;
      if (idx < current.length) {
        trackKeystroke(current[idx], typed[idx] === current[idx]);
      }
    }
    lastTypedLength = typed.length;

    if (typed.length >= current.length) {
      let correct = 0, incorrect = 0;
      for (let i = 0; i < current.length; i++) {
        if (typed[i] === current[i]) correct++; else incorrect++;
      }
      correctChars += correct;
      incorrectChars += incorrect;

      if (incorrect === 0) combo.hit();
      else combo.miss();

      repsCompleted += 1;

      const hudCombo = document.getElementById("lesson-combo");
      hudCombo.classList.remove("pulse");
      void hudCombo.offsetWidth;
      hudCombo.classList.add("pulse");

      updateHUD();

      if (repsCompleted >= REPS_PER_LESSON) {
        finish();
      } else {
        nextDrill();
      }
    }
  }

  function updateHUD() {
    const elapsed = performance.now() - sessionStart;
    document.getElementById("lesson-wpm").textContent = calcWPM(correctChars, elapsed);
    document.getElementById("lesson-accuracy").textContent = calcAccuracy(correctChars, incorrectChars) + "%";
    document.getElementById("lesson-combo").textContent = "x" + comboMultiplier(combo.combo);
    document.getElementById("lesson-progress").textContent = repsCompleted + "/" + REPS_PER_LESSON;
  }

  function finish() {
    stop();
    const elapsed = performance.now() - sessionStart;
    const accuracy = calcAccuracy(correctChars, incorrectChars);
    const wpm = calcWPM(correctChars, elapsed);
    const passed = accuracy >= PASS_ACCURACY;
    recordLessonResult(lessonId, { accuracy, wpm, passed });

    const result = {
      mode: "lesson",
      lessonId,
      lessonTitle: lesson.title,
      score: correctChars * 10,
      wpm,
      accuracy,
      maxCombo: combo.maxCombo,
      passed,
    };
    App.onGameFinished(result);
  }

  // Called when the player quits mid-lesson: records whatever progress was
  // made instead of discarding it. Returns false (and just stops) if no
  // drill reps were completed yet, so an instant quit skips the results screen.
  function finishEarly() {
    if (!running) return false;
    if (repsCompleted === 0) {
      stop();
      return false;
    }
    finish();
    return true;
  }

  return { init, start, stop, finishEarly };
})();
