import { AudioPlayer, createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import { isSoundEffectsEnabled } from './settings';

// צלילי המשחק: קליק לנגיעה באות/לחיצה על כפתור, וצליל הצלחה/שגיאה בהגשת מילה.
const SOUND_FILES = {
  click: require('../../assets/sounds/click.wav'),
  letterClick: require('../../assets/sounds/letterClick.wav'),
  correct: require('../../assets/sounds/correct.wav'),
  incorrect: require('../../assets/sounds/incorrect.wav'),
  duplicate: require('../../assets/sounds/duplicate.wav'),
} as const;

type SoundName = keyof typeof SOUND_FILES;

// שחקן אחד לכל צליל, נטען פעם אחת ומשומש חוזר (seekTo + play) בכל הפעלה,
// כדי שלא ניצור נגן חדש (ועיכוב טעינה) בכל נגיעה באות.
const players: Partial<Record<SoundName, AudioPlayer>> = {};
let audioModeRequested = false;

function getPlayer(name: SoundName): AudioPlayer {
  let player = players[name];
  if (!player) {
    player = createAudioPlayer(SOUND_FILES[name]);
    players[name] = player;
  }
  return player;
}

function ensureAudioMode() {
  if (audioModeRequested) return;
  audioModeRequested = true;
  // מאפשר ניגון גם כשהמכשיר במצב שקט (חשוב לצלילי משחק קטנים)
  setAudioModeAsync({ playsInSilentMode: true }).catch(() => {});
}

function play(name: SoundName) {
  if (!isSoundEffectsEnabled()) return;
  ensureAudioMode();
  try {
    const player = getPlayer(name);
    player.seekTo(0).catch(() => {});
    player.play();
  } catch {
    // אם הניגון נכשל (למשל פלטפורמה ללא תמיכה) - לא מפילים את המשחק בגלל זה
  }
}

export function playClickSound() {
  play('click');
}

export function playLetterClickSound() {
  play('letterClick');
}

export function playCorrectSound() {
  play('correct');
}

export function playIncorrectSound() {
  play('incorrect');
}

export function playDuplicateSound() {
  play('duplicate');
}
