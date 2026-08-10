import Link from 'next/link';

export default async function TraineesPage({ searchParams }) {
  const { view } = await searchParams;
  const activeView = view === 'groups' ? 'לפי קבוצות' : 'לפי חברים';

  return (
    <div style={{ padding: 24, color: '#E8E0C8', background: '#080400', minHeight: '100vh' }}>
      <p>רשימת מתאמנים (B3) — טרם נבנה. תצוגה ברירת מחדל: {activeView}.</p>
      <Link href="/coach/home" style={{ color: '#C9A84C' }}>← חזרה לכוורת</Link>
    </div>
  );
}
