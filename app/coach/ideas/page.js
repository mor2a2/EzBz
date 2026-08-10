import Link from 'next/link';

export default function IdeasPage() {
  return (
    <div style={{ padding: 24, color: '#E8E0C8', background: '#080400', minHeight: '100vh' }}>
      <p>רעיונות עסקיים — בקרוב.</p>
      <Link href="/coach/home" style={{ color: '#C9A84C' }}>← חזרה לכוורת</Link>
    </div>
  );
}
