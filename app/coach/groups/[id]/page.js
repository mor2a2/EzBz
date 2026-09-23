import Link from 'next/link';
import { IconArrowRight } from '@tabler/icons-react';
import { createClient } from '@/lib/supabase-ssr';
import WorkBackground from '../../WorkBackground';
import HeaderGrid from '../../HeaderGrid';
import { DEFAULT_STAGES } from '../../trainees/progressStages';
import '../../trainees/trainees.css';
import '../../trainees/[id]/progress/progress.css';
import '../groups.css';

const MEMBER_NAMES_SHOWN = 3;

function membersLine(names) {
  if (names.length === 0) return 'אין חברים בקבוצה';
  const shown = names.slice(0, MEMBER_NAMES_SHOWN).join(', ');
  const rest = names.length - MEMBER_NAMES_SHOWN;
  return `חברים: ${rest > 0 ? `${shown} ועוד ${rest}` : shown}`;
}

export default async function GroupStagesPage({ params }) {
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

  const [groupRes, membersRes] = await Promise.all([
    supabase.from('groups').select('id, name, schedule_label').eq('id', id).eq('coach_id', user.id).single(),
    supabase.from('trainees').select('name').eq('group_id', id).eq('coach_id', user.id),
  ]);

  const group = groupRes.data;
  if (!group) {
    return (
      <WorkBackground>
        <p>קבוצה לא נמצאה.</p>
      </WorkBackground>
    );
  }

  const memberNames = (membersRes.data ?? []).map((m) => m.name).sort((a, b) => a.localeCompare(b, 'he'));

  return (
    <WorkBackground>
      <div className="tr-root">
        <div className="pg-hdr">
          <HeaderGrid />
          <div className="pg-hdr-content">
            <div className="pg-hdr-top">
              <Link href="/coach/groups" className="gr-back" aria-label="חזרה לקבוצות">
                <IconArrowRight size={14} style={{ verticalAlign: 'middle' }} /> קבוצות
              </Link>
              <div className="pg-name">{group.name}</div>
              <div style={{ width: 40 }} />
            </div>
            {group.schedule_label && <div className="pg-subtitle">{group.schedule_label}</div>}
          </div>
        </div>

        <div className="gr-members-line">{membersLine(memberNames)}</div>

        <div className="pg-list">
          {DEFAULT_STAGES.map((name, i) => (
            <div className="pg-row gr-static" key={i}>
              <div className="pg-row-col">
                <div className="pg-circle todo">{i + 1}</div>
                {i < DEFAULT_STAGES.length - 1 && <div className="pg-line" />}
              </div>
              <div className="pg-row-content">
                <div className="pg-row-name">{name}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </WorkBackground>
  );
}
