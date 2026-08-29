'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  IconArrowRight,
  IconCalendarEvent,
  IconCalendarPlus,
  IconUserCircle,
  IconTrendingUp,
  IconWallet,
  IconChevronDown,
  IconArrowLeft,
  IconCheck,
} from '@tabler/icons-react';
import HeaderGrid from '../../HeaderGrid';
import AssignGroupSheet from '../AssignGroupSheet';
import EditDetailsSheet from './EditDetailsSheet';
import AddPaymentSheet from './AddPaymentSheet';
import AddSessionSheet from './AddSessionSheet';
import { currentStageNumber, stageWindow } from '../progressStages';
import { formatDayLabel, formatTime, toLocalDateParam } from '../../calendar/calendarMath';

function formatMonthYear(dateStr) {
  if (!dateStr) return '—';
  return new Intl.DateTimeFormat('he-IL', { month: 'long', year: 'numeric' }).format(new Date(dateStr));
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Intl.DateTimeFormat('he-IL').format(new Date(dateStr));
}

function stageCircleClass(stage) {
  if (stage.status === 'todo') return 'todo';
  return stage.hasNotes ? 'filled' : 'hollow';
}

function stageLabelClass(stage) {
  if (stage.status === 'todo') return 'todo';
  if (stage.status === 'active') return 'active';
  return 'done';
}

function PaymentBadge({ status, overdue }) {
  if (status === 'paid') return <span className="tc-badge-pay paid">שולם</span>;
  if (overdue) return <span className="tc-badge-pay overdue">באיחור</span>;
  return <span className="tc-badge-pay pending">ממתין</span>;
}

