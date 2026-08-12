-- הרצה חד-פעמית: מוסיף טבלת groups (לא הייתה קיימת) וקושר אליה את trainees.group_id.
-- כל שאר הטבלאות (כולל accountants עם השורה האמיתית שלך) לא נגעות — אין DROP כאן.

CREATE TABLE groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID REFERENCES coaches(id),
  name TEXT NOT NULL,
  schedule_label TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "accountant_sees_own_groups" ON groups
  FOR ALL USING (
    coach_id IN (SELECT id FROM coaches WHERE accountant_id = (SELECT id FROM accountants WHERE email = auth.jwt()->>'email'))
  );
CREATE POLICY "coach_sees_own_groups" ON groups
  FOR ALL USING (coach_id = auth.uid());

ALTER TABLE trainees
  ADD CONSTRAINT trainees_group_id_fkey FOREIGN KEY (group_id) REFERENCES groups(id);
