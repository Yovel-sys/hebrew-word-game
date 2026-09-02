/**
 * סקריפט build-time (לא רץ באפליקציה עצמה) שמעבד את hspell_simple.txt:
 *   1. מסנן מילים לא תקינות (תווים לא-עבריים, אורך קיצוני)
 *   2. מצליב מול רשימת תדירויות אמיתית (he_freq.txt - מבוססת קורפוס
 *      כתוביות אמיתי, 50,000 מילים) - נשארות רק מילים שבאמת בשימוש.
 *      זו הסיבה שהשיטה הזו עדיפה על ניחוש לשוני של סיומות: במקום לנחש
 *      איזו מילה היא "נטייה" של איזו, פשוט בודקים שימוש אמיתי. התוצאה:
 *      128,674 -> 23,242 מילים (82% פחות, אבל כולן מילים בשימוש אמיתי).
 *   3. שומר מילון נקי כ-JSON לטעינה מהירה באפליקציה
 *   4. מייצר רשימת "חידות מוכנות" - סטים של N אותיות (ברירת מחדל 5,
 *      ראו LETTER_COUNT) עם מספיק מילים אפשריות ולפחות פנגרם אחד
 *
 * הרצה: npx tsx scripts/generateDictionary.ts
 * למצב מתקדם עתידי עם 6 אותיות: שנו את LETTER_COUNT ל-6 והריצו שוב
 * (זה ייצור puzzles6.json נפרד, בלי לדרוס את puzzles.json של 5 אותיות).
 */
import fs from 'node:fs';
import path from 'node:path';

const RAW_PATH = path.join(__dirname, 'hspell_simple.txt');
const FREQ_PATH = path.join(__dirname, 'he_freq.txt');
const OUT_WORDS_PATH = path.join(__dirname, '..', 'src', 'data', 'words.json');

// === כאן קובעים כמה אותיות יש בחידה ===
const LETTER_COUNT = 5;
const OUT_PUZZLES_PATH = path.join(
  __dirname,
  '..',
  'src',
  'data',
  LETTER_COUNT === 5 ? 'puzzles.json' : `puzzles${LETTER_COUNT}.json`
);

const FINAL_TO_BASE: Record<string, string> = {
  'ך': 'כ',
  'ם': 'מ',
  'ן': 'נ',
  'ף': 'פ',
  'ץ': 'צ',
};

function normalize(word: string): string {
  return [...word].map((c) => FINAL_TO_BASE[c] ?? c).join('');
}

const HEBREW_ONLY = /^[\u05D0-\u05EA]+$/;
const MIN_LEN = 2;
const MAX_LEN = 12;

function loadAndCleanHspell(): string[] {
  const raw = fs.readFileSync(RAW_PATH, 'utf-8');
  const lines = raw.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  const seen = new Set<string>();
  const cleaned: string[] = [];

  for (const word of lines) {
    if (!HEBREW_ONLY.test(word)) continue; // מסנן גרשיים, מספרים וכו'
    if (word.length < MIN_LEN || word.length > MAX_LEN) continue;
    if (seen.has(word)) continue;
    seen.add(word);
    cleaned.push(word);
  }

  return cleaned;
}

function loadFrequencySet(): Set<string> {
  const raw = fs.readFileSync(FREQ_PATH, 'utf-8');
  const words = raw
    .split(/\r?\n/)
    .map((line) => line.trim().split(/\s+/)[0])
    .filter(Boolean);
  return new Set(words);
}

interface PuzzleCandidate {
  letters: string[];
  pangramWord: string;
  wordCount: number;
  sampleWords: string[];
  difficulty: number;
  achievableScore: number;
}

const PANGRAM_BONUS = 7;

/** זהה ל-calculateScore ב-src/utils/gameLogic.ts - כפולה כאן כי זה סקריפט
 * build-time נפרד שרץ מחוץ לאפליקציה (ב-node, לא ב-RN), ולא משתף קוד
 * runtime. אם משנים את נוסחת הניקוד שם, יש לעדכן גם כאן.
 */
function scoreForWord(word: string, letterCount: number): number {
  const base = word.length === 2 ? 1 : word.length;
  const isPangram = new Set(word).size === letterCount;
  return base + (isPangram ? PANGRAM_BONUS : 0);
}

/**
 * מונה כמה פעמים כל אות (אחרי נרמול) מופיעה בכל מילות המילון הנקי.
 * זה הבסיס לחישוב "נדירות" אמיתית - לא ניחוש, אלא מדידה בפועל.
 */
