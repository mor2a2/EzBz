import Link from 'next/link';
import WorkBackground from '../WorkBackground';

export default async function TraineesPage({ searchParams }) {
  const { view } = await searchParams;
  const activeView = view === 'groups' ? 'לפי קבוצות' : 'לפי חברים';

  return (
    <WorkBackground>
      <p>רשימת מתאמנים (B3) — טרם נבנה. תצוגה ברירת מחדל: {activeView}.</p>
      <Link href="/coach/home">← חזרה לכוורת</Link>
    </WorkBackground>
  );
}
