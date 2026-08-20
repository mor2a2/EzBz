import { createClient } from '@/lib/supabase-ssr';
import WorkBackground from '../WorkBackground';
import Calendar from './Calendar';
import { monthsFromToday } from './calendarMath';

export default async function CalendarPage({ searchParams }) {
  const { date } = await searchParams;

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

  // טווח שליפה מוגבל — חצי שנה אחורה/קדימה מהיום — כדי שה-payload לא יגדל ללא
  // הגבלה עם הזמן. אותם גבולות מועברים ל-Calendar כדי שהודעת "מעבר לטווח"
  // תמיד תואמת בדיוק למה שבאמת נשלף, לא מחושבת בנפרד בצד הלקוח.
  const rangeStart = monthsFromToday(-6);
  const rangeEnd = monthsFromToday(6);

  const [sessionsRes, traineesRes, groupsRes] = await Promise.all([
    supabase
      .from('sessions')
      .select('id, trainee_id, group_id, date, summary')
      .eq('coach_id', user.id)
      .gte('date', rangeStart.toISOString())
      .lte('date', rangeEnd.toISOString()),
    supabase.from('trainees').select('id, name, group_id').eq('coach_id', user.id),
    supabase.from('groups').select('id, name').eq('coach_id', user.id),
  ]);

  const traineeById = Object.fromEntries((traineesRes.data ?? []).map((t) => [t.id, t]));
  const groupById = Object.fromEntries((groupsRes.data ?? []).map((g) => [g.id, g]));
  const memberCountByGroup = {};
  for (const t of traineesRes.data ?? []) {
    if (t.group_id) memberCountByGroup[t.group_id] = (memberCountByGroup[t.group_id] ?? 0) + 1;
  }

  const sessions = (sessionsRes.data ?? []).map((s) => {
    const isGroup = !!s.group_id;
    return {
      id: s.id,
      date: s.date,
      isGroup,
      title: isGroup ? (groupById[s.group_id]?.name ?? 'קבוצה') : (traineeById[s.trainee_id]?.name ?? 'מתאמן'),
      memberCount: isGroup ? (memberCountByGroup[s.group_id] ?? 0) : undefined,
      traineeId: isGroup ? null : s.trainee_id,
      hasSummary: !!s.summary,
    };
  });

  return (
    <WorkBackground>
      <Calendar
        sessions={sessions}
        initialDate={date}
        rangeStart={rangeStart.toISOString()}
        rangeEnd={rangeEnd.toISOString()}
      />
    </WorkBackground>
  );
}
