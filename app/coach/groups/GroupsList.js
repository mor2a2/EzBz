'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { IconUsers, IconClock, IconCalendarEvent, IconChevronLeft, IconPlus, IconUserPlus } from '@tabler/icons-react';
import HeaderGrid from '../HeaderGrid';
import CreateGroupSheet from '../trainees/CreateGroupSheet';
import CreateTraineeSheet from '../trainees/CreateTraineeSheet';

function initials(name) {
  return name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]).join('');
}

function TraineeLinkRow({ trainee }) {
  return (
    <Link href={`/coach/trainees/${trainee.id}/progress`} className="tr-row gr-row">
      <div className="tr-av">{initials(trainee.name)}</div>
      <div className="tr-info">
        <div className="tr-name">{trainee.name}</div>
        <div className="tr-sub">
          {trainee.groupName ? (
            <span className="tr-tag">{trainee.groupName}</span>
          ) : trainee.nextSessionLabel ? (
            <span className="tr-time">
              <IconClock size={10} />
              {trainee.nextSessionLabel}
            </span>
          ) : (
            <span>אין פגישה</span>
          )}
        </div>
      </div>
      <IconChevronLeft size={14} className="gr-chev" />
    </Link>
  );
}

export default function GroupsList({ groups, trainees, citySuggestions }) {
  const [query, setQuery] = useState('');
  const [showGroupSheet, setShowGroupSheet] = useState(false);
  const [showTraineeSheet, setShowTraineeSheet] = useState(false);

  const q = query.trim().toLowerCase();

  // קבוצה שתאמה מוצגת ככרטיס. בלי חיפוש: כל הקבוצות, בסדר שהשרת קבע.
  const visibleGroups = useMemo(
    () => (q ? groups.filter((g) => g.name.toLowerCase().includes(q)) : groups),
    [groups, q]
  );

  // ילד שתאם מוצג כשורה (עם שם הקבוצה בתת-כותרת אם יש). בלי חיפוש: רק ילדים ללא קבוצה.
  const visibleTrainees = useMemo(
    () => (q ? trainees.filter((t) => t.name.toLowerCase().includes(q)) : trainees.filter((t) => !t.groupId)),
    [trainees, q]
  );

  const nothingAtAll = groups.length === 0 && trainees.length === 0;
  const nothingFound = q && visibleGroups.length === 0 && visibleTrainees.length === 0;

  return (
    <div className="tr-root">
      <div className="tr-hdr">
        <HeaderGrid />
        <div className="tr-hdr-content">
          <div className="tr-hdr-greet">קבוצות</div>
          <div className="tr-hdr-title">הקבוצות שלי</div>
        </div>
      </div>

      <div className="tr-search">
        <input
          type="text"
          placeholder="חיפוש לפי שם ילד או קבוצה..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {nothingAtAll && <div className="tr-empty">אין עדיין קבוצות או מתאמנים.</div>}
      {nothingFound && <div className="tr-empty">לא נמצאו תוצאות.</div>}

      {visibleGroups.map((g) => (
        <Link key={g.id} href={`/coach/groups/${g.id}`} className="tr-gcard gr-gcard">
          <div className="tr-ghdr">
            <div className="tr-gname">
              <IconUsers size={13} className="tr-gicon" />
              {g.name}
              <span className="tr-gbadge">{g.memberCount}</span>
            </div>
            <div className="tr-ghdr-right">
              {g.scheduleLabel && (
                <span className="tr-gtime">
                  <IconClock size={10} />
                  {g.scheduleLabel}
                </span>
              )}
              <IconChevronLeft size={14} className="gr-chev" />
            </div>
          </div>
          <div className="gr-gcard-sub">
            {g.nextSessionLabel ? (
              <span className="tr-time">
                <IconCalendarEvent size={10} />
                {`מפגש קרוב: ${g.nextSessionLabel}`}
              </span>
            ) : (
              <span>אין מפגש קרוב</span>
            )}
          </div>
        </Link>
      ))}

      {visibleTrainees.length > 0 && (
        <>
          <div className="gr-section-label">{q ? 'מתאמנים' : 'ללא קבוצה'}</div>
          <div className="gr-list">
            {visibleTrainees.map((t) => (
              <TraineeLinkRow key={t.id} trainee={t} />
            ))}
          </div>
        </>
      )}

      <div className="tr-bottom-btns">
        <button type="button" className="tr-addbtn" onClick={() => setShowGroupSheet(true)}>
          <IconPlus size={14} /> הוסף קבוצה
        </button>
        <button type="button" className="tr-addbtn sec" onClick={() => setShowTraineeSheet(true)}>
          <IconUserPlus size={14} /> הוסף מתאמן
        </button>
      </div>

      {showGroupSheet && <CreateGroupSheet trainees={trainees} onClose={() => setShowGroupSheet(false)} />}
      {showTraineeSheet && (
        <CreateTraineeSheet
          groups={groups}
          citySuggestions={citySuggestions}
          initialArea={null}
          onClose={() => setShowTraineeSheet(false)}
        />
      )}
    </div>
  );
}
