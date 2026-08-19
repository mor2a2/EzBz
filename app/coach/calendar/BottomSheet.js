'use client';

import Link from 'next/link';
import { formatDayLabel, formatTime, reminderTier } from './calendarMath';

export default function BottomSheet({ session, onClose }) {
  const date = new Date(session.date);
  const tier = reminderTier(date, new Date());

  return (
    <div className="cal-sheet-overlay" onClick={onClose}>
      <div className="cal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="cal-sheet-handle" />
        <div className="cal-sheet-hdr">
          <div>
            <div className="cal-sheet-title">{session.title}</div>
            <div className="cal-sheet-sub">
              {formatDayLabel(date)} · {formatTime(date)} ·{' '}
              {session.isGroup ? `קבוצתי · ${session.memberCount} מתאמנים` : 'אישי'}
            </div>
          </div>
          <button className="cal-sheet-close" onClick={onClose} aria-label="סגור">
            ✕
          </button>
        </div>

        {tier === 'due' && (
          <div className="cal-sheet-reminder">🔔 תזכורת וואטסאפ בטווח 24 השעות שלפני המפגש</div>
        )}

        <div className={`cal-sheet-status ${session.hasSummary ? 'done' : ''}`}>
          {session.hasSummary ? 'סוכם' : 'טרם סוכם'}
        </div>

        <div className="cal-sheet-actions">
          {!session.isGroup && session.traineeId && (
            <Link href={`/coach/trainees/${session.traineeId}`} className="cal-sheet-btn ghost">
              כרטיס מתאמן ↗
            </Link>
          )}
          <Link href={`/coach/sessions/${session.id}`} className="cal-sheet-btn primary">
            + סיכום מפגש
          </Link>
        </div>
      </div>
    </div>
  );
}
