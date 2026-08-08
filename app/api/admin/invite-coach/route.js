import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

// זמני: מוגן בקוד סוד בלבד עד שיהיה Auth אמיתי לרו"ח. ראו TODO ב-CLAUDE.md (שלב 2 — Auth).
export async function POST(request) {
  const { name, email, secret } = await request.json();

  if (secret !== process.env.ADMIN_INVITE_SECRET) {
    return NextResponse.json({ error: 'לא מורשה' }, { status: 401 });
  }

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