export default function TraineeCard({ trainee, groups, citySuggestions, stages, payments, nextSession }) {
  const [openSection, setOpenSection] = useState('personal');
  const [showEditSheet, setShowEditSheet] = useState(false);
  const [showAssignSheet, setShowAssignSheet] = useState(false);
  const [showAddPaymentSheet, setShowAddPaymentSheet] = useState(false);
  const [showAddSessionSheet, setShowAddSessionSheet] = useState(false);

  function toggleSection(name) {
    setOpenSection((prev) => (prev === name ? null : name));
  }

  const doneCount = stages.filter((s) => s.status === 'done').length;
  const current = currentStageNumber(stages);
  const activeStage = stages.find((s) => s.status === 'active');
  const windowStages = stageWindow(stages, current);

  return (
    <div className="tr-root">
      <div className="tc-hdr">
        <HeaderGrid />
        <div className="tc-hdr-content">
          <div className="tc-hdr-top">
            <Link href="/coach/trainees" className="tc-back-btn" aria-label="חזרה לרשימה">
              <IconArrowRight size={18} />
            </Link>
            <div className="tc-name">{trainee.name}</div>
            <div style={{ width: 18 }} />
          </div>
          <div className="tc-badges">
            <span className="tc-badge">{trainee.age != null ? `גיל ${trainee.age}` : 'גיל —'}</span>
            <span className="tc-badge">{trainee.groupId ? 'קבוצה' : 'יחיד'}</span>
            <span className="tc-badge">{formatMonthYear(trainee.startDate)}</span>
          </div>
          {nextSession ? (
            <Link
              href={`/coach/calendar?date=${toLocalDateParam(new Date(nextSession.date))}&traineeId=${trainee.id}`}
              className="tc-meet-pill has"
            >
              <span className="tc-meet-main">
                <IconCalendarEvent size={13} />
                {formatDayLabel(new Date(nextSession.date))} · {formatTime(new Date(nextSession.date))}
              </span>
              <span className="tc-meet-cta">צפה בפגישה ↗</span>
            </Link>
          ) : (
            <button type="button" className="tc-meet-pill none" onClick={() => setShowAddSessionSheet(true)}>
              <IconCalendarPlus size={13} />
              <span>+ קבע פגישה</span>
            </button>
          )}
        </div>
      </div>

      <div className="tc-body">
        {/* סעיף א: פרטים אישיים */}
        <div className="tc-sec">
          <div className="tc-shdr" onClick={() => toggleSection('personal')}>
            <div className="tc-stitle">
              <IconUserCircle size={15} />
              פרטים אישיים
            </div>
            <IconChevronDown size={15} className={`tc-schev ${openSection === 'personal' ? 'op' : ''}`} />
          </div>
          {openSection === 'personal' && (
            <div className="tc-sbody">
              <div className="tc-fr">
                <span className="tc-fl">גיל</span>
                <span className="tc-fv">{trainee.age ?? '—'}</span>
              </div>
              <div className="tc-fr">
                <span className="tc-fl">טלפון</span>
                <span className="tc-fv">{trainee.phone || '—'}</span>
              </div>
              <div className="tc-fr">
                <span className="tc-fl">הורה</span>
                <span className="tc-fv">
                  {trainee.parentName || trainee.parentPhone
                    ? `${trainee.parentName || '—'}${trainee.parentPhone ? ` — ${trainee.parentPhone}` : ''}`
                    : '—'}
                </span>
              </div>
              <div className="tc-fr">
                <span className="tc-fl">אישור הורים</span>
                <span className={`tc-fv ${trainee.parentConsent ? 'ok' : ''}`}>
                  {trainee.parentConsent
                    ? `✓ כן${trainee.parentConsentDate ? ` · ${formatDate(trainee.parentConsentDate)}` : ''}`
                    : '— לא'}
                </span>
              </div>
              <div className="tc-fr">
                <span className="tc-fl">תאריך התחלה</span>
                <span className="tc-fv">{formatMonthYear(trainee.startDate)}</span>
              </div>
              <div className="tc-fr">
                <span className="tc-fl">איזור</span>
                <span className="tc-fv">{trainee.area || '—'}</span>
              </div>
              <div className="tc-fr">
                <span className="tc-fl">קבוצה</span>
                {trainee.groupName ? (
                  <button type="button" className="tc-fv-link" onClick={() => setShowAssignSheet(true)}>
                    {trainee.groupName} <span className="tc-fv-link-sub">(שנה)</span>
                  </button>
                ) : (
                  <button type="button" className="tc-fv-link muted" onClick={() => setShowAssignSheet(true)}>
                    + שייך לקבוצה
                  </button>
                )}
              </div>
              <div className="tc-fr">
                <span className="tc-fl">הערה</span>
                <span className="tc-fv note">{trainee.note || '—'}</span>
              </div>

              <button type="button" className="tr-addbtn tc-edit-btn" onClick={() => setShowEditSheet(true)}>
                ערוך פרטים
              </button>
            </div>
          )}
        </div>

        {/* סעיף ב: מעקב התקדמות */}
        <div className="tc-sec">
          <div className="tc-shdr" onClick={() => toggleSection('progress')}>
            <div className="tc-stitle">
              <IconTrendingUp size={15} />
              מעקב התקדמות
            </div>
            <IconChevronDown size={15} className={`tc-schev ${openSection === 'progress' ? 'op' : ''}`} />
          </div>
          {openSection === 'progress' && (
            <div className="tc-sbody">
              <div className="tc-progress-summary">
                <span>{doneCount} שלבים הושלמו</span>
                <span className="tc-progress-current">
                  {activeStage ? `בתהליך: ${activeStage.name}` : doneCount === 12 ? 'כל השלבים הושלמו! 🎉' : 'טרם התחיל'}
                </span>
              </div>
              <div className="tc-progress-bar">
                <div className="tc-progress-fill" style={{ width: `${(doneCount / 12) * 100}%` }} />
              </div>

              <div className="tc-timeline">
                {windowStages.map((s) => (
                  <div className="tc-stage-item" key={s.stageNumber}>
                    <div className="tc-stage-col">
                      <div className={`tc-stage-circle ${stageCircleClass(s)}`}>
                        {s.status === 'done' ? <IconCheck size={11} /> : s.stageNumber}
                        {s.hasPlan && <div className="tc-plan-dot" />}
                      </div>
                      <div className={`tc-stage-line ${s.status === 'done' ? 'done' : ''}`} />
                    </div>
                    <div className={`tc-stage-label ${stageLabelClass(s)}`}>{s.name}</div>
                  </div>
                ))}
              </div>

              <Link href={`/coach/trainees/${trainee.id}/progress`} className="tc-full-btn">
                <IconArrowLeft size={13} />
                מעקב מלא וסיכומי מפגשים
              </Link>
            </div>
          )}
        </div>

        {/* סעיף ג: מעקב תשלומים */}
        <div className="tc-sec">
          <div className="tc-shdr" onClick={() => toggleSection('payments')}>
            <div className="tc-stitle">
              <IconWallet size={15} />
              מעקב תשלומים
            </div>
            <IconChevronDown size={15} className={`tc-schev ${openSection === 'payments' ? 'op' : ''}`} />
          </div>
          {openSection === 'payments' && (
            <div className="tc-sbody">
              {payments.length === 0 && <div className="tr-empty">אין עדיין תשלומים.</div>}
              {payments.map((p) => (
                <div className="tc-fr" key={p.id}>
                  <span className="tc-fl">{formatMonthYear(p.dueDate)}</span>
                  <PaymentBadge status={p.status} overdue={p.overdue} />
                </div>
              ))}

              <button type="button" className="tr-addbtn tc-edit-btn" onClick={() => setShowAddPaymentSheet(true)}>
                + הוסף תשלום
              </button>
            </div>
          )}
        </div>
      </div>

      {showEditSheet && (
        <EditDetailsSheet trainee={trainee} citySuggestions={citySuggestions} onClose={() => setShowEditSheet(false)} />
      )}
      {showAssignSheet && (
        <AssignGroupSheet trainee={trainee} groups={groups} onClose={() => setShowAssignSheet(false)} />
      )}
      {showAddPaymentSheet && (
        <AddPaymentSheet traineeId={trainee.id} onClose={() => setShowAddPaymentSheet(false)} />
      )}
      {showAddSessionSheet && (
        <AddSessionSheet
          traineeId={trainee.groupId ? null : trainee.id}
          groupId={trainee.groupId || null}
          onClose={() => setShowAddSessionSheet(false)}
        />
      )}
    </div>
  );
}
