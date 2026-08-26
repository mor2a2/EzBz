'use client';

import { useState, useTransition } from 'react';
import Sheet from '../Sheet';
import { createSession } from '../actions';

export default function AddSessionSheet({ traineeId, groupId, onClose }) {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [error, setError] = useState(null);
  const [isPending, startTransition] = useTransition();

  function save() {
    setError(null);
    startTransition(async () => {
      const res = await createSession(groupId ? { groupId, date, time } : { traineeId, date, time });
      if (res?.error) setError(res.error);
      else onClose();
    });
  }

  return (
    <Sheet title="קביעת מפגש" onClose={onClose}>
      <div className="tr-field">
        <label>תאריך</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>
      <div className="tr-field">
        <label>שעה</label>
        <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
      </div>
      {error && <div className="tr-sheet-error">{error}</div>}
      <button type="button" className="tr-save-btn" disabled={isPending} onClick={save}>
        {isPending ? 'שומר...' : 'קבע מפגש'}
      </button>
    </Sheet>
  );
}
