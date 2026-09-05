import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { FONTS } from '../utils/fonts';
import { RemainingGroup } from '../hooks/useRemainingByLength';

// ריבוע קטן שמייצג אות אחת. מספיק גדול כדי שאפשר יהיה לספור ריבועים
// במבט חטוף, ומספיק קטן כדי שהרמז לא יתחרה בגלגל על תשומת הלב.
const SQUARE_SIZE = 6;
const SQUARE_GAP = 2;

interface Props {
  groups: RemainingGroup[];
}

/**
 * רמז מינימלי: כמה מילים נשארו למצוא בכל אורך.
 * אורך המילה מיוצג בריבועים (אות = ריבוע) במקום בספרה, כדי שהשורה
 * תיקרא כ"צורת מילה" ולא כשני מספרים זה לצד זה.
 */
export default function RemainingByLength({ groups }: Props) {
  if (groups.length === 0) return null;

  // כל שורות הריבועים מקבלות את הרוחב של השורה הארוכה ביותר, כך שעמודת
  // ה-×N מיושרת לאורך כל הבלוק במקום "לקפוץ" פנימה בכל שורה קצרה.
  const maxLength = Math.max(...groups.map((g) => g.length));
  const squaresWidth = maxLength * SQUARE_SIZE + (maxLength - 1) * SQUARE_GAP;

  return (
    <View style={styles.container}>
      {groups.map((group) => (
        <View key={group.length} style={styles.group}>
          <View style={[styles.squares, { width: squaresWidth }]}>
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
  // עמודה: שורה אחת לכל אורך מילה, מהקצרה למעלה לארוכה למטה.
  // הבלוק כולו נצמד לימין, כמו כיוון הקריאה של שאר המסך.
  container: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
    rowGap: 3,
  },
  group: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 4,
  },
  // row-reverse כאן מצמיד את הריבועים לימין בתוך הרוחב הקבוע, כך
  // שכל השורות מתחילות מאותו קו ימני.
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
    fontSize: 10,
    lineHeight: 12,
    color: '#9C8B6F',
  },
});
