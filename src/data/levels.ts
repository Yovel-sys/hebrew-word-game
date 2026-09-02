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
 * כמה נקודות מצטברות (מכל השלבים ביחד) צריך כדי לפתוח שלב מסוים.
 * שלב 0 (הראשון, הקל ביותר) תמיד פתוח.
 *
 * הסף מבוסס על הניקוד ה*אמיתי* הניתן להשגה בשלבים הקודמים (achievableScore,
 * מחושב ב-generateDictionary.ts מסכימת כל המילים האפשריות בכל שלב) - לא
 * נוסחה שרירותית. כל שלב דורש שהשחקן צבר לפחות UNLOCK_FRACTION מתוך סך כל
 * הניקוד האפשרי בשלבים שקדמו לו. כך יש הבטחה מתמטית שכל שלב ניתן לפתיחה
 * (אי אפשר לדרוש יותר נקודות ממה שבכלל אפשר לצבור).
 */
const UNLOCK_FRACTION = 0.5;

function computeRequiredScores(puzzles: RawPuzzle[]): number[] {
  const required: number[] = [];
  let cumulativeAchievable = 0;
  for (let i = 0; i < puzzles.length; i++) {
    required.push(i === 0 ? 0 : Math.round(cumulativeAchievable * UNLOCK_FRACTION));
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
