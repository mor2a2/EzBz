import Link from 'next/link';
import './hive.css';
import { BG_W, BG_H, buildHexGridPolygons } from './hexGrid';

const HEX_POLYGON = '74,2 146,42 146,128 74,168 2,128 2,42';
const BLOB_PATH =
  'M74,13 C96,15 133,36 136,53 C140,70 137,101 134,119 C132,134 95,157 73,155 C50,158 15,132 12,117 C9,101 11,67 14,51 C16,36 52,13 74,13 Z';
const RIM_PATH =
  'M74,25 C91,28 117,43 121,57 C124,70 121,101 119,113 C116,127 90,144 73,142 C55,145 31,125 27,113 C24,100 27,68 29,55 C32,42 57,26 74,25 Z';

const RIM_STYLE = { stroke: 'var(--hex-rim-stroke)', strokeWidth: 'var(--hex-rim-width)' };
const ICON_STYLE = { stroke: 'var(--hex-icon-stroke)' };

function CellGradient({ id, wallStops }) {
  return (
    <defs>
      <radialGradient id={`wall${id}`} cx="50%" cy="28%" r="65%">
        {wallStops.map(([offset, color]) => (
          <stop key={offset} offset={offset} stopColor={color} />
        ))}
      </radialGradient>
      {/* cx/cy/r are gradient geometry, not CSS-stylable — var() would not resolve here.
          Literal values match --hex-cell-cx/cy/r in tokens.css; keep them in sync. */}
      <radialGradient id={`cell${id}`} cx="40%" cy="24%" r="75%">
        <stop offset="0%" style={{ stopColor: 'var(--hex-cell-stop-0)' }} />
        <stop offset="20%" style={{ stopColor: 'var(--hex-cell-stop-20)' }} />
        <stop offset="45%" style={{ stopColor: 'var(--hex-cell-stop-45)' }} />
        <stop offset="72%" style={{ stopColor: 'var(--hex-cell-stop-72)' }} />
        <stop offset="100%" style={{ stopColor: 'var(--hex-cell-stop-100)' }} />
      </radialGradient>
    </defs>
  );
}

function Glint({ cx, cy }) {
  return (
    <>
      <circle cx={cx} cy={cy} style={{ r: 'var(--hex-glint-outer-r)', fill: 'var(--hex-glint-outer-fill)' }} />
      <circle cx={cx} cy={cy} style={{ r: 'var(--hex-glint-inner-r)', fill: 'var(--hex-glint-inner-fill)' }} />
    </>
  );
}

function CalendarIcon() {
  return (
    <g transform="translate(74,91)">
      <rect x="-13" y="-12" width="26" height="23" rx="2.5" fill="none" style={ICON_STYLE} strokeWidth="1.5" />
      <line x1="-13" y1="-4" x2="13" y2="-4" style={ICON_STYLE} strokeWidth="1.3" />
      <line x1="-5" y1="-16" x2="-5" y2="-8" style={ICON_STYLE} strokeWidth="1.6" strokeLinecap="round" />
      <line x1="5" y1="-16" x2="5" y2="-8" style={ICON_STYLE} strokeWidth="1.6" strokeLinecap="round" />
    </g>
  );
}

function TraineesIcon() {
  return (
    <g transform="translate(74,91)">
      <circle cx="-5" cy="-11" r="6" fill="none" style={ICON_STYLE} strokeWidth="1.5" />
      <path d="M-17,8 C-17,1 -12,-3 -5,-3 C2,-3 7,1 7,8" fill="none" style={ICON_STYLE} strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="10" cy="-9" r="4.5" fill="none" stroke="rgba(255,235,175,0.6)" strokeWidth="1.2" />
      <path d="M5,8 C5,3 8,0 13,0" fill="none" stroke="rgba(255,235,175,0.6)" strokeWidth="1.2" strokeLinecap="round" />
    </g>
  );
}

function InspirationIcon() {
  return (
    <g transform="translate(74,91)">
      <polygon
        points="0,-14 3.6,-5 13,-5 6,1 8.8,11 0,5.5 -8.8,11 -6,1 -13,-5 -3.6,-5"
        fill="none"
        style={ICON_STYLE}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </g>
  );
}

