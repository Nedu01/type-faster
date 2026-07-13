// Achievement definitions and unlock-checking logic.

const ACHIEVEMENTS = [
  { id: "first_game", name: "Getting Started", desc: "Complete your first game", icon: "🎮" },
  { id: "wpm_40", name: "Speedy Fingers", desc: "Reach 40 WPM in a run", icon: "⚡" },
  { id: "wpm_60", name: "Lightning Typist", desc: "Reach 60 WPM in a run", icon: "🚀" },
  { id: "wpm_80", name: "Keyboard Wizard", desc: "Reach 80 WPM in a run", icon: "🧙" },
  { id: "combo_10", name: "On a Roll", desc: "Hit a 10x combo streak", icon: "🔥" },
  { id: "combo_20", name: "Unstoppable", desc: "Hit a 20x combo streak", icon: "💥" },
  { id: "perfect_accuracy", name: "Flawless", desc: "Finish a run with 100% accuracy", icon: "🎯" },
  { id: "level_5", name: "Rising Star", desc: "Survive to level 5 in Falling Words", icon: "⭐" },
  { id: "level_10", name: "Word Warrior", desc: "Survive to level 10 in Falling Words", icon: "🏆" },
  { id: "sentences_10", name: "Bookworm", desc: "Complete 10 sentences", icon: "📚" },
];

// Returns a list of newly-unlocked achievement objects for this run's results.
function checkAchievements(result) {
  const newly = [];
  const tryUnlock = (id) => {
    if (unlockAchievement(id)) {
      const def = ACHIEVEMENTS.find((a) => a.id === id);
      if (def) newly.push(def);
    }
  };

  tryUnlock("first_game");

  if (result.wpm >= 40) tryUnlock("wpm_40");
  if (result.wpm >= 60) tryUnlock("wpm_60");
  if (result.wpm >= 80) tryUnlock("wpm_80");

  if (result.maxCombo >= 10) tryUnlock("combo_10");
  if (result.maxCombo >= 20) tryUnlock("combo_20");

  if (result.accuracy >= 100) tryUnlock("perfect_accuracy");

  if (result.mode === "falling") {
    if (result.level >= 5) tryUnlock("level_5");
    if (result.level >= 10) tryUnlock("level_10");
  }

  if (result.mode === "sentences" && result.sentencesCompletedTotal >= 10) {
    tryUnlock("sentences_10");
  }

  return newly;
}
