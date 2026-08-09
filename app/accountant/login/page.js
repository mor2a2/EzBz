'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

// מסך זמני ומינימלי — לא קשור לעיצוב הנעול של הדשבורד.
export default function AccountantLoginPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('שולח...');

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/confirm?next=/accountant/home`,
      },
    });

    if (error) {
      setStatus(`שגיאה: ${error.message}`);
    } else {
      setStatus('נשלח קישור כניסה למייל');
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ padding: 24, maxWidth: 320 }}>
      <h1>כניסת רו"ח (זמני)</h1>
      <div>
        <label>אימייל</label>
        <br />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <button type="submit">שלח קישור כניסה</button>
      {status && <p>{status}</p>}
    </form>
  );
}