function MorningIcon() {
  return (
    <g transform="translate(74,91)">
      <circle cx="0" cy="0" r="8" fill="none" stroke="rgba(255,245,190,0.95)" strokeWidth="1.7" />
      <line x1="0" y1="-14" x2="0" y2="-11" stroke="rgba(255,245,190,0.95)" strokeWidth="1.7" strokeLinecap="round" />
      <line x1="0" y1="11" x2="0" y2="14" stroke="rgba(255,245,190,0.95)" strokeWidth="1.7" strokeLinecap="round" />
      <line x1="-14" y1="0" x2="-11" y2="0" stroke="rgba(255,245,190,0.95)" strokeWidth="1.7" strokeLinecap="round" />
      <line x1="11" y1="0" x2="14" y2="0" stroke="rgba(255,245,190,0.95)" strokeWidth="1.7" strokeLinecap="round" />
      <line x1="-10" y1="-10" x2="-8" y2="-8" stroke="rgba(255,245,190,0.95)" strokeWidth="1.7" strokeLinecap="round" />
      <line x1="8" y1="8" x2="10" y2="10" stroke="rgba(255,245,190,0.95)" strokeWidth="1.7" strokeLinecap="round" />
      <line x1="10" y1="-10" x2="8" y2="-8" stroke="rgba(255,245,190,0.95)" strokeWidth="1.7" strokeLinecap="round" />
      <line x1="-8" y1="8" x2="-10" y2="10" stroke="rgba(255,245,190,0.95)" strokeWidth="1.7" strokeLinecap="round" />
    </g>
  );
}

function GroupsIcon() {
  return (
    <g transform="translate(74,91)">
      <circle cx="0" cy="-11" r="6" fill="none" style={ICON_STYLE} strokeWidth="1.5" />
      <circle cx="-12" cy="-7" r="4.5" fill="none" stroke="rgba(255,235,175,0.65)" strokeWidth="1.3" />
      <circle cx="12" cy="-7" r="4.5" fill="none" stroke="rgba(255,235,175,0.65)" strokeWidth="1.3" />
      <path d="M-13,8 C-13,1 -7,-2 0,-2 C7,-2 13,1 13,8" fill="none" style={ICON_STYLE} strokeWidth="1.5" strokeLinecap="round" />
    </g>
  );
}

function FinanceIcon() {
  return (
    <g transform="translate(74,91)">
      <line x1="0" y1="-14" x2="0" y2="14" style={ICON_STYLE} strokeWidth="1.7" strokeLinecap="round" />
      <path
        d="M8,-10 L-7,-10 C-11,-10 -11,-4 -7,0 L8,0 C12,0 12,6 8,10 L-8,10"
        fill="none"
        style={ICON_STYLE}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  );
}

function IdeasIcon() {
  return (
    <g transform="translate(74,91)">
      <path
        d="M0,-14 C-8,-14 -12,-8 -12,-2 C-12,4 -8,9 -4,12 L-4,14 L4,14 L4,12 C8,9 12,4 12,-2 C12,-8 8,-14 0,-14 Z"
        fill="none"
        style={ICON_STYLE}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <line x1="-4" y1="14" x2="4" y2="14" style={ICON_STYLE} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="-3" y1="17" x2="3" y2="17" stroke="rgba(255,235,175,0.70)" strokeWidth="1.3" strokeLinecap="round" />
    </g>
  );
}

