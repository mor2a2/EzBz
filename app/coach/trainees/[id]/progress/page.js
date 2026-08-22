import Link from 'next/link';
import WorkBackground from '../../../WorkBackground';

export default async function TraineeProgressPage({ params }) {
  const { id } = await params;
  return (
    <WorkBackground>
      <p>מעקב התקדמות מלא (B6) — טרם נבנה.</p>
      <Link href={`/coach/trainees/${id}`}>← חזרה לכרטיס מתאמן</Link>
    </WorkBackground>
  );
}
