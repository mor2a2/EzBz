import Link from 'next/link';
import { createClient } from '@/lib/supabase-ssr';

// עמוד נחיתה זמני ומינימלי — רק לוודא שה-magic link מוביל לכאן ולא לשגיאה.
// הדשבורד המלא של הרו"ח (מסך 01) ייבנה בשלב נפרד.
export default async function AccountantHomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div style={{ padding: 24 }}>
        <p>לא מחובר/ת. יש להתחבר דרך /accountant/login.</p>
      </div>
    );
  }

  const { data: accountant } = await supabase
    .from('accountants')
    .select('name')
    .eq('id', user.id)
    .single();

  if (!accountant) {
    return (
      <div style={{ padding: 24 }}>
        <p>המשתמש המחובר אינו רשום כרו"ח.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <p>ברוך/ה הבא/ה, {accountant.name} — התחברת בהצלחה.</p>
      <p>
        <Link href="/accountant/coordinators">ניהול רכזי איזור</Link>
      </p>
    </div>
  );
}
