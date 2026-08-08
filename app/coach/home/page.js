import { createClient } from '@/lib/supabase-ssr';

// עמוד נחיתה זמני ומינימלי — רק לוודא שה-magic link מוביל לכאן ולא לשגיאה.
// העיצוב המלא של הכוורת (B0) ייבנה בשלב נפרד.
export default async function CoachHomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div style={{ padding: 24 }}>
        <p>לא מחובר/ת. יש להתחבר דרך קישור ההזמנה שנשלח באימייל.</p>
      </div>
    );
  }

  const { data: coach } = await supabase
    .from('coaches')
    .select('name')
    .eq('id', user.id)
    .single();

  return (
    <div style={{ padding: 24 }}>
      <p>ברוך/ה הבא/ה, {coach?.name ?? user.email} — התחברת בהצלחה.</p>
    </div>
  );
}
