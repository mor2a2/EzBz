import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

export async function proxy(request) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // מרענן את ה-session cookie אם צריך; חובה כדי שה-auth cookies לא יפגו
  const pathname = request.nextUrl.pathname;
  const isAccountantPath = pathname.startsWith('/accountant') && pathname !== '/accountant/login';
  const isCoachPath = pathname.startsWith('/coach');

  if (isAccountantPath || isCoachPath) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (isAccountantPath) {
      if (!user) {
        return NextResponse.redirect(new URL('/accountant/login', request.url));
      }
      const { data: accountant } = await supabase
        .from('accountants')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();
      if (!accountant) {
        const { data: coach } = await supabase
          .from('coaches')
          .select('id')
          .eq('id', user.id)
          .maybeSingle();
        return NextResponse.redirect(
          new URL(coach ? '/coach/home' : '/accountant/login', request.url)
        );
      }
    }

    if (isCoachPath && user) {
      const { data: coach } = await supabase
        .from('coaches')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();
      if (!coach) {
        const { data: accountant } = await supabase
          .from('accountants')
          .select('id')
          .eq('id', user.id)
          .maybeSingle();
        if (accountant) {
          return NextResponse.redirect(new URL('/accountant/home', request.url));
        }
      }
    }
  } else {
    await supabase.auth.getUser();
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
