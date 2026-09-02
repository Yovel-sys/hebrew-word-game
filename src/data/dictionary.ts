import wordsData from './words.json';
import puzzlesData from './puzzles.json';
import { PuzzleLetters } from '../types';

export const ALL_WORDS: string[] = wordsData as string[];

export interface CuratedPuzzle {
  letters: string[];
  pangramWord: string;
  wordCount: number;
  sampleWords: string[];
}

export const CURATED_PUZZLES: CuratedPuzzle[] = puzzlesData as CuratedPuzzle[];

/**
 * בוחרת חידה אקראית מתוך רשימת החידות המוכנות מראש.
 * (החידות נוצרו מראש ע"י scripts/generateDictionary.ts, כדי לא לחשב
 * את זה על המכשיר בכל פעם - זה חישוב כבד יחסית על 128 אלף מילים)
 */
export function pickRandomPuzzle(): PuzzleLetters {
  const puzzle = CURATED_PUZZLES[Math.floor(Math.random() * CURATED_PUZZLES.length)];
  return { letters: puzzle.letters };
}
