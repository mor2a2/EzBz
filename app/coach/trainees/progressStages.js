// 12 שלבי ברירת המחדל של מעקב התקדמות (B6), ר' CLAUDE.md. עומד בפני עצמו כי גם
// B6/B7 העתידיים יזדקקו לאותה רשימה בדיוק — לא רק B5.
export const DEFAULT_STAGES = [
  'גילוי עצמי',
  'בחירת תחום',
  'שיווק ראשון',
  'גישה ללקוח',
  'התמודדות עם לא',
  'מכירה ראשונה',
  'ביצוע בפועל',
  'משוב ושיפור',
  'תמחור מחדש',
  'לקוח חוזר',
  'בניית שגרה',
  'צמיחה וסיכום',
];

// ממזג את 12 השלבים הקנוניים עם שורות progress_stages בפועל (עשויות להיות
// חלקיות או ריקות לגמרי — למתאמן חדש אין אף שורה, לא מצב נפרד בקוד: שלב חסר
// נופל אוטומטית לברירת המחדל todo/ללא הערות/ללא מערך).
export function mergeProgressStages(rows) {
  const rowByNumber = Object.fromEntries((rows ?? []).map((r) => [r.stage_number, r]));
  return DEFAULT_STAGES.map((name, i) => {
    const num = i + 1;
    const row = rowByNumber[num];
    return {
      stageNumber: num,
      name: row?.name ?? name,
      status: row?.status ?? 'todo',
      hasNotes: row?.has_notes ?? false,
      hasPlan: row?.has_plan ?? false,
    };
  });
}

// "שלב נוכחי": השלב הפעיל (active) אם יש כזה, אחרת השלב הראשון שעוד לא הושלם
// (מתאמן חדש: כל השלבים todo → שלב 1). אם הכל הושלם — נשאר על 12.
export function currentStageNumber(stages) {
  const active = stages.find((s) => s.status === 'active');
  if (active) return active.stageNumber;
  const firstNotDone = stages.find((s) => s.status !== 'done');
  return firstNotDone ? firstNotDone.stageNumber : stages.length;
}

// חלון של 6 שלבים סביב השלב הנוכחי, לא קבוע 1-6. start מוגבל ל-7 לכל היותר
// כדי שהחלון (start..start+5) לעולם לא יחרוג מ-12 השלבים הקיימים.
export function stageWindow(stages, current) {
  const start = Math.min(Math.max(current - 2, 1), 7);
  return stages.slice(start - 1, start - 1 + 6);
}
