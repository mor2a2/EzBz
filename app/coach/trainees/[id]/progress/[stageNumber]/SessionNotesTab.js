'use client';

import { useState, useTransition } from 'react';
import { saveSessionNotes, createSessionWithNotes } from './actions';

const MOODS = [
  { value: 'open', label: 'פתוח' },
  { value: 'hopeful', label: 'מלא תקווה' },
  { value: 'resistant', label: 'מתנגד' },
  { value: 'overwhelmed', label: 'עמוס' },
  { value: 'quiet', label: 'שקט' },
];
const MOOD_LABEL = Object.fromEntries(MOODS.map((m) => [m.value, m.label]));

function fmtDate(iso) {
  return new Intl.DateTimeFormat('he-IL', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(iso));
}
function todayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function SessionNotesTab({
  traineeId,
  groupId,
  stageNumber,
  pastSummaries,
  sessionMode,
  knownSession,
  candidates,
  planPreviewText,
}) {
  const [chosen, setChosen] = useState(sessionMode === 'pick' ? null : knownSession);
  const [mood, setMood] = useState(chosen?.emotional_state ?? null);
  const [summaryText, setSummaryText] = useState(chosen?.summary ?? '');
  const [nextNote, setNextNote] = useState(chosen?.next_session_note ?? '');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);

  function pickCandidate(c) {
    setChosen(c);
    setMood(c.emotional_state ?? null);
    setSummaryText(c.summary ?? '');
    setNextNote(c.next_session_note ?? '');
  }

  function changeSelection() {
    setChosen(null);
    setMood(null);
    setSummaryText('');
    setNextNote('');
  }

  function save() {
    setError(null);
    startTransition(async () => {
      const res = chosen
        ? await saveSessionNotes({
            sessionId: chosen.id,
            traineeId,
            stageNumber,
            mood,
            summary: summaryText,
            nextSessionNote: nextNote,
          })
        : await createSessionWithNotes({
            traineeId,
            groupId,
            stageNumber,
            date,
            time,
            mood,
            summary: summaryText,
            nextSessionNote: nextNote,
          });
      if (res?.error) setError(res.error);
      else setDone(true);
    });
  }

  return (
    <div className="sd-notes">
      {planPreviewText && (
        <div className="sd-banner sd-plan-preview">
          <div className="sd-banner-label">מערך שיעור לשלב זה</div>
          <div className="sd-banner-text">
            {planPreviewText}
          </div>
        </div>
      )}

      {pastSummaries.map((s) => (
        <div className="sn-card" key={s.id}>
          <div className="sn-date">{fmtDate(s.date)}</div>
          <div className="sn-text">{s.summary}</div>
          {s.emotional_state && (
            <div className="sn-tags">
              <span className="sn-tag">{MOOD_LABEL[s.emotional_state] ?? s.emotional_state}</span>
            </div>
          )}
          {s.next_session_note && <div className="sn-next-note">← לפגישה הבאה: {s.next_session_note}</div>}
        </div>
      ))}

      {done ? (
        <div className="sd-empty-text">ההערות נשמרו.</div>
      ) : sessionMode === 'pick' && !chosen ? (
        <div className="sd-picker">
          <div className="add-label">לאיזה מפגש?</div>
          {candidates.map((c) => (
            <button type="button" key={c.id} className="sd-picker-row" onClick={() => pickCandidate(c)}>
              {fmtDate(c.date)}
            </button>
          ))}
        </div>
      ) : (
        <div className="add-area">
          <div className="add-label">הוסף סיכום{groupId ? ': לקבוצה' : ': אישי למתאמן'}</div>

          {chosen && (
            <div className="sd-chosen-date">
              מסכם/ת את המפגש מ־{fmtDate(chosen.date)}
              {sessionMode === 'pick' && (
                <button type="button" className="sd-change-link" onClick={changeSelection}>
                  שנה בחירה
                </button>
              )}
            </div>
          )}

          {!chosen && (
            <>
              <div className="tr-field">
                <label>תאריך המפגש</label>
                <input type="date" max={todayIso()} value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
              <div className="tr-field">
                <label>שעה</label>
                <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
              </div>
            </>
          )}

          <div className="mood-row">
            {MOODS.map((m) => (
              <button
                type="button"
                key={m.value}
                className={`mood-btn ${mood === m.value ? 'on' : ''}`}
                onClick={() => setMood(mood === m.value ? null : m.value)}
              >
                {m.label}
              </button>
            ))}
          </div>
          <textarea
            style={{ minHeight: 60 }}
            placeholder="מה עלה במפגש..."
            value={summaryText}
            onChange={(e) => setSummaryText(e.target.value)}
          />
          <div className="next-field-label">לפגישה הבאה</div>
          <input
            className="next-field"
            type="text"
            value={nextNote}
            onChange={(e) => setNextNote(e.target.value)}
            placeholder="מה לזכור / לבדוק בפגישה הבאה..."
          />

          {error && <div className="tr-sheet-error">{error}</div>}

          <div className="notes-foot">
            <button type="button" className="tr-save-btn" disabled={isPending} onClick={save}>
              {isPending ? 'שומר...' : 'שמור הערות'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
