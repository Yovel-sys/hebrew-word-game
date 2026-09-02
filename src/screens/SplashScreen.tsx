import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Props {
  onStart: () => void;
}

// מסך פתיחה בסיסי - placeholder. עדיין לא הוחלט מה בדיוק יהיה כאן
// (לוגו? אנימציה? הסבר קצר על המשחק?) - אבל יש כאן מסגרת מוכנה שקל
// להרחיב: רק צריך להוסיף תוכן בתוך containerה, הכפתור כבר מחובר לניווט.
export default function SplashScreen({ onStart }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>מעגל אותיות</Text>
      <Text style={styles.subtitle}>הרכיבו כמה שיותר מילים מהאותיות שבמעגל</Text>

      <View style={styles.instructionBox}>
        <Text style={styles.instructionText}>
          גררו אצבע בין האותיות בלי להרים כדי לבנות מילה - ההגשה קורית
          אוטומטית ברגע שמרימים.
        </Text>
        <Text style={styles.instructionText}>
          אפשר לחזור על אותה אות יותר מפעם אחת באותה מילה - פשוט גררו
          אליה שוב (גם אם זה אומר לחזור אחורה בנתיב).
        </Text>
      </View>

      <TouchableOpacity style={styles.startButton} onPress={onStart} activeOpacity={0.8}>
        <Text style={styles.startButtonText}>בואו נתחיל</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8E7',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#3A2E1F',
    writingDirection: 'rtl',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#7A6A52',
    writingDirection: 'rtl',
    textAlign: 'center',
    marginBottom: 24,
  },
  instructionBox: {
    backgroundColor: '#F4E9D0',
    borderRadius: 16,
    padding: 16,
    marginBottom: 40,
    gap: 10,
  },
  instructionText: {
    fontSize: 14,
    color: '#5B4A32',
    writingDirection: 'rtl',
    textAlign: 'right',
    lineHeight: 20,
  },
  startButton: {
    backgroundColor: '#3A2E1F',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 28,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF8E7',
    writingDirection: 'rtl',
  },
});
