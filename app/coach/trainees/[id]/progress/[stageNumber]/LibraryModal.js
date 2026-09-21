'use client';

function preview(text) {
  if (!text) return null;
  return text.length > 50 ? `${text.slice(0, 50)}…` : text;
}

export default function LibraryModal({ templates, onPick, onClose }) {
  return (
    <div className="sd-modal-overlay" onClick={onClose}>
      <div className="sd-modal" onClick={(e) => e.stopPropagation()}>
        <div className="sd-modal-title">בחר מהמאגר</div>
        {templates.length === 0 && <div className="sd-empty-text">אין עדיין תבניות לשלב הזה.</div>}
        {templates.map((t) => (
          <div className="sd-modal-row" key={t.id}>
            <span className="sd-modal-row-name">{t.template_name || preview(t.session_goal) || 'ללא שם'}</span>
            <button type="button" className="sd-modal-pick-btn" onClick={() => onPick(t)}>
              בחר
            </button>
          </div>
        ))}
        <div className="sd-modal-close">
          <button type="button" onClick={onClose}>
            סגור
          </button>
        </div>
      </div>
    </div>
  );
}
