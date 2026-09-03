import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'hebrew-word-game:settings:v1';

interface StoredSettings {
  soundEffectsEnabled: boolean;
  hapticEnabled: boolean;
}

const DEFAULT_SETTINGS: StoredSettings = {
  soundEffectsEnabled: true,
  hapticEnabled: true,
};

// מצב גלובלי בזיכרון כדי ש-sound.ts/haptics.ts יוכלו לבדוק אותו באופן
// סינכרוני בכל נגיעה, בלי לחכות לטעינה מ-AsyncStorage בכל פעם.
let currentSettings: StoredSettings = { ...DEFAULT_SETTINGS };

export function isSoundEffectsEnabled(): boolean {
  return currentSettings.soundEffectsEnabled;
}

export function isHapticEnabled(): boolean {
  return currentSettings.hapticEnabled;
}

export async function loadSettings(): Promise<StoredSettings> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      currentSettings = { ...DEFAULT_SETTINGS };
      return currentSettings;
    }
    const parsed = JSON.parse(raw) as Partial<StoredSettings>;
    currentSettings = {
      soundEffectsEnabled: parsed.soundEffectsEnabled ?? DEFAULT_SETTINGS.soundEffectsEnabled,
      hapticEnabled: parsed.hapticEnabled ?? DEFAULT_SETTINGS.hapticEnabled,
    };
    return currentSettings;
  } catch (err) {
    console.warn('נכשל בטעינת הגדרות שמורות, משתמשים בברירת מחדל:', err);
    currentSettings = { ...DEFAULT_SETTINGS };
    return currentSettings;
  }
}

export async function setSoundEffectsEnabled(enabled: boolean): Promise<void> {
  currentSettings = { ...currentSettings, soundEffectsEnabled: enabled };
  await persistSettings();
}

export async function setHapticEnabled(enabled: boolean): Promise<void> {
  currentSettings = { ...currentSettings, hapticEnabled: enabled };
  await persistSettings();
}

async function persistSettings(): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(currentSettings));
  } catch (err) {
    console.warn('נכשל בשמירת הגדרות:', err);
  }
}
