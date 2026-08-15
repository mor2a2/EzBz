'use server';

import { createClient } from '@/lib/supabase-ssr';
import { revalidatePath } from 'next/cache';

export async function markIncomeReceived(incomeId) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'לא מחובר/ת' };

  const { error } = await supabase
    .from('income')
    .update({ status: 'received' })
    .eq('id', incomeId)
    .eq('coach_id', user.id);

  if (error) return { error: error.message };

  revalidatePath('/coach/trainees');
  return { ok: true };
}

export async function createGroup({ name, scheduleLabel, memberIds }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'לא מחובר/ת' };
  if (!name?.trim()) return { error: 'שם הקבוצה הוא שדה חובה' };

  const { data: group, error } = await supabase
    .from('groups')
    .insert({ coach_id: user.id, name: name.trim(), schedule_label: scheduleLabel?.trim() || null })
    .select('id')
    .single();

  if (error) return { error: error.message };

  if (memberIds?.length) {
    const { error: assignError } = await supabase
      .from('trainees')
      .update({ group_id: group.id })
      .eq('coach_id', user.id)
      .in('id', memberIds);
    if (assignError) return { error: assignError.message };
  }

  revalidatePath('/coach/trainees');
  return { ok: true };
}

export async function createTrainee({ name, area, groupId }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'לא מחובר/ת' };
  if (!name?.trim()) return { error: 'שם המתאמן הוא שדה חובה' };

  const { error } = await supabase.from('trainees').insert({
    coach_id: user.id,
    name: name.trim(),
    area: area?.trim() || null,
    group_id: groupId || null,
  });

  if (error) return { error: error.message };

  revalidatePath('/coach/trainees');
  return { ok: true };
}

export async function assignTraineeToGroup(traineeId, groupId) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'לא מחובר/ת' };

  const { error } = await supabase
    .from('trainees')
    .update({ group_id: groupId })
    .eq('id', traineeId)
    .eq('coach_id', user.id);

  if (error) return { error: error.message };

  revalidatePath('/coach/trainees');
  return { ok: true };
}
