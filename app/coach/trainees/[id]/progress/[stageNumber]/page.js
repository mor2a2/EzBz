import Link from 'next/link';
import { createClient } from '@/lib/supabase-ssr';
import WorkBackground from '../../../../WorkBackground';
import HeaderGrid from '../../../../HeaderGrid';
import { DEFAULT_STAGES } from '../../../progressStages';
import EditableStageName from './EditableStageName';
import StageDetail from './StageDetail';
import '../../../trainees.css';
import '../progress.css';
import './stage.css';

const STATUS_LABEL = { todo: 'טרם התחיל', active: 'בתהליך', done: 'הושלם' };

function preview(text) {
  if (!text) return null;
  return text.length > 50 ? `${text.slice(0, 50)}…` : text;
}

export default async function StagePage({ params, searchParams }) {
  const { id, stageNumber: stageNumberParam } = await params;
  const { sessionId } = await searchParams;
  const stageNumber = Number(stageNumberParam);

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

  if (!Number.isInteger(stageNumber) || stageNumber < 1 || stageNumber > 12) {
    return (
      <WorkBackground>
        <p>שלב לא תקין.</p>
      </WorkBackground>
    );
  }

  const traineeRes = await supabase.from('trainees').select('id, name, group_id').eq('id', id).eq('coach_id', user.id).single();
  const trainee = traineeRes.data;
  if (!trainee) {
    return (
      <WorkBackground>
        <p>מתאמן/ת לא נמצא/ה.</p>
      </WorkBackground>
    );
  }

  const sessionFilter = trainee.group_id
    ? `trainee_id.eq.${id},group_id.eq.${trainee.group_id}`
    : `trainee_id.eq.${id}`;
  const now = new Date();

  const [stageRes, planRes, libraryRes, lastNoteRes, pastSummariesRes, openRes, knownRes] = await Promise.all([
    supabase
      .from('progress_stages')
      .select('name, status')
      .eq('trainee_id', id)
      .eq('stage_number', stageNumber)
      .eq('coach_id', user.id)
      .maybeSingle(),
    supabase
      .from('stage_lesson_plans')
      .select('session_goal, planned_tools, bring_to_session')
      .eq('trainee_id', id)
      .eq('stage_number', stageNumber)
      .eq('coach_id', user.id)
      .maybeSingle(),
    supabase
      .from('stage_lesson_plans')
      .select('id, template_name, session_goal, planned_tools, bring_to_session')
      .is('trainee_id', null)
      .is('group_id', null)
      .eq('stage_number', stageNumber)
      .eq('coach_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('sessions')
      .select('date, next_session_note')
      .eq('coach_id', user.id)
      .or(sessionFilter)
      .not('next_session_note', 'is', null)
      .lte('date', now.toISOString())
      .order('date', { ascending: false })
      .limit(1),
    supabase
      .from('sessions')
      .select('id, date, summary, emotional_state, next_session_note')
      .eq('coach_id', user.id)
      .or(sessionFilter)
      .not('summary', 'is', null)
      .order('date', { ascending: false })
      .limit(10),
    supabase
      .from('sessions')
      .select('id, date, summary, emotional_state, next_session_note')
      .eq('coach_id', user.id)
      .or(sessionFilter)
      .is('summary', null)
      .lte('date', now.toISOString())
      .order('date', { ascending: false }),
    sessionId
      ? supabase
          .from('sessions')
          .select('id, date, summary, emotional_state, next_session_note')
          .eq('id', sessionId)
          .eq('coach_id', user.id)
          .or(sessionFilter)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const stageName = stageRes.data?.name ?? DEFAULT_STAGES[stageNumber - 1];
  const stageStatus = stageRes.data?.status ?? 'todo';
  const plan = planRes.data ?? null;
  const library = libraryRes.data ?? [];
  const lastNote = lastNoteRes.data?.[0] ?? null;
  const pastSummaries = pastSummariesRes.data ?? [];
  const planPreviewText = preview(plan?.session_goal);

  const openRows = openRes.data ?? [];
  let sessionMode;
  let knownSession = null;
  let candidates = [];
  if (sessionId && knownRes.data) {
    sessionMode = 'known';
    knownSession = knownRes.data;
  } else if (openRows.length === 0) {
    sessionMode = 'create';
  } else if (openRows.length === 1) {
    sessionMode = 'auto';
    knownSession = openRows[0];
  } else {
    sessionMode = 'pick';
    candidates = openRows;
  }

  return (
    <WorkBackground>
      <div className="tr-root">
        <div className="pg-hdr">
          <HeaderGrid />
          <div className="pg-hdr-content">
            <div className="pg-hdr-top">
              <Link href={`/coach/trainees/${id}/progress`} className="pg-back-btn">
                ← חזרה
              </Link>
              <EditableStageName traineeId={id} stageNumber={stageNumber} name={stageName} />
              <div style={{ width: 40 }} />
            </div>
            <div className="pg-subtitle">
              {trainee.name} · שלב {stageNumber} · {STATUS_LABEL[stageStatus]}
            </div>
          </div>
        </div>

        <StageDetail
          traineeId={id}
          groupId={trainee.group_id}
          stageNumber={stageNumber}
          defaultTab={sessionId ? 'notes' : 'plan'}
          lastNote={lastNote}
          plan={plan}
          library={library}
          pastSummaries={pastSummaries}
          sessionMode={sessionMode}
          knownSession={knownSession}
          candidates={candidates}
          planPreviewText={planPreviewText}
        />
      </div>
    </WorkBackground>
  );
}
