-- הרצה חד-פעמית: טבלת stage_lesson_plans (B7, מערך שיעור) — לא הרסני, אין DROP.
-- שורה עם trainee_id/group_id שניהם NULL = תבנית משותפת במאגר (per-שלב, לא per-מתאמן).
-- בפועל תמיד trainee_id כשמדובר בעותק פר-מתאמן (גם בתוך קבוצה) — group_id קיים
-- כאן רק לסימטריה מול sessions, לא בשימוש בפועל בסבב הזה (ר' CLAUDE.md B7).
-- כל שכפול (מאגר→מתאמן, מתאמן→מאגר) הוא insert עצמאי - אין live link/update בין שורות.
CREATE TABLE stage_lesson_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID REFERENCES coaches(id),
  trainee_id UUID REFERENCES trainees(id),
  group_id UUID REFERENCES groups(id),
  stage_number INTEGER NOT NULL,
  template_name TEXT,
  session_goal TEXT, -- מטרת המפגש
  planned_tools TEXT, -- כלים ופעילויות מתוכננות
  bring_to_session TEXT, -- להביא למפגש
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE stage_lesson_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "accountant_sees_own_stage_lesson_plans" ON stage_lesson_plans
  FOR SELECT USING (
    coach_id IN (SELECT id FROM coaches WHERE accountant_id = (SELECT id FROM accountants WHERE email = auth.jwt()->>'email'))
  );
CREATE POLICY "coach_sees_own_stage_lesson_plans" ON stage_lesson_plans
  FOR ALL USING (coach_id = auth.uid());
