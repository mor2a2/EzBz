import { HEADER_W, HEADER_H, HEADER_R, buildHexGridPolygons } from './hexGrid';

// רשת משושים צפופה בתוך כותרות אדום-ענבר (B2, B3, וכל מסך עבודה עתידי) —
// עוצמה 3 מאושרת: אותם --hex-grid-opacity/--hex-grid-width כמו שהיו ברקע
// הכללי (עכשיו כבוי), לא ערכים חדשים. --header-grid-stroke זהב עדין,
// שונה בכוונה מ---work-grid-stroke (הענבר-חום של השוליים) כדי לבלוט על אדום כהה.
export default function HeaderGrid() {
  const polygons = buildHexGridPolygons(HEADER_W, HEADER_H, HEADER_R);

  return (
    <svg
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }}
      viewBox={`0 0 ${HEADER_W} ${HEADER_H}`}
      preserveAspectRatio="xMidYMid slice"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g
        fill="none"
        style={{
          stroke: 'var(--header-grid-stroke)',
          strokeOpacity: 'var(--hex-grid-opacity)',
          strokeWidth: 'var(--hex-grid-width)',
        }}
      >
        {polygons.map((pts) => (
          <polygon key={pts} points={pts} />
        ))}
      </g>
    </svg>
  );
}
