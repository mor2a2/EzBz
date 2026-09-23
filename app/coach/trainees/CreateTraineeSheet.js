'use client';

import { useState, useTransition } from 'react';
import Sheet from './Sheet';
import CityAutocomplete from './CityAutocomplete';
import { createTrainee } from './actions';

export default function CreateTraineeSheet({ groups, citySuggestions, initialArea, onClose }) {
  const [name, setName] = useState('');
  const [area, setArea] = useState(initialArea || '');
  const [groupId, setGroupId] = useState('');
  const [error, setError] = useState(null);
  const [isPending, startTransition] = useTransition();

  function save() {
    setError(null);
    startTransition(async () => {
      const res = await createTrainee({ name, area: area || null, groupId: groupId || null });
      if (res?.error) setError(res.error);
      else onClose();
    });
  }

  return (
    <Sheet title="הוסף מתאמן חדש" onClose={onClose}>
      <div className="tr-field">
        <label>שם המתאמן</label>
        <input type="text" placeholder="שם מלא" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="tr-field">
        <label>אזור</label>
        <CityAutocomplete value={area} onChange={setArea} suggestions={citySuggestions} />
        {citySuggestions.length === 0 && (
          <div className="tr-field-hint">אין עדיין ערים מוצעות — אפשר להקליד עיר חופשית</div>
        )}
      </div>
      <div className="tr-field">
        <label>קבוצה (אופציונלי)</label>
        <select value={groupId} onChange={(e) => setGroupId(e.target.value)}>
          <option value="">ללא קבוצה</option>
          {groups.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
      </div>
      {error && <div className="tr-sheet-error">{error}</div>}
      <button type="button" className="tr-save-btn" disabled={isPending} onClick={save}>
        {isPending ? 'שומר...' : 'שמור מתאמן'}
      </button>
    </Sheet>
  );
}
