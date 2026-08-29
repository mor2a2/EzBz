-- מקשר מפגש לשלב הספציפי מ-progress_stages שהוא שייך אליו (B6/B7).
-- Nullable בכוונה: שום קוד עדיין לא כותב לעמודה הזו (B7 יעשה זאת) - היא
-- קיימת מראש כדי ש-B6 ידע לשלוף ממנה כשהזמן יגיע. לא הרסני - ADD COLUMN בלבד.
ALTER TABLE sessions ADD COLUMN stage_number INTEGER;
