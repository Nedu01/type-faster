// localStorage persistence: high scores, achievements, stats history.

const STORAGE_KEYS = {
  scores: "tf_high_scores",
  achievements: "tf_achievements",
  stats: "tf_stats_history",
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
