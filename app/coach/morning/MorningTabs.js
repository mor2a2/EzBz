'use client';

import { useState } from 'react';

function initials(name) {
  const parts = name.trim().split(/\s+/);
  return parts.slice(0, 2).map((p) => p[0]).join('');
}

export default function MorningTabs({ meetings, money, completion }) {
  const [active, setActive] = useState('meet');

  const moneyBadge = money.toCollect.length + money.toReceipt.length + money.toPay.length > 0;
  const compBadge = completion.missingSummaries.length + completion.missingPlans.length > 0;

  return (
    <div>
      <div className="m-tabs">
        <button className={`m-tab ${active === 'meet' ? 'on' : ''}`} onClick={() => setActive('meet')}>
          פגישות
        </button>
        <button className={`m-tab ${active === 'money' ? 'on' : ''}`} onClick={() => setActive('money')}>
          כספים
          {moneyBadge && <span className="m-tab-badge" />}
        </button>
        <button className={`m-tab ${active === 'comp' ? 'on' : ''}`} onClick={() => setActive('comp')}>
          השלמה
          {compBadge && <span className="m-tab-badge" />}
        </button>
      </div>

      {active === 'meet' && (
        <div>
          {meetings.length === 0 && <div className="m-empty">אין פגישות היום.</div>}
          {meetings.map((m, i) => (
            <div key={m.id} className={`m-meet-card ${i === 0 ? 'next' : ''}`}>
              <div className="m-meet-time">
                <div className="m-meet-time-num">{m.timeLabel}</div>
                <div className="m-meet-time-unit">{m.subTimeLabel}</div>
              </div>
              <div className="m-meet-av">{initials(m.traineeName)}</div>
              <div className="m-meet-info">
                <div className="m-meet-name">{m.traineeName}</div>
                <div className="m-meet-sub">{m.subLabel}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {active === 'money' && (
        <div>
          {money.toCollect.length === 0 && money.toReceipt.length === 0 && money.toPay.length === 0 && (
            <div className="m-empty">אין כלום לטפל בו כרגע.</div>
          )}
          {money.toCollect.length > 0 && (
            <>
              <div className="m-money-lbl">לגבות</div>
              {money.toCollect.map((row) => (
                <div className="m-money-row" key={row.id}>
                  <div className="m-money-info">
                    <div className="m-money-name">{row.traineeName}</div>
                    <div className="m-money-sub">{row.subLabel}</div>
                  </div>
                  <div className="m-money-amt">₪{row.amount}</div>
                </div>
              ))}
            </>
          )}
          {money.toReceipt.length > 0 && (
            <>
              <div className="m-money-lbl">להפיק קבלה</div>
              {money.toReceipt.map((row) => (
                <div className="m-money-row" key={row.id}>
                  <div className="m-money-info">
                    <div className="m-money-name">{row.traineeName}</div>
                    <div className="m-money-sub">שולם · קבלה טרם הופקה</div>
                  </div>
                  <div className="m-money-amt receipt">₪{row.amount}</div>
                </div>
              ))}
            </>
          )}
          {money.toPay.length > 0 && (
            <>
              <div className="m-money-lbl">לשלם</div>
              {money.toPay.map((row) => (
                <div className="m-money-row" key={row.id}>
                  <div className="m-money-info">
                    <div className="m-money-name">{row.institutionLabel}</div>
                    <div className="m-money-sub">{row.subLabel}</div>
                  </div>
                  <div className="m-money-amt">₪{row.amount}</div>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {active === 'comp' && (
        <div>
          {completion.missingSummaries.length === 0 && completion.missingPlans.length === 0 && (
            <div className="m-empty">הכל מעודכן.</div>
          )}
          {completion.missingSummaries.map((row) => (
            <div className="m-comp-row" key={row.id}>
              <div className="m-comp-info">
                <div className="m-comp-name">{row.traineeName} — חסר סיכום מפגש</div>
                <div className="m-comp-sub">{row.subLabel}</div>
              </div>
              <span className="m-comp-type">סיכום</span>
            </div>
          ))}
          {completion.missingPlans.map((row) => (
            <div className="m-comp-row" key={row.id}>
              <div className="m-comp-info">
                <div className="m-comp-name">{row.traineeName} — מערך שיעור חסר</div>
                <div className="m-comp-sub">{row.subLabel}</div>
              </div>
              <span className="m-comp-type">מערך</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
