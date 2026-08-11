import Link from 'next/link';
import WorkBackground from '../WorkBackground';

export default function FinancePage() {
  return (
    <WorkBackground>
      <p>כספים (B9) — טרם נבנה.</p>
      <Link href="/coach/home">← חזרה לכוורת</Link>
    </WorkBackground>
  );
}
