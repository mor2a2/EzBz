'use server';

import { createClient } from '@/lib/supabase-ssr';
import { revalidatePath } from 'next/cache';
import { jerusalemInstant } from '../../../../calendar/calendarMath';

async function markStageFlag(supabase, userId, traineeId, stageNumber, flag) {
  await supabase
    .from('progress_stages')
    .update({ [flag]: true })
    .eq('trainee_id', traineeId)
    .eq('stage_number', stageNumber)
    .eq('coach_id', userId);
}

export async function updateStageName(traineeId, stageNumber, name) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'לא מחובר/ת' };
  if (!name?.trim()) return { error: 'שם השלב הוא שדה חובה' };

  const { error } = await supabase
    .from('progress_stages')
    .update({ name: name.trim() })
    .eq('trainee_id', traineeId)
    .eq('stage_number', stageNumber)
    .eq('coach_id', user.id);

  if (error) return { error: error.message };

  revalidatePath(`/coach/trainees/${traineeId}/progress/${stageNumber}`);
  revalidatePath(`/coach/trainees/${traineeId}/progress`);
  return { ok: true };
}

export async function saveLessonPlan({ traineeId, stageNumber, sessionGoal, plannedTools, bringToSession }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'לא מחובר/ת' };

  const { data: existing } = await supabase
    .from('stage_lesson_plans')
    .select('id')
    .eq('trainee_id', traineeId)
    .eq('stage_number', stageNumber)
    .eq('coach_id', user.id)
    .maybeSingle();

  const fields = {
    session_goal: sessionGoal?.trim() || null,
    planned_tools: plannedTools?.trim() || null,
    bring_to_session: bringToSession?.trim() || null,
  };

  const { error } = existing
    ? await supabase.from('stage_lesson_plans').update(fields).eq('id', existing.id)
    : await supabase
        .from('stage_lesson_plans')
        .insert({ coach_id: user.id, trainee_id: traineeId, stage_number: stageNumber, ...fields });

  if (error) return { error: error.message };

  await markStageFlag(supabase, user.id, traineeId, stageNumber, 'has_plan');
  revalidatePath(`/coach/trainees/${traineeId}/progress/${stageNumber}`);
  return { ok: true };
}

// שכפול תמיד כ-insert עצמאי — לא live link/update. מריצים גם כשיש כבר תוכן
// שמור (עותק של המצב הנוכחי בטופס) וגם כשעדיין לא נשמר כלום עבור המתאמן.
export async function publishToLibrary({ stageNumber, templateName, sessionGoal, plannedTools, bringToSession }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'לא מחובר/ת' };

  const { error } = await supabase.from('stage_lesson_plans').insert({
    coach_id: user.id,
    trainee_id: null,
    group_id: null,
    stage_number: stageNumber,
    template_name: templateName?.trim() || null,
    session_goal: sessionGoal?.trim() || null,
    planned_tools: plannedTools?.trim() || null,
    bring_to_session: bringToSession?.trim() || null,
  });

  if (error) return { error: error.message };
  return { ok: true };
}

export async function saveSessionNotes({ sessionId, traineeId, stageNumber, mood, summary, nextSessionNote }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'לא מחובר/ת' };
  if (!sessionId) return { error: 'חסר מזהה מפגש' };

  const { error } = await supabase
    .from('sessions')
    .update({
      summary: summary?.trim() || null,
      emotional_state: mood || null,
      next_session_note: nextSessionNote?.trim() || null,
      stage_number: stageNumber,
    })
    .eq('id', sessionId)
    .eq('coach_id', user.id);

  if (error) return { error: error.message };

  await markStageFlag(supabase, user.id, traineeId, stageNumber, 'has_notes');
  revalidatePath(`/coach/trainees/${traineeId}/progress/${stageNumber}`);
  revalidatePath('/coach/morning');
  revalidatePath('/coach/calendar');
  return { ok: true };
}

// מקרה "אין sessions פתוחים" — מפגש שכבר התקיים ועדיין לא נרשם בכלל.
// המדריכה ממלאת את התאריך בפועל (לא "עכשיו" אוטומטי) — לכן אין חסימת "לא עבר",
// אלא ההפך: תאריך עתידי לא הגיוני כאן (עוד לא התקיים), ונחסם.
export async function createSessionWithNotes({
  traineeId,
  groupId,
  stageNumber,
  date,
  time,
  mood,
  summary,
  nextSessionNote,
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'לא מחובר/ת' };
  if (!traineeId && !groupId) return { error: 'חסר מתאמן/קבוצה' };
  if (!date || !time) return { error: 'תאריך ושעה הם שדה חובה' };

  const [year, month, day] = date.split('-').map(Number);
  const [hour, minute] = time.split(':').map(Number);
  const instant = jerusalemInstant(year, month, day, hour, minute);
  if (Number.isNaN(instant.getTime())) return { error: 'תאריך/שעה לא תקינים' };
  if (instant.getTime() > Date.now()) return { error: 'לא ניתן לרשום סיכום למפגש שעוד לא התקיים' };

  // traineeId הוא תמיד המתאמן/ת המייצג/ת (מ-URL) — גם ל-session קבוצתי, לצורך
  // סימון has_notes למטה. השורה עצמה ב-sessions היא קבוצתית אם groupId קיים
  // (המתאמן משויך לקבוצה), אחרת אישית — ה-CHECK constraint דורש בדיוק אחד מהשניים.
  const { error } = await supabase.from('sessions').insert({
    coach_id: user.id,
    trainee_id: groupId ? null : traineeId,
    group_id: groupId || null,
    date: instant.toISOString(),
    summary: summary?.trim() || null,
    emotional_state: mood || null,
    next_session_note: nextSessionNote?.trim() || null,
    stage_number: stageNumber,
  });

  if (error) return { error: error.message };

  await markStageFlag(supabase, user.id, traineeId, stageNumber, 'has_notes');
  revalidatePath(`/coach/trainees/${traineeId}/progress/${stageNumber}`);
  revalidatePath('/coach/morning');
  revalidatePath('/coach/calendar');
  return { ok: true };
}
