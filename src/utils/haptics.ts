import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

// רטט לא נתמך בדפדפן (web) - expo-haptics זורק שגיאה שם, אז פשוט מדלגים.
const isSupported = Platform.OS !== 'web';

// רטט קליל - נגיעה באות או לחיצה על כפתור רגיל
export function tapHaptic() {
  if (!isSupported) return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
}

// רטט הצלחה - מילה תקינה נמצאה
export function successHaptic() {
  if (!isSupported) return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
}

// רטט כישלון - מילה לא תקינה או כפולה
export function errorHaptic() {
  if (!isSupported) return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
}
