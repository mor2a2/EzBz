# EzBz — מדריך מלא לפיתוח

## מה זה EzBz
אפליקציה Web למדריכי NLP המלווים קבוצות נוער (עד 3) בבניית עסק קטן עצמאי.
מור היא רואת חשבון שבונה את הפלטפורמה — המדריכים הם גם לקוחות הרו"ח שלה.

## סטאק טכנולוגי
- **Frontend + Backend:** Next.js 16 (App Router, ללא TypeScript, עם Tailwind CSS)
- **Database + Auth:** Supabase (PostgreSQL + Row Level Security)
- **Hosting:** Vercel
- **Files:** Cloudinary
- **Messaging:** Twilio + WhatsApp Business API
- **Language:** עברית מלאה, RTL

---

## ארכיטקטורת שכבות

### שכבה A — רו"ח (מוכנה לקידוד)
ממשק מור לניהול לקוחות (מדריכים), מסמכים, מוסדות ודוחות.

### שכבה B — מדריך (מאופיין)
ממשק המדריך לניהול קבוצות נוער, קלנדר, כספים.

### שכבה C — שיווק (טרם אופיין)
פרופיל, CRM, דף נחיתה, QR.

### שכבה D — משחקון נוער (טרם אופיין)
גישה דרך QR דפדפן, רישום למדריך, קבוצות.

---

## מבנה טבלאות Supabase

### טבלת accountants (רואי חשבון)
```sql
CREATE TABLE accountants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### טבלת coaches (מדריכים)
```sql
CREATE TABLE coaches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  accountant_id UUID REFERENCES accountants(id),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  business_type TEXT DEFAULT 'exempt', -- exempt | licensed
  business_number TEXT,
  status TEXT DEFAULT 'pending', -- pending | active | inactive
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### טבלת documents (מסמכים)
```sql
CREATE TABLE documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID REFERENCES coaches(id),
  type TEXT NOT NULL, -- income | expense
  status TEXT DEFAULT 'pending', -- pending | approved | rejected
  category TEXT, -- משרדיות | רכב | מקצועיות | שיווק | אחר | חומרי הדרכה | תשלום למדריכים עמיתים
  amount DECIMAL(10,2),
  date DATE,
  file_url TEXT,
  rejection_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### טבלת institutions (מוסדות)
```sql
CREATE TABLE institutions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID REFERENCES coaches(id),
  institution_type TEXT NOT NULL, -- tax | insurance | vat
  amount DECIMAL(10,2) NOT NULL,
  frequency TEXT NOT NULL, -- monthly | bimonthly | yearly
  day_of_month INTEGER NOT NULL,
  start_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### טבלת payments (תשלומים מוסדיים)
```sql
CREATE TABLE payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID REFERENCES institutions(id),
  due_date DATE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending', -- pending | paid | overdue
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### טבלת trainees (מתאמנים)
```sql
CREATE TABLE trainees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID REFERENCES coaches(id),
  name TEXT NOT NULL,
  age INTEGER,
  area TEXT,
  group_type TEXT DEFAULT 'individual', -- individual | group
  group_id UUID,
  parent_name TEXT,
  parent_phone TEXT,
  parent_consent BOOLEAN DEFAULT FALSE,
  parent_consent_date DATE,
  start_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### טבלת sessions (מפגשים)
```sql
CREATE TABLE sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trainee_id UUID REFERENCES trainees(id),
  coach_id UUID REFERENCES coaches(id),
  date TIMESTAMPTZ NOT NULL,
  summary TEXT,
  emotional_state TEXT, -- open | hopeful | resistant | overwhelmed | quiet
  next_session_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### טבלת progress_stages (שלבי התקדמות)
```sql
CREATE TABLE progress_stages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID REFERENCES coaches(id),
  trainee_id UUID REFERENCES trainees(id),
  stage_number INTEGER NOT NULL,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'todo', -- todo | active | done
  has_notes BOOLEAN DEFAULT FALSE,
  has_plan BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### טבלת income (הכנסות מדריך)
```sql
CREATE TABLE income (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID REFERENCES coaches(id),
  trainee_id UUID REFERENCES trainees(id),
  amount DECIMAL(10,2) NOT NULL,
  date DATE NOT NULL,
  status TEXT DEFAULT 'pending', -- pending | received | overdue
  receipt_issued BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Row Level Security (RLS) — קריטי לאבטחה

```sql
-- הפעלת RLS על כל הטבלאות
ALTER TABLE coaches ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainees ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE income ENABLE ROW LEVEL SECURITY;

