-- הרצה חד-פעמית: מוחק את כל 9 הטבלאות (ריקות, 0 שורות) לפני הרצה מחדש
-- של schema.sql המעודכן. הרץ ב-Supabase SQL Editor ואז מחק/הרץ מחדש את schema.sql.

DROP TABLE IF EXISTS accountants CASCADE;
DROP TABLE IF EXISTS coaches CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS institutions CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS trainees CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS progress_stages CASCADE;
DROP TABLE IF EXISTS income CASCADE;
