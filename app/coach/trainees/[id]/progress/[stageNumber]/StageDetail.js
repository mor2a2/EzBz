'use client';

import { useState } from 'react';
import LessonPlanTab from './LessonPlanTab';
import SessionNotesTab from './SessionNotesTab';

function fmtShortDate(iso) {
  return new Intl.DateTimeFormat('he-IL', { day: 'numeric', month: 'long' }).format(new Date(iso));
}

export default function StageDetail({
  traineeId,
  groupId,
  stageNumber,
  defaultTab,
  lastNote,
  plan,
  library,
  pastSummaries,
  sessionMode,
  knownSession,
  candidates,
  planPreviewText,
}) {
  const [tab, setTab] = useState(defaultTab);

  return (
    <>
      {lastNote && (
        <div className="sd-banner">
          <div className="sd-banner-label">ממה המשכנו · {fmtShortDate(lastNote.date)}</div>
          <div className="sd-banner-text">{lastNote.next_session_note}</div>
        </div>
      )}

      <div className="tr-tabs">
        <div className={`tr-tab ${tab === 'plan' ? 'on' : ''}`} onClick={() => setTab('plan')}>
          מערך שיעור
        </div>
        <div className={`tr-tab ${tab === 'notes' ? 'on' : ''}`} onClick={() => setTab('notes')}>
          הערות מפגש{pastSummaries.length ? ` (${pastSummaries.length})` : ''}
        </div>
      </div>

      {tab === 'plan' ? (
        <LessonPlanTab traineeId={traineeId} stageNumber={stageNumber} plan={plan} library={library} />
      ) : (
        <SessionNotesTab
          traineeId={traineeId}
          groupId={groupId}
          stageNumber={stageNumber}
          pastSummaries={pastSummaries}
          sessionMode={sessionMode}
          knownSession={knownSession}
          candidates={candidates}
          planPreviewText={planPreviewText}
        />
      )}
    </>
  );
}
