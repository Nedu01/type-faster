// Reusable on-screen QWERTY keyboard component: renders the layout, can
// highlight the next key to press (with its finger name), and can render a
// per-key accuracy heatmap. Purely a passive display — never intercepts
// clicks or focus, so it doesn't interfere with the hidden-input typing
// mechanism used by every game/lesson screen.

const VirtualKeyboard = (() => {
  const LAYOUT = [
    ["`", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "="],
    ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p", "[", "]"],
    ["a", "s", "d", "f", "g", "h", "j", "k", "l", ";", "'"],
    ["z", "x", "c", "v", "b", "n", "m", ",", ".", "/"],
  ];

  const FINGER_MAP = {
    "`": "left-pinky", "1": "left-pinky", "q": "left-pinky", "a": "left-pinky", "z": "left-pinky",
    "2": "left-ring", "w": "left-ring", "s": "left-ring", "x": "left-ring",
    "3": "left-middle", "e": "left-middle", "d": "left-middle", "c": "left-middle",
    "4": "left-index", "5": "left-index", "r": "left-index", "t": "left-index",
    "f": "left-index", "g": "left-index", "v": "left-index", "b": "left-index",
    "6": "right-index", "7": "right-index", "y": "right-index", "u": "right-index",
    "h": "right-index", "j": "right-index", "n": "right-index", "m": "right-index",
    "8": "right-middle", "i": "right-middle", "k": "right-middle", ",": "right-middle",
    "9": "right-ring", "o": "right-ring", "l": "right-ring", ".": "right-ring",
    "0": "right-pinky", "-": "right-pinky", "=": "right-pinky",
    "p": "right-pinky", "[": "right-pinky", "]": "right-pinky", ";": "right-pinky",
    "'": "right-pinky", "/": "right-pinky",
    " ": "thumb",
  };

  const FINGER_NAMES = {
    "left-pinky": "left pinky", "left-ring": "left ring finger", "left-middle": "left middle finger",
    "left-index": "left index finger", "right-index": "right index finger",
    "right-middle": "right middle finger", "right-ring": "right ring finger",
    "right-pinky": "right pinky", "thumb": "thumb",
  };

  const SHIFT_MAP = { "!": "1", "?": "/", "\"": "'" };

  let root = null;
  let keyEls = {};
  let labelEl = null;

  function getFinger(char) {
    const base = SHIFT_MAP[char] || char;
    return FINGER_MAP[base.toLowerCase()] || null;
  }

  function mount(containerEl) {
    containerEl.innerHTML = "";
    root = document.createElement("div");
    root.className = "vkeyboard";
    keyEls = {};

    LAYOUT.forEach((row) => {
      const rowEl = document.createElement("div");
      rowEl.className = "vkey-row";
      row.forEach((key) => {
        const keyEl = document.createElement("div");
        keyEl.className = "vkey";
        keyEl.dataset.key = key;
        keyEl.dataset.finger = FINGER_MAP[key] || "";
        keyEl.textContent = key;
        rowEl.appendChild(keyEl);
        keyEls[key] = keyEl;
      });
      root.appendChild(rowEl);
    });

    const spaceRow = document.createElement("div");
    spaceRow.className = "vkey-row";
    const spaceEl = document.createElement("div");
    spaceEl.className = "vkey vkey-space";
    spaceEl.dataset.key = " ";
    spaceEl.dataset.finger = "thumb";
    spaceRow.appendChild(spaceEl);
    root.appendChild(spaceRow);
    keyEls[" "] = spaceEl;

    labelEl = document.createElement("div");
    labelEl.className = "vkey-finger-label";

    containerEl.appendChild(root);
    containerEl.appendChild(labelEl);
  }

  function clearHighlight() {
    Object.values(keyEls).forEach((el) => el.classList.remove("next"));
    if (labelEl) labelEl.textContent = "";
  }

  function highlightKey(char) {
    clearHighlight();
    if (!char) return;
    const base = SHIFT_MAP[char] || char;
    const target = keyEls[base.toLowerCase()];
    if (!target) return;
    target.classList.add("next");
    const finger = getFinger(char);
    if (labelEl && finger) {
      labelEl.textContent = "Use your " + FINGER_NAMES[finger];
    }
  }

  function clearHeatmap() {
    Object.values(keyEls).forEach((el) => {
      el.classList.remove("heat-good", "heat-warn", "heat-bad", "heat-untested");
    });
  }

  function applyHeatmap() {
    clearHeatmap();
    const stats = getKeyStats();
    Object.entries(keyEls).forEach(([key, el]) => {
      if (key === " ") return;
      const s = stats[key];
      if (!s || s.attempts < 5) {
        el.classList.add("heat-untested");
        return;
      }
      const acc = (s.correct / s.attempts) * 100;
      if (acc >= 95) el.classList.add("heat-good");
      else if (acc >= 85) el.classList.add("heat-warn");
      else el.classList.add("heat-bad");
    });
  }

  return { mount, highlightKey, clearHighlight, applyHeatmap, clearHeatmap, getFinger, FINGER_NAMES };
})();
