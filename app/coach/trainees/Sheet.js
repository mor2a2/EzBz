'use client';

import { IconX } from '@tabler/icons-react';

export default function Sheet({ title, onClose, children }) {
  return (
    <div className="tr-overlay" onClick={onClose}>
      <div className="tr-sheet" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="tr-sheet-close" onClick={onClose}>
          <IconX size={16} />
        </button>
        <div className="tr-sheet-handle" />
        <div className="tr-sheet-title">{title}</div>
        {children}
      </div>
    </div>
  );
}
