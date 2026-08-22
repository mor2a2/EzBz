'use client';

import { useState, useTransition } from 'react';
import Sheet from '../Sheet';
import { addTraineePayment } from '../actions';

export default function AddPaymentSheet({ traineeId, onClose }) {
  const [dueDate, setDueDate] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState(null);
  const [isPending, startTransition] = useTransition();

  function save() {
    setError(null);
    startTransition(async () => {
      const res = await addTraineePayment({ traineeId, dueDate, amount });
      if (res?.error) setError(res.error);
      else onClose();
    });
  }

  return (
    <Sheet title="הוסף תשלום" onClose={onClose}>
      <div className="tr-field">
        <label>תאריך יעד</label>
        <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
      </div>
      <div className="tr-field">
        <label>סכום (₪)</label>
        <input type="number" min="0" step="1" value={amount} onChange={(e) => setAmount(e.target.value)} />
      </div>
      {error && <div className="tr-sheet-error">{error}</div>}
      <button type="button" className="tr-save-btn" disabled={isPending} onClick={save}>
        {isPending ? 'שומר...' : 'שמור תשלום'}
      </button>
    </Sheet>
  );
}
