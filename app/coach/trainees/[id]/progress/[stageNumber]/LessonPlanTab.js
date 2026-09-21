'use client';

import { useState, useTransition } from 'react';
import { IconUsers } from '@tabler/icons-react';
import { saveLessonPlan, publishToLibrary } from './actions';
import LibraryModal from './LibraryModal';

export default function LessonPlanTab({ traineeId, stageNumber, plan, library }) {
  const [editing, setEditing] = useState(!!plan);
  const [savedOnce, setSavedOnce] = useState(!!plan);
  const [showLibrary, setShowLibrary] = useState(false);
  const [showPublish, setShowPublish] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [fields, setFields] = useState({
    sessionGoal: plan?.session_goal ?? '',
    plannedTools: plan?.planned_tools ?? '',
    bringToSession: plan?.bring_to_session ?? '',
  });
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState(null);

  function pickTemplate(t) {
    setFields({
      sessionGoal: t.session_goal ?? '',
      plannedTools: t.planned_tools ?? '',
      bringToSession: t.bring_to_session ?? '',
    });
    setShowLibrary(false);
    setEditing(true);
  }

  function save() {
    setError(null);
    startTransition(async () => {
      const res = await saveLessonPlan({ traineeId, stageNumber, ...fields });
      if (res?.error) setError(res.error);
      else setSavedOnce(true);
    });
  }

  function publish() {
    setError(null);
    startTransition(async () => {
      const res = await publishToLibrary({ stageNumber, templateName, ...fields });
      if (res?.error) setError(res.error);
      else {
        setShowPublish(false);
        setTemplateName('');
      }
    });
  }

  if (!editing) {
    return (
      <div className="sd-lesson-empty">
        <p className="sd-empty-text">עדיין אין מערך שיעור למתאמן/ת הזה בשלב הזה.</p>
        <button type="button" className="tr-save-btn" disabled={library.length === 0} onClick={() => setShowLibrary(true)}>
          בחר מהמאגר
        </button>
        <button type="button" className="tr-addbtn sec" onClick={() => setEditing(true)}>
          או צור חדש
        </button>
        {library.length === 0 && <div className="tr-field-hint">אין עדיין תבניות במאגר לשלב הזה</div>}
        {showLibrary && <LibraryModal templates={library} onPick={pickTemplate} onClose={() => setShowLibrary(false)} />}
      </div>
    );
  }

  return (
    <div className="sd-lesson-form">
      {library.length > 0 && (
        <div className="sd-shared-bar">
          <span>
            <IconUsers size={13} /> {library.length} תבניות במאגר לשלב זה
          </span>
          <button type="button" className="sd-shared-bar-btn" onClick={() => setShowLibrary(true)}>
            בחר מהמאגר
          </button>
        </div>
      )}

      <div className="tr-field">
        <label>מטרת המפגש</label>
        <textarea
          style={{ minHeight: 52 }}
          value={fields.sessionGoal}
          onChange={(e) => setFields({ ...fields, sessionGoal: e.target.value })}
        />
      </div>
      <div className="tr-field">
        <label>כלים ופעילויות מתוכננות</label>
        <textarea
          style={{ minHeight: 80 }}
          value={fields.plannedTools}
          onChange={(e) => setFields({ ...fields, plannedTools: e.target.value })}
        />
      </div>
      <div className="tr-field">
        <label>להביא למפגש</label>
        <textarea
          style={{ minHeight: 52 }}
          value={fields.bringToSession}
          onChange={(e) => setFields({ ...fields, bringToSession: e.target.value })}
        />
      </div>

      {error && <div className="tr-sheet-error">{error}</div>}

      <div className="sd-lesson-foot">
        {savedOnce && (
          <button type="button" className="tr-addbtn sec" onClick={() => setShowPublish(true)}>
            שלח למאגר
          </button>
        )}
        <button type="button" className="tr-save-btn" disabled={isPending} onClick={save}>
          {isPending ? 'שומר...' : 'שמור מערך'}
        </button>
      </div>

      {showPublish && (
        <div className="sd-publish-box">
          <div className="tr-field">
            <label>שם תבנית (אופציונלי)</label>
            <input value={templateName} onChange={(e) => setTemplateName(e.target.value)} placeholder="לדוגמה: מערך בסיסי" />
          </div>
          <div className="sd-lesson-foot">
            <button type="button" className="tr-addbtn sec" onClick={() => setShowPublish(false)}>
              ביטול
            </button>
            <button type="button" className="tr-save-btn" disabled={isPending} onClick={publish}>
              שלח
            </button>
          </div>
        </div>
      )}

      {showLibrary && <LibraryModal templates={library} onPick={pickTemplate} onClose={() => setShowLibrary(false)} />}
    </div>
  );
}
