'use client';

import { useState, useMemo, useTransition } from 'react';
import Link from 'next/link';
import HeaderGrid from '../HeaderGrid';
import { markIncomeReceived } from './actions';

function initials(name) {
  return name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]).join('');
}

function waLink(phone, name) {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, '').replace(/^0/, '');
  const text = encodeURIComponent(`שלום, פונה בקשר ל${name}`);
  return `https://wa.me/972${digits}?text=${text}`;
}

function Actions({ trainee }) {
  const [isPending, startTransition] = useTransition();
  const wa = waLink(trainee.parentPhone, trainee.name);

  return (
    <div className="tr-qa">
      <Link href={`/coach/trainees/${trainee.id}`} className="tr-qb" title="כרטיס">
        ↗
      </Link>
      {wa && (
        <a href={wa} target="_blank" rel="noopener noreferrer" className="tr-qb wa" title="WhatsApp">
          ✆
        </a>
      )}
      {trainee.pendingIncomeId && (
        <button
          className="tr-qb paid"
          title="סמן כשולם"
          disabled={isPending}
          onClick={() => startTransition(() => markIncomeReceived(trainee.pendingIncomeId))}
        >
          ✓
        </button>
      )}
    </div>
  );
}

function TraineeRow({ trainee }) {
  return (
    <div className="tr-row">
      <div className={`tr-sbar ${trainee.statusColor}`} />
      <div className="tr-av">{initials(trainee.name)}</div>
      <div className="tr-info">
        <div className="tr-name">{trainee.name}</div>
        <div className="tr-sub">
          {trainee.nextSessionLabel ? <span>{trainee.nextSessionLabel}</span> : <span>אין פגישה</span>}
          {trainee.groupName ? (
            <span className="tr-tag">{trainee.groupName}</span>
          ) : (
            <span className="tr-tag">לא משויך לקבוצה</span>
          )}
        </div>
      </div>
      <Actions trainee={trainee} />
    </div>
  );
}

export default function TraineesList({ trainees, groups, initialView }) {
  const [activeRegion, setActiveRegion] = useState('הכל');
  const [activeTab, setActiveTab] = useState(initialView === 'groups' ? 'groups' : 'members');
  const [query, setQuery] = useState('');

  const regions = useMemo(
    () => ['הכל', ...new Set(trainees.map((t) => t.area).filter(Boolean))],
    [trainees]
  );

  const filteredTrainees = useMemo(() => {
    const q = query.trim().toLowerCase();
    return trainees.filter((t) => {
      const regionOk = activeRegion === 'הכל' || t.area === activeRegion;
      const queryOk = !q || t.name.toLowerCase().includes(q);
      return regionOk && queryOk;
    });
  }, [trainees, activeRegion, query]);

  const groupsWithMembers = useMemo(
    () =>
      groups
        .map((g) => ({ ...g, members: filteredTrainees.filter((t) => t.groupId === g.id) }))
        .filter((g) => g.members.length > 0 || query === ''),
    [groups, filteredTrainees, query]
  );

  return (
    <div className="tr-root">
      <div className="tr-hdr">
        <HeaderGrid />
        <div className="tr-hdr-content">
          <div className="tr-hdr-greet">ניהול לקוחות</div>
          <div className="tr-hdr-title">המתאמנים שלי</div>
        </div>
      </div>

      <div className="tr-regions">
        {regions.map((r) => (
          <button
            key={r}
            className={`tr-rtab ${activeRegion === r ? 'on' : ''}`}
            onClick={() => setActiveRegion(r)}
          >
            {r}
          </button>
        ))}
      </div>

      <div className="tr-tabs">
        <button className={`tr-tab ${activeTab === 'groups' ? 'on' : ''}`} onClick={() => setActiveTab('groups')}>
          לפי קבוצות
        </button>
        <button className={`tr-tab ${activeTab === 'members' ? 'on' : ''}`} onClick={() => setActiveTab('members')}>
          לפי מתאמנים
        </button>
      </div>

      <div className="tr-search">
        <input
          type="text"
          placeholder="חיפוש לפי שם..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {activeTab === 'groups' ? (
        <div>
          {groupsWithMembers.length === 0 && <div className="tr-empty">אין קבוצות עדיין.</div>}
          {groupsWithMembers.map((g) => (
            <div className="tr-gcard" key={g.id}>
              <div className="tr-ghdr">
                <div className="tr-gname">
                  {g.name}
                  <span className="tr-gbadge">{g.members.length}</span>
                </div>
                {g.schedule_label && <div className="tr-gtime">{g.schedule_label}</div>}
              </div>
              {g.members.map((t) => (
                <TraineeRow key={t.id} trainee={t} />
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div>
          {filteredTrainees.length === 0 && <div className="tr-empty">אין מתאמנים.</div>}
          {filteredTrainees.map((t) => (
            <TraineeRow key={t.id} trainee={t} />
          ))}
        </div>
      )}
    </div>
  );
}
