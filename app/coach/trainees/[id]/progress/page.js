import Link from 'next/link';
import { IconCheck } from '@tabler/icons-react';
import { createClient } from '@/lib/supabase-ssr';
import WorkBackground from '../../../WorkBackground';
import HeaderGrid from '../../../HeaderGrid';
import { mergeProgressStages } from '../../progressStages';
import StageRow from './StageRow';
import '../../trainees.css';
import './progress.css';

function circleClass(stage) {
  if (stage.status === 'todo') return 'todo';
  return stage.hasNotes ? 'filled' : 'hollow';
}

function nameClass(stage) {
  if (stage.status === 'todo') return 'todo';
  if (stage.status === 'active') return 'active';
  return 'done';
}

export default async function TraineeProgressPage({ params }) {
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

  const [groupRes, progressRes, sessionsRes] = await Promise.all([
    trainee.group_id
      ? supabase.from('groups').select('name').eq('id', trainee.group_id).single()
      : Promise.resolve({ data: null }),
    supabase
      .from('progress_stages')
      .select('stage_number, name, status, has_notes, has_plan')
      .eq('trainee_id', id)
      .eq('coach_id', user.id),
    supabase
      .from('sessions')
      .select('stage_number, summary, date')
      .eq('coach_id', user.id)
      .or(sessionFilter)
      .not('stage_number', 'is', null)
      .order('date', { ascending: false }),
  ]);

  const groupName = groupRes.data?.name ?? null;
  const stages = mergeProgressStages(progressRes.data);
  const doneCount = stages.filter((s) => s.status === 'done').length;
  const activeStage = stages.find((s) => s.status === 'active');

  const previewByStage = {};
  for (const s of sessionsRes.data ?? []) {
    if (s.stage_number == null || previewByStage[s.stage_number] || !s.summary) continue;
    previewByStage[s.stage_number] = s.summary.length > 50 ? `${s.summary.slice(0, 50)}…` : s.summary;
  }

  return (
    <WorkBackground>
      <div className="tr-root">
        <div className="pg-hdr">
          <HeaderGrid />
          <div className="pg-hdr-content">
            <div className="pg-hdr-top">
              <Link href={`/coach/trainees/${id}`} className="pg-back-btn">
                כרטיס ↗
              </Link>
              <div className="pg-name">{trainee.name}</div>
              <div style={{ width: 40 }} />
            </div>
            <div className="pg-subtitle">{groupName ? `${groupName} · מעקב התקדמות` : 'מעקב התקדמות'}</div>
          </div>
        </div>

        <div className="pg-summary-bar">
          <div className="pg-summary-text">
            <span>{doneCount} שלבים הושלמו</span>
            <span className="pg-summary-current">
              {activeStage ? `בתהליך: ${activeStage.name}` : doneCount === 12 ? 'כל השלבים הושלמו! 🎉' : 'טרם התחיל'}
            </span>
          </div>
          <div className="pg-summary-track">
            <div className="pg-summary-fill" style={{ width: `${(doneCount / 12) * 100}%` }} />
          </div>
        </div>

        <div className="pg-list">
          {stages.map((stage) => (
            <StageRow
              href={`/coach/sessions/${trainee.id}?stageNumber=${stage.stageNumber}`}
              className={`pg-row ${stage.status === 'active' ? 'active' : ''}`}
              key={stage.stageNumber}
            >
              <div className="pg-row-col">
                <div className={`pg-circle ${circleClass(stage)}`}>
                  {stage.status === 'done' ? <IconCheck size={12} /> : stage.stageNumber}
                  {stage.hasPlan && <div className="pg-plan-dot" />}
                </div>
                {stage.stageNumber < 12 && <div className={`pg-line ${stage.status === 'done' ? 'done' : ''}`} />}
              </div>
              <div className="pg-row-content">
                <div className={`pg-row-name ${nameClass(stage)}`}>{stage.name}</div>
                {previewByStage[stage.stageNumber] ? (
                  <div className="pg-row-preview">{previewByStage[stage.stageNumber]}</div>
                ) : stage.hasPlan ? (
                  <div className="pg-row-tag">מערך מוכן</div>
                ) : null}
              </div>
            </StageRow>
          ))}
        </div>
      </div>
    </WorkBackground>
  );
}
