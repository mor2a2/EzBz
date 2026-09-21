import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase-ssr';
import WorkBackground from '../../WorkBackground';
import HeaderGrid from '../../HeaderGrid';
import { mergeProgressStages, currentStageNumber } from '../../trainees/progressStages';
import './resolve.css';

// נקודת כניסה מהקלנדר/B2 ("+ סיכום מפגש") — session id בלבד ידוע, לא trainee+stage.
// session אישי: פותר את שלב היעד (השלב הפעיל של המתאמן) ומפנה ישירות ל-B7.
// session קבוצתי: אין מושג "שלב קבוצתי" בסכימה (progress_stages הוא per-trainee
// בלבד) — מציג שלב ביניים לבחירת מתאמן ספציפי מתוך חברי הקבוצה, ר' CLAUDE.md B7.
export default async function SessionResolverPage({ params }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <WorkBackground>
        <p>לא מחובר/ת. יש להתחבר דרך קישור ההזמנה שנשלח באימייל.</p>
      </WorkBackground>
    );
  }

  const { data: session } = await supabase
    .from('sessions')
    .select('id, trainee_id, group_id')
    .eq('id', id)
    .eq('coach_id', user.id)
    .single();

  if (!session) {
    return (
      <WorkBackground>
        <p>מפגש לא נמצא.</p>
      </WorkBackground>
    );
  }

  if (session.trainee_id) {
    const { data: stageRows } = await supabase
      .from('progress_stages')
      .select('stage_number, status')
      .eq('trainee_id', session.trainee_id)
      .eq('coach_id', user.id);
    const stageNumber = currentStageNumber(mergeProgressStages(stageRows));
    redirect(`/coach/trainees/${session.trainee_id}/progress/${stageNumber}?sessionId=${session.id}`);
  }

  const [groupRes, membersRes] = await Promise.all([
    supabase.from('groups').select('name').eq('id', session.group_id).single(),
    supabase.from('trainees').select('id, name').eq('group_id', session.group_id).eq('coach_id', user.id),
  ]);

  const members = membersRes.data ?? [];
  const stagesByTrainee = await Promise.all(
    members.map((m) =>
      supabase
        .from('progress_stages')
        .select('stage_number, status')
        .eq('trainee_id', m.id)
        .eq('coach_id', user.id)
        .then((r) => currentStageNumber(mergeProgressStages(r.data)))
    )
  );

  return (
    <WorkBackground>
      <div className="rs-root">
        <div className="rs-hdr">
          <HeaderGrid />
          <div className="rs-hdr-content">
            <Link href="/coach/calendar" className="rs-back-btn">
              ← חזרה לקלנדר
            </Link>
            <div className="rs-title">{groupRes.data?.name ?? 'קבוצה'}</div>
            <div className="rs-subtitle">לאיזה מתאמן/ת לסכם את המפגש?</div>
          </div>
        </div>
        <div className="rs-list">
          {members.map((m, i) => (
            <Link
              key={m.id}
              href={`/coach/trainees/${m.id}/progress/${stagesByTrainee[i]}?sessionId=${session.id}`}
              className="rs-row"
            >
              {m.name}
            </Link>
          ))}
        </div>
      </div>
    </WorkBackground>
  );
}
