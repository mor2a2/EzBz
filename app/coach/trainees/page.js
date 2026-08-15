import { createClient } from '@/lib/supabase-ssr';
import WorkBackground from '../WorkBackground';
import TraineesList from './TraineesList';
import './trainees.css';

function formatNextSession(dateStr, now) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) {
    return `היום ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  }
  return new Intl.DateTimeFormat('he-IL', { weekday: 'long' }).format(d);
}

export default async function TraineesPage({ searchParams }) {
  const { view } = await searchParams;

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

  const now = new Date();

  const [groupsRes, trainRes, pendingIncomeRes, upcomingSessionsRes, coordinatorsRes] = await Promise.all([
    supabase.from('groups').select('id, name, schedule_label').eq('coach_id', user.id),
    supabase.from('trainees').select('id, name, area, group_id, parent_phone').eq('coach_id', user.id),
    supabase
      .from('income')
      .select('id, trainee_id, date')
      .eq('coach_id', user.id)
      .eq('status', 'pending'),
    supabase
      .from('sessions')
      .select('trainee_id, date')
      .eq('coach_id', user.id)
      .gte('date', now.toISOString())
      .order('date', { ascending: true }),
    supabase.from('coordinators').select('id, region, name, phone, email').order('region'),
  ]);

  const groups = groupsRes.data ?? [];
  const groupById = Object.fromEntries(groups.map((g) => [g.id, g]));
  const pendingByTrainee = {};
  for (const row of pendingIncomeRes.data ?? []) {
    (pendingByTrainee[row.trainee_id] ??= []).push(row);
  }
  const nextSessionByTrainee = {};
  for (const s of upcomingSessionsRes.data ?? []) {
    if (!nextSessionByTrainee[s.trainee_id]) nextSessionByTrainee[s.trainee_id] = s.date;
  }

  const trainees = (trainRes.data ?? []).map((t) => {
    const pending = pendingByTrainee[t.id] ?? [];
    const hasOverdue = pending.some((p) => new Date(p.date) < now);
    const hasUpcoming = !!nextSessionByTrainee[t.id];
    const statusColor = hasOverdue ? 'red' : pending.length > 0 || !hasUpcoming ? 'yellow' : 'green';

    return {
      id: t.id,
      name: t.name,
      area: t.area,
      groupId: t.group_id,
      groupName: t.group_id ? groupById[t.group_id]?.name : null,
      parentPhone: t.parent_phone,
      pendingIncomeId: pending[0]?.id ?? null,
      nextSessionLabel: formatNextSession(nextSessionByTrainee[t.id], now),
      statusColor,
    };
  });

  const coordinators = coordinatorsRes.data ?? [];

  return (
    <WorkBackground>
      <TraineesList
        trainees={trainees}
        groups={groups}
        coordinators={coordinators}
        initialView={view === 'groups' ? 'groups' : 'members'}
      />
    </WorkBackground>
  );
}
