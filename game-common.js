// Shared scoring / stats utilities used by both game modes.

function calcWPM(correctChars, elapsedMs) {
  const minutes = elapsedMs / 60000;
  if (minutes <= 0) return 0;
  return Math.round((correctChars / 5) / minutes);
}

function calcAccuracy(correctChars, incorrectChars) {
  const total = correctChars + incorrectChars;
  if (total === 0) return 100;
  return Math.round((correctChars / total) * 100);
}

// Combo -> multiplier curve: x1 up to combo 4, then +1 every 5 combo, capped at x5.
function comboMultiplier(combo) {
  return Math.min(5, 1 + Math.floor(combo / 5));
}

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

class ComboTracker {
  constructor() {
    this.combo = 0;
    this.maxCombo = 0;
  }
  hit() {
    this.combo += 1;
    this.maxCombo = Math.max(this.maxCombo, this.combo);
    return comboMultiplier(this.combo);
  }
  miss() {
    this.combo = 0;
  }
}
