'use client';

import { useState, useTransition } from 'react';
import { IconUsers } from '@tabler/icons-react';
import Sheet from './Sheet';
import { assignTraineeToGroup } from './actions';

export default function AssignGroupSheet({ trainee, groups, onClose }) {
  const [error, setError] = useState(null);
  const [isPending, startTransition] = useTransition();

  function assign(groupId) {
    setError(null);
    startTransition(async () => {
      const res = await assignTraineeToGroup(trainee.id, groupId);
      if (res?.error) setError(res.error);
      else onClose();
    });
  }

  return (
    <Sheet title={`שייך את ${trainee.name} לקבוצה`} onClose={onClose}>
      {groups.length === 0 && <div className="tr-member-empty">אין עדיין קבוצות — צרי קבוצה חדשה קודם</div>}
      <div className="tr-members-select">
        {groups.map((g) => (
          <button
            type="button"
            key={g.id}
            className="tr-assign-option"
            disabled={isPending}
            onClick={() => assign(g.id)}
          >
            <IconUsers size={13} />
            {g.name}
          </button>
        ))}
      </div>
      {error && <div className="tr-sheet-error">{error}</div>}
    </Sheet>
  );
}
