'use client';

import { useState, useTransition } from 'react';
import { addCoordinator, updateCoordinator, deleteCoordinator } from './actions';
import { isValidPhone } from './validation';

const EMPTY_FORM = { region: '', name: '', phone: '', email: '' };

export default function CoordinatorsAdmin({ coordinators }) {
  const [isPending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState(null);

  function startEdit(c) {
    setEditingId(c.id);
    setForm({ region: c.region, name: c.name, phone: c.phone ?? '', email: c.email ?? '' });
    setError(null);
  }

  function resetForm() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError(null);
  }

  function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    if (!isValidPhone(form.phone)) {
      setError('טלפון חייב להכיל ספרות בלבד (מקפים/רווחים מותרים)');
      return;
    }
    startTransition(async () => {
      const result = editingId ? await updateCoordinator(editingId, form) : await addCoordinator(form);
      if (result?.error) setError(result.error);
      else resetForm();
    });
  }

  function handleDelete(id) {
    if (!confirm('למחוק רכז/ה זה/ו?')) return;
    startTransition(async () => {
      await deleteCoordinator(id);
      if (editingId === id) resetForm();
    });
  }

  const byRegion = coordinators.reduce((acc, c) => {
    (acc[c.region] ??= []).push(c);
    return acc;
  }, {});

  return (
    <div className="coord-root">
      <form className="coord-form" onSubmit={handleSubmit}>
        <div className="coord-form-title">{editingId ? 'עריכת רכז/ה' : 'רכז/ה חדש/ה'}</div>
        <div className="coord-fields">
          <input
            required
            placeholder="איזור (לדוגמה: רעננה)"
            value={form.region}
            onChange={(e) => setForm({ ...form, region: e.target.value })}
          />
          <input required placeholder="שם" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input
            type="tel"
            inputMode="numeric"
            placeholder="טלפון"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <input
            placeholder="אימייל"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        {error && <div className="coord-error">{error}</div>}
        <div className="coord-form-actions">
          <button type="submit" disabled={isPending}>
            {editingId ? 'שמור שינויים' : '+ הוסף רכז/ה'}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm}>
              ביטול
            </button>
          )}
        </div>
      </form>

      <div className="coord-list">
        {coordinators.length === 0 && <div className="coord-empty">אין רכזים עדיין.</div>}
        {Object.entries(byRegion).map(([region, list]) => (
          <div className="coord-group" key={region}>
            <div className="coord-region-lbl">{region}</div>
            {list.map((c) => (
              <div className="coord-row" key={c.id}>
                <div className="coord-info">
                  <div className="coord-name">{c.name}</div>
                  {c.phone && (
                    <div className="coord-field">
                      <span className="coord-field-lbl">טלפון</span>
                      {c.phone}
                    </div>
                  )}
                  {c.email && (
                    <div className="coord-field">
                      <span className="coord-field-lbl">אימייל</span>
                      {c.email}
                    </div>
                  )}
                </div>
                <div className="coord-actions">
                  <button onClick={() => startEdit(c)}>ערוך</button>
                  <button onClick={() => handleDelete(c.id)}>מחק</button>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
