import { createClient } from '@/lib/supabase-ssr';
import WorkBackground from '../WorkBackground';
import HeaderGrid from '../HeaderGrid';
import MorningTabs from './MorningTabs';
import './morning.css';

function getGreeting(hour) {
  if (hour >= 5 && hour < 12) return 'בוקר טוב';
  if (hour >= 12 && hour < 18) return 'צהריים טובים';
  return 'ערב טוב';
}

function formatMeetingTime(dateStr, now) {
  const d = new Date(dateStr);
  const timeLabel = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  const diffMin = Math.round((d - now) / 60000);
  const subTimeLabel =
    diffMin > 0 && diffMin < 180
      ? `עוד ${diffMin} ד׳`
      : d.getHours() < 12
        ? 'בוקר'
        : d.getHours() < 17
          ? 'אחה"צ'
          : 'ערב';
  return { timeLabel, subTimeLabel };
}

const INSTITUTION_LABELS = { tax: 'מס הכנסה', insurance: 'ביטוח לאומי', vat: 'מע"מ' };

export default async function MorningPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <WorkBackground>
        <p>לא מחובר/ת. יש להתחבר דרך קישור ההזמנה שנשלח באימייל.</p>
      </WorkBackground>
    );
  }

  const { data: coach } = await supabase.from('coaches').select('name').eq('id', user.id).single();

  const now = new Date();
  const dayStart = new Date(now);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(now);
  dayEnd.setHours(23, 59, 59, 999);

  const [sessionsRes, toCollectRes, toReceiptRes, toPayRes, missingSummariesRes, missingPlansRes] =
    await Promise.all([
      supabase
        .from('sessions')
        .select('id, date, trainees(name, group_type, progress_stages(stage_number, name, status))')
        .eq('coach_id', user.id)
        .gte('date', dayStart.toISOString())
        .lte('date', dayEnd.toISOString())
        .order('date', { ascending: true })
        .limit(3),
      supabase
        .from('income')
        .select('id, amount, date, trainees(name)')
        .eq('coach_id', user.id)
        .eq('status', 'pending')
        .order('date', { ascending: true }),
      supabase
        .from('income')
        .select('id, amount, trainees(name)')
        .eq('coach_id', user.id)
        .eq('status', 'received')
        .eq('receipt_issued', false),
      supabase
        .from('payments')
        .select('id, due_date, amount, status, institutions!inner(institution_type, coach_id)')
        .eq('institutions.coach_id', user.id)
        .in('status', ['pending', 'overdue']),
      supabase
        .from('sessions')
        .select('id, date, trainees(name)')
        .eq('coach_id', user.id)
        .is('summary', null)
        .lte('date', now.toISOString())
        .order('date', { ascending: false })
        .limit(5),
      supabase
        .from('progress_stages')
        .select('id, name, stage_number, trainees(name)')
        .eq('coach_id', user.id)
        .eq('has_plan', false)
        .eq('status', 'active'),
    ]);

  const meetings = (sessionsRes.data ?? []).map((s) => {
    const { timeLabel, subTimeLabel } = formatMeetingTime(s.date, now);
    const activeStage = s.trainees?.progress_stages?.find((st) => st.status === 'active');
    const groupLabel = s.trainees?.group_type === 'group' ? 'ליווי קבוצתי' : 'ליווי אישי';
    return {
      id: s.id,
      timeLabel,
      subTimeLabel,
      traineeName: s.trainees?.name ?? '—',
      subLabel: activeStage ? `${groupLabel} · שלב ${activeStage.stage_number}` : groupLabel,
    };
  });

  const toCollect = (toCollectRes.data ?? []).map((row) => {
    const overdueDays = Math.floor((now - new Date(row.date)) / 86400000);
    return {
      id: row.id,
      amount: row.amount,
      traineeName: row.trainees?.name ?? '—',
      subLabel: overdueDays > 0 ? `באיחור ${overdueDays} ימים` : 'לתשלום',
    };
  });

  const toReceipt = (toReceiptRes.data ?? []).map((row) => ({
    id: row.id,
    amount: row.amount,
    traineeName: row.trainees?.name ?? '—',
  }));

  const toPay = (toPayRes.data ?? []).map((row) => {
    const overdue = new Date(row.due_date) < now;
    return {
      id: row.id,
      amount: row.amount,
      institutionLabel: INSTITUTION_LABELS[row.institutions?.institution_type] ?? row.institutions?.institution_type,
      subLabel: overdue ? 'עבר המועד' : 'קרוב',
    };
  });

  const missingSummaries = (missingSummariesRes.data ?? []).map((row) => {
    const daysAgo = Math.floor((now - new Date(row.date)) / 86400000);
    return {
      id: row.id,
      traineeName: row.trainees?.name ?? '—',
      subLabel: daysAgo <= 0 ? 'מפגש מהיום' : `מפגש מ-${daysAgo} ימים`,
    };
  });

  const missingPlans = (missingPlansRes.data ?? []).map((row) => ({
    id: row.id,
    traineeName: row.trainees?.name ?? '—',
    subLabel: `שלב פעיל: ${row.name}`,
  }));

  const greeting = getGreeting(now.getHours());
  const dateLabel = new Intl.DateTimeFormat('he-IL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(now);

  return (
    <WorkBackground>
      <div className="morning-root">
        <div className="m-hdr">
          <HeaderGrid />
          <div className="m-hdr-content">
            <div className="m-hdr-greet">להיום</div>
            <div className="m-hdr-title">
              {greeting}, {coach?.name ?? ''}
            </div>
            <div className="m-hdr-date">{dateLabel}</div>
          </div>
        </div>
        <MorningTabs
          meetings={meetings}
          money={{ toCollect, toReceipt, toPay }}
          completion={{ missingSummaries, missingPlans }}
        />
        <a className="m-back" href="/coach/home">
          ← חזרה לכוורת
        </a>
      </div>
    </WorkBackground>
  );
}
