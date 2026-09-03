import React, { useEffect, useRef, useState } from 'react';
import { Animated, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Props {
  onBack: () => void;
  onResetProgress: () => void;
}

interface ToggleProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
}

const TOGGLE_TRAVEL = 20; // מרחק ההחלקה של הכפתור בפיקסלים: רוחב המסילה (50) פחות הכפתור (24) פחות הריפוד משני הצדדים (3+3)

// מתג מותאם אישית במקום ה-Switch המובנה של react-native: על אנדרואיד/web
// ה-Switch המובנה מתעלם לפעמים מ-trackColor ומציג את צבע ה-accent הירוק
// של המערכת. הגרסה הזו בנויה מ-Animated.View כדי גם לשלוט בצבעים וגם
// להחליק את הכפתור בין המצבים במקום לקפוץ ביניהם.
function Toggle({ value, onValueChange }: ToggleProps) {
  const anim = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: value ? 1 : 0,
      duration: 180,
      useNativeDriver: false,
    }).start();
  }, [value, anim]);

  const trackBackground = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#E7D6AC', '#F4C542'],
  });
  const thumbBackground = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#FFF8E7', '#3A2E1F'],
  });
  const translateX = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, TOGGLE_TRAVEL],
  });

  return (
    <TouchableOpacity activeOpacity={0.8} onPress={() => onValueChange(!value)}>
      <Animated.View style={[styles.toggleTrack, { backgroundColor: trackBackground }]}>
        <Animated.View
          style={[styles.toggleThumb, { backgroundColor: thumbBackground, transform: [{ translateX }] }]}
        />
      </Animated.View>
    </TouchableOpacity>
  );
}

// מוקאפ בלבד: הבקרות (מוזיקה/אפקטים/רטט) שומרות מצב מקומי במסך הזה כדי
// שהתצוגה תגיב, אבל לא מחוברות בפועל לניגון סאונד/רטט ולא נשמרות ב-AsyncStorage.
export default function SettingsScreen({ onBack, onResetProgress }: Props) {
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [soundEffectsEnabled, setSoundEffectsEnabled] = useState(true);
  const [hapticEnabled, setHapticEnabled] = useState(true);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [comingSoonVisible, setComingSoonVisible] = useState(false);

  function handleConfirmReset() {
    setConfirmVisible(false);
    onResetProgress();
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Text style={styles.backButton}>‹ חזרה</Text>
        </TouchableOpacity>
        <Text style={styles.title}>הגדרות</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>סאונד</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>מוזיקת רקע</Text>
            <Toggle value={musicEnabled} onValueChange={setMusicEnabled} />
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.rowLabel}>אפקטים קוליים</Text>
            <Toggle value={soundEffectsEnabled} onValueChange={setSoundEffectsEnabled} />
          </View>
        </View>

        <Text style={styles.sectionTitle}>משוב</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>רטט (משוב הפטי)</Text>
            <Toggle value={hapticEnabled} onValueChange={setHapticEnabled} />
          </View>
        </View>

        <Text style={styles.sectionTitle}>עזרה</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.row} onPress={() => setComingSoonVisible(true)}>
            <Text style={styles.rowLabel}>דיווח על באג</Text>
            <Text style={styles.chevron}>‹</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.dangerButton}
          onPress={() => setConfirmVisible(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.dangerButtonText}>מחיקת התקדמות</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={confirmVisible} transparent animationType="fade" onRequestClose={() => setConfirmVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>מחיקת התקדמות</Text>
            <Text style={styles.modalMessage}>
              האם אתם בטוחים? הפעולה תמחק את כל הניקוד והמילים שנמצאו, ולא ניתן לבטל אותה.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalConfirmButton]}
                onPress={handleConfirmReset}
                activeOpacity={0.8}
              >
                <Text style={styles.modalConfirmText}>כן, למחוק</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancelButton]}
                onPress={() => setConfirmVisible(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.modalCancelText}>לא</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={comingSoonVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setComingSoonVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setComingSoonVisible(false)}
        >
          <View style={styles.comingSoonCard}>
            <Text style={styles.comingSoonText}>בקרוב</Text>
          </View>
        </TouchableOpacity>
      </Modal>
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
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
    backgroundColor: '#F2E6C9',
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E7D6AC',
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
    color: '#9C8A66',
  },
  divider: {
    height: 1,
    backgroundColor: '#E7D6AC',
  },
  toggleTrack: {
    width: 50,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  dangerButton: {
    marginTop: 32,
    backgroundColor: '#D64545',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  dangerButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF8E7',
    writingDirection: 'rtl',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(58, 46, 31, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  modalCard: {
    backgroundColor: '#FFF8E7',
    borderRadius: 20,
    padding: 24,
    width: '100%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#3A2E1F',
    writingDirection: 'rtl',
    textAlign: 'center',
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 14,
    color: '#7A6A52',
    writingDirection: 'rtl',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  modalButtons: {
    flexDirection: 'row-reverse',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalConfirmButton: {
    backgroundColor: '#D64545',
  },
  modalConfirmText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFF8E7',
    writingDirection: 'rtl',
  },
  modalCancelButton: {
    backgroundColor: '#EDE0C8',
  },
  modalCancelText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#3A2E1F',
    writingDirection: 'rtl',
  },
  comingSoonCard: {
    backgroundColor: '#FFF8E7',
    borderRadius: 20,
    paddingVertical: 28,
    paddingHorizontal: 40,
  },
  comingSoonText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#3A2E1F',
    writingDirection: 'rtl',
    textAlign: 'center',
  },
});
