import './work.css';
import { BG_W, BG_H, buildHexGridPolygons } from './hexGrid';

// רקע ברירת מחדל לכל מסכי העבודה (B2 ואילך): שמפניה בהיר + אותה רשת משושים
// מ-ezbz_menu (20).html, בגוון הפוך. גוונים מאושרים סופית ב-app/coach/tokens.css.
export default function WorkBackground({ children }) {
  const bgPolygons = buildHexGridPolygons();

  return (
    <div className="work-page">
      <svg
        style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }}
        viewBox={`0 0 ${BG_W} ${BG_H}`}
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width={BG_W} height={BG_H} fill="var(--work-bg)" />
        <g
          fill="none"
          style={{
            stroke: 'var(--work-grid-stroke)',
            strokeOpacity: 'var(--hex-grid-opacity)',
            strokeWidth: 'var(--hex-grid-width)',
          }}
        >
          {bgPolygons.map((pts) => (
            <polygon key={pts} points={pts} />
          ))}
        </g>
      </svg>
      <div className="work-content">{children}</div>
    </div>
  );
}
