import React, { useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

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
  const [confirmVisible, setConfirmVisible] = useState(false);

  function handleReportBug() {
    Alert.alert('דיווח על באג', 'התכונה הזו תהיה זמינה בקרוב.');
  }

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
            <Switch
              value={musicEnabled}
              onValueChange={setMusicEnabled}
              trackColor={{ false: '#D8C9A3', true: '#B99A48' }}
              thumbColor={musicEnabled ? '#3A2E1F' : '#FFF8E7'}
              ios_backgroundColor="#D8C9A3"
            />
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.rowLabel}>אפקטים קוליים</Text>
            <Switch
              value={soundEffectsEnabled}
              onValueChange={setSoundEffectsEnabled}
              trackColor={{ false: '#D8C9A3', true: '#B99A48' }}
              thumbColor={soundEffectsEnabled ? '#3A2E1F' : '#FFF8E7'}
              ios_backgroundColor="#D8C9A3"
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>משוב</Text>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>רטט (משוב הפטי)</Text>
            <Switch
              value={hapticEnabled}
              onValueChange={setHapticEnabled}
              trackColor={{ false: '#D8C9A3', true: '#B99A48' }}
              thumbColor={hapticEnabled ? '#3A2E1F' : '#FFF8E7'}
              ios_backgroundColor="#D8C9A3"
            />
          </View>
        </View>

        <Text style={styles.sectionTitle}>עזרה</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.row} onPress={handleReportBug}>
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
});
