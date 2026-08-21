import { createClient } from '@/lib/supabase-ssr';
import WorkBackground from '../WorkBackground';
import HeaderGrid from '../HeaderGrid';
import MorningTabs from './MorningTabs';
import { jerusalemDayBounds, jerusalemHourMinute } from '../calendar/calendarMath';
import './morning.css';

function getGreeting(hour) {
  if (hour >= 5 && hour < 12) return 'בוקר טוב';
  if (hour >= 12 && hour < 18) return 'צהריים טובים';
  return 'ערב טוב';
}

function formatMeetingTime(dateStr, now) {
  const d = new Date(dateStr);
  const { hour, minute } = jerusalemHourMinute(d);
  const timeLabel = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  const diffMin = Math.round((d - now) / 60000);
  const subTimeLabel =
    diffMin > 0 && diffMin < 180
      ? `עוד ${diffMin} ד׳`
      : hour < 12
        ? 'בוקר'
        : hour < 17
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
  const { start: dayStart, end: dayEnd } = jerusalemDayBounds(now);

  const [sessionsRes, toCollectRes, toReceiptRes, toPayRes, missingSummariesRes, missingPlansRes] =
    await Promise.all([
      supabase
        .from('sessions')
        .select(
          'id, date, trainee_id, group_id, trainees(name, progress_stages(stage_number, name, status)), groups(name)'
        )
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
        .select('id, date, trainee_id, group_id, trainees(name), groups(name)')
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
    const isGroup = !!s.group_id;
    if (isGroup) {
      return {
        id: s.id,
        timeLabel,
        subTimeLabel,
        traineeName: s.groups?.name ?? '—',
        subLabel: 'ליווי קבוצתי',
      };
    }
    const activeStage = s.trainees?.progress_stages?.find((st) => st.status === 'active');
    return {
      id: s.id,
      timeLabel,
      subTimeLabel,
      traineeName: s.trainees?.name ?? '—',
      subLabel: activeStage ? `ליווי אישי · שלב ${activeStage.stage_number}` : 'ליווי אישי',
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
    const traineeName = row.group_id ? (row.groups?.name ?? '—') : (row.trainees?.name ?? '—');
    return {
      id: row.id,
      traineeName,
      subLabel: daysAgo <= 0 ? 'מפגש מהיום' : `מפגש מ-${daysAgo} ימים`,
    };
  });

  const missingPlans = (missingPlansRes.data ?? []).map((row) => ({
    id: row.id,
    traineeName: row.trainees?.name ?? '—',
    subLabel: `שלב פעיל: ${row.name}`,
  }));

  const greeting = getGreeting(jerusalemHourMinute(now).hour);
  const dateLabel = new Intl.DateTimeFormat('he-IL', {
    timeZone: 'Asia/Jerusalem',
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
      </div>
    </WorkBackground>
  );
}
