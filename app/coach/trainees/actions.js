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
