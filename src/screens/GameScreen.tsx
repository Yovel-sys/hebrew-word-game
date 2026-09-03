import React, { useMemo, useRef, useState } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Modal,
  PanResponder,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { ALL_WORDS } from '../data/dictionary';
import { computeCirclePositions, Point } from '../utils/circleLayout';
import { computeLineStyle, distance } from '../utils/lineGeometry';
import { buildDictionarySet } from '../utils/wordValidator';
import { restoreState, submitWord } from '../utils/gameLogic';
import { POINTS_ICON } from '../utils/ui';
import { toFinalFormAtEnd } from '../utils/hebrewLetters';
import { errorHaptic, successHaptic, tapHaptic } from '../utils/haptics';
import {
  playClickSound,
  playCorrectSound,
  playDuplicateSound,
  playIncorrectSound,
  playLetterClickSound,
} from '../utils/sound';
import { GameState, Level } from '../types';

// גודל אזור המעגל וכל אריח אות
const CIRCLE_SIZE = 260;
const TILE_SIZE = 56;
const RADIUS = CIRCLE_SIZE / 2 - TILE_SIZE / 2;
const CENTER = { x: CIRCLE_SIZE / 2, y: CIRCLE_SIZE / 2 };
// כמה קרוב צריך האצבע להיות למרכז אות כדי ש"תיגע" בה - קצת יותר סלחני
// מרדיוס האריח עצמו, כדי שהגרירה תרגיש נוחה ולא תדרוש דיוק מושלם
const HIT_RADIUS = TILE_SIZE * 0.68;
const LINE_THICKNESS = 6;

interface SelectedTile {
  index: number;
  char: string;
  point: Point;
}

interface Props {
  level: Level;
  initialFoundWords: string[]; // מילים שנמצאו בעבר בשלב הזה (מ-AsyncStorage)
  onWordFound: (word: string, scoreGained: number) => void;
  onBack: () => void;
}

