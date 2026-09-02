import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Level, StoredProgress } from '../types';
import { getFoundWordsForLevel } from '../utils/progress';
import { isLevelUnlocked } from '../data/levels';
import { POINTS_ICON } from '../utils/ui';

interface Props {
  levels: Level[];
  progress: StoredProgress;
  onSelectLevel: (level: Level) => void;
  onBackToSplash: () => void;
}

export default function LevelSelectScreen({ levels, progress, onSelectLevel, onBackToSplash }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBackToSplash} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Text style={styles.homeButton}>🏠</Text>
        </TouchableOpacity>
        <Text style={styles.title}>שלבים</Text>
        <Text style={styles.totalScore}>
          {progress.totalScore} {POINTS_ICON}
        </Text>
      </View>

      <FlatList
        data={levels}
        keyExtractor={(item) => String(item.index)}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const unlocked = isLevelUnlocked(item, progress.totalScore);
          const foundCount = getFoundWordsForLevel(progress, item.index).length;
          const completed = foundCount >= item.wordCount;

          if (!unlocked) {
            // כרטיס נעול: תצוגה ממורכזת - מנעול באמצע, ומתחתיו רק
            // המספר הנדרש + אייקון הנקודות. בלי "דורש X נקודות".
            return (
              <TouchableOpacity style={[styles.card, styles.cardLocked]} disabled activeOpacity={1}>
                <Text style={styles.lockedLevelLabel}>שלב {item.index + 1}</Text>
                <Text style={styles.lockIconCentered}>🔒</Text>
                <Text style={styles.lockedCost}>
                  {item.requiredScore} {POINTS_ICON}
                </Text>
              </TouchableOpacity>
            );
          }

          return (
            <TouchableOpacity
              style={styles.card}
              onPress={() => onSelectLevel(item)}
              activeOpacity={0.7}
            >
              <View style={styles.cardRight}>
                <Text style={styles.levelNumber}>שלב {item.index + 1}</Text>
                <View style={styles.letterRow}>
                  {item.letters.map((char, i) => (
                    <View key={i} style={styles.letterBadge}>
                      <Text style={styles.letterBadgeText}>{char}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <View style={styles.cardLeft}>
                {completed && <Text style={styles.completedBadge}>⭐</Text>}
                <Text style={styles.progressText}>
                  {foundCount}/{item.wordCount}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8E7',
    paddingTop: 48,
  },
  header: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#3A2E1F',
    writingDirection: 'rtl',
  },
  totalScore: {
    fontSize: 16,
    color: '#7A6A52',
    writingDirection: 'rtl',
  },
  homeButton: {
    fontSize: 22,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  card: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F4C542',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginBottom: 10,
    minHeight: 76,
  },
  cardLocked: {
    backgroundColor: '#EDE0C8',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardRight: {
    alignItems: 'flex-end',
  },
  cardLeft: {
    alignItems: 'flex-end',
    minWidth: 48,
  },
  levelNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#3A2E1F',
    writingDirection: 'rtl',
  },
  letterRow: {
    flexDirection: 'row-reverse',
    marginTop: 6,
    gap: 6,
  },
  letterBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFF8E7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  letterBadgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3A2E1F',
  },
  lockedLevelLabel: {
    fontSize: 13,
    color: '#9C8B6F',
    writingDirection: 'rtl',
    marginBottom: 4,
  },
  lockIconCentered: {
    fontSize: 22,
    marginBottom: 4,
  },
  lockedCost: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9C8B6F',
    writingDirection: 'rtl',
  },
  progressText: {
    fontSize: 14,
    color: '#5B4A32',
    fontWeight: '600',
  },
  completedBadge: {
    fontSize: 16,
    marginBottom: 2,
  },
});
