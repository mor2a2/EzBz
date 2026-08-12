import Link from 'next/link';
import WorkBackground from '../../WorkBackground';

export default function TraineeCardPage() {
  return (
    <WorkBackground>
      <p>כרטיס מתאמן (B5) — טרם נבנה.</p>
      <Link href="/coach/trainees">← חזרה לרשימה</Link>
    </WorkBackground>
  );
}
