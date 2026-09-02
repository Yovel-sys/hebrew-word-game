import { PuzzleLetters, ValidationResult } from '../types';
import { normalizeFinalLetter } from './hebrewLetters';

export const MIN_WORD_LENGTH = 2;

/**
 * בונה Set לבדיקה מהירה של מילים תקינות.
 * חשוב: הרצה חד-פעמית בטעינת המשחק, לא בכל בדיקת מילה.
 */
export function buildDictionarySet(words: string[]): Set<string> {
  return new Set(words.map(normalizeWord));
}

/**
 * מנקה מילה מרווחים ומאחדת לצורת השוואה עקבית.
 * (בעתיד אפשר להרחיב כאן טיפול בגרשיים, ניקוד וכו')
 */
export function normalizeWord(word: string): string {
  return word.trim();
}

/**
 * בודקת שכל אות במילה שייכת לאותיות הזמינות במעגל.
 * הערה עיצובית: בסגנון "Spelling Bee", כל אות מוצגת פעם אחת במעגל
 * אך ניתן להשתמש בה מספר פעמים בתוך אותה מילה (האותיות לא "נצרכות").
 */
export function usesOnlyAvailableLetters(word: string, availableLetters: string[]): boolean {
  const allowed = new Set(availableLetters);
  return [...word].every((char) => allowed.has(normalizeFinalLetter(char)));
}

/**
 * בודקת אם מילה היא "פנגרם" - משתמשת בכל האותיות הזמינות לפחות פעם אחת.
 */
export function isPangram(word: string, availableLetters: string[]): boolean {
  const wordLetters = new Set([...word].map(normalizeFinalLetter));
  return availableLetters.every((letter) => wordLetters.has(letter));
}

/**
 * הפונקציה המרכזית: בודקת אם מילה שהמשתמש הרכיב היא קבילה.
 */
export function validateWord(
  word: string,
  puzzle: PuzzleLetters,
  dictionary: Set<string>,
  alreadyFound: Set<string>
): ValidationResult {
  const normalized = normalizeWord(word);

  if (normalized.length < MIN_WORD_LENGTH) {
    return { valid: false, reason: 'too_short' };
  }

  if (puzzle.requiredLetter && ![...normalized].includes(puzzle.requiredLetter)) {
    return { valid: false, reason: 'missing_required_letter' };
  }

  if (!usesOnlyAvailableLetters(normalized, puzzle.letters)) {
    return { valid: false, reason: 'invalid_letters' };
  }

  if (alreadyFound.has(normalized)) {
    return { valid: false, reason: 'already_found' };
  }

  if (!dictionary.has(normalized)) {
    return { valid: false, reason: 'not_in_dictionary' };
  }

  return { valid: true };
}
