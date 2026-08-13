-- הרצה חד-פעמית: טבלת רכזי איזור, גלובלית משותפת (לא coach_id/accountant_id).
-- מוזנת ע"י הרו"ח (מסך ניהול ב-Layer A), נצרכת read-only ע"י כל המדריכים
-- (לשונית "+ איזור" ב-B3). לא הרסני — טבלה חדשה בלבד, אין DROP.

CREATE TABLE coordinators (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  region TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE coordinators ENABLE ROW LEVEL SECURITY;

-- רו"ח: גישה מלאה (מסך הניהול)
CREATE POLICY "accountant_manages_coordinators" ON coordinators
  FOR ALL USING (
    EXISTS (SELECT 1 FROM accountants WHERE email = auth.jwt()->>'email')
  );

-- מדריך: קריאה בלבד, ללא scoping (גלובלי, לא per-coach)
CREATE POLICY "coach_reads_coordinators" ON coordinators
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM coaches WHERE id = auth.uid())
  );
