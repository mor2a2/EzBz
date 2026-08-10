import { createClient } from '@/lib/supabase-ssr';
import Hive from '../Hive';

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

  return <Hive />;
}
