import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { tapHaptic } from '../utils/haptics';
import { playClickSound } from '../utils/sound';

interface Props {
  onDone: () => void;
}

export default function ExplanationScreen({ onDone }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>איך משחקים</Text>

      <View style={styles.instructionBox}>
        <Text style={styles.instructionText}>
          🔤 גררו אצבע בין האותיות במעגל בלי להרים, כדי לבנות מילה.
        </Text>
        <Text style={styles.instructionText}>
          ✋ ההגשה קורית אוטומטית ברגע שמרימים את האצבע - אין כפתור אישור.
        </Text>
        <Text style={styles.instructionText}>
          💎 כל מילה שווה נקודות לפי אורכה, ובונוס גדול למילה שמשתמשת
          בכל האותיות במעגל.
        </Text>
      </View>

      <TouchableOpacity
        style={styles.doneButton}
        onPress={() => {
          tapHaptic();
          playClickSound();
          onDone();
        }}
        activeOpacity={0.8}
      >
        <Text style={styles.doneButtonText}>הבנתי, בואו נתחיל</Text>
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
    fontSize: 26,
    fontWeight: '800',
    color: '#3A2E1F',
    writingDirection: 'rtl',
    marginBottom: 20,
  },
  instructionBox: {
    backgroundColor: '#F4E9D0',
    borderRadius: 16,
    padding: 18,
    marginBottom: 36,
    gap: 14,
    width: '100%',
  },
  instructionText: {
    fontSize: 15,
    color: '#5B4A32',
    writingDirection: 'rtl',
    textAlign: 'right',
    lineHeight: 21,
  },
  doneButton: {
    backgroundColor: '#3A2E1F',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 28,
  },
  doneButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF8E7',
    writingDirection: 'rtl',
  },
});
