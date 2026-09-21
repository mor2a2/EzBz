'use client';

import { useState, useTransition } from 'react';
import { IconPencil, IconCheck, IconX } from '@tabler/icons-react';
import { updateStageName } from './actions';

export default function EditableStageName({ traineeId, stageNumber, name }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(name);
  const [isPending, startTransition] = useTransition();

  function save() {
    if (!value.trim() || value.trim() === name) {
      setEditing(false);
      return;
    }
    startTransition(async () => {
      const res = await updateStageName(traineeId, stageNumber, value);
      if (!res?.error) setEditing(false);
    });
  }

  if (!editing) {
    return (
      <button
        type="button"
        className="pg-name sd-name-btn"
        onClick={() => {
          setValue(name);
          setEditing(true);
        }}
      >
        {name} <IconPencil size={12} />
      </button>
    );
  }

  return (
    <div className="sd-name-edit">
      <input value={value} onChange={(e) => setValue(e.target.value)} autoFocus />
      <button type="button" onClick={save} disabled={isPending} aria-label="שמור">
        <IconCheck size={14} />
      </button>
      <button type="button" onClick={() => setEditing(false)} aria-label="ביטול">
        <IconX size={14} />
      </button>
    </div>
  );
}
