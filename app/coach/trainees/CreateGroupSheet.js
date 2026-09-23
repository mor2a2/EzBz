'use client';

import { useState, useTransition } from 'react';
import Sheet from './Sheet';
import { createGroup } from './actions';

export default function CreateGroupSheet({ trainees, onClose }) {
  const [name, setName] = useState('');
  const [scheduleLabel, setScheduleLabel] = useState('');
  const [memberIds, setMemberIds] = useState([]);
  const [error, setError] = useState(null);
  const [isPending, startTransition] = useTransition();

  function toggleMember(id) {
    setMemberIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function save() {
    setError(null);
    startTransition(async () => {
      const res = await createGroup({ name, scheduleLabel, memberIds });
      if (res?.error) setError(res.error);
      else onClose();
    });
  }

  return (
    <Sheet title="צור קבוצה חדשה" onClose={onClose}>
      <div className="tr-field">
        <label>שם הקבוצה</label>
        <input type="text" placeholder="לדוגמא: נוער פתח תקווה" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="tr-field">
        <label>מועד קבוע</label>
        <input
          type="text"
          placeholder="לדוגמא: ראשון 10:00"
          value={scheduleLabel}
          onChange={(e) => setScheduleLabel(e.target.value)}
        />
      </div>
      <div className="tr-field">
        <label>בחר מתאמנים</label>
        <div className="tr-members-select">
          {trainees.length === 0 && <div className="tr-member-empty">אין עדיין מתאמנים</div>}
          {trainees.map((t) => (
            <div className="tr-member-option" key={t.id}>
              <input
                type="checkbox"
                id={`m-${t.id}`}
                checked={memberIds.includes(t.id)}
                onChange={() => toggleMember(t.id)}
              />
              <label htmlFor={`m-${t.id}`}>{t.name}</label>
              <span className="tr-member-status">{t.groupName || 'לא משויך'}</span>
            </div>
          ))}
        </div>
      </div>
      {error && <div className="tr-sheet-error">{error}</div>}
      <button type="button" className="tr-save-btn" disabled={isPending} onClick={save}>
        {isPending ? 'שומר...' : 'שמור קבוצה'}
      </button>
    </Sheet>
  );
}
