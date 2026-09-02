import { FoundWord, GameState, InvalidReason, PuzzleLetters } from '../types';
import { isPangram, validateWord } from './wordValidator';

const PANGRAM_BONUS = 7;

/**
 * חישוב ניקוד למילה:
 * - מילה בת 2 אותיות: נקודה אחת
 * - מילה ארוכה יותר: נקודה אחת לכל אות
 * - בונוס פנגרם: +7 נקודות אם המילה משתמשת בכל האותיות הזמינות
 * (ההיגיון תואם את המוסכמה המקובלת במשחקי "Spelling Bee" ואפשר לכייל בהמשך)
 */
export function calculateScore(word: string, puzzle: PuzzleLetters): number {
  const base = word.length === 2 ? 1 : word.length;
  const bonus = isPangram(word, puzzle.letters) ? PANGRAM_BONUS : 0;
  return base + bonus;
}

export function createInitialState(puzzle: PuzzleLetters): GameState {
  return {
    puzzle,
    foundWords: [],
    totalScore: 0,
    currentInput: '',
  };
}

/**
 * בונה GameState עבור שלב שכבר שיחקו בו בעבר - משחזרת FoundWord מלא
 * (כולל ניקוד ופנגרם) מתוך רשימת מחרוזות מילים בלבד ששמורות ב-AsyncStorage.
 * זה עובד כי הניקוד תמיד ניתן לחישוב מחדש מהמילה + החידה (דטרמיניסטי) -
 * אין צורך לשמור את הניקוד עצמו, רק אילו מילים נמצאו.
 */
export function restoreState(puzzle: PuzzleLetters, previouslyFoundWords: string[]): GameState {
  const foundWords: FoundWord[] = previouslyFoundWords.map((word) => ({
    word,
    score: calculateScore(word, puzzle),
    isPangram: isPangram(word, puzzle.letters),
  }));

  return {
    puzzle,
    foundWords,
    totalScore: foundWords.reduce((sum, f) => sum + f.score, 0),
    currentInput: '',
  };
}

export interface SubmitResult {
  state: GameState;
  success: boolean;
  message?: string;
}

/**
 * מנסה להגיש את המילה שהמשתמש הרכיב.
 * מחזירה מצב משחק מעודכן (state חדש, ללא מוטציה של הישן) + הודעת פידבק.
 */
export function submitWord(state: GameState, dictionary: Set<string>): SubmitResult {
  const alreadyFound = new Set(state.foundWords.map((f) => f.word));
  const result = validateWord(state.currentInput, state.puzzle, dictionary, alreadyFound);

  if (!result.valid) {
    const messages: Record<InvalidReason, string> = {
      too_short: 'המילה קצרה מדי',
      missing_required_letter: 'חסרה האות החובה',
      invalid_letters: 'יש כאן אות שלא במעגל',
      already_found: 'כבר מצאת את המילה הזו',
      not_in_dictionary: 'לא מזהה את המילה הזו',
    };
    return {
      state: { ...state, currentInput: '' },
      success: false,
      message: messages[result.reason],
    };
  }

  const word = state.currentInput.trim();
  const score = calculateScore(word, state.puzzle);
  const foundWord: FoundWord = {
    word,
    score,
    isPangram: isPangram(word, state.puzzle.letters),
  };

  return {
    state: {
      ...state,
      currentInput: '',
      foundWords: [...state.foundWords, foundWord],
      totalScore: state.totalScore + score,
    },
    success: true,
    message: foundWord.isPangram ? `פנגרם! +${score} נקודות` : `יפה! +${score} נקודות`,
  };
}
