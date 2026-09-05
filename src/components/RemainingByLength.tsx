import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { FONTS } from '../utils/fonts';
import { RemainingGroup } from '../hooks/useRemainingByLength';

// ריבוע קטן שמייצג אות אחת. מספיק גדול כדי שאפשר יהיה לספור ריבועים
// במבט חטוף, ומספיק קטן כדי שהרמז לא יתחרה בגלגל על תשומת הלב.
const SQUARE_SIZE = 7;
const SQUARE_GAP = 2;

interface Props {
  groups: RemainingGroup[];
}

/**
 * רמז מינימלי: כמה מילים נשארו למצוא בכל אורך.
 * אורך המילה מיוצג בריבועים (אות = ריבוע) במקום בספרה, כדי שהשורה
 * תיקרא כ"צורת מילה" ולא כשתי מספרים זה לצד זה.
 */
export default function RemainingByLength({ groups }: Props) {
  if (groups.length === 0) return null;

  return (
    <View style={styles.container}>
      {groups.map((group) => (
        <View key={group.length} style={styles.group}>
          <View style={styles.squares}>
            {Array.from({ length: group.length }, (_, i) => (
              <View key={i} style={styles.square} />
            ))}
          </View>
          <Text style={styles.count}>×{group.remaining}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  // row-reverse: הקבוצה הראשונה (המילים הקצרות) מתחילה בימין, כמו כיוון
  // הקריאה של שאר המסך. עוטף לשורה נוספת בשלבים עם מילים ארוכות.
  container: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    alignItems: 'center',
    alignSelf: 'flex-end',
    columnGap: 10,
    rowGap: 4,
    maxWidth: '100%',
  },
  group: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 3,
  },
  squares: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: SQUARE_GAP,
  },
  square: {
    width: SQUARE_SIZE,
    height: SQUARE_SIZE,
    borderRadius: 2,
    backgroundColor: '#D8C08A',
  },
  count: {
    fontFamily: FONTS.regular,
    fontSize: 11,
    color: '#9C8B6F',
  },
});