-- רו"ח רואה רק את הלקוחות שלה
CREATE POLICY "accountant_sees_own_coaches" ON coaches
  FOR ALL USING (
    accountant_id = (SELECT id FROM accountants WHERE email = auth.jwt()->>'email')
  );

-- מדריך רואה רק את הנתונים שלו
CREATE POLICY "coach_sees_own_data" ON documents
  FOR ALL USING (
    coach_id = (SELECT id FROM coaches WHERE id = auth.uid())
  );
```

---

## מפת מסכים — שכבת הרו"ח

### 01 — דשבורד רו"ח
**מה מוצג:**
- 4 ריבועי KPI: (2fr+1fr+1fr+1fr)
  - ריבוע 1 (ירוק כהה, 2fr): "X מסמכים לאישור" — קליקבילי, גולל לפאנל משימות
  - ריבוע 2 (ענבר כהה): "X מוסד עבר המועד" — קליקבילי, גולל ללוח שנה
  - ריבוע 3 (ענבר בהיר): "X תשלומים קרובים" — קליקבילי, גולל ללוח שנה
  - ריבוע 4 (ירוק בהיר): "X לקוחות פעילים" — קליקבילי, מנווט לרשימת לקוחות
- פאנל משימות (שמאל):
  - "מסמכים לאישור" — כותרת ירוק כהה, שורות לחיצות לכרטיס לקוח, show-more אחרי 4 שורות
  - "לידיעה" — כותרת אפור, מידע בלבד
  - מצב "הכל תקין": אייקון ירוק + "אין פעולות ממתינות"
- לוח תשלומים מוסדיים (ימין):
  - שורות עם תאריך + שם לקוח + סכום + סטטוס (עבר המועד / קרוב)
  - show-more אחרי 4 שורות
  - כל שורה לחיצה → כרטיס לקוח
- ברכה דינמית: "בוקר טוב/צהריים טובים/ערב טוב, מור" + תאריך עברי
- "הודעה לכולם" בטופבר: modal + פידבק אחרי שליחה
- ניווט: דשבורד / כל הלקוחות / לקוח חדש / הגדרות

**החלטות שנעולות:**
- מוסדות שעברו המועד: בלוח בלבד, לא בפאנל משימות (כפילות)
- "כל הלקוחות" = מסך נפרד עם חיפוש
- כפתור "לקוח חדש" בסרגל מחובר למסך פתיחת תיק עם ולידציה

### 02 — פתיחת תיק לקוח
**שדות:** שם מלא (חובה) + טלפון (חובה, פורמט ישראלי 05X-XXXXXXX)
**כפתור:** "שלח הזמנה בוואטסאפ" — URL: `https://wa.me/972{phone}?text={encoded_message}`
**לאחר שליחה:** התיק נפתח במצב "ממתין להצטרפות"

### 03 — נחיתה מדריך (מקישור הזמנה)
**עיצוב:** רקע כהה-זהב, לוגו EzBz, 3 שלבים מוצגים
**פעולה:** כפתור "בואו נתחיל" → מסך קביעת סיסמה

### 04 — קביעת סיסמה
**שם משתמש:** טלפון (אוטומטי, לא ניתן לשינוי)
**סיסמה:** חובה אימות כפול
**Progress bar:** 2 שלבים (סיסמה → פרטי עסק)

### 05 — פרטי עסק
**שדות:** מספר עוסק (9 ספרות) + סוג עסק (עוסק פטור / עוסק מורשה)
**ניתן לדלג** → "אשלים מאוחר יותר"
**בחירת סוג עסק:** radio buttons עם פונקציית selRadio()

### 06 — כרטיס לקוח
**4 בלוקים:**
1. תמונת מצב: הכנסות / הוצאות / רווח לתקופה הנוכחית
2. דורש ממני: לשוניות הכנסות/הוצאות, כפתורי "אשר עם סיווג" / "דחה"
3. דורש מהלקוח: לידיעה בלבד (תשלומים באיחור, קבלות חסרות)
4. מוסדות: תאריכים קרובים + סטטוס

**3 כפתורי פעולה:**
- ניהול מוסדות → מסך 08
- הודעה אישית → modal עם textarea → שליחה כבאנר
- דוח רווח והפסד → modal מעל הכרטיס (לא טאב חדש!)

**ניווט חזרה:** תמיד חוזר למסך שממנו הגיעו (דשבורד / רשימת לקוחות)

