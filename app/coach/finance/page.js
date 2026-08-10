import Link from 'next/link';

export default function FinancePage() {
  return (
    <div style={{ padding: 24, color: '#E8E0C8', background: '#080400', minHeight: '100vh' }}>
      <p>כספים (B9) — טרם נבנה.</p>
      <Link href="/coach/home" style={{ color: '#C9A84C' }}>← חזרה לכוורת</Link>
    </div>
  );
}
