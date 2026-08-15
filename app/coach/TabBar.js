'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IconHexagon, IconSettings, IconCalendar, IconUsers, IconHome } from '@tabler/icons-react';

// 5 אייקונים: הכוורת (B0) נוספה בכוונה מעבר ל-4 המקוריות של המוקאפ הנעול
// (הגדרות/קלנדר/מתאמנים/בית) — הכוורת היא "שולחן העבודה" של האפליקציה,
// חייבת להיות נגישה תמיד מכל מסך עבודה, לא רק מיד אחרי התחברות.
// "בית" ממשיך להוביל ל-B2 (פאנל בוקר), לא לכוורת — אלה שני יעדים שונים בכוונה.
// אייקוני Tabler אמיתיים (לא אימוג'י) — צביעים לפי טוקני הענבר-זהב, עקבי עם שאר B3.
const ITEMS = [
  { href: '/coach/home', Icon: IconHexagon, label: 'כוורת', match: (p) => p === '/coach/home' },
  { href: '/coach/settings', Icon: IconSettings, label: 'הגדרות', match: (p) => p.startsWith('/coach/settings') },
  { href: '/coach/calendar', Icon: IconCalendar, label: 'קלנדר', match: (p) => p.startsWith('/coach/calendar') },
  { href: '/coach/trainees', Icon: IconUsers, label: 'מתאמנים', match: (p) => p.startsWith('/coach/trainees') },
  { href: '/coach/morning', Icon: IconHome, label: 'בית', match: (p) => p.startsWith('/coach/morning') },
];

export default function TabBar() {
  const pathname = usePathname();

  return (
    <nav className="tab-bar">
      {ITEMS.map(({ href, Icon, label, match }) => (
        <Link key={href} href={href} className={`tab-bar-item ${match(pathname) ? 'on' : ''}`} aria-label={label}>
          <Icon size={20} className="tab-bar-icon" />
        </Link>
      ))}
    </nav>
  );
}