export default function GameScreen({ level, initialFoundWords, onWordFound, onBack }: Props) {
  const puzzle = useMemo(() => ({ letters: level.letters }), [level]);
  // המילון: נטען פעם אחת בעליית המסך.
  const dictionary = useMemo(() => buildDictionarySet(ALL_WORDS), []);

  const [state, setState] = useState<GameState>(() => restoreState(puzzle, initialFoundWords));
  const [feedback, setFeedback] = useState<string | null>(null);

  // דיווח על מילה שגויה - מוקאפ בלבד: לא נשלח לשום שרת, רק מציג טופס ואישור
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [reportWord, setReportWord] = useState('');
  const [reportMeaning, setReportMeaning] = useState('');

  function openReportModal() {
    tapHaptic();
    playClickSound();
    setReportSubmitted(false);
    setReportWord('');
    setReportMeaning('');
    setReportModalVisible(true);
  }

  function closeReportModal() {
    playClickSound();
    setReportModalVisible(false);
  }

  function submitReport() {
    if (!reportWord.trim()) return;
    playClickSound();
    successHaptic();
    setReportSubmitted(true);
  }
  const [selectedPath, setSelectedPath] = useState<SelectedTile[]>([]);
  const [dragPoint, setDragPoint] = useState<Point | null>(null);

  // מוחזק ב-ref (לא state) כי אנחנו קוראים אותו בתוך handlers של
  // PanResponder, ששם ה-closure עלול להחזיק ערך "ישן" של ה-state
  const selectedPathRef = useRef<SelectedTile[]>([]);
  const stateRef = useRef(state);
  stateRef.current = state;
  // האם האצבע "עזבה" את האות האחרונה שנוספה מאז שנוספה - נחוץ כדי להבחין
  // בין "עדיין נשען על אותה אות" (לא מוסיפים שוב) לבין "עזב וחזר לאותה
  // אות" (הכוונה להוסיף אות כפולה ברצף, כמו ב"עורר")
  const awayFromLastRef = useRef(true);

  // סדר האותיות כפי שמוצג במעגל - נפרד מ-puzzle.letters כי אפשר לערבב
  // אותו (כפתור הערבוב) בלי לשנות שום דבר בלוגיקת המשחק עצמה, שמתייחסת
  // לאותיות כקבוצה (סדר לא משנה לבדיקת תקינות/ניקוד).
  const [letterOrder, setLetterOrder] = useState<string[]>(() => level.letters);

  function shuffleLetters() {
    tapHaptic();
    playClickSound();
    resetSelection();
    setLetterOrder((prev) => {
      const arr = [...prev];
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    });
  }

  const positions = useMemo(
    () => computeCirclePositions(puzzle.letters.length, RADIUS, CENTER),
    [puzzle.letters.length]
  );

  const tiles: SelectedTile[] = useMemo(
    () => letterOrder.map((char, i) => ({ index: i, char, point: positions[i] })),
    [letterOrder, positions]
  );
  // ה-PanResponder נוצר פעם אחת בלבד (ראו useRef למטה) - ה-handlers שלו
  // "קפואים" על הקלוז'ר מהרינדור הראשון. tiles משתנה כשמערבבים אותיות
  // (letterOrder), אז צריך גישה דרך ref כדי שההנדלרים תמיד יראו את
  // הגרסה העדכנית, לא את זו שהייתה קיימת כשה-PanResponder נוצר.
  const tilesRef = useRef(tiles);
  tilesRef.current = tiles;

  // ערך אנימציה (scale) לכל אות במעגל - "פועם" רגע כשהאצבע נוגעת בה
  const tileScales = useRef<Animated.Value[]>([]).current;
  if (tileScales.length !== tiles.length) {
    tileScales.length = 0;
    for (let i = 0; i < tiles.length; i++) tileScales.push(new Animated.Value(1));
  }

  function pulseTile(index: number) {
    tapHaptic();
    playLetterClickSound();
    const val = tileScales[index];
    if (!val) return;
    val.setValue(1);
    Animated.sequence([
      Animated.timing(val, { toValue: 1.22, duration: 70, useNativeDriver: true }),
      Animated.timing(val, { toValue: 1, duration: 130, useNativeDriver: true }),
    ]).start();
  }

  // אנימציית סמל הפידבק (X למילה לא מזוהה, ↺ למילה שכבר נמצאה) - "פועם"
  // (גדל-קטן) ואז נעלם. שני המקרים חולקים את אותה אנימציה, רק הסמל/הצבע משתנה.
  const feedbackScale = useRef(new Animated.Value(0)).current;
  const feedbackOpacity = useRef(new Animated.Value(0)).current;
  const [symbolFeedback, setSymbolFeedback] = useState<'invalid' | 'duplicate' | null>(null);

  function triggerSymbolFeedback(kind: 'invalid' | 'duplicate') {
    setSymbolFeedback(kind);
    feedbackScale.setValue(1);
    feedbackOpacity.setValue(1);
    Animated.sequence([
      Animated.timing(feedbackScale, { toValue: 1.3, duration: 100, useNativeDriver: true }),
      Animated.timing(feedbackScale, { toValue: 1, duration: 100, useNativeDriver: true }),
      Animated.delay(120),
      Animated.timing(feedbackOpacity, { toValue: 0, duration: 150, useNativeDriver: true }),
    ]).start(() => setSymbolFeedback(null));
  }

  function findTileAt(point: Point): SelectedTile | null {
    let closest: SelectedTile | null = null;
    let closestDist = HIT_RADIUS;
    for (const tile of tilesRef.current) {
      const d = distance(point, tile.point);
      if (d < closestDist) {
        closest = tile;
        closestDist = d;
      }
    }
    return closest;
  }

  function resetSelection() {
    selectedPathRef.current = [];
    setSelectedPath([]);
    setDragPoint(null);
  }

  function finishWord() {
    const path = selectedPathRef.current;
    resetSelection();

    if (path.length < 2) return; // אות בודדת - אין מילה כזו, אין טעם להראות שגיאה

    const rawWord = path.map((t) => t.char).join('');
    const word = toFinalFormAtEnd(rawWord);
    const result = submitWord({ ...stateRef.current, currentInput: word }, dictionary);
    setState(result.state);

    if (result.success) {
      successHaptic();
      playCorrectSound();
      const newFoundWord = result.state.foundWords[result.state.foundWords.length - 1];
      setFeedback(`${newFoundWord.isPangram ? '⭐ ' : ''}+${newFoundWord.score} ${POINTS_ICON}`);
      onWordFound(newFoundWord.word, newFoundWord.score);
    } else {
      errorHaptic();
      const isDuplicate = result.reason === 'already_found';
      if (isDuplicate) {
        playDuplicateSound();
      } else {
        playIncorrectSound();
      }
      setFeedback(null);
      triggerSymbolFeedback(isDuplicate ? 'duplicate' : 'invalid');
    }
  }

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const point = { x: evt.nativeEvent.locationX, y: evt.nativeEvent.locationY };
        const tile = findTileAt(point);
        setFeedback(null);
        // מתחילים מילה חדשה - מבטלים מיד את אנימציית הסמל אם היא עדיין
        // רצה, כדי שהיא לא "תתקע" ותחסום את תצוגת המילה החדשה
        feedbackScale.stopAnimation();
        feedbackOpacity.stopAnimation();
        setSymbolFeedback(null);
        if (tile) {
          selectedPathRef.current = [tile];
          setSelectedPath([tile]);
          pulseTile(tile.index);
        } else {
          selectedPathRef.current = [];
          setSelectedPath([]);
        }
        awayFromLastRef.current = false;
        setDragPoint(point);
      },
      onPanResponderMove: (evt) => {
        const point = { x: evt.nativeEvent.locationX, y: evt.nativeEvent.locationY };
        setDragPoint(point);

        const tile = findTileAt(point);
        const path = selectedPathRef.current;
        const last = path[path.length - 1];

        if (!tile) {
          // האצבע יצאה מכל אות - מסמנים שאפשר "לחזור" לאות האחרונה בהמשך
          awayFromLastRef.current = true;
          return;
        }

        if (last && tile.index === last.index) {
          if (!awayFromLastRef.current) {
            return; // עדיין נשען על אותה אות ברצף - לא מוסיפים שוב
          }
          // האצבע עזבה את האות הזו וחזרה אליה - זו כוונה מפורשת לאות
          // כפולה ברצף (כמו ב"עורר" או "וו")
        }

        if (!last) {
          // לא התחלנו בתוך אות (למשל אצבע ירדה מחוץ למעגל) - מתחילים כאן
          selectedPathRef.current = [tile];
          setSelectedPath([tile]);
          pulseTile(tile.index);
          awayFromLastRef.current = false;
          return;
        }

        // חשוב: אין כאן "ביטול בגרירה אחורה" בכוונה. מילים אמיתיות בעברית
        // הרבה פעמים חוזרות על אותה אות (למשל "בלבל" = ב-ל-ב-ל), אז גרירה
        // חזרה לאות קודמת חייבת להוסיף אותה מחדש למילה, לא לבטל אותה.
        // אם המשתמש טעה בדרך, השחרור פשוט יגיש מילה לא תקינה והוא יתחיל
        // שוב - אין "עלות" לטעות כי אין כפתור אישור נפרד.
        const next = [...path, tile];
        selectedPathRef.current = next;
        setSelectedPath(next);
        pulseTile(tile.index);
        awayFromLastRef.current = false;
      },
      onPanResponderRelease: finishWord,
      onPanResponderTerminate: finishWord,
    })
  ).current;

  const liveWord = selectedPath.map((t) => t.char).join('');
  const selectedIndices = new Set(selectedPath.map((t) => t.index));

  return (
    <View style={styles.container}>
      <View style={styles.topSection}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => {
              tapHaptic();
              playClickSound();
              onBack();
            }}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Text style={styles.backButton}>‹ שלבים</Text>
          </TouchableOpacity>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.reportButton}
              onPress={openReportModal}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Text style={styles.reportButtonText}>🚩</Text>
            </TouchableOpacity>
            <Text style={styles.score}>{state.totalScore} {POINTS_ICON}</Text>
          </View>
        </View>
        <Text style={styles.levelLabel}>
          שלב {level.index + 1} · {state.foundWords.length}/{level.wordCount} מילים
        </Text>

        {/* תצוגת המילה תוך כדי גרירה, או הודעת פידבק אחרי שחרור.
            ה-X מוצג כשכבת-על (position: absolute) בכוונה - כדי שהופעתו
            לא תזיז שום דבר אחר במסך, לא משנה מה גודל הטקסט/האנימציה שלו. */}
        <View style={styles.inputDisplay}>
          <Text style={styles.inputText}>{!symbolFeedback ? liveWord || feedback || ' ' : ' '}</Text>
          {symbolFeedback && (
            <Animated.View
              style={[
                styles.invalidXWrap,
                { transform: [{ scale: feedbackScale }], opacity: feedbackOpacity },
              ]}
            >
              <Text
                style={[
                  styles.invalidX,
                  symbolFeedback === 'duplicate' && styles.duplicateSymbol,
                ]}
              >
                {symbolFeedback === 'duplicate' ? '↺' : '✕'}
              </Text>
            </Animated.View>
          )}
        </View>

        {/* מעגל האותיות + קווי החיבור */}
        <View
          style={[styles.circleContainer, { width: CIRCLE_SIZE, height: CIRCLE_SIZE }]}
          {...panResponder.panHandlers}
        >
          {/* קווים בין אותיות שכבר נבחרו */}
          {selectedPath.slice(1).map((tile, i) => {
            const from = selectedPath[i].point;
            const style = computeLineStyle(from, tile.point, LINE_THICKNESS);
            return <View key={`line-${i}`} style={[styles.line, style]} pointerEvents="none" />;
          })}
          {/* קו "זנב" מהאות האחרונה שנבחרה עד למיקום האצבע כרגע */}
          {selectedPath.length > 0 && dragPoint && (
            <View
              style={[
                styles.line,
                styles.trailLine,
                computeLineStyle(selectedPath[selectedPath.length - 1].point, dragPoint, LINE_THICKNESS),
              ]}
              pointerEvents="none"
            />
          )}

          {tiles.map((tile) => {
            const isSelected = selectedIndices.has(tile.index);
            return (
              <Animated.View
                key={tile.index}
                style={[
                  styles.letterTile,
                  { left: tile.point.x - TILE_SIZE / 2, top: tile.point.y - TILE_SIZE / 2 },
                  isSelected && styles.letterTileSelected,
                  { transform: [{ scale: tileScales[tile.index] }] },
                ]}
                pointerEvents="none"
              >
                <Text style={[styles.letterText, isSelected && styles.letterTextSelected]}>
                  {tile.char}
                </Text>
              </Animated.View>
            );
          })}
        </View>

        <TouchableOpacity style={styles.shuffleButton} onPress={shuffleLetters} activeOpacity={0.7}>
          <Text style={styles.shuffleButtonText}>🔀 ערבוב אותיות</Text>
        </TouchableOpacity>
      </View>

      {/* רשימת מילים שנמצאו - מוצמדת לתחתית המסך */}
      <View style={styles.foundListWrapper}>
        <ScrollView style={styles.foundList}>
          {state.foundWords.map((fw, i) => (
            <View key={i} style={styles.foundRow}>
              <Text style={styles.foundWordText}>
                {fw.word} {fw.isPangram ? '⭐' : ''}
              </Text>
              <Text style={styles.foundScoreText}>+{fw.score} {POINTS_ICON}</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      <Modal
        visible={reportModalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeReportModal}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalCard}>
            {reportSubmitted ? (
              <>
                <Text style={styles.modalTitle}>תודה! 🙏</Text>
                <Text style={styles.modalMessage}>
                  קיבלנו את הדיווח שלך ונבדוק אותו בהקדם.
                </Text>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalConfirmButton]}
                  onPress={closeReportModal}
                  activeOpacity={0.8}
                >
                  <Text style={styles.modalConfirmText}>סגירה</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.modalTitle}>דיווח על מילה שגויה</Text>
                <Text style={styles.modalMessage}>
                  ניסית מילה שאתה בטוח שהיא נכונה, אבל המשחק לא זיהה אותה? ספר
                  לנו עליה ונבדוק אותה.
                </Text>

                <Text style={styles.fieldLabel}>מה המילה?</Text>
                <TextInput
                  style={styles.input}
                  value={reportWord}
                  onChangeText={setReportWord}
                  placeholder="לדוגמה: שולחן"
                  placeholderTextColor="#B7A97E"
                  textAlign="right"
                />

                <Text style={styles.fieldLabel}>מה הפירוש שלה?</Text>
                <TextInput
                  style={[styles.input, styles.inputMultiline]}
                  value={reportMeaning}
                  onChangeText={setReportMeaning}
                  placeholder="הסבר קצר על משמעות המילה"
                  placeholderTextColor="#B7A97E"
                  textAlign="right"
                  multiline
                />

                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[
                      styles.modalButton,
                      styles.modalConfirmButton,
                      !reportWord.trim() && styles.modalButtonDisabled,
                    ]}
                    onPress={submitReport}
                    activeOpacity={0.8}
                    disabled={!reportWord.trim()}
                  >
                    <Text style={styles.modalConfirmText}>שליחה</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalCancelButton]}
                    onPress={closeReportModal}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.modalCancelText}>ביטול</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </KeyboardAvoidingView>
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
  topSection: {
    alignItems: 'center',
    paddingHorizontal: 16,
    overflow: 'visible',
  },
  header: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 16,
  },
  score: { fontSize: 20, fontWeight: '700', color: '#3A2E1F', writingDirection: 'rtl' },
  backButton: { fontSize: 16, color: '#7A6A52', writingDirection: 'rtl' },
  headerRight: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 10,
  },
  reportButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EDE0C8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reportButtonText: {
    fontSize: 15,
  },
  levelLabel: {
    fontSize: 14,
    color: '#9C8B6F',
    writingDirection: 'rtl',
    alignSelf: 'flex-end',
    marginBottom: 8,
  },
  wordCount: { fontSize: 16, color: '#7A6A52', writingDirection: 'rtl' },
  inputDisplay: {
    width: '100%',
    height: 44,
    justifyContent: 'center',
    marginBottom: 8,
    overflow: 'visible',
  },
  inputText: {
    fontSize: 30,
    fontWeight: '600',
    color: '#3A2E1F',
    writingDirection: 'rtl',
    textAlign: 'center',
  },
  circleContainer: {
    position: 'relative',
    marginVertical: 16,
  },
  shuffleButton: {
    alignSelf: 'center',
    backgroundColor: '#EDE0C8',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 18,
    marginBottom: 8,
  },
  shuffleButtonText: {
    fontSize: 14,
    color: '#5B4A32',
    writingDirection: 'rtl',
  },
  line: {
    position: 'absolute',
    height: 6,
    borderRadius: 3,
    backgroundColor: '#C9A227',
  },
  trailLine: {
    backgroundColor: '#D8C08A',
  },
  letterTile: {
    position: 'absolute',
    width: TILE_SIZE,
    height: TILE_SIZE,
    borderRadius: TILE_SIZE / 2,
    backgroundColor: '#F4C542',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
  },
  letterTileSelected: {
    backgroundColor: '#3A2E1F',
  },
  letterText: {
    fontSize: 26,
    fontWeight: '700',
    color: '#3A2E1F',
  },
  letterTextSelected: {
    color: '#F4C542',
  },
  invalidXWrap: {
    position: 'absolute',
    top: -8,
    left: 0,
    right: 0,
    bottom: -8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  invalidX: {
    fontSize: 30,
    lineHeight: 40,
    fontWeight: '800',
    color: '#C0392B',
  },
  duplicateSymbol: {
    color: '#B5651D',
  },
  foundListWrapper: {
    flex: 1,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#D8C9A8',
    marginTop: 8,
  },
  foundList: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  foundRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#D8C9A8',
  },
  foundWordText: {
    fontSize: 18,
    color: '#3A2E1F',
    writingDirection: 'rtl',
  },
  foundScoreText: {
    fontSize: 16,
    color: '#7A6A52',
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
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5B4A32',
    writingDirection: 'rtl',
    textAlign: 'right',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#F2E6C9',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E7D6AC',
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: '#3A2E1F',
    writingDirection: 'rtl',
    marginBottom: 16,
  },
  inputMultiline: {
    height: 70,
    textAlignVertical: 'top',
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
  modalButtonDisabled: {
    opacity: 0.5,
  },
  modalConfirmButton: {
    backgroundColor: '#3A2E1F',
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
