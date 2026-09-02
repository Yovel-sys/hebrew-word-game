import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Props {
  onBack: () => void;
}

// TODO: זה שלד בלבד - הבקרות עצמן (מוזיקה/אפקטים/רטט/גודל פונט) יתווספו
// בפעימה הבאה. כרגע יש רק ניווט כדי שכפתור ההגדרות במסך הבית לא יהיה "מת".
export default function SettingsScreen({ onBack }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Text style={styles.backButton}>‹ חזרה</Text>
        </TouchableOpacity>
        <Text style={styles.title}>הגדרות</Text>
      </View>
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
});
