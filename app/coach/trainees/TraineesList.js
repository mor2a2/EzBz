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
  IconSearch,
  IconMapPin,
  IconUser,
  IconPhone,
  IconMail,
  IconBrandWhatsapp,
} from '@tabler/icons-react';
import HeaderGrid from '../HeaderGrid';
import Sheet from './Sheet';
import AssignGroupSheet from './AssignGroupSheet';
import CreateGroupSheet from './CreateGroupSheet';
import CreateTraineeSheet from './CreateTraineeSheet';
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

function coordinatorWaLink(coordinator) {
  if (!coordinator.phone) return null;
  const digits = coordinator.phone.replace(/\D/g, '').replace(/^0/, '');
  const text = encodeURIComponent(
    `שלום ${coordinator.name}, אני מדריך/ה NLP חדש/ה באיזור ${coordinator.region} דרך EzBz, אשמח להכיר!`
  );
  return `https://wa.me/972${digits}?text=${text}`;
}

function Actions({ trainee }) {
  const [isPending, startTransition] = useTransition();
  const wa = waLink(trainee.phone || trainee.parentPhone, trainee.name);

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

function AddRegionSheet({ coordinators, cityOptions, onAddTrainee, onClose }) {
  const [filter, setFilter] = useState('');
  const [selectedCity, setSelectedCity] = useState(null);

  const filteredCities = useMemo(() => {
    const q = filter.trim();
    return q ? cityOptions.filter((c) => c.includes(q)) : cityOptions;
  }, [cityOptions, filter]);

  const matchedCoordinators = useMemo(
    () => (selectedCity ? coordinators.filter((c) => c.region === selectedCity) : []),
    [coordinators, selectedCity]
  );

  return (
    <Sheet title="מצא רכז לפי עיר" onClose={onClose}>
      {cityOptions.length === 0 ? (
        <div className="tr-no-result">הרו"ח עדיין לא הזינה ערים ורכזים — יש לפנות אליה</div>
      ) : (
        <>
          <div className="tr-city-search">
            <IconSearch size={13} />
            <input
              type="text"
              placeholder="חפש עיר..."
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value);
                setSelectedCity(null);
              }}
            />
          </div>

          <div className="tr-members-select">
            {filteredCities.length === 0 && <div className="tr-member-empty">לא נמצאה עיר תואמת</div>}
            {filteredCities.map((city) => (
              <button
                type="button"
                key={city}
                className={`tr-assign-option ${selectedCity === city ? 'on' : ''}`}
                onClick={() => setSelectedCity(city)}
              >
                <IconMapPin size={13} />
                {city}
              </button>
            ))}
          </div>

          {matchedCoordinators.map((coordinator) => {
            const waHref = coordinatorWaLink(coordinator);
            return (
              <div className="tr-coord-result" key={coordinator.id}>
                <div className="tr-coord-city">
                  <IconMapPin size={13} />
                  {coordinator.region}
                </div>
                <div className="tr-coord-row">
                  <IconUser size={12} />
                  <span>{coordinator.name}</span>
                </div>
                {coordinator.phone && (
                  <div className="tr-coord-row">
                    <IconPhone size={12} />
                    <span>{coordinator.phone}</span>
                  </div>
                )}
                {coordinator.email && (
                  <div className="tr-coord-row">
                    <IconMail size={12} />
                    <span>{coordinator.email}</span>
                  </div>
                )}
                {waHref && (
                  <a href={waHref} target="_blank" rel="noopener noreferrer" className="tr-wa-btn">
                    <IconBrandWhatsapp size={14} /> שלח הודעת היכרות
                  </a>
                )}
                <button
                  type="button"
                  className="tr-coord-secondary-btn"
                  onClick={() => onAddTrainee(coordinator.region)}
                >
                  <IconUserPlus size={12} /> כבר יש מתאמן מהעיר הזו — הוסף אותו
                </button>
              </div>
            );
          })}
        </>
      )}
    </Sheet>
  );
}

export default function TraineesList({ trainees, groups, coordinators = [], initialView }) {
  const [activeRegion, setActiveRegion] = useState('כולם');
  const [activeTab, setActiveTab] = useState(initialView === 'groups' ? 'groups' : 'members');
  const [query, setQuery] = useState('');
  const [openGroups, setOpenGroups] = useState(() => new Set(groups.map((g) => g.id)));
  const [filterIncome, setFilterIncome] = useState(false);
  const [filterSession, setFilterSession] = useState(false);
  const [assignTarget, setAssignTarget] = useState(null);
  const [showGroupSheet, setShowGroupSheet] = useState(false);
  const [showTraineeSheet, setShowTraineeSheet] = useState(false);
  const [showRegionSheet, setShowRegionSheet] = useState(false);
  const [prefillArea, setPrefillArea] = useState(null);

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

  function openTraineeSheet(area = null) {
    setPrefillArea(area);
    setShowRegionSheet(false);
    setShowTraineeSheet(true);
  }

  const cityOptions = useMemo(
    () => [...new Set(coordinators.map((c) => c.region))].sort((a, b) => a.localeCompare(b, 'he')),
    [coordinators]
  );

  const citySuggestions = useMemo(() => {
    const coordCities = new Set(coordinators.map((c) => c.region));
    const usedCities = trainees.map((t) => t.area).filter(Boolean);
    const all = new Set([...coordCities, ...usedCities]);
    return [...all]
      .sort((a, b) => a.localeCompare(b, 'he'))
      .map((city) => ({ city, hasCoordinator: coordCities.has(city) }));
  }, [coordinators, trainees]);

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
        <button type="button" className="tr-rtab add" onClick={() => setShowRegionSheet(true)}>
          + איזור
        </button>
      </div>

      <div className="tr-region-label">{activeRegion !== 'כולם' ? `מציג: ${activeRegion}` : ''}</div>

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
            <button type="button" className="tr-addbtn sec" onClick={() => openTraineeSheet(activeRegion !== 'כולם' ? activeRegion : null)}>
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
            <button type="button" className="tr-addbtn" onClick={() => openTraineeSheet(activeRegion !== 'כולם' ? activeRegion : null)}>
              <IconUserPlus size={14} /> הוסף מתאמן
            </button>
            <button type="button" className="tr-addbtn sec" onClick={() => setShowGroupSheet(true)}>
              <IconUsers size={14} /> קבוצה
            </button>
          </div>
        </div>
      )}

      {showGroupSheet && <CreateGroupSheet trainees={trainees} onClose={() => setShowGroupSheet(false)} />}
      {showTraineeSheet && (
        <CreateTraineeSheet
          groups={groups}
          citySuggestions={citySuggestions}
          initialArea={prefillArea}
          onClose={() => setShowTraineeSheet(false)}
        />
      )}
      {showRegionSheet && (
        <AddRegionSheet
          coordinators={coordinators}
          cityOptions={cityOptions}
          onAddTrainee={openTraineeSheet}
          onClose={() => setShowRegionSheet(false)}
        />
      )}
      {assignTarget && (
        <AssignGroupSheet trainee={assignTarget} groups={groups} onClose={() => setAssignTarget(null)} />
      )}
    </div>
  );
}
