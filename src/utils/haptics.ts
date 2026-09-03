import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { isHapticEnabled } from './settings';

// רטט לא נתמך בדפדפן (web) - expo-haptics זורק שגיאה שם, אז פשוט מדלגים.
const isSupported = Platform.OS !== 'web';

// רטט קליל - נגיעה באות או לחיצה על כפתור רגיל
export function tapHaptic() {
  if (!isSupported || !isHapticEnabled()) return;
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
}

// רטט הצלחה - מילה תקינה נמצאה
export function successHaptic() {
  if (!isSupported || !isHapticEnabled()) return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
}

// רטט כישלון - מילה לא תקינה או כפולה
export function errorHaptic() {
  if (!isSupported || !isHapticEnabled()) return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
}
