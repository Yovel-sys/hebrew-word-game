import AsyncStorage from '@react-native-async-storage/async-storage';
import { StoredProgress } from '../types';

const STORAGE_KEY = 'hebrew-word-game:progress:v1';

const EMPTY_PROGRESS: StoredProgress = {
  totalScore: 0,
  foundWordsByLevel: {},
};

export async function loadProgress(): Promise<StoredProgress> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...EMPTY_PROGRESS, foundWordsByLevel: {} };
    const parsed = JSON.parse(raw) as StoredProgress;
    // הגנה בסיסית למקרה שהמבנה השתנה בעדכון עתידי
    return {
      totalScore: parsed.totalScore ?? 0,
      foundWordsByLevel: parsed.foundWordsByLevel ?? {},
    };
  } catch (err) {
    console.warn('נכשל בטעינת התקדמות שמורה, מתחילים מחדש:', err);
    return { ...EMPTY_PROGRESS, foundWordsByLevel: {} };
  }
}

export async function saveProgress(progress: StoredProgress): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (err) {
    console.warn('נכשל בשמירת התקדמות:', err);
  }
}

/**
 * מוחקת את כל ההתקדמות השמורה (ניקוד + מילים שנמצאו בכל השלבים).
 * שימושי בעיקר לבדיקות/פיתוח - כרגע מחובר לכפתור זמני במסך הפתיחה.
 */
export async function clearProgress(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.warn('נכשל במחיקת התקדמות:', err);
  }
}

/**
 * מוסיפה מילה שנמצאה בשלב מסוים לתוך ההתקדמות השמורה, ומעדכנת את
 * הניקוד המצטב הכולל. לא בודקת תקינות המילה - זה תפקידה של submitWord
 * (utils/gameLogic.ts); הפונקציה הזו רק אחראית על השמירה עצמה.
 */
export function addFoundWordToProgress(
  progress: StoredProgress,
  levelIndex: number,
  word: string,
  scoreGained: number
): StoredProgress {
  const key = String(levelIndex);
  const existing = progress.foundWordsByLevel[key] ?? [];
  if (existing.includes(word)) return progress; // כבר נספר בעבר, לא מכפילים ניקוד

  return {
    totalScore: progress.totalScore + scoreGained,
    foundWordsByLevel: {
      ...progress.foundWordsByLevel,
      [key]: [...existing, word],
    },
  };
}

export function getFoundWordsForLevel(progress: StoredProgress, levelIndex: number): string[] {
  return progress.foundWordsByLevel[String(levelIndex)] ?? [];
}
