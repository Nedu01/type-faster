// Progressive touch-typing curriculum: home row -> top row -> bottom row ->
// numbers -> punctuation -> full keyboard. Order in LESSON_DEFS is the
// progression. Each lesson's drills use ONLY newKeys + reviewKeys, so the
// player is never asked to type a key they haven't been taught yet.
// reviewKeys is computed automatically below as "every newKey from every
// earlier lesson" so the curriculum can't silently drift out of sync as
// lessons are added or reordered.

const LESSON_DEFS = [
  // ---- Home row (index fingers first, working outward) ----
  { id: "home-1", title: "Home Row: F and J", newKeys: ["f", "j"],
    drills: ["f j", "j f", "ff jj", "fj jf", "fjf jfj", "jff fjj", "fjfj jfjf"] },
  { id: "home-2", title: "Home Row: D and K", newKeys: ["d", "k"],
    drills: ["d k", "dk kd", "dfj kjf", "fjdk kdfj", "djfk kfjd", "dkdk fjfj"] },
  { id: "home-3", title: "Home Row: S and L", newKeys: ["s", "l"],
    drills: ["s l", "sl ls", "slsl kdkd", "flsdk skjl", "sdlk klsd", "slfjdk"] },
  { id: "home-4", title: "Home Row: A and ;", newKeys: ["a", ";"],
    drills: ["a ;", "a; ;a", "ask lad", "salad flask", "a;a; ksks", "flask; ada;"] },
  { id: "home-5", title: "Home Row: G and H", newKeys: ["g", "h"],
    drills: ["g h", "gh hg", "gas hall", "flash glad", "hags gash", "half glass", "shall dash"] },
  { id: "home-review", title: "Home Row Review", newKeys: [],
    drills: ["ask", "lad", "gas", "hall", "flash", "glad", "salad", "flask", "shall", "dash", "half", "glass", "flags", "hash", "gala"] },

  // ---- Top row ----
  { id: "top-1", title: "Top Row: R and U", newKeys: ["r", "u"],
    drills: ["r u", "ru ur", "dark hard", "surf rush", "guard hurl", "rural"] },
  { id: "top-2", title: "Top Row: E and I", newKeys: ["e", "i"],
    drills: ["e i", "ei ie", "rise dear", "fires ideas", "share slide", "leisure"] },
  { id: "top-3", title: "Top Row: W and O", newKeys: ["w", "o"],
    drills: ["w o", "wo ow", "wore dorks", "world sword", "worries roads", "worked"] },
  { id: "top-4", title: "Top Row: Q and P", newKeys: ["q", "p"],
    drills: ["q p", "qp pq", "pique quip", "spoke quips", "quips proud", "square"] },
  { id: "top-5", title: "Top Row: T and Y", newKeys: ["t", "y"],
    drills: ["t y", "ty yt", "type story", "yearly quiet", "gather quote", "yesterday"] },
  { id: "top-review", title: "Top Row Review", newKeys: [],
    drills: ["water", "story", "quiet", "world", "wire", "your", "spray", "type", "trade", "sword", "square", "wisely", "gather", "quarter"] },

  // ---- Bottom row ----
  { id: "bottom-1", title: "Bottom Row: V and M", newKeys: ["v", "m"],
    drills: ["v m", "vm mv", "move dive", "moves vivid", "movie marvel", "primate"] },
  { id: "bottom-2", title: "Bottom Row: C and ,", newKeys: ["c", ","],
    drills: ["c ,", "c, ,c", "race, mice,", "circle, glacier,", "voice, curve,", "cameras,"] },
  { id: "bottom-3", title: "Bottom Row: X and .", newKeys: ["x", "."],
    drills: ["x .", "x. .x", "exam. mix.", "excuse. exact.", "extra fix. taxi.", "exercise."] },
  { id: "bottom-4", title: "Bottom Row: Z and /", newKeys: ["z", "/"],
    drills: ["z /", "z/ /z", "size/ zoom/", "amaze/ crazy/", "haze/ maze/", "zero/doze/"] },
  { id: "bottom-5", title: "Bottom Row: B and N", newKeys: ["b", "n"],
    drills: ["b n", "bn nb", "born bank", "brain number", "movie brain", "urban dinner"] },
  { id: "bottom-review", title: "Bottom Row Review", newKeys: [],
    drills: ["brave", "mouse", "circle", "extra", "amazing", "number", "movie", "curious", "invented", "example", "expensive", "vacuum"] },

  // ---- Numbers & punctuation ----
  { id: "numbers-1", title: "Numbers: 1-5", newKeys: ["1", "2", "3", "4", "5"],
    drills: ["1 2 3", "4 5", "12 34 5", "123 45", "54321", "15243"] },
  { id: "numbers-2", title: "Numbers: 6-0", newKeys: ["6", "7", "8", "9", "0"],
    drills: ["6 7 8", "9 0", "67 89 0", "1090 2020", "678 90", "1234567890"] },
  { id: "punctuation", title: "Punctuation & Symbols", newKeys: ["!", "?", "'", "\""],
    drills: ["hi!", "really?", "it's", "\"sure\"", "wow! yes?", "she's here!"] },

  // ---- Full keyboard ----
  { id: "full-keyboard", title: "Full Keyboard Challenge", newKeys: [], useSentences: true, drills: [] },
];

// Build the public LESSONS array with reviewKeys auto-computed as every
// newKey introduced by an earlier lesson (deduped, insertion order).
const LESSONS = (() => {
  const seen = [];
  return LESSON_DEFS.map((def) => {
    const reviewKeys = seen.slice();
    def.newKeys.forEach((k) => {
      if (!seen.includes(k)) seen.push(k);
    });
    return { ...def, reviewKeys };
  });
})();

// Filters a word so it only uses characters from the allowed key set
// (case-insensitive). Used to build later-lesson drills from the existing
// word bank instead of hand-authoring hundreds of words.
function wordUsesOnlyKeys(word, allowedKeys) {
  const allowed = new Set(allowedKeys.map((k) => k.toLowerCase()));
  return [...word.toLowerCase()].every((ch) => allowed.has(ch) || ch === " ");
}

function getLessonById(id) {
  return LESSONS.find((l) => l.id === id) || null;
}

function getNextLesson(id) {
  const idx = LESSONS.findIndex((l) => l.id === id);
  if (idx === -1 || idx === LESSONS.length - 1) return null;
  return LESSONS[idx + 1];
}

function getLessonKeys(lesson) {
  return [...(lesson.newKeys || []), ...(lesson.reviewKeys || [])];
}

// Returns the next drill string for a lesson: cycles through hand-authored
// drills, or for the final lesson pulls a random real sentence.
function getLessonDrillText(lessonId) {
  const lesson = getLessonById(lessonId);
  if (!lesson) return "";
  if (lesson.useSentences) return getSentence("easy");
  return lesson.drills[Math.floor(Math.random() * lesson.drills.length)];
}
