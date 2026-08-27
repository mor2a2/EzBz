import { createClient } from '@/lib/supabase-ssr';
import WorkBackground from '../../WorkBackground';
import TraineeCard from './TraineeCard';
import { mergeProgressStages } from '../progressStages';
import '../trainees.css';
import './card.css';

export default async function TraineeCardPage({ params }) {
  const { id } = await params;

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

  const traineeRes = await supabase.from('trainees').select('*').eq('id', id).eq('coach_id', user.id).single();
  const trainee = traineeRes.data;
  if (!trainee) {
    return (
      <WorkBackground>
        <p>מתאמן/ת לא נמצא/ה.</p>
      </WorkBackground>
    );
  }

  const nextSessionFilter = trainee.group_id
    ? `trainee_id.eq.${id},group_id.eq.${trainee.group_id}`
    : `trainee_id.eq.${id}`;

  const [groupsRes, progressRes, paymentsRes, nextSessionRes, coordinatorsRes, allAreasRes] = await Promise.all([
    supabase.from('groups').select('id, name').eq('coach_id', user.id),
    supabase
      .from('progress_stages')
      .select('stage_number, name, status, has_notes, has_plan')
      .eq('trainee_id', id)
      .eq('coach_id', user.id),
    supabase
      .from('trainee_payments')
      .select('id, due_date, amount, status')
      .eq('trainee_id', id)
      .eq('coach_id', user.id)
      .order('due_date', { ascending: true }),
    supabase
      .from('sessions')
      .select('id, date')
      .eq('coach_id', user.id)
      .or(nextSessionFilter)
      .gte('date', now.toISOString())
      .order('date', { ascending: true })
      .limit(1),
    supabase.from('coordinators').select('region').order('region'),
    supabase.from('trainees').select('area').eq('coach_id', user.id),
  ]);

  const groups = groupsRes.data ?? [];
  const groupName = trainee.group_id ? (groups.find((g) => g.id === trainee.group_id)?.name ?? null) : null;

  const stages = mergeProgressStages(progressRes.data);

  const payments = (paymentsRes.data ?? []).map((p) => ({
    id: p.id,
    dueDate: p.due_date,
    amount: p.amount,
    status: p.status,
    overdue: p.status === 'pending' && new Date(p.due_date) < now,
  }));

  const nextSession = nextSessionRes.data?.[0] ?? null;

  const coordCities = new Set((coordinatorsRes.data ?? []).map((c) => c.region));
  const usedCities = (allAreasRes.data ?? []).map((r) => r.area).filter(Boolean);
  const citySuggestions = [...new Set([...coordCities, ...usedCities])]
    .sort((a, b) => a.localeCompare(b, 'he'))
    .map((city) => ({ city, hasCoordinator: coordCities.has(city) }));

  return (
    <WorkBackground>
      <TraineeCard
        trainee={{
          id: trainee.id,
          name: trainee.name,
          age: trainee.age,
          phone: trainee.phone,
          parentName: trainee.parent_name,
          parentPhone: trainee.parent_phone,
          parentConsent: trainee.parent_consent,
          parentConsentDate: trainee.parent_consent_date,
          startDate: trainee.start_date,
          area: trainee.area,
          groupId: trainee.group_id,
          groupName,
          note: trainee.note,
          groupType: trainee.group_type,
        }}
        groups={groups}
        citySuggestions={citySuggestions}
        stages={stages}
        payments={payments}
        nextSession={nextSession}
      />
    </WorkBackground>
  );
}
