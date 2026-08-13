import Link from 'next/link';
import { createClient } from '@/lib/supabase-ssr';
import CoordinatorsAdmin from './CoordinatorsAdmin';
import '../tokens.css';
import './coordinators.css';

export default async function CoordinatorsPage() {
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

  const { data: accountant } = await supabase.from('accountants').select('id').eq('id', user.id).maybeSingle();
  if (!accountant) {
    return (
      <div style={{ padding: 24 }}>
        <p>המשתמש המחובר אינו רשום כרו"ח.</p>
      </div>
    );
  }

  const { data } = await supabase.from('coordinators').select('*').order('region').order('name');

  return (
    <div className="coord-page">
      <div className="coord-topbar">
        <Link href="/accountant/home" className="coord-back">
          ← חזרה
        </Link>
        <div className="coord-topbar-title">רכזי איזור</div>
      </div>
      <CoordinatorsAdmin coordinators={data ?? []} />
    </div>
  );
}
