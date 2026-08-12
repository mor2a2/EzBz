-- EzBz — Initial schema + RLS
-- הרץ את כל הקובץ הזה ב-Supabase SQL Editor (פרויקט: zdqauizttqubfnjlllhb)

-- ============================================================
-- טבלאות
-- ============================================================

CREATE TABLE accountants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- הערה: id נקבע ידנית (לא gen_random_uuid) כדי שיהיה זהה ל-auth.uid()
-- של המשתמש שנוצר ב-Supabase Auth בזמן ההזמנה. ראו CLAUDE.md, TODO קריטי (שלב 2 — Auth).
CREATE TABLE coaches (
  id UUID PRIMARY KEY,
  accountant_id UUID REFERENCES accountants(id),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT, -- נאסף מאוחר יותר באונבורדינג, לא בזמן ההזמנה
  business_type TEXT DEFAULT 'exempt', -- exempt | licensed
  business_number TEXT,
  status TEXT DEFAULT 'pending', -- pending | active | inactive
  created_at TIMESTAMPTZ DEFAULT NOW()
);

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

CREATE TABLE payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  institution_id UUID REFERENCES institutions(id),
  due_date DATE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending', -- pending | paid | overdue
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID REFERENCES coaches(id),
  name TEXT NOT NULL,
  schedule_label TEXT, -- טקסט חופשי, לדוגמה "ראשון 10:00"
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE trainees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID REFERENCES coaches(id),
  name TEXT NOT NULL,
  age INTEGER,
  area TEXT,
  group_type TEXT DEFAULT 'individual', -- individual | group
  group_id UUID REFERENCES groups(id),
  parent_name TEXT,
  parent_phone TEXT,
  parent_consent BOOLEAN DEFAULT FALSE,
  parent_consent_date DATE,
  start_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

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

-- ============================================================
-- Row Level Security
-- ============================================================

ALTER TABLE accountants ENABLE ROW LEVEL SECURITY;
ALTER TABLE coaches ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainees ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE income ENABLE ROW LEVEL SECURITY;

-- רו"ח רואה רק את עצמה
CREATE POLICY "accountant_sees_own_row" ON accountants
  FOR ALL USING (email = auth.jwt()->>'email');

-- רו"ח רואה רק את הלקוחות (מדריכים) שלה, מדריך רואה רק את עצמו
CREATE POLICY "accountant_sees_own_coaches" ON coaches
  FOR ALL USING (
    accountant_id = (SELECT id FROM accountants WHERE email = auth.jwt()->>'email')
  );

CREATE POLICY "coach_sees_own_row" ON coaches
  FOR ALL USING (id = auth.uid());

-- documents / institutions / trainees / sessions / progress_stages / income
-- כולן עם coach_id ישיר: רו"ח רואה דרך coaches.accountant_id, מדריך רואה את עצמו

CREATE POLICY "accountant_sees_own_documents" ON documents
  FOR ALL USING (
    coach_id IN (SELECT id FROM coaches WHERE accountant_id = (SELECT id FROM accountants WHERE email = auth.jwt()->>'email'))
  );
CREATE POLICY "coach_sees_own_documents" ON documents
  FOR ALL USING (coach_id = auth.uid());

CREATE POLICY "accountant_sees_own_institutions" ON institutions
  FOR ALL USING (
    coach_id IN (SELECT id FROM coaches WHERE accountant_id = (SELECT id FROM accountants WHERE email = auth.jwt()->>'email'))
  );
CREATE POLICY "coach_sees_own_institutions" ON institutions
  FOR ALL USING (coach_id = auth.uid());

CREATE POLICY "accountant_sees_own_groups" ON groups
  FOR ALL USING (
    coach_id IN (SELECT id FROM coaches WHERE accountant_id = (SELECT id FROM accountants WHERE email = auth.jwt()->>'email'))
  );
CREATE POLICY "coach_sees_own_groups" ON groups
  FOR ALL USING (coach_id = auth.uid());

CREATE POLICY "accountant_sees_own_trainees" ON trainees
  FOR ALL USING (
    coach_id IN (SELECT id FROM coaches WHERE accountant_id = (SELECT id FROM accountants WHERE email = auth.jwt()->>'email'))
  );
CREATE POLICY "coach_sees_own_trainees" ON trainees
  FOR ALL USING (coach_id = auth.uid());

CREATE POLICY "accountant_sees_own_sessions" ON sessions
  FOR ALL USING (
    coach_id IN (SELECT id FROM coaches WHERE accountant_id = (SELECT id FROM accountants WHERE email = auth.jwt()->>'email'))
  );
CREATE POLICY "coach_sees_own_sessions" ON sessions
  FOR ALL USING (coach_id = auth.uid());

CREATE POLICY "accountant_sees_own_progress_stages" ON progress_stages
  FOR ALL USING (
    coach_id IN (SELECT id FROM coaches WHERE accountant_id = (SELECT id FROM accountants WHERE email = auth.jwt()->>'email'))
  );
CREATE POLICY "coach_sees_own_progress_stages" ON progress_stages
  FOR ALL USING (coach_id = auth.uid());

CREATE POLICY "accountant_sees_own_income" ON income
  FOR ALL USING (
    coach_id IN (SELECT id FROM coaches WHERE accountant_id = (SELECT id FROM accountants WHERE email = auth.jwt()->>'email'))
  );
CREATE POLICY "coach_sees_own_income" ON income
  FOR ALL USING (coach_id = auth.uid());

-- payments: מקושר דרך institution_id -> institutions.coach_id
CREATE POLICY "accountant_sees_own_payments" ON payments
  FOR ALL USING (
    institution_id IN (
      SELECT id FROM institutions WHERE coach_id IN (
        SELECT id FROM coaches WHERE accountant_id = (SELECT id FROM accountants WHERE email = auth.jwt()->>'email')
      )
    )
  );
CREATE POLICY "coach_sees_own_payments" ON payments
  FOR ALL USING (
    institution_id IN (SELECT id FROM institutions WHERE coach_id = auth.uid())
  );