### 07 — אישור מסמך
**3 סטטוסים:**
- ממתין (כחול E6F1FB)
- אושר (ירוק-teal E1F5EE)
- נדחה (ורוד FEF8F8 + פס ענבר + הערת דחייה)

**קטגוריות סיווג:**
- כללי: משרדיות / רכב / מקצועיות / שיווק / אחר
- ספציפי NLP: חומרי הדרכה / תשלום למדריכים עמיתים

**חשוב:** סיווג קורה רק בעת האישור, לא לפני.
**דחייה:** הערה חובה. מסמך ישן נשמר בהיסטוריה, חדש מחליף בתצוגה.

### 08 — ניהול מוסדות
**כלל תשלום:** סכום + תדירות + יום בחודש + תאריך התחלה
**3 תדירויות בלבד:** חודשי / דו-חודשי / שנתי
**המערכת מחשבת** את כל תשלומי השנה אוטומטית
**שינוי סכום:** חל מהתשלום הבא קדימה בלבד
**מע"מ:** אפור לעוסק פטור, מופעל בשינוי business_type

### 09 — דוח רווח והפסד
**מבנה:**
- Dropdown חודשים (ינואר עד החודש הנוכחי)
- גרף עמודות קליקבילי: לחיצה פותחת/סוגרת פירוט וגוללת לסקשן
- סיכום: הכנסות / הוצאות / רווח (ללא אחוזים בסיכום!)
- קטגוריות סגורות כברירת מחדל, drill-down לחשבוניות
- "טרם סווג": רקע שמנת-ענברי (#FFFBF0), צבע ענבר, אייקון אזהרה
- שורת רווח נקי: 67% מסך ההכנסות (אחוז מוצג רק כאן!)
- הדפסה/PDF: גרף נסתר, כל הקטגוריות נפתחות

---

## מפת מסכים — שכבת המדריך

### B0 — תפריט כוורת
**עיצוב:** רקע #1a0f00, לוגו EzBz ענבר-זהב #D4A017
**7 כפתורים (2-3-2):**
- שורה עליונה: ניהול לקוחות (ti-users) + קלאנדר (ti-calendar)
- שורה אמצעית: קבוצות (ti-users-group) + להיום/מרכזי גדול (ti-sun) + מרחב השראה (ti-sparkles)
- שורה תחתונה: רעיונות עסקיים (ti-bulb) + כספים (ti-coin)

### B1 — להיום (Action Center)
**3 לשוניות:**
- פגישות: 3 הקרובות + countdown
- כספים: לגבות / להפיק קבלה / לשלם
- השלמה: סיכומים חסרים + מערכי שיעור + הודעות מהרו"ח

**מקור נתונים לכספים:**
- "לגבות": income.status = 'pending'
- "להפיק קבלה": income.status = 'received' AND income.receipt_issued = false
- "לשלם": payments שעברו/קרובים מוגדרים ע"י הרו"ח

### B2 — פאנל בוקר
נגיש מאייקון בית בסרגל התחתון בלבד (לא בתפריט הכוורת)

### B3 — רשימת מתאמנים
- 2 תצוגות: לפי קבוצות / לפי חברים
- פילטר לפי אזור
- פס צבע ימני: ירוק=תקין, צהוב=לתשומת לב, אדום=בעיה
- פעולות מהירות: כרטיס ↗ / WhatsApp / שולם ✓

### B4 — קלנדר
- 3 תצוגות: חודשית / שבועית (ברירת מחדל) / יומית
- נקודות על ימי פגישה
- Bottom sheet בלחיצה על פגישה
- תזכורת WhatsApp 24 שעות לפני

### B5 — כרטיס מתאמן
- 3 accordion: פרטים אישיים (פתוח) / מעקב התקדמות / מעקב תשלומים
- כפתור דינמי: יש פגישה → "צפה ↗" / אין → "+ קבע פגישה"

### B6 — מעקב התקדמות
**12 שלבי ברירת מחדל (ניתנים לעריכה):**
1. גילוי עצמי, 2. בחירת תחום, 3. שיווק ראשון, 4. גישה ללקוח
5. התמודדות עם לא, 6. מכירה ראשונה, 7. ביצוע בפועל, 8. משוב ושיפור
9. תמחור מחדש, 10. לקוח חוזר, 11. בניית שגרה, 12. צמיחה וסיכום

**מקרא עיגולים:**
- מלא ענבר = יש הערות מפגש
- ריק ענבר = הושלם/פעיל, אין הערות
- אפור = טרם התחיל
- נקודה ירוקה = יש מערך שיעור מוכן

### B7 — מסך שלב
- נפתח כ-modal מלמטה, max-height 90vh
- לשונית 1: מערך שיעור (שמירה מעדכנת לכל המתאמנים בשלב)
- לשונית 2: הערות מפגש (אישי למתאמן בלבד)
- שדה "לפגישה הבאה" מועבר אוטומטית לפגישה הבאה

### B8 — מרחב השראה
- לשונית רכזים: אוטומטי לפי אזור המתאמן
- לשונית ארגז כלים: שיווק / ניהול עסקי / כלי NLP (accordion)

### B9 — כספים (עודכן)
**3 סטטוסי מסמכים:**
- ממתין (כחול E6F1FB)
- אושר (ירוק-teal E1F5EE)
- נדחה (ורוד FEF8F8 + פס ענבר אדום + הערת דחייה + כפתור "העלה מחדש")

**"העלה מחדש":** פותח חלונית כללית עם הערת הדחייה בראשה
**שדה "קבלה הופקה":** Toggle ליד כל הכנסה שסומנה "התקבל"

---

## עיצוב — CSS Variables

```css
:root {
  --green: #3B6D11;
  --green-light: #EAF3DE;
  --green-mid: #639922;
  --green-pale: #C0DD97;
  --green-dark: #28500C;
  --amber: #BA7517;
  --amber-light: #FAEEDA;
  --amber-dark: #633806;
  --bg: #ffffff;
  --bg2: #f7f7f5;
  --border: #e4e4e0;
  --text1: #1a1a1a;
  --text2: #4a4a4a;
  --text3: #8a8a88;
}
```

**כללי עיצוב:**
- RTL מלא: `dir="rtl"` על `<html>`
- פונט: -apple-system, BlinkMacSystemFont, 'Segoe UI' (לא Arial, לא Roboto)
- אייקונים: Tabler Icons (ti-*)
- אנימציות: רק בנקודות השפעה גבוהה

---

## ניווט — מפה מלאה

### שכבת הרו"ח
| מקור | יעד | סוג |
|------|-----|-----|
| KPI מסמכים | פאנל משימות | scroll |
| KPI מוסד עבר המועד | לוח שנה | scroll |
| KPI תשלומים קרובים | לוח שנה | scroll |
| KPI לקוחות פעילים | כל הלקוחות | navigate |
| שורה בפאנל משימות | כרטיס לקוח | navigate |
| שורה בלוח שנה | כרטיס לקוח | navigate |
| כרטיס לקוח ← חזרה | מסך מקור | navigate (זוכר מאיפה הגיעו) |
| כרטיס לקוח → דוח | דוח ר"ה | modal |
| כרטיס לקוח → מוסדות | מסך 08 | navigate |
| גרף דוח → עמודה | פירוט סקשן | toggle + scroll |
| קטגוריה בדוח → לחיצה | חשבוניות | toggle + scroll |
| "לקוח חדש" בסרגל | מסך פתיחת תיק | navigate |

### שכבת המדריך
| מקור | יעד | סוג |
|------|-----|-----|
| כוורת → להיום | Action Center | navigate |
| להיום → פגישה | כרטיס מתאמן | navigate |
| קלנדר → pill | Bottom sheet | sheet |
| Bottom sheet → + סיכום | מסך שלב | navigate |
| כרטיס מתאמן → מעקב מלא | מעקב התקדמות | navigate |
| מעקב → שלב | מסך שלב | navigate |
| כספים → נדחה → העלה מחדש | חלונית העלאה | modal |
| כל מסך → סרגל תחתון | בית/מתאמנים/קלנדר/הגדרות | navigate |

---

## החלטות עיצוב נעולות — אל תשנה!

1. **תשלום בין מדריכים** = עסקה עם חיצוני, אין קישור בין תיקים
2. **סיווג מסמך** = קורה בעת האישור בלבד
3. **דוח ל-PDF** = הדפסה דרך דפדפן (window.print)
4. **דוח רווח והפסד** = נפתח כ-modal מעל כרטיס הלקוח
5. **אחרי אישור/דחיית מסמך** = חזרה למסך שממנו הגיעו
6. **לוח שנה בסרגל** = מוסר עד גרסה 2 (כפתור לא קיים)
7. **קלנדר אישי רו"ח** = גרסה 2
8. **שכבות C ו-D** = לא ב-MVP
9. **מוסדות בדשבורד** = בלוח בלבד, לא בפאנל משימות
10. **העלאה מחדש** = חלונית כללית עם context (לא ממשק נפרד)

---

## Checklist בדיקות לפני כל commit

### בדיקות קוד
- [ ] אין פונקציות JS שמוגדרות פעמיים
- [ ] כל onclick מחובר לפונקציה מוגדרת
- [ ] אין display:none ו-display:flex באותו element
- [ ] אין CSS כפול
- [ ] RTL תקין (dir="rtl", direction:rtl)
- [ ] viewport meta קיים
- [ ] charset UTF-8 קיים

### בדיקות UX
- [ ] כל כפתור עובד ומוביל למקום הנכון
- [ ] חזרה תמיד חוזרת למסך המקור
- [ ] show-more עובד ומציג/מסתיר
- [ ] modals נסגרים עם X או ביטול
- [ ] ולידציה: שדות חובה מציגים הודעת שגיאה ברורה

### בדיקות Supabase
- [ ] RLS מופעל על כל הטבלאות
- [ ] רו"ח רואה רק לקוחות שלה
- [ ] מדריך רואה רק נתונים שלו
- [ ] בדיקה עם 2 משתמשים שונים

### בדיקות שיש לבצע לפני launch
- [ ] מצבי ריק (אין מסמכים, אין תשלומים, אין הכנסות)
- [ ] מצבי שגיאה (upload נכשל, שרת לא מגיב)
- [ ] מובייל אמיתי (iPhone/Android)
- [ ] RTL קצוות (טקסטים ארוכים, ₪ בכיוון נכון)
- [ ] WhatsApp URL עובד
- [ ] Real-time: התראה לרו"ח כשמדריך מעלה מסמך

---

## סדר קידוד מומלץ

### שלב 1 — תשתית (התחל כאן)
1. התקנת Supabase client: `npm install @supabase/supabase-js`
2. יצירת `/lib/supabase.js` עם URL ו-anon key
3. יצירת כל הטבלאות ב-Supabase SQL editor
4. הגדרת RLS על כל הטבלאות
5. בדיקה שהחיבור עובד

### שלב 2 — Auth
1. לוגין רו"ח (email + password)
2. לוגין מדריך (phone + password)
3. middleware לאימות session
4. redirect אוטומטי לפי סוג משתמש

> ⚠️ **TODO קריטי:** מדיניות ה-RLS של מדריך ב-`supabase/schema.sql` מבוססת על `coach_id = auth.uid()`.
> זה עובד רק אם בזמן ה-signup (יצירת השורה בטבלת `coaches`) נקבע `id` בדיוק שווה ל-`auth.uid()` של המשתמש שנרשם ב-Supabase Auth — **לא** UUID אקראי נפרד שנוצר עצמאית (למשל דרך `gen_random_uuid()` בברירת המחדל של הטבלה). יש לוודא זאת בקוד ה-signup לפני שסומכים על ה-RLS.

### שלב 3 — שכבת הרו"ח
1. דשבורד עם נתונים אמיתיים
2. פתיחת תיק + שליחת WhatsApp
3. onboarding מדריך (3→4→5)
4. כרטיס לקוח
5. אישור מסמכים + Cloudinary upload
6. ניהול מוסדות + חישוב תשלומים אוטומטי
7. דוח רווח והפסד

### שלב 4 — שכבת המדריך
1. תפריט כוורת
2. להיום (Action Center)
3. כספים + upload מסמכים
4. רשימת מתאמנים
5. קלנדר
6. כרטיס מתאמן
7. מעקב התקדמות + מסך שלב
8. מרחב השראה

### שלב 5 — אינטגרציות
1. WhatsApp/Twilio
2. Cloudinary
3. Real-time notifications (Supabase Realtime)
4. פרסום ל-Vercel

---

## משתני סביבה נדרשים (.env.local)

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

---

## כללים חשובים לפיתוח

1. **תמיד RLS קודם** — לפני כל feature חדש, ודא שה-RLS מוגדר
2. **לא לנפח את ה-MVP** — כל מה שלא ברשימת שלב 1-4 = גרסה 2
3. **עברית בכל מקום** — כל טקסט UI בעברית, RTL מלא
4. **Supabase client** — השתמש תמיד ב-server-side client לפעולות רגישות
5. **Error handling** — כל fetch מ-Supabase עם try/catch ו-toast error
6. **Loading states** — כל טעינה עם spinner/skeleton
7. **Empty states** — כל רשימה עם מצב ריק מעוצב

---

*EzBz · יולי 2026 · גרסה 9.0 · מסמך פיתוח מלא*
