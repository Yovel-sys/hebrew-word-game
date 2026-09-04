import Constants from 'expo-constants';
import { Platform } from 'react-native';

const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit';

// זמן המתנה מקסימלי לתגובה מהשרת. בלי זה בקשה תקועה תשאיר את הטופס
// במצב "שולח..." לנצח.
const REQUEST_TIMEOUT_MS = 15000;

export interface Web3FormsResult {
  success: boolean;
  /** הודעה בעברית שאפשר להציג למשתמש כשהשליחה נכשלה */
  message?: string;
}

/**
 * שדות נוספים שנשלחים יחד עם הטופס. Web3Forms שולח כל מפתח כשורה במייל,
 * ולכן שמות המפתחות הם מה שיופיע בגוף ההודעה.
 */
export type Web3FormsFields = Record<string, string>;

function getAccessKey(): string {
  const fromConfig = Constants.expoConfig?.extra?.web3formsAccessKey;
  if (typeof fromConfig === 'string' && fromConfig.length > 0) {
    return fromConfig;
  }
  // גיבוי: משתנה סביבה עם קידומת EXPO_PUBLIC_ מוטמע בבנדל בזמן הבנייה.
  return process.env.EXPO_PUBLIC_WEB3FORMS_ACCESS_KEY ?? '';
}

/** מידע על הסביבה שמצורף לכל דיווח, כדי שיהיה אפשר לשחזר את הבאג */
function deviceContext(): Web3FormsFields {
  return {
    פלטפורמה: `${Platform.OS} ${String(Platform.Version)}`,
    'גרסת אפליקציה': Constants.expoConfig?.version ?? 'לא ידוע',
  };
}

/**
 * שולח טופס ל-Web3Forms. הפונקציה לא זורקת שגיאות - היא תמיד מחזירה תוצאה,
 * כך שמסכי ה-UI יכולים פשוט להציג הודעה מתאימה.
 *
 * @param fromName שם השולח שיוצג בתיבת הדואר, לפי סוג הדיווח
 */
export async function submitToWeb3Forms(
  subject: string,
  fromName: string,
  fields: Web3FormsFields,
): Promise<Web3FormsResult> {
  const accessKey = getAccessKey();
  if (!accessKey) {
    return { success: false, message: 'שליחת דיווחים אינה מוגדרת כרגע. נסו שוב מאוחר יותר.' };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(WEB3FORMS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        access_key: accessKey,
        subject,
        // שם השולח שמופיע בתיבת הדואר. שונה לכל סוג דיווח כדי שאפשר יהיה
        // לסנן ולמיין את שני סוגי הפניות בלי לפתוח אותן.
        from_name: fromName,
        // מלכודת ספאם של Web3Forms: אם השדה מלא, הפנייה נזרקת.
        botcheck: '',
        ...deviceContext(),
        ...fields,
      }),
      signal: controller.signal,
    });

    const data: unknown = await response.json().catch(() => null);
    const succeeded =
      response.ok &&
      typeof data === 'object' &&
      data !== null &&
      (data as { success?: boolean }).success === true;

    if (succeeded) {
      return { success: true };
    }

    return { success: false, message: 'השליחה נכשלה. בדקו את החיבור לאינטרנט ונסו שוב.' };
  } catch {
    return { success: false, message: 'השליחה נכשלה. בדקו את החיבור לאינטרנט ונסו שוב.' };
  } finally {
    clearTimeout(timeout);
  }
}
