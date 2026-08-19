'use client';

import { WEEKDAY_LABELS, buildMonthGrid, startOfDay } from './calendarMath';

export default function MonthView({ cursor, sessionsByDay, onSelectDay }) {
  const weeks = buildMonthGrid(cursor);
  const today = startOfDay(new Date());
  const currentMonth = cursor.getMonth();

  return (
    <div className="cal-month">
      <div className="cal-month-hdr">
        {WEEKDAY_LABELS.map((w) => (
          <div key={w} className="cal-month-hdr-cell">
            {w}
          </div>
        ))}
      </div>
      {weeks.map((week, wi) => (
        <div className="cal-month-row" key={wi}>
          {week.map((day) => {
            const key = day.toDateString();
            const daySessions = sessionsByDay[key] ?? [];
            const isToday = key === today.toDateString();
            const inMonth = day.getMonth() === currentMonth;
            const hasSolo = daySessions.some((s) => !s.isGroup);
            const hasGroup = daySessions.some((s) => s.isGroup);
            return (
              <button
                key={key}
                className={`cal-month-cell ${inMonth ? '' : 'dim'} ${isToday ? 'today' : ''}`}
                onClick={() => onSelectDay(day)}
              >
                <span className="cal-month-daynum">{day.getDate()}</span>
                {(hasSolo || hasGroup) && (
                  <span className="cal-month-dots">
                    {hasSolo && <span className="cal-dot solo" />}
                    {hasGroup && <span className="cal-dot group" />}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
