import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'hebrew-word-game:hasSeenExplanation:v1';

export async function hasSeenExplanation(): Promise<boolean> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw === 'true';
  } catch {
    return false;
  }
}

export async function markExplanationSeen(): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, 'true');
  } catch {
    // לא קריטי אם זה נכשל - במקרה הגרוע המשתמש יראה את מסך ההסבר שוב בפעם הבאה
  }
}
