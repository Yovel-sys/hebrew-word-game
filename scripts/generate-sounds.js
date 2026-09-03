// Script חד-פעמי ליצירת קובצי WAV קטנים (סינתזה טהורה, בלי תלות
// חיצונית) לצלילי המשחק. הרצה: node scripts/generate-sounds.js
const fs = require('fs');
const path = require('path');

const SAMPLE_RATE = 44100;

function writeWav(filePath, samples) {
  const numSamples = samples.length;
  const blockAlign = 2; // 16-bit mono
  const byteRate = SAMPLE_RATE * blockAlign;
  const dataSize = numSamples * blockAlign;
  const buffer = Buffer.alloc(44 + dataSize);

  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // fmt chunk size
  buffer.writeUInt16LE(1, 20); // PCM
  buffer.writeUInt16LE(1, 22); // mono
  buffer.writeUInt32LE(SAMPLE_RATE, 24);
  buffer.writeUInt32LE(byteRate, 28);
  buffer.writeUInt16LE(blockAlign, 32);
  buffer.writeUInt16LE(16, 34); // bits per sample
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);

  for (let i = 0; i < numSamples; i++) {
    const clamped = Math.max(-1, Math.min(1, samples[i]));
    buffer.writeInt16LE(Math.round(clamped * 32767), 44 + i * 2);
  }

  fs.writeFileSync(filePath, buffer);
}

// עטיפת אנוולופ (attack/decay) כדי שהצליל לא "יקליק" בגבולות (קליק דיגיטלי לא רצוי)
function envelope(t, duration, attack, decay) {
  if (t < attack) return t / attack;
  const decayStart = duration - decay;
  if (t > decayStart) return Math.max(0, (duration - t) / decay);
  return 1;
}

function tone(freqStart, freqEnd, duration, attack, decay, wave = 'sine') {
  const n = Math.floor(SAMPLE_RATE * duration);
  const out = new Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    const freq = freqStart + (freqEnd - freqStart) * (t / duration);
    const phase = 2 * Math.PI * freq * t;
    let v;
    if (wave === 'square') {
      v = Math.sin(phase) >= 0 ? 1 : -1;
    } else {
      v = Math.sin(phase);
    }
    out[i] = v * envelope(t, duration, attack, decay);
  }
  return out;
}

function noise(duration, attack, decay) {
  const n = Math.floor(SAMPLE_RATE * duration);
  const out = new Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE;
    out[i] = (Math.random() * 2 - 1) * envelope(t, duration, attack, decay);
  }
  return out;
}

function mix(...tracks) {
  const length = Math.max(...tracks.map((track) => track.length));
  const out = new Array(length).fill(0);
  for (const track of tracks) {
    for (let i = 0; i < track.length; i++) out[i] += track[i];
  }
  return out;
}

function concat(...parts) {
  return parts.flat();
}

function silence(duration) {
  return new Array(Math.floor(SAMPLE_RATE * duration)).fill(0);
}

function scale(samples, factor) {
  return samples.map((v) => v * factor);
}

const outDir = path.join(__dirname, '..', 'assets', 'sounds');
fs.mkdirSync(outDir, { recursive: true });

// קליק לחיצה על כפתור - חד וקצר
const click = scale(tone(1200, 900, 0.045, 0.002, 0.03), 0.5);
writeWav(path.join(outDir, 'click.wav'), click);

// קליק לנגיעה באות - נקישה קצרצרה וחדה (לא "רחבה"/נמרחת כמו קודם):
// פרץ רעש ממש קצר עם דעיכה מהירה מאוד, מעורבב עם טון גבוה קצרצר,
// בעוצמה שקטה כי הוא מושמע הרבה פעמים ברצף תוך כדי גרירה
const letterClick = mix(
  scale(noise(0.008, 0.0005, 0.006), 0.13),
  scale(tone(2400, 2000, 0.006, 0.0005, 0.005), 0.08)
);
writeWav(path.join(outDir, 'letterClick.wav'), letterClick);

// צליל הצלחה - שתי תווים עולים, שמח
const correct = concat(
  scale(tone(880, 880, 0.09, 0.005, 0.05), 0.55),
  silence(0.02),
  scale(tone(1318.5, 1318.5, 0.14, 0.005, 0.09), 0.55)
);
writeWav(path.join(outDir, 'correct.wav'), correct);

// צליל שגיאה - טון נמוך ויורד, קצר ורך (סינוס, לא ריבועי, ובעוצמה נמוכה
// יותר מהצלילים האחרים כדי שלא יבלוט חזק מדי ביחס אליהם)
const incorrect = scale(tone(320, 180, 0.16, 0.006, 0.1), 0.16);
writeWav(path.join(outDir, 'incorrect.wav'), incorrect);

// צליל "מילה שכבר נמצאה" - נייטרלי, לא שלילי כמו טעות: שני "טוק" קצרים
// באותו גובה צליל (כמו הקשה חוזרת/תזכורת), שונה מהזמזום היורד של טעות
const duplicate = concat(
  scale(tone(600, 600, 0.06, 0.004, 0.045), 0.22),
  silence(0.045),
  scale(tone(600, 600, 0.06, 0.004, 0.045), 0.22)
);
writeWav(path.join(outDir, 'duplicate.wav'), duplicate);

console.log('Generated sounds in', outDir);
