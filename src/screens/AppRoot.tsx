import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Level, StoredProgress } from '../types';
import { LEVELS } from '../data/levels';
import { loadProgress, saveProgress, addFoundWordToProgress, getFoundWordsForLevel } from '../utils/progress';
import SplashScreen from './SplashScreen';
import LevelSelectScreen from './LevelSelectScreen';
import GameScreen from './GameScreen';

type Screen = { name: 'splash' } | { name: 'levels' } | { name: 'game'; level: Level };

export default function AppRoot() {
  const [progress, setProgress] = useState<StoredProgress | null>(null);
  const [screen, setScreen] = useState<Screen>({ name: 'splash' });

  useEffect(() => {
    loadProgress().then(setProgress);
  }, []);

  if (screen.name === 'splash') {
    // מסך הפתיחה מוצג מיד, בלי לחכות לטעינת AsyncStorage - אין בו
    // תלות בהתקדמות שמורה, אז אין סיבה להשהות אותו.
    return <SplashScreen onStart={() => setScreen({ name: 'levels' })} />;
  }

  if (!progress) {
    // טעינת ההתקדמות מ-AsyncStorage היא אסינכרונית - מסך המתנה קצרצר
    // עד שהיא מסתיימת, כדי לא להבזיק "0 נקודות" לפני שהנתון האמיתי נטען
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#3A2E1F" />
      </View>
    );
  }

  function handleWordFound(levelIndex: number, word: string, scoreGained: number) {
    setProgress((prev) => {
      if (!prev) return prev;
      const next = addFoundWordToProgress(prev, levelIndex, word, scoreGained);
      saveProgress(next); // לא מחכים (fire-and-forget) - ה-UI כבר התעדכן אופטימית
      return next;
    });
  }

  if (screen.name === 'game') {
    const level = screen.level;
    return (
      <GameScreen
        // ה-key מכריח מחדש (remount) כשעוברים בין שלבים שונים, כדי שה-state
        // הפנימי של GameScreen (המילה שנבנית, המעגל וכו') יתאפס נקי
        key={level.index}
        level={level}
        initialFoundWords={getFoundWordsForLevel(progress, level.index)}
        onWordFound={(word, score) => handleWordFound(level.index, word, score)}
        onBack={() => setScreen({ name: 'levels' })}
      />
    );
  }

  return (
    <LevelSelectScreen
      levels={LEVELS}
      progress={progress}
      onSelectLevel={(level) => setScreen({ name: 'game', level })}
      onBackToSplash={() => setScreen({ name: 'splash' })}
    />
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF8E7',
  },
});
