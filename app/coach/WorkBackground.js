import './work.css';
import { BG_W, BG_H, buildScatteredHexes, hexPoints } from './hexGrid';
import TabBar from './TabBar';

// רקע ברירת מחדל לכל מסכי העבודה (B2 ואילך): שמפניה בהיר + משושים בודדים
// מפוזרים (לא רשת חוזרת — זו עברה לתוך כותרות הכרטיסים, ר' HeaderGrid.js,
// כדי שלא תהיה כפילות). גוונים ופיזור מאושרים סופית ב-app/coach/tokens.css.
export default function WorkBackground({ children }) {
  const hexes = buildScatteredHexes();

  return (
    <div className="work-page">
      <svg
        style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }}
        viewBox={`0 0 ${BG_W} ${BG_H}`}
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width={BG_W} height={BG_H} fill="var(--work-bg)" />
        <g fill="none" style={{ stroke: 'var(--work-grid-stroke)', strokeWidth: 1.1 }}>
          {hexes.map((h) => (
            <polygon
              key={`${h.cx},${h.cy}`}
              points={hexPoints(h.cx, h.cy, h.r)}
              style={{ strokeOpacity: h.opacity }}
            />
          ))}
        </g>
      </svg>
      <div className="work-content">{children}</div>
      <TabBar />
    </div>
  );
}
