import { getPersonality, getBotProfile, Personality, BotProfile } from './config';
import { Tone } from '@jack-bot/shared-types'

const intents: Record<string, RegExp[]> = {
  changeDetection: [/onpush/i, /change\s*detec/i],
  rxjs: [/rxjs/i, /\bmergeMap|switchMap|forkJoin|subject|behavior/i],
  forms: [/reactive\s*forms?/i, /\bform(control|group|builder)\b/i],
  routing: [/router|routing|lazy\s*load/i],
  performance: [/perf|optimi|trackBy|memo/i],
  material: [/angular\s*material|mat-/i],
  general: [/angular/i]
};

const tips: Record<keyof typeof intents, string[]> = {
  changeDetection: [
    'נסה OnPush + async pipe; הימנע מ-subscribe ידני היכן שאפשר.',
    'הוסף trackBy לרשימות ושמור על Immutable Data.',
    'Signals בפשטות במקום Subject כשאין צורך בריבוי מנ订ים.',
    'בדיקה: console.time סביב אזור בעייתי + ChangeDetection היעילי.',
    'אל תעשה bind של פונקציות כבדות ישירות לתבנית.'
  ],
  rxjs: [
    'החלף nested subscribe ב-switchMap/mergeMap; נהל שגיאות עם catchError.',
    'shareReplay(1) לשיתוף תוצאה בלי להריץ בקשות מיותרות.',
    'בטל מנויים עם takeUntil(destroyRef) במקום לשמור ידנית.',
    'exhaustMap לשאלות “לחיץ פעם אחת” כדי למנוע spam קליקים.',
    'finalize לניקוי סטייט “loading”.'
  ],
  forms: [
    'Reactive Forms + ולידציות; פצל טפסים גדולים לקומפוננטות.',
    'valueChanges עם distinctUntilChanged להפחתת רינדורים.',
    'AsyncValidator לבדיקות שרת; אל תדחוף ל-onSubmit בלבד.',
    'ControlValueAccessor לרכיבים מותאמים – שומר אחידות.',
    'עדכן validity עם updateValueAndValidity כשמשנים מבנה דינמי.'
  ],
  routing: [
    'Lazy-load למסכים כבדים; שקול canMatch לנתיבים מותנים.',
    'Resolver לטעינות קריטיות לפני ניווט; שאר הנתונים אחרי.',
    'PreloadingStrategy חכם למסכים פופולריים.',
    'routerLinkActiveOptions="{ exact: true }" לניווט נקי.',
    'Standalone components ב-loadComponent מקלים על תחזוקה.'
  ],
  performance: [
    'מדוד עם DevTools; OnPush, trackBy, ו-pure pipes עוזרים.',
    'CDK VirtualScroll לרשימות ארוכות.',
    'נקה listeners/intervals ב-destroy כדי למנוע דליפות.',
    'בדוק גודל bundle ו-tree-shaking של ספריות.',
    'חשב תצוגות יקרות עם computed() ושמור תוצאות.'
  ],
  material: [
    'Theme פשוט, טיפוגרפיה עקבית, וניגודיות טובה.',
    'Density קומפקטי לטפסים כבדים (הקטנת מרווחים).',
    'טען אייקונים דרך MatIconRegistry כדי לחסוך רשת מיותרת.',
    'שמור על labels/aria בטפסים – נגישות ותיעוד עצמי.',
    'הימנע מ-debounce ארוך על כניסות חיוניות, זה מרגיש איטי.'
  ],
  general: [
    'בדוק גרסת Angular ושמור עקביות Standalone/Modules.',
    'Signals על state פשוט, RxJS כשיש זרמים/side-effects.',
    'שמור על strict במפרט TypeScript; זה מציל באגים.',
    'אל תגזים בארכיטקטורה לפני שיש צורך אמיתי.',
    'שים דגש על DX: lint, format, ו-scripts קצרים.'
  ]
};

const openingsTone: Record<Tone, string[]> = {
  funny: [
    "שמע, יש לי רעיון נדיר:",
    "היה לי פעם קטע מצחיק שקשור לזה:",
    "טיפ זהב שלא תשכח לעולם:",
    "חכם סיני זקן פעם אמר לי..."
  ],
  serious: [
    "ניגש לעניין:",
    "בקצרה ולעניין:",
    "כך נהוג לעשות:",
    "ההמלצה המקצועית:"
  ],
  motivational: [
    "יאללה, עושים סדר:",
    "בוא נקדם את זה צעד:",
    "קדימה לתכלס:",
    "אתה בכיוון, הנה טיפ:"
  ],
  concise:  [
    'בקצרה:',
    'אמלק:',
    'שורה תחתונה:',
    'זריז:'
  ],
  default: [
    "אז ככה:",
    "הנה הכיוון שלי:",
    "רעיון קטן:",
    "כך הייתי ניגש:"
  ]
};

const listClosers = ['תגיד אם זה עוזר.', 'נמשיך משם אם צריך.', 'עדכן איך הולך.', 'אפשר לחדד עוד.'];

function applyPersonality(line: string, p: Personality, opts?: { addOpener?: boolean }) {
  let out = line.trim();

  if (opts?.addOpener !== false && p.tone !== 'concise' && chance(0.7)) {
    out = `${pick(openingsTone[p.tone])} ${out}`;
  } else if (p.tone === 'concise') {
    const first = out.split(/[.!?]/)[0] || out;
    out = `${pick(openingsTone.concise)} ${first}.`;
  }

  if (p.emoji && chance(0.6)) out += ' 🙂';

  if (p.tone !== 'concise' && chance(0.4)) out += ' ' + pick(listClosers);

  return out;
}

export function buildReply(q: string, personality: Personality): string | null {
  const key = (Object.keys(intents) as string[])
    .find(k => intents[k].some(rx => rx.test(q)));
  return key ? applyPersonality(pick(tips[key]), personality, { addOpener: true }) : null;
}

export function welcome(profile: BotProfile, personality: Personality): string {
  const base = `היי, אני ${profile.name}. שאל כל דבר על Angular ונתחיל.`;
  // לפתיחה לא נוסיף opener, רק התאמה לטון/אימוג׳י
  return applyPersonality(base, personality, { addOpener: false });
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function chance(p: number) {
  return Math.random() < p;
}
