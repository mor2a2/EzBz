'use client';

import { useMemo, useState } from 'react';
import HeaderGrid from '../HeaderGrid';
import MonthView from './MonthView';
import WeekView from './WeekView';
import DayView from './DayView';
import BottomSheet from './BottomSheet';
import {
  addDays,
  addMonths,
  buildWeekDays,
  endOfMonth,
  formatDayLabel,
  formatMonthYear,
  formatWeekRangeLabel,
  startOfDay,
  startOfMonth,
} from './calendarMath';
import './calendar.css';

export default function Calendar({ sessions, initialDate, rangeStart, rangeEnd }) {
  const [view, setView] = useState('week');
  const [cursor, setCursor] = useState(() =>
    startOfDay(initialDate ? new Date(initialDate) : new Date())
  );
  const [selectedId, setSelectedId] = useState(null);

  const sessionsByDay = useMemo(() => {
    const map = {};
    for (const s of sessions) {
      const key = startOfDay(new Date(s.date)).toDateString();
      (map[key] ??= []).push(s);
    }
    return map;
  }, [sessions]);

  const selectedSession = sessions.find((s) => s.id === selectedId) ?? null;

  // "מעבר לטווח" — רלוונטי לתצוגה חודשית בלבד (ניווט בשבועי/יומי לא נגענו בו
  // היום). משווה מול rangeStart/rangeEnd שהתקבלו מ-page.js, לא מחשב טווח
  // עצמאי בצד הלקוח, כדי שההודעה תמיד תואמת בדיוק למה שבאמת נשלף מהשרת.
  let outOfRangeDirection = null;
  if (view === 'month' && rangeStart && rangeEnd) {
    const monthEnd = endOfMonth(cursor);
    const monthStart = startOfMonth(cursor);
    if (monthEnd < new Date(rangeStart)) outOfRangeDirection = 'past';
    else if (monthStart > new Date(rangeEnd)) outOfRangeDirection = 'future';
  }

  function goPrev() {
    setCursor((c) => (view === 'month' ? addMonths(c, -1) : view === 'week' ? addDays(c, -7) : addDays(c, -1)));
  }
  function goNext() {
    setCursor((c) => (view === 'month' ? addMonths(c, 1) : view === 'week' ? addDays(c, 7) : addDays(c, 1)));
  }
  function goToday() {
    setCursor(startOfDay(new Date()));
  }

  const label =
    view === 'month'
      ? formatMonthYear(cursor)
      : view === 'week'
        ? formatWeekRangeLabel(buildWeekDays(cursor))
        : formatDayLabel(cursor);

  return (
    <div className="cal-root">
      <div className="cal-hdr">
        <HeaderGrid />
        <div className="cal-hdr-content">
          <div className="cal-hdr-greet">קלנדר</div>
          <div className="cal-hdr-title">המפגשים שלי</div>
        </div>
      </div>

      <div className="cal-views">
        <button className={`cal-vtab ${view === 'month' ? 'on' : ''}`} onClick={() => setView('month')}>
          חודשי
        </button>
        <button className={`cal-vtab ${view === 'week' ? 'on' : ''}`} onClick={() => setView('week')}>
          שבועי
        </button>
        <button className={`cal-vtab ${view === 'day' ? 'on' : ''}`} onClick={() => setView('day')}>
          יומי
        </button>
      </div>

      <div className="cal-nav">
        <button className="cal-nav-btn" onClick={goPrev} aria-label="הקודם">
          ‹
        </button>
        <button className="cal-nav-label" onClick={goToday}>
          {label}
        </button>
        <button className="cal-nav-btn" onClick={goNext} aria-label="הבא">
          ›
        </button>
      </div>

      {view === 'month' && outOfRangeDirection && (
        <div className="cal-range-notice">
          <div className="cal-range-notice-title">הלכת רחוק מדי</div>
          <div className="cal-range-notice-sub">
            {outOfRangeDirection === 'future'
              ? 'כרגע ניתן לראות עד חצי שנה קדימה.'
              : 'כרגע ניתן לראות עד חצי שנה אחורה.'}
          </div>
        </div>
      )}
      {view === 'month' && !outOfRangeDirection && (
        <MonthView
          cursor={cursor}
          sessionsByDay={sessionsByDay}
          onSelectDay={(day) => {
            setCursor(day);
            setView('day');
          }}
        />
      )}
      {view === 'week' && (
        <WeekView cursor={cursor} sessionsByDay={sessionsByDay} onSelectSession={setSelectedId} />
      )}
      {view === 'day' && (
        <DayView cursor={cursor} sessionsByDay={sessionsByDay} onSelectSession={setSelectedId} />
      )}

      {selectedSession && <BottomSheet session={selectedSession} onClose={() => setSelectedId(null)} />}
    </div>
  );
}
