import React, { useState } from 'react';
import { Alert, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

interface Props {
  onBack: () => void;
  onResetProgress: () => void;
}

// מוקאפ בלבד: הבקרות (מוזיקה/אפקטים/רטט) שומרות מצב מקומי במסך הזה כדי
// שהתצוגה תגיב, אבל לא מחוברות בפועל לניגון סאונד/רטט ולא נשמרות ב-AsyncStorage.
export default function SettingsScreen({ onBack, onResetProgress }: Props) {
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [soundEffectsEnabled, setSoundEffectsEnabled] = useState(true);
  const [hapticEnabled, setHapticEnabled] = useState(true);

  function handleReportBug() {
    Alert.alert('דיווח על באג', 'התכונה הזו תהיה זמינה בקרוב.');
  }

  function handleResetPress() {
    Alert.alert(
      'מחיקת התקדמות',
      'האם אתם בטוחים? הפעולה תמחק את כל הניקוד והמילים שנמצאו, ולא ניתן לבטל אותה.',
      [
        { text: 'ביטול', style: 'cancel' },
        { text: 'מחיקה', style: 'destructive', onPress: onResetProgress },
      ],
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Text style={styles.backButton}>‹ חזרה</Text>
        </TouchableOpacity>
        <Text style={styles.title}>הגדרות</Text>
      </View>

      <Text style={styles.sectionTitle}>סאונד</Text>
      <View style={styles.card}>
        <View style={styles.row}>
          <Switch value={musicEnabled} onValueChange={setMusicEnabled} />
          <Text style={styles.rowLabel}>מוזיקת רקע</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.row}>
          <Switch value={soundEffectsEnabled} onValueChange={setSoundEffectsEnabled} />
          <Text style={styles.rowLabel}>אפקטים קוליים</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>משוב</Text>
      <View style={styles.card}>
        <View style={styles.row}>
          <Switch value={hapticEnabled} onValueChange={setHapticEnabled} />
          <Text style={styles.rowLabel}>רטט (משוב הפטי)</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>עזרה</Text>
      <View style={styles.card}>
        <TouchableOpacity style={styles.row} onPress={handleReportBug}>
          <Text style={styles.chevron}>‹</Text>
          <Text style={styles.rowLabel}>דיווח על באג</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.dangerButton} onPress={handleResetPress}>
        <Text style={styles.dangerButtonText}>מחיקת התקדמות</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8E7',
    paddingTop: 48,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#3A2E1F',
    writingDirection: 'rtl',
  },
  backButton: {
    fontSize: 16,
    color: '#7A6A52',
    writingDirection: 'rtl',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#7A6A52',
    writingDirection: 'rtl',
    textAlign: 'right',
    marginTop: 28,
    marginBottom: 10,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
  },
  row: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  rowLabel: {
    fontSize: 16,
    color: '#3A2E1F',
    writingDirection: 'rtl',
  },
  chevron: {
    fontSize: 18,
    color: '#B8A98A',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0E6D2',
  },
  dangerButton: {
    marginTop: 32,
    borderWidth: 1.5,
    borderColor: '#D64545',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  dangerButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#D64545',
    writingDirection: 'rtl',
  },
});
