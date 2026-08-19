'use client';

import { useState } from 'react';
import { IconChevronDown } from '@tabler/icons-react';
import { WEEKDAY_FULL, buildWeekDays, formatTime, startOfDay } from './calendarMath';

export default function WeekView({ cursor, sessionsByDay, onSelectSession }) {
  const [showPast, setShowPast] = useState(false);

  const days = buildWeekDays(cursor);
  const today = startOfDay(new Date());
  const todayKey = today.toDateString();
  const isCurrentWeek = days.some((d) => d.toDateString() === todayKey);
  const pastDays = isCurrentWeek ? days.filter((d) => d < today) : [];
  const visibleDays = isCurrentWeek && !showPast ? days.filter((d) => d >= today) : days;

  // אין שדה attendance במערכת, אז אין הבחנה בין "מפגש שלא התקיים" ל"מפגש בלי
  // תיעוד" — כל מפגש עבר בלי summary נחשב לצורך ה-badge.
  const hasUnsummarizedPast = pastDays.some((day) =>
    (sessionsByDay[day.toDateString()] ?? []).some((s) => !s.hasSummary)
  );

  return (
    <div className="cal-week">
      {isCurrentWeek && pastDays.length > 0 && (
        <button type="button" className="cal-week-past-toggle" onClick={() => setShowPast((v) => !v)}>
          <IconChevronDown size={12} className={`cal-week-past-chev ${showPast ? 'op' : ''}`} />
          <span>{showPast ? 'הסתר עבר' : 'הצג עבר'}</span>
          {!showPast && hasUnsummarizedPast && <span className="cal-week-past-badge" />}
        </button>
      )}
      {visibleDays.map((day) => {
        const key = day.toDateString();
        const daySessions = (sessionsByDay[key] ?? []).slice().sort((a, b) => new Date(a.date) - new Date(b.date));
        const isToday = key === todayKey;
        const isBusy = daySessions.length > 0;

        return (
          <div className={`cal-week-day ${isToday ? 'is-today' : ''} ${isBusy ? 'is-busy' : ''}`.trim()} key={key}>
            <div className={`cal-week-daylbl ${isToday ? 'is-today' : ''}`}>
              {WEEKDAY_FULL[day.getDay()]} {day.getDate()}
            </div>
            {daySessions.length === 0 ? (
              <div className="cal-week-empty">אין מפגשים</div>
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
      })}
    </div>
  );
}