const CELLS = [
  {
    id: 1,
    label: 'קלנדר',
    href: '/coach/calendar',
    glint: [53, 52],
    wallStops: [['0%', '#F5E8C0'], ['55%', '#D4A840'], ['100%', '#8B5A10']],
    Icon: CalendarIcon,
  },
  {
    id: 2,
    label: 'ניהול לקוחות',
    href: '/coach/trainees',
    glint: [53, 52],
    wallStops: [['0%', '#EEE0B8'], ['55%', '#C89C38'], ['100%', '#7A4E0C']],
    Icon: TraineesIcon,
  },
  {
    id: 3,
    label: 'מרחב השראה',
    href: '/coach/inspiration',
    glint: [53, 52],
    wallStops: [['0%', '#F0E2BA'], ['55%', '#CCA035'], ['100%', '#80500E']],
    Icon: InspirationIcon,
  },
  {
    id: 4,
    label: 'פאנל בוקר',
    href: '/coach/morning',
    glint: [52, 49],
    center: true,
    wallStops: [['0%', '#FFF5D0'], ['50%', '#EEC040'], ['100%', '#A07010']],
    Icon: MorningIcon,
  },
  {
    id: 5,
    label: 'קבוצות',
    href: '/coach/trainees?view=groups',
    glint: [53, 52],
    wallStops: [['0%', '#EDE0B5'], ['55%', '#C89838'], ['100%', '#7C4C0C']],
    Icon: GroupsIcon,
  },
  {
    id: 6,
    label: 'כספים',
    href: '/coach/finance',
    glint: [73, 63],
    wallStops: [['0%', '#F2E4BC'], ['55%', '#CCA238'], ['100%', '#7E5010']],
    Icon: FinanceIcon,
  },
  {
    id: 7,
    label: 'רעיונות עסקיים',
    href: '/coach/ideas',
    glint: [53, 52],
    wallStops: [['0%', '#EDE0B8'], ['55%', '#C89C36'], ['100%', '#7A4E0E']],
    Icon: IdeasIcon,
  },
];

function Cell({ cell }) {
  const [gx, gy] = cell.glint;
  return (
    <Link href={cell.href} className="hex-wrap" aria-label={cell.label}>
      <svg viewBox="0 0 148 170" xmlns="http://www.w3.org/2000/svg">
        <CellGradient id={cell.id} wallStops={cell.wallStops} />
        <polygon
          points={HEX_POLYGON}
          fill={`url(#wall${cell.id})`}
          stroke={cell.center ? 'var(--coach-gold-line)' : undefined}
          strokeWidth={cell.center ? 1.5 : undefined}
        />
        <path d={BLOB_PATH} fill={`url(#cell${cell.id})`} />
        <path d={RIM_PATH} fill="none" style={RIM_STYLE} />
        <Glint cx={gx} cy={gy} />
        <cell.Icon />
        <text
          className={cell.center ? 'center-label' : 'hex-label'}
          x="74"
          y="127"
          textAnchor="middle"
        >
          {cell.label}
        </text>
      </svg>
    </Link>
  );
}

export default function Hive() {
  const bgPolygons = buildHexGridPolygons();
  const [row1, row2, row3] = [CELLS.slice(0, 2), CELLS.slice(2, 5), CELLS.slice(5, 7)];

  return (
    <div className="hive-page">
      <svg
        style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }}
        viewBox={`0 0 ${BG_W} ${BG_H}`}
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width={BG_W} height={BG_H} fill="var(--coach-bg2)" />
        <g
          fill="none"
          style={{
            stroke: 'var(--coach-gold)',
            strokeOpacity: 'var(--hex-grid-opacity)',
            strokeWidth: 'var(--hex-grid-width)',
          }}
        >
          {bgPolygons.map((pts) => (
            <polygon key={pts} points={pts} />
          ))}
        </g>
      </svg>

      <div className="logo-wrap">
        <div className="logo-row">
          <svg width="20" height="23" viewBox="0 0 20 23" style={{ opacity: 0.75 }}>
            <polygon points="10,1 19,6 19,17 10,22 1,17 1,6" fill="none" stroke="var(--coach-gold-line)" strokeWidth="1.2" />
          </svg>
          <span className="logo-text">
            Ez<strong>Bz</strong>
          </span>
          <svg width="20" height="23" viewBox="0 0 20 23" style={{ opacity: 0.75 }}>
            <polygon points="10,1 19,6 19,17 10,22 1,17 1,6" fill="none" stroke="var(--coach-gold-line)" strokeWidth="1.2" />
          </svg>
        </div>
        <div className="logo-divider" />
        <div className="logo-sub">מרחב הניהול שלך</div>
      </div>

      <div className="hive">
        <div className="hive-row">
          {row1.map((cell) => (
            <Cell key={cell.id} cell={cell} />
          ))}
        </div>
        <div className="hive-row hive-row-mid">
          {row2.map((cell) => (
            <Cell key={cell.id} cell={cell} />
          ))}
        </div>
        <div className="hive-row">
          {row3.map((cell) => (
            <Cell key={cell.id} cell={cell} />
          ))}
        </div>
      </div>
    </div>
  );
}
