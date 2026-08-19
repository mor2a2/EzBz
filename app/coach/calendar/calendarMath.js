const WEEKDAY_LABELS = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'];
const WEEKDAY_FULL = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

export { WEEKDAY_LABELS, WEEKDAY_FULL };

export function startOfDay(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

export function addDays(d, n) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

export function addMonths(d, n) {
  return new Date(d.getFullYear(), d.getMonth() + n, 1);
}

export function startOfWeek(d) {
  const x = startOfDay(d);
  x.setDate(x.getDate() - x.getDay());
  return x;
}

export function startOfMonth(d) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export function buildWeekDays(cursor) {
  const start = startOfWeek(cursor);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

// כולל שבועות מלאים לפני/אחרי החודש, כדי שהרשת תמיד תהיה מלבן שלם (6 או 5 שורות)
export function buildMonthGrid(cursor) {
  const first = startOfMonth(cursor);
  const last = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0);
  const gridStart = startOfWeek(first);
  const gridEnd = addDays(startOfWeek(last), 6);

  const weeks = [];
  let day = gridStart;
  while (day <= gridEnd) {
    weeks.push(Array.from({ length: 7 }, (_, i) => addDays(day, i)));
    day = addDays(day, 7);
  }
  return weeks;
}

export function formatMonthYear(d) {
  return new Intl.DateTimeFormat('he-IL', { month: 'long', year: 'numeric' }).format(d);
}

export function formatDayLabel(d) {
  return new Intl.DateTimeFormat('he-IL', { weekday: 'long', day: 'numeric', month: 'long' }).format(d);
}

export function formatWeekRangeLabel(days) {
  const first = days[0];
  const last = days[6];
  const fmtDay = new Intl.DateTimeFormat('he-IL', { day: 'numeric' });
  const fmtDayMonth = new Intl.DateTimeFormat('he-IL', { day: 'numeric', month: 'long' });
  return first.getMonth() === last.getMonth()
    ? `${fmtDay.format(first)}–${fmtDayMonth.format(last)}`
    : `${fmtDayMonth.format(first)} – ${fmtDayMonth.format(last)}`;
}

// YYYY-MM-DD לפי היום המקומי (לא UTC) — לשימוש בפרמטר ?date= בקישורים לקלנדר.
// slice(0,10) על ISO string ייתן את התאריך ב-UTC, שיכול "לקפוץ" יום ליד חצות בישראל (UTC+3).
export function toLocalDateParam(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function formatTime(d) {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

// מצב תזכורת מחושב לפי תאריך בלבד (מאושר, זמני עד שלב 5 — אין עדיין שליחת
// WhatsApp אמיתית דרך Twilio). 'due' = המפגש בטווח 24 השעות הבאות.
export function reminderTier(sessionDate, now) {
  const diffH = (sessionDate - now) / 3600000;
  if (diffH < 0 || diffH > 24) return null;
  return 'due';
}
