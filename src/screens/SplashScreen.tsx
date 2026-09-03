import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { playClickSound } from '../utils/sound';

interface Props {
  onStart: () => void;
  onOpenSettings: () => void;
}

export default function SplashScreen({ onStart, onOpenSettings }: Props) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.settingsButton}
        onPress={() => {
          playClickSound();
          onOpenSettings();
        }}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <Text style={styles.settingsIcon}>⚙️</Text>
      </TouchableOpacity>

      <View style={styles.iconCircle}>
        <Text style={styles.iconText}>🔤</Text>
      </View>

      <Text style={styles.title}>מעגל אותיות</Text>
      <Text style={styles.subtitle}>הרכיבו כמה שיותר מילים מהאותיות שבמעגל</Text>

      <TouchableOpacity
        style={styles.startButton}
        onPress={() => {
          playClickSound();
          onStart();
        }}
        activeOpacity={0.8}
      >
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
  settingsButton: {
    position: 'absolute',
    top: 56,
    left: 24,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EDE0C8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsIcon: {
    fontSize: 22,
  },
  iconCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#F4C542',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconText: {
    fontSize: 52,
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
    marginBottom: 40,
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
