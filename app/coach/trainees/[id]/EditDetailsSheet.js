'use client';

import { useState, useTransition } from 'react';
import Sheet from '../Sheet';
import CityAutocomplete from '../CityAutocomplete';
import { updateTraineeDetails } from '../actions';

function todayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function EditDetailsSheet({ trainee, citySuggestions, onClose }) {
  const [age, setAge] = useState(trainee.age ?? '');
  const [phone, setPhone] = useState(trainee.phone ?? '');
  const [parentName, setParentName] = useState(trainee.parentName ?? '');
  const [parentPhone, setParentPhone] = useState(trainee.parentPhone ?? '');
  const [parentConsent, setParentConsent] = useState(!!trainee.parentConsent);
  const [startMonth, setStartMonth] = useState(trainee.startDate ? trainee.startDate.slice(0, 7) : '');
  const [area, setArea] = useState(trainee.area ?? '');
  const [note, setNote] = useState(trainee.note ?? '');
  const [error, setError] = useState(null);
  const [isPending, startTransition] = useTransition();

  function save() {
    setError(null);
    const parentConsentDate = parentConsent ? (trainee.parentConsent ? trainee.parentConsentDate : todayIso()) : null;

    startTransition(async () => {
      const res = await updateTraineeDetails(trainee.id, {
        age,
        phone,
        parentName,
        parentPhone,
        parentConsent,
        parentConsentDate,
        startDate: startMonth ? `${startMonth}-01` : null,
        area,
        note,
      });
      if (res?.error) setError(res.error);
      else onClose();
    });
  }

  return (
    <Sheet title="עריכת פרטי מתאמן/ת" onClose={onClose}>
      <div className="tr-field">
        <label>גיל</label>
        <input type="number" min="0" max="120" value={age} onChange={(e) => setAge(e.target.value)} />
      </div>

      <div className="tr-field">
        <label>טלפון (של המתאמן/ת)</label>
        <input type="tel" placeholder="05X-XXXXXXX" value={phone} onChange={(e) => setPhone(e.target.value)} />
      </div>

      <div className="tr-field">
        <label>שם ההורה</label>
        <input type="text" value={parentName} onChange={(e) => setParentName(e.target.value)} />
      </div>
      <div className="tr-field">
        <label>טלפון ההורה</label>
        <input type="tel" placeholder="05X-XXXXXXX" value={parentPhone} onChange={(e) => setParentPhone(e.target.value)} />
      </div>

      <div className="tc-consent-row">
        <label>
          <input type="checkbox" checked={parentConsent} onChange={(e) => setParentConsent(e.target.checked)} />
          אישור הורים
        </label>
        {parentConsent && (
          <span className="tc-consent-date">
            {trainee.parentConsent && trainee.parentConsentDate ? trainee.parentConsentDate : todayIso()}
          </span>
        )}
      </div>

      <div className="tr-field">
        <label>תאריך התחלה</label>
        <input type="month" value={startMonth} onChange={(e) => setStartMonth(e.target.value)} />
      </div>

      <div className="tr-field">
        <label>אזור</label>
        <CityAutocomplete value={area} onChange={setArea} suggestions={citySuggestions} />
      </div>

      <div className="tr-field">
        <label>סוג ליווי</label>
        <div className="tc-fv-readonly">{trainee.groupId ? 'קבוצה' : 'יחיד'}</div>
      </div>

      <div className="tr-field">
        <label>הערה</label>
        <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} />
      </div>

      {error && <div className="tr-sheet-error">{error}</div>}
      <button type="button" className="tr-save-btn" disabled={isPending} onClick={save}>
        {isPending ? 'שומר...' : 'שמור פרטים'}
      </button>
    </Sheet>
  );
}
