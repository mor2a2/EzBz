import Link from 'next/link';
import WorkBackground from '../WorkBackground';

export default function MorningPage() {
  return (
    <WorkBackground>
      <p>פאנל בוקר (B2, כולל "להיום") — טרם נבנה.</p>
      <Link href="/coach/home">← חזרה לכוורת</Link>
    </WorkBackground>
  );
}
