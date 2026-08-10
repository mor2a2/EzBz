import { Heebo } from 'next/font/google';
import './tokens.css';

const heebo = Heebo({
  subsets: ['hebrew', 'latin'],
  weight: ['300', '400', '600'],
  variable: '--font-heebo',
});

export default function CoachLayout({ children }) {
  return <div className={heebo.variable}>{children}</div>;
}
