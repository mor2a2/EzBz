import { createClient } from '@/lib/supabase-ssr';
import WorkBackground from '../WorkBackground';
import { jerusalemDayBounds, jerusalemHourMinute } from '../calendar/calendarMath';
import GroupsList from './GroupsList';
import '../trainees/trainees.css';
import './groups.css';

const TZ = 'Asia/Jerusalem';
const DAY_MS = 24 * 60 * 60 * 1000;

// רץ בשרת (UTC ב-Vercel), ולכן כל החישובים לפי שעון ישראל דרך ה-helpers
// ו-timeZone מפורש, ולא לפי getHours/toDateString של התהליך.
// היום: "היום HH:MM". עד 6 ימים קדימה: שם היום. מעבר לכך: תאריך, למשל 30.9.
function formatNextSession(dateStr, now) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  const daysAhead = Math.round((jerusalemDayBounds(d).start - jerusalemDayBounds(now).start) / DAY_MS);
  if (daysAhead <= 0) {
    const { hour, minute } = jerusalemHourMinute(d);
    return `היום ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  }
  if (daysAhead <= 6) {
    return new Intl.DateTimeFormat('he-IL', { weekday: 'long', timeZone: TZ }).format(d);
  }
  const parts = new Intl.DateTimeFormat('he-IL', { day: 'numeric', month: 'numeric', timeZone: TZ }).formatToParts(d);
  const day = parts.find((p) => p.type === 'day').value;
  const month = parts.find((p) => p.type === 'month').value;
  return `${day}.${month}`;
}

export default async function GroupsPage() {
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
  const { start: todayStart } = jerusalemDayBounds(now);

  const [groupsRes, traineesRes, sessionsRes, coordinatorsRes] = await Promise.all([
    supabase.from('groups').select('id, name, schedule_label').eq('coach_id', user.id),
    supabase.from('trainees').select('id, name, area, group_id').eq('coach_id', user.id),
    // מפגש היום נחשב קרוב, גם אם שעתו כבר עברה
    supabase
      .from('sessions')
      .select('trainee_id, group_id, date')
      .eq('coach_id', user.id)
      .gte('date', todayStart.toISOString())
      .order('date', { ascending: true }),
    supabase.from('coordinators').select('region'),
  ]);

  const nextByGroup = {};
  const nextByTrainee = {};
  for (const s of sessionsRes.data ?? []) {
    if (s.group_id) nextByGroup[s.group_id] ??= s.date;
    else if (s.trainee_id) nextByTrainee[s.trainee_id] ??= s.date;
  }

  const rawTrainees = traineesRes.data ?? [];
  const memberCount = {};
  for (const t of rawTrainees) {
    if (t.group_id) memberCount[t.group_id] = (memberCount[t.group_id] ?? 0) + 1;
  }

  const sortedGroups = (groupsRes.data ?? [])
    .map((g) => ({
      id: g.id,
      name: g.name,
      scheduleLabel: g.schedule_label,
      memberCount: memberCount[g.id] ?? 0,
      nextAt: nextByGroup[g.id] ?? null,
    }))
    .sort((a, b) => {
      if (a.nextAt && b.nextAt) {
        const diff = new Date(a.nextAt) - new Date(b.nextAt);
        if (diff !== 0) return diff;
      } else if (a.nextAt) {
        return -1;
      } else if (b.nextAt) {
        return 1;
      }
      return a.name.localeCompare(b.name, 'he');
    });

  const groups = sortedGroups.map(({ nextAt, ...g }) => ({
    ...g,
    nextSessionLabel: formatNextSession(nextAt, now),
  }));

  const groupNameById = Object.fromEntries(groups.map((g) => [g.id, g.name]));

  // תווית מפגש רק לילד ללא קבוצה. לילד בקבוצה המפגש שייך לקבוצה, לא לו.
  const trainees = rawTrainees
    .map((t) => ({
      id: t.id,
      name: t.name,
      groupId: t.group_id,
      groupName: t.group_id ? groupNameById[t.group_id] ?? null : null,
      nextSessionLabel: t.group_id ? null : formatNextSession(nextByTrainee[t.id], now),
    }))
    .sort((a, b) => a.name.localeCompare(b.name, 'he'));

  // אותה נוסחה כמו ב-TraineesList, אבל בשרת: ללקוח נשלחות רק שמות ערים, בלי פרטי רכזים
  const coordCities = new Set((coordinatorsRes.data ?? []).map((c) => c.region));
  const usedCities = rawTrainees.map((t) => t.area).filter(Boolean);
  const citySuggestions = [...new Set([...coordCities, ...usedCities])]
    .sort((a, b) => a.localeCompare(b, 'he'))
    .map((city) => ({ city, hasCoordinator: coordCities.has(city) }));

  return (
    <WorkBackground>
      <GroupsList groups={groups} trainees={trainees} citySuggestions={citySuggestions} />
    </WorkBackground>
  );
}
