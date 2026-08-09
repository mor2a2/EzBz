'use client';

import { useState } from 'react';

// מסך זמני ומינימלי לבדיקת זרימת ההזמנה בלבד — לא קשור לעיצוב הנעול של הדשבורד.
export default function InviteCoachPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('שולח...');

    const res = await fetch('/api/admin/invite-coach', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email }),
    });
    const data = await res.json();

    if (res.ok) {
      setStatus('ההזמנה נשלחה בהצלחה');
      setName('');
      setEmail('');
    } else {
      setStatus(`שגיאה: ${data.error}`);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ padding: 24, maxWidth: 320 }}>
      <h1>הזמנת מדריך (זמני, לבדיקה בלבד)</h1>
      <div>
        <label>שם</label>
        <br />
        <input value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
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
      <button type="submit">שלח הזמנה</button>
      {status && <p>{status}</p>}
    </form>
  );
}
