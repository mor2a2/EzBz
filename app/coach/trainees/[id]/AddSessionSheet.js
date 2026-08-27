'use client';

import { useState, useTransition } from 'react';
import Sheet from '../Sheet';
import { createSession, checkSessionConflict } from '../actions';

function todayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function nowHhMm() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export default function AddSessionSheet({ traineeId, groupId, onClose }) {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [error, setError] = useState(null);
  const [conflictName, setConflictName] = useState(null);
  const [isPending, startTransition] = useTransition();

  const minDate = todayIso();
  const minTime = date === minDate ? nowHhMm() : undefined;

  function updateDate(v) {
    setDate(v);
    setConflictName(null);
  }
  function updateTime(v) {
    setTime(v);
    setConflictName(null);
  }

  function save() {
    setError(null);
    if (date && time && new Date(`${date}T${time}:00`) < new Date()) {
      setError('לא ניתן לקבוע מפגש בתאריך/שעה שכבר עברו');
      return;
    }
    startTransition(async () => {
      if (!conflictName) {
        const { conflict } = await checkSessionConflict({ date, time });
        if (conflict) {
          setConflictName(conflict.name);
          return;
        }
      }
      const res = await createSession(groupId ? { groupId, date, time } : { traineeId, date, time });
      if (res?.error) setError(res.error);
      else onClose();
    });
  }

  return (
    <Sheet title="קביעת מפגש" onClose={onClose}>
      <div className="tr-field">
        <label>תאריך</label>
        <input type="date" min={minDate} value={date} onChange={(e) => updateDate(e.target.value)} />
      </div>
      <div className="tr-field">
        <label>שעה</label>
        <input type="time" min={minTime} value={time} onChange={(e) => updateTime(e.target.value)} />
      </div>
      {error && <div className="tr-sheet-error">{error}</div>}
      {conflictName && !error && (
        <div className="tr-sheet-warning">
          יש לך כבר מפגש עם {conflictName} בשעה הזו. לקבוע בכל זאת?
        </div>
      )}
      <button type="button" className="tr-save-btn" disabled={isPending} onClick={save}>
        {isPending ? 'שומר...' : conflictName ? 'קבע בכל זאת' : 'קבע מפגש'}
      </button>
      {conflictName && (
        <button type="button" className="tr-addbtn sec tr-cancel-btn" onClick={() => setConflictName(null)}>
          ביטול
        </button>
      )}
    </Sheet>
  );
}