function computeLetterFrequencies(words: string[]): Record<string, number> {
  const freq: Record<string, number> = {};
  for (const w of words) {
    for (const l of normalize(w)) {
      freq[l] = (freq[l] ?? 0) + 1;
    }
  }
  return freq;
}

/**
 * ציון קושי לחידה: משלב שני גורמים -
 *  1. נדירות האותיות (סכום 1/תדירות לכל אות בחידה) - אותיות נדירות = קשה יותר
 *  2. כמות המילים האפשריות בפועל (wordCount) - פחות מילים = קשה יותר
 * מחלקים את (1) ב-(2) כדי לקבל ציון יחיד: גם אותיות נדירות וגם מעט מילים
 * מחמירים זה את זה. ציון גבוה יותר = קשה יותר.
 */
function computeDifficulty(
  letters: string[],
  wordCount: number,
  letterFreq: Record<string, number>
): number {
  const raritySum = letters.reduce((sum, l) => sum + 1 / (letterFreq[l] ?? 1), 0);
  return raritySum / wordCount;
}

function generatePuzzles(
  words: string[],
  letterCount: number,
  targetCount: number,
  letterFreq: Record<string, number>
): PuzzleCandidate[] {
  const wordLetterSets = words.map((w) => ({
    word: w,
    letters: new Set(normalize(w)),
  }));

  const pangramCandidates = wordLetterSets.filter((w) => w.letters.size === letterCount);
  console.log(`מועמדי פנגרם (${letterCount} אותיות ייחודיות): ${pangramCandidates.length}`);

  const puzzles: PuzzleCandidate[] = [];
  const shuffled = [...pangramCandidates].sort(() => Math.random() - 0.5);

  for (const candidate of shuffled) {
    if (puzzles.length >= targetCount) break;

    const letterSet = candidate.letters;
    const matchingWords = wordLetterSets.filter((w) => {
      for (const l of w.letters) {
        if (!letterSet.has(l)) return false;
      }
      return true;
    });

    // טווח "כמות משחקית" - מותאם לגודל המילון אחרי הצלבת תדירויות
    if (matchingWords.length < 8 || matchingWords.length > 60) continue;

    const key = [...letterSet].sort().join('');
    if (puzzles.some((p) => [...p.letters].sort().join('') === key)) continue;

    const letters = [...letterSet];
    const achievableScore = matchingWords.reduce(
      (sum, w) => sum + scoreForWord(w.word, letterCount),
      0
    );
    puzzles.push({
      letters,
      pangramWord: candidate.word,
      wordCount: matchingWords.length,
      sampleWords: matchingWords.slice(0, 5).map((w) => w.word),
      difficulty: computeDifficulty(letters, matchingWords.length, letterFreq),
      achievableScore,
    });
  }

  // ממיינים מהקל לקשה - כך אינדקס 0 = שלב 1 = הכי קל
  puzzles.sort((a, b) => a.difficulty - b.difficulty);

  return puzzles;
}

function main() {
  console.log('טוען ומנקה את הרשימה...');
  const hspellWords = loadAndCleanHspell();
  console.log(`מילים תקינות אחרי סינון ראשוני: ${hspellWords.length}`);

  console.log('מצליב מול רשימת תדירויות אמיתית...');
  const freqSet = loadFrequencySet();
  const words = hspellWords.filter((w) => freqSet.has(w));
  console.log(`מילים אחרי הצלבה: ${words.length} (${hspellWords.length - words.length} הוסרו)`);

  fs.mkdirSync(path.dirname(OUT_WORDS_PATH), { recursive: true });
  fs.writeFileSync(OUT_WORDS_PATH, JSON.stringify(words), 'utf-8');
  console.log(`נשמר: ${OUT_WORDS_PATH} (${(fs.statSync(OUT_WORDS_PATH).size / 1024 / 1024).toFixed(2)}MB)`);

  console.log(`מייצר חידות (${LETTER_COUNT} אותיות)...`);
  const letterFreq = computeLetterFrequencies(words);
  const puzzles = generatePuzzles(words, LETTER_COUNT, 60, letterFreq);
  fs.writeFileSync(OUT_PUZZLES_PATH, JSON.stringify(puzzles, null, 2), 'utf-8');
  console.log(`נשמר: ${OUT_PUZZLES_PATH} (${puzzles.length} חידות, ממוינות מהקל לקשה)`);

  console.log('\nהחידה הקלה ביותר:', puzzles[0]);
  console.log('\nהחידה הקשה ביותר:', puzzles[puzzles.length - 1]);
}

main();
