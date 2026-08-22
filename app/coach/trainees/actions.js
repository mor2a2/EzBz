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

export async function updateTraineeDetails(traineeId, fields) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'לא מחובר/ת' };

  const { error } = await supabase
    .from('trainees')
    .update({
      age: fields.age === '' || fields.age == null ? null : Number(fields.age),
      phone: fields.phone?.trim() || null,
      note: fields.note?.trim() || null,
      parent_name: fields.parentName?.trim() || null,
      parent_phone: fields.parentPhone?.trim() || null,
      area: fields.area?.trim() || null,
      group_type: fields.groupType,
      parent_consent: fields.parentConsent,
      parent_consent_date: fields.parentConsentDate || null,
      start_date: fields.startDate || null,
    })
    .eq('id', traineeId)
    .eq('coach_id', user.id);

  if (error) return { error: error.message };

  revalidatePath(`/coach/trainees/${traineeId}`);
  revalidatePath('/coach/trainees');
  return { ok: true };
}

export async function addTraineePayment({ traineeId, dueDate, amount }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'לא מחובר/ת' };
  if (!dueDate) return { error: 'תאריך הוא שדה חובה' };
  const amountNum = Number(amount);
  if (!amountNum || amountNum <= 0) return { error: 'סכום לא תקין' };

  const { error } = await supabase
    .from('trainee_payments')
    .insert({ coach_id: user.id, trainee_id: traineeId, due_date: dueDate, amount: amountNum });

  if (error) return { error: error.message };

  revalidatePath(`/coach/trainees/${traineeId}`);
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
