'use client';

import { WEEKDAY_LABELS, buildMonthGrid, startOfDay } from './calendarMath';

export default function MonthView({ cursor, sessionsByDay, onSelectDay }) {
  const weeks = buildMonthGrid(cursor);
  const today = startOfDay(new Date());
  const todayKey = today.toDateString();
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
            const isToday = key === todayKey;
            const inMonth = day.getMonth() === currentMonth;
            // "עבר בתוך החודש" מקבל את אותו גוון מוחלש כמו "מחוץ לחודש" —
            // לא טוקן חדש. ההבחנה בין השניים לא ויזואלית יותר; מה שכן נשאר
            // גלוי בשני המקרים הוא נוכחות/היעדר נקודה (יש מפגש או אין).
            const isPast = day < today;
            const isMuted = !inMonth || isPast;
            const hasSolo = daySessions.some((s) => !s.isGroup);
            const hasGroup = daySessions.some((s) => s.isGroup);
            const isBusy = hasSolo || hasGroup;
            const cellClass = [
              'cal-month-cell',
              isMuted && 'dim',
              isToday && 'is-today',
              isBusy && 'is-busy',
            ]
              .filter(Boolean)
              .join(' ');
            return (
              <button key={key} className={cellClass} onClick={() => onSelectDay(day)}>
                <span className="cal-month-daynum">{day.getDate()}</span>
                {isBusy && (
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
