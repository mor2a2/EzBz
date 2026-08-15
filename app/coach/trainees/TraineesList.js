'use client';

import { useState, useMemo, useTransition } from 'react';
import Link from 'next/link';
import {
  IconUsers,
  IconClock,
  IconChevronDown,
  IconCoin,
  IconCalendarEvent,
  IconPlus,
  IconUserPlus,
  IconX,
} from '@tabler/icons-react';
import HeaderGrid from '../HeaderGrid';
import { markIncomeReceived, createGroup, createTrainee, assignTraineeToGroup } from './actions';

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

function TraineeRow({ trainee, onAssign }) {
  return (
    <div className="tr-row">
      <div className={`tr-sbar ${trainee.statusColor}`} />
      <div className="tr-av">{initials(trainee.name)}</div>
      <div className="tr-info">
        <div className="tr-name">{trainee.name}</div>
        <div className="tr-sub">
          {trainee.nextSessionLabel ? (
            <span className="tr-time">
              <IconClock size={10} />
              {trainee.nextSessionLabel}
            </span>
          ) : (
            <span>אין פגישה</span>
          )}
          {trainee.groupName ? (
            <span className="tr-tag">{trainee.groupName}</span>
          ) : (
            <button
              type="button"
              className="tr-assign-tag"
              onClick={(e) => {
                e.stopPropagation();
                onAssign?.(trainee);
              }}
            >
              + שייך לקבוצה
            </button>
          )}
        </div>
      </div>
      <Actions trainee={trainee} />
    </div>
  );
}

