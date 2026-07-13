// localStorage persistence: high scores, achievements, stats history.

const STORAGE_KEYS = {
  scores: "tf_high_scores",
  achievements: "tf_achievements",
  stats: "tf_stats_history",
  keyStats: "tf_key_stats",
  lessonProgress: "tf_lesson_progress",
  everWeakKeys: "tf_ever_weak_keys",
};

function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}

function saveJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function getHighScores() {
  return loadJSON(STORAGE_KEYS.scores, { falling: [], sentences: [] });
}

function addHighScore(mode, entry) {
  const scores = getHighScores();
  scores[mode] = scores[mode] || [];
  scores[mode].push(entry);
  scores[mode].sort((a, b) => b.score - a.score);
  scores[mode] = scores[mode].slice(0, 5);
  saveJSON(STORAGE_KEYS.scores, scores);
  return scores[mode];
}

function getUnlockedAchievements() {
  return loadJSON(STORAGE_KEYS.achievements, []);
}

function unlockAchievement(id) {
  const unlocked = getUnlockedAchievements();
  if (!unlocked.includes(id)) {
    unlocked.push(id);
    saveJSON(STORAGE_KEYS.achievements, unlocked);
    return true;
  }
  return false;
}

function getStatsHistory() {
  return loadJSON(STORAGE_KEYS.stats, []);
}

function addStatsEntry(entry) {
  const history = getStatsHistory();
  history.push(entry);
  saveJSON(STORAGE_KEYS.stats, history.slice(-50));
}

function getKeyStats() {
  return loadJSON(STORAGE_KEYS.keyStats, {});
}

// key: lowercase character. correct: whether it was typed correctly.
// msSinceLastKey: interval since the previous keystroke (used for speed;
// only accumulated on correct presses, since timing after a mistake is noisy).
function recordKeyPress(key, correct, msSinceLastKey) {
  const stats = getKeyStats();
  const s = stats[key] || { attempts: 0, correct: 0, totalMs: 0, lastSeen: 0 };
  s.attempts += 1;
  if (correct) {
    s.correct += 1;
    if (typeof msSinceLastKey === "number" && msSinceLastKey > 0 && msSinceLastKey < 5000) {
      s.totalMs += msSinceLastKey;
    }
  }
  s.lastSeen = Date.now();
  stats[key] = s;
  saveJSON(STORAGE_KEYS.keyStats, stats);
}

function getKeyAccuracy(key) {
  const s = getKeyStats()[key];
  if (!s || s.attempts === 0) return null;
  return Math.round((s.correct / s.attempts) * 100);
}

// Returns the n keys with the lowest accuracy, ignoring keys with too few
// attempts to be meaningful. [{key, accuracy, attempts}, ...]
function getWeakestKeys(n = 3, minAttempts = 5) {
  const stats = getKeyStats();
  return Object.entries(stats)
    .filter(([, s]) => s.attempts >= minAttempts)
    .map(([key, s]) => ({ key, accuracy: Math.round((s.correct / s.attempts) * 100), attempts: s.attempts }))
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, n);
}

// Tracks which keys have ever dipped below the "weak" accuracy threshold, so
// a later achievement can detect "a previously-weak key improved" even
// though getKeyStats() alone only reflects the current running average.
function getEverWeakKeys() {
  return loadJSON(STORAGE_KEYS.everWeakKeys, []);
}

function markEverWeak(key) {
  const weak = getEverWeakKeys();
  if (!weak.includes(key)) {
    weak.push(key);
    saveJSON(STORAGE_KEYS.everWeakKeys, weak);
  }
}

function getLessonProgress() {
  return loadJSON(STORAGE_KEYS.lessonProgress, {});
}

function recordLessonResult(lessonId, { accuracy, wpm, passed }) {
  const progress = getLessonProgress();
  const p = progress[lessonId] || { completed: false, bestAccuracy: 0, bestWpm: 0, attempts: 0 };
  p.attempts += 1;
  p.bestAccuracy = Math.max(p.bestAccuracy, accuracy);
  p.bestWpm = Math.max(p.bestWpm, wpm);
  if (passed) p.completed = true;
  progress[lessonId] = p;
  saveJSON(STORAGE_KEYS.lessonProgress, progress);
  return p;
}
