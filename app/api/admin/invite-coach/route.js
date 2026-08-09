import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { createClient } from '@/lib/supabase-ssr';

export async function POST(request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'לא מחובר/ת' }, { status: 401 });
  }

  const { data: accountant } = await supabase
    .from('accountants')
    .select('id')
    .eq('id', user.id)
    .maybeSingle();

  if (!accountant) {
    return NextResponse.json({ error: 'אין הרשאה — לא רו"ח מורשה' }, { status: 403 });
  }

  const { name, email } = await request.json();

  if (!name?.trim() || !email?.trim()) {
    return NextResponse.json({ error: 'שם ואימייל הם שדות חובה' }, { status: 400 });
  }

  const { data: invited, error: inviteError } = await supabaseServer.auth.admin.inviteUserByEmail(
    email.trim(),
    {
      data: { name: name.trim() },
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/confirm?next=/coach/home`,
    }
  );

  if (inviteError) {
    return NextResponse.json({ error: inviteError.message }, { status: 400 });
  }

  // id זהה בכוונה ל-auth.uid() שחזר מההזמנה, כדי שמדיניות ה-RLS למדריך תעבוד
  const { error: coachError } = await supabaseServer.from('coaches').insert({
    id: invited.user.id,
    name: name.trim(),
    email: email.trim(),
  });

  if (coachError) {
    await supabaseServer.auth.admin.deleteUser(invited.user.id);
    return NextResponse.json({ error: coachError.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
