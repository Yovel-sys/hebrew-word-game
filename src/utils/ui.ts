import { StyleSheet } from 'react-native';

// אייקון הנקודות המשותף לכל המסכים, במקום לכתוב את המילה "נקודות" בכל מקום.
// בחרתי יהלום (💎) ולא מטבע/כוכב, כי כוכב (⭐) כבר תפוס לסימון פנגרם,
// ומטבע (🪙) פחות ברור ויזואלית בגדלים קטנים על רקע צהוב-חום של האפליקציה.
export const POINTS_ICON = '💎';

// כמה זמן הודעת האישור ("הדיווח נשלח") נשארת על המסך לפני שהיא נסגרת מעצמה.
// משותף למסך ההגדרות ולמסך המשחק כדי ששני הדיווחים יתנהגו אותו דבר.
export const CONFIRMATION_DURATION_MS = 1000;

// גלגל ההגדרות מופיע בשלושה מסכים שונים. כדי שהוא לא "יקפוץ" בין מעברי
// מסכים, המידות והמיקום מוגדרים כאן פעם אחת במקום להשתכפל בכל מסך.
export const HEADER_INSET = 16; // מרחק אופקי מקצה המסך
export const HEADER_TOP = 48; // מרחק אנכי מראש המסך

export const headerIconStyles = StyleSheet.create({
  button: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EDE0C8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 15,
  },
});
