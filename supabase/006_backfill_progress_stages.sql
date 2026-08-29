-- הרצה חד-פעמית: יצירת 12 שורות progress_stages (לפי DEFAULT_STAGES ב-
-- app/coach/trainees/progressStages.js) לכל מתאמן קיים שאין לו עדיין אף
-- שורה ב-progress_stages. מ-B6 שלב 1 ואילך, מתאמן חדש מקבל את השורות האלה
-- ישירות מ-createTrainee — הסקריפט הזה משלים רק את מי שנוצר לפני השינוי.
-- בטוח להרצה חוזרת (NOT EXISTS על trainee_id) — לא ייצור כפילויות אם ירוץ פעם שנייה.
INSERT INTO progress_stages (coach_id, trainee_id, stage_number, name)
SELECT t.coach_id, t.id, s.stage_number, s.name
FROM trainees t
CROSS JOIN (VALUES
  (1, 'גילוי עצמי'),
  (2, 'בחירת תחום'),
  (3, 'שיווק ראשון'),
  (4, 'גישה ללקוח'),
  (5, 'התמודדות עם לא'),
  (6, 'מכירה ראשונה'),
  (7, 'ביצוע בפועל'),
  (8, 'משוב ושיפור'),
  (9, 'תמחור מחדש'),
  (10, 'לקוח חוזר'),
  (11, 'בניית שגרה'),
  (12, 'צמיחה וסיכום')
) AS s(stage_number, name)
WHERE NOT EXISTS (
  SELECT 1 FROM progress_stages ps WHERE ps.trainee_id = t.id
);
