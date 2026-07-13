// Word and sentence banks, tiered by difficulty.

const WORD_TIERS = [
  // tier 0: short/easy (levels 1-2)
  ["cat","dog","run","sun","hat","big","red","top","fun","box","cup","pen","bed","key","map","sky","ice","tea","van","zoo"],
  // tier 1: medium (levels 3-4)
  ["apple","house","chair","water","light","music","happy","green","tiger","cloud","river","stone","bread","dance","smile","plant","brave","quiet","sharp","dream"],
  // tier 2: longer (levels 5-6)
  ["mountain","elephant","keyboard","sandwich","umbrella","triangle","building","calendar","dinosaur","medicine","backpack","festival","hospital","language","exercise","favorite","universe","treasure","vacation","volcano"],
  // tier 3: hard/long (levels 7+)
  ["algorithm","adventure","chocolate","dictionary","engineering","fascinate","gymnastics","hurricane","imagination","journalist","kaleidoscope","laboratory","mysterious","nutrition","opportunity","photograph","questionable","refrigerator","spontaneous","technology"],
];

function getWordForLevel(level) {
  const tier = Math.min(WORD_TIERS.length - 1, Math.floor((level - 1) / 2));
  const list = WORD_TIERS[tier];
  return list[Math.floor(Math.random() * list.length)];
}

const SENTENCE_TIERS = {
  easy: [
    "The cat sat on the mat.",
    "I like to eat pizza.",
    "The sun is very bright today.",
    "She runs fast every morning.",
    "We play games after school.",
    "Birds fly high in the sky.",
    "He reads a book at night.",
    "The dog barks at the mailman.",
    "My favorite color is blue.",
    "They walk to the park together.",
  ],
  medium: [
    "The quick brown fox jumps over the lazy dog.",
    "Practice makes perfect, so keep typing every day.",
    "A journey of a thousand miles begins with a single step.",
    "Technology is changing the way we live and work.",
    "The weather forecast predicts rain for the weekend.",
    "Learning new skills can be challenging but rewarding.",
    "The chef prepared a delicious meal for the guests.",
    "Music has the power to bring people together.",
    "Scientists discovered a new species in the rainforest.",
    "Good habits are hard to build but easy to break.",
  ],
  hard: [
    "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    "The mysterious old library contained thousands of ancient, dust-covered manuscripts.",
    "Despite the overwhelming challenges, the team persevered and achieved extraordinary results.",
    "Photosynthesis is the process by which plants convert sunlight into chemical energy.",
    "The entrepreneur's innovative approach revolutionized the entire industry within a decade.",
    "Quantum mechanics describes the strange behavior of particles at the subatomic level.",
    "Effective communication requires clarity, empathy, and a willingness to listen actively.",
    "The archaeologists uncovered artifacts that reshaped our understanding of ancient civilizations.",
    "Climate change poses significant challenges that require immediate global cooperation.",
    "Perseverance, discipline, and curiosity are the cornerstones of lifelong learning.",
  ],
};

function getSentence(difficulty) {
  const list = SENTENCE_TIERS[difficulty] || SENTENCE_TIERS.easy;
  return list[Math.floor(Math.random() * list.length)];
}
