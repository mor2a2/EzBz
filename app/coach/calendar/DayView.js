'use client';

import { formatTime } from './calendarMath';

export default function DayView({ cursor, sessionsByDay, onSelectSession }) {
  const key = cursor.toDateString();
  const daySessions = (sessionsByDay[key] ?? []).slice().sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <div className="cal-day">
      {daySessions.length === 0 ? (
        <div className="cal-week-empty">אין מפגשים ביום זה</div>
      ) : (
        daySessions.map((s) => (
          <button key={s.id} className="cal-sess-row" onClick={() => onSelectSession(s.id)}>
            <span className={`cal-dot ${s.isGroup ? 'group' : 'solo'}`} />
            <span className="cal-sess-time">{formatTime(new Date(s.date))}</span>
            <span className="cal-sess-name">{s.title}</span>
            <span className="cal-sess-type">{s.isGroup ? `קבוצתי · ${s.memberCount}` : 'אישי'}</span>
          </button>
        ))
      )}
    </div>
  );
}
