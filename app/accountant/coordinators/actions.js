'use server';

import { createClient } from '@/lib/supabase-ssr';
import { revalidatePath } from 'next/cache';
import { isValidPhone } from './validation';

async function requireAccountant(supabase) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'לא מחובר/ת' };

  const { data: accountant } = await supabase.from('accountants').select('id').eq('id', user.id).maybeSingle();
  if (!accountant) return { error: 'אין הרשאה — לא רו"ח מורשה' };

  return { ok: true };
}

function validate(fields) {
  if (!fields.region?.trim() || !fields.name?.trim()) {
    return 'איזור ושם הם שדות חובה';
  }
  if (!isValidPhone(fields.phone)) {
    return 'טלפון חייב להכיל ספרות בלבד (מקפים/רווחים מותרים)';
  }
  return null;
}

export async function addCoordinator(fields) {
  const supabase = await createClient();
  const auth = await requireAccountant(supabase);
  if (auth.error) return auth;

  const validationError = validate(fields);
  if (validationError) return { error: validationError };

  const { error } = await supabase.from('coordinators').insert({
    region: fields.region.trim(),
    name: fields.name.trim(),
    phone: fields.phone?.trim() || null,
    email: fields.email?.trim() || null,
  });
  if (error) return { error: error.message };

  revalidatePath('/accountant/coordinators');
  return { ok: true };
}

export async function updateCoordinator(id, fields) {
  const supabase = await createClient();
  const auth = await requireAccountant(supabase);
  if (auth.error) return auth;

  const validationError = validate(fields);
  if (validationError) return { error: validationError };

  const { error } = await supabase
    .from('coordinators')
    .update({
      region: fields.region.trim(),
      name: fields.name.trim(),
      phone: fields.phone?.trim() || null,
      email: fields.email?.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id);
  if (error) return { error: error.message };

  revalidatePath('/accountant/coordinators');
  return { ok: true };
}

export async function deleteCoordinator(id) {
  const supabase = await createClient();
  const auth = await requireAccountant(supabase);
  if (auth.error) return auth;

  const { error } = await supabase.from('coordinators').delete().eq('id', id);
  if (error) return { error: error.message };

  revalidatePath('/accountant/coordinators');
  return { ok: true };
}