function Sheet({ title, onClose, children }) {
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

function CreateGroupSheet({ trainees, onClose }) {
  const [name, setName] = useState('');
  const [scheduleLabel, setScheduleLabel] = useState('');
  const [memberIds, setMemberIds] = useState([]);
  const [error, setError] = useState(null);
  const [isPending, startTransition] = useTransition();

  function toggleMember(id) {
    setMemberIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function save() {
    setError(null);
    startTransition(async () => {
      const res = await createGroup({ name, scheduleLabel, memberIds });
      if (res?.error) setError(res.error);
      else onClose();
    });
  }

  return (
    <Sheet title="צור קבוצה חדשה" onClose={onClose}>
      <div className="tr-field">
        <label>שם הקבוצה</label>
        <input type="text" placeholder="לדוגמא: נוער פתח תקווה" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="tr-field">
        <label>מועד קבוע</label>
        <input
          type="text"
          placeholder="לדוגמא: ראשון 10:00"
          value={scheduleLabel}
          onChange={(e) => setScheduleLabel(e.target.value)}
        />
      </div>
      <div className="tr-field">
        <label>בחר מתאמנים</label>
        <div className="tr-members-select">
          {trainees.length === 0 && <div className="tr-member-empty">אין עדיין מתאמנים</div>}
          {trainees.map((t) => (
            <div className="tr-member-option" key={t.id}>
              <input
                type="checkbox"
                id={`m-${t.id}`}
                checked={memberIds.includes(t.id)}
                onChange={() => toggleMember(t.id)}
              />
              <label htmlFor={`m-${t.id}`}>{t.name}</label>
              <span className="tr-member-status">{t.groupName || 'לא משויך'}</span>
            </div>
          ))}
        </div>
      </div>
      {error && <div className="tr-sheet-error">{error}</div>}
      <button type="button" className="tr-save-btn" disabled={isPending} onClick={save}>
        {isPending ? 'שומר...' : 'שמור קבוצה'}
      </button>
    </Sheet>
  );
}

function CreateTraineeSheet({ groups, onClose }) {
  const [name, setName] = useState('');
  const [area, setArea] = useState('');
  const [groupId, setGroupId] = useState('');
  const [error, setError] = useState(null);
  const [isPending, startTransition] = useTransition();

  function save() {
    setError(null);
    startTransition(async () => {
      const res = await createTrainee({ name, area, groupId: groupId || null });
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
        <input type="text" placeholder="לדוגמא: רעננה" value={area} onChange={(e) => setArea(e.target.value)} />
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

function AssignGroupSheet({ trainee, groups, onClose }) {
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

export default function TraineesList({ trainees, groups, initialView }) {
  const [activeRegion, setActiveRegion] = useState('כולם');
  const [activeTab, setActiveTab] = useState(initialView === 'groups' ? 'groups' : 'members');
  const [query, setQuery] = useState('');
  const [openGroups, setOpenGroups] = useState(() => new Set(groups.map((g) => g.id)));
  const [filterIncome, setFilterIncome] = useState(false);
  const [filterSession, setFilterSession] = useState(false);
  const [assignTarget, setAssignTarget] = useState(null);
  const [showGroupSheet, setShowGroupSheet] = useState(false);
  const [showTraineeSheet, setShowTraineeSheet] = useState(false);

  function toggleGroup(id) {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const regions = useMemo(
    () => ['כולם', ...new Set(trainees.map((t) => t.area).filter(Boolean))],
    [trainees]
  );

  const filteredTrainees = useMemo(() => {
    const q = query.trim().toLowerCase();
    return trainees.filter((t) => {
      const regionOk = activeRegion === 'כולם' || t.area === activeRegion;
      const queryOk = !q || t.name.toLowerCase().includes(q);
      return regionOk && queryOk;
    });
  }, [trainees, activeRegion, query]);

  const unassignedCount = useMemo(() => trainees.filter((t) => !t.groupId).length, [trainees]);

  const visibleMembers = useMemo(
    () =>
      filteredTrainees.filter((t) => {
        const incomeOk = !filterIncome || t.pendingIncomeId;
        const sessionOk = !filterSession || t.nextSessionLabel;
        return incomeOk && sessionOk;
      }),
    [filteredTrainees, filterIncome, filterSession]
  );

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
          {unassignedCount > 0 && <span className="tr-tab-badge">{unassignedCount}</span>}
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
          {groupsWithMembers.map((g) => {
            const isOpen = openGroups.has(g.id);
            return (
              <div className="tr-gcard" key={g.id}>
                <div className="tr-ghdr" onClick={() => toggleGroup(g.id)}>
                  <div className="tr-gname">
                    <IconUsers size={13} className="tr-gicon" />
                    {g.name}
                    <span className="tr-gbadge">{g.members.length}</span>
                  </div>
                  <div className="tr-ghdr-right">
                    {g.schedule_label && (
                      <span className="tr-gtime">
                        <IconClock size={10} />
                        {g.schedule_label}
                      </span>
                    )}
                    <IconChevronDown size={14} className={`tr-chev ${isOpen ? 'op' : ''}`} />
                  </div>
                </div>
                <div className={`tr-gmembers ${isOpen ? 'op' : ''}`}>
                  {g.members.map((t) => (
                    <TraineeRow key={t.id} trainee={t} onAssign={setAssignTarget} />
                  ))}
                </div>
              </div>
            );
          })}
          <div className="tr-bottom-btns">
            <button type="button" className="tr-addbtn" onClick={() => setShowGroupSheet(true)}>
              <IconPlus size={14} /> הוסף קבוצה
            </button>
            <button type="button" className="tr-addbtn sec" onClick={() => setShowTraineeSheet(true)}>
              <IconUserPlus size={14} /> מתאמן
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div className="tr-frow">
            <span className="tr-fcount">{visibleMembers.length} מתאמנים</span>
            <button
              className={`tr-hexf ${filterIncome ? 'act' : ''}`}
              title="הכנסה ממתינה"
              onClick={() => setFilterIncome((v) => !v)}
            >
              <IconCoin size={13} />
            </button>
            <button
              className={`tr-hexf ${filterSession ? 'act' : ''}`}
              title="פגישה קרובה"
              onClick={() => setFilterSession((v) => !v)}
            >
              <IconCalendarEvent size={13} />
            </button>
          </div>
          {visibleMembers.length === 0 && <div className="tr-empty">אין מתאמנים.</div>}
          {visibleMembers.map((t) => (
            <TraineeRow key={t.id} trainee={t} onAssign={setAssignTarget} />
          ))}
          <div className="tr-bottom-btns">
            <button type="button" className="tr-addbtn" onClick={() => setShowTraineeSheet(true)}>
              <IconUserPlus size={14} /> הוסף מתאמן
            </button>
            <button type="button" className="tr-addbtn sec" onClick={() => setShowGroupSheet(true)}>
              <IconUsers size={14} /> קבוצה
            </button>
          </div>
        </div>
      )}

      {showGroupSheet && <CreateGroupSheet trainees={trainees} onClose={() => setShowGroupSheet(false)} />}
      {showTraineeSheet && <CreateTraineeSheet groups={groups} onClose={() => setShowTraineeSheet(false)} />}
      {assignTarget && (
        <AssignGroupSheet trainee={assignTarget} groups={groups} onClose={() => setAssignTarget(null)} />
      )}
    </div>
  );
}
