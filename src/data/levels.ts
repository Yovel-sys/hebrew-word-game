import puzzlesData from './puzzles.json';
import { Level } from '../types';

interface RawPuzzle {
  letters: string[];
  pangramWord: string;
  wordCount: number;
  difficulty: number;
  achievableScore: number;
}

const RAW_PUZZLES = puzzlesData as RawPuzzle[];

/**
 * כמה שלבים ראשונים תמיד פתוחים בלי שום תנאי ניקוד - נותן לשחקנים
 * חדשים כמה חידות להתנסות בהן מיד, לפני שנכנס לתמונה שיקול ה"פתיחה".
 */
const FREE_LEVELS = 4;

/**
 * כמה נקודות מצטברות (מכל השלבים ביחד) צריך כדי לפתוח שלב מסוים,
 * לשלבים שאחרי FREE_LEVELS.
 *
 * הסף מבוסס על הניקוד ה*אמיתי* הניתן להשגה בשלבים הקודמים (achievableScore,
 * מחושב ב-generateDictionary.ts מסכימת כל המילים האפשריות בכל שלב) - לא
 * נוסחה שרירותית. כל שלב דורש שהשחקן צבר לפחות UNLOCK_FRACTION מתוך סך כל
 * הניקוד האפשרי בשלבים שקדמו לו. כך יש הבטחה מתמטית שכל שלב ניתן לפתיחה
 * (אי אפשר לדרוש יותר נקודות ממה שבכלל אפשר לצבור).
 */
const UNLOCK_FRACTION = 0.22;

function computeRequiredScores(puzzles: RawPuzzle[]): number[] {
  const required: number[] = [];
  let cumulativeAchievable = 0;
  for (let i = 0; i < puzzles.length; i++) {
    required.push(i < FREE_LEVELS ? 0 : Math.floor((cumulativeAchievable * UNLOCK_FRACTION) / 10) * 10);
    cumulativeAchievable += puzzles[i].achievableScore;
  }
  return required;
}

const REQUIRED_SCORES = computeRequiredScores(RAW_PUZZLES);

export const LEVELS: Level[] = RAW_PUZZLES.map((p, index) => ({
  index,
  letters: p.letters,
  pangramWord: p.pangramWord,
  wordCount: p.wordCount,
  difficulty: p.difficulty,
  achievableScore: p.achievableScore,
  requiredScore: REQUIRED_SCORES[index],
}));

export function isLevelUnlocked(level: Level, totalScore: number): boolean {
  return totalScore >= level.requiredScore;
}

export function getLevel(index: number): Level | undefined {
  return LEVELS[index];
}
