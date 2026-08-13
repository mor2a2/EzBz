'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

// 5 אייקונים: הכוורת (B0) נוספה בכוונה מעבר ל-4 המקוריות של המוקאפ הנעול
// (הגדרות/קלנדר/מתאמנים/בית) — הכוורת היא "שולחן העבודה" של האפליקציה,
// חייבת להיות נגישה תמיד מכל מסך עבודה, לא רק מיד אחרי התחברות.
// "בית" ממשיך להוביל ל-B2 (פאנל בוקר), לא לכוורת — אלה שני יעדים שונים בכוונה.
const ITEMS = [
  { href: '/coach/home', icon: '⬡', label: 'כוורת', match: (p) => p === '/coach/home' },
  { href: '/coach/settings', icon: '⚙️', label: 'הגדרות', match: (p) => p.startsWith('/coach/settings') },
  { href: '/coach/calendar', icon: '📅', label: 'קלנדר', match: (p) => p.startsWith('/coach/calendar') },
  { href: '/coach/trainees', icon: '👥', label: 'מתאמנים', match: (p) => p.startsWith('/coach/trainees') },
  { href: '/coach/morning', icon: '🏠', label: 'בית', match: (p) => p.startsWith('/coach/morning') },
];

export default function TabBar() {
  const pathname = usePathname();

  return (
    <nav className="tab-bar">
      {ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`tab-bar-item ${item.match(pathname) ? 'on' : ''}`}
          aria-label={item.label}
        >
          <span className="tab-bar-icon">{item.icon}</span>
        </Link>
      ))}
    </nav>
  );
}
