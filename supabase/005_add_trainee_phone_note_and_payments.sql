-- הרצה חד-פעמית: הכנה לכרטיס מתאמן (B5) — טלפון+הערה חופשית על trainees,
-- וטבלת מעקב תשלומי מתאמן חדשה. לא הרסני — ADD COLUMN/CREATE TABLE בלבד, אין DROP.

-- טלפון המתאמן/ת עצמו/ה (לתזכורות שוטפות; נפילה ל-parent_phone אם ריק, ראו B5 ב-CLAUDE.md)
ALTER TABLE trainees ADD COLUMN phone TEXT;

-- הערה חופשית של המדריך/ה על המתאמן/ת
ALTER TABLE trainees ADD COLUMN note TEXT;

-- מעקב תשלומי מתאמן (לקוח→מדריך). לא להתבלבל עם payments הקיימת (מדריך→מוסדות).
-- אין עמודת "חודש" נפרדת בכוונה — מחושב מ-due_date בתצוגה בלבד, תואם לדפוס ב-payments המוסדי.
CREATE TABLE trainee_payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID REFERENCES coaches(id),
  trainee_id UUID REFERENCES trainees(id),
  due_date DATE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending', -- pending | paid | overdue
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE trainee_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "accountant_sees_own_trainee_payments" ON trainee_payments
  FOR SELECT USING (
    coach_id IN (SELECT id FROM coaches WHERE accountant_id = (SELECT id FROM accountants WHERE email = auth.jwt()->>'email'))
  );
CREATE POLICY "coach_sees_own_trainee_payments" ON trainee_payments
  FOR ALL USING (coach_id = auth.uid());
