import Link from 'next/link';
import WorkBackground from '../WorkBackground';

export default function IdeasPage() {
  return (
    <WorkBackground>
      <p>רעיונות עסקיים — בקרוב.</p>
      <Link href="/coach/home">← חזרה לכוורת</Link>
    </WorkBackground>
  );
}
