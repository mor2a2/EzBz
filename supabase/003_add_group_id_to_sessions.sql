-- הרצה חד-פעמית: מוסיף group_id ל-sessions, כדי שמפגש קבוצתי יהיה שורה
-- אחת אמיתית (לא הסתמכות שבירה על צירוף מספר מפגשי-יחיד שחולקים תאריך/שעה
-- זהים). לא הרסני — ADD COLUMN + ADD CONSTRAINT בלבד, אין DROP.
-- sessions ריקה כרגע (0 שורות, נבדק) אז ה-CHECK בטוח.

ALTER TABLE sessions
  ADD COLUMN group_id UUID REFERENCES groups(id);

-- בדיוק אחד מהשניים: מפגש יחיד (trainee_id) או מפגש קבוצתי (group_id), לא שניהם ולא אף אחד
ALTER TABLE sessions
  ADD CONSTRAINT sessions_trainee_or_group_chk
  CHECK (
    (trainee_id IS NOT NULL AND group_id IS NULL) OR
    (trainee_id IS NULL AND group_id IS NOT NULL)
  );
