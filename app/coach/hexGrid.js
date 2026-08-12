export const BG_W = 1080;
export const BG_H = 832;
export const BG_R = 44;

// תא כותרת (HeaderGrid) — רשת צפופה, אותה גיאומטריה בקנה מידה קטן יותר
export const HEADER_W = 300;
export const HEADER_H = 64;
export const HEADER_R = 22;

export function hexPoints(cx, cy, r) {
  const pts = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 180) * (60 * i - 90);
    pts.push(`${(cx + r * Math.cos(angle)).toFixed(1)},${(cy + r * Math.sin(angle)).toFixed(1)}`);
  }
  return pts.join(' ');
}

export function buildHexGridPolygons(W = BG_W, H = BG_H, r = BG_R) {
  const dx = r * Math.sqrt(3);
  const dy = r * 1.5;
  const rows = Math.ceil(H / dy) + 2;
  const cols = Math.ceil(W / dx) + 2;
  const polygons = [];

  for (let row = -1; row < rows; row++) {
    const cy = row * dy + r;
    const offset = row % 2 !== 0 ? dx / 2 : 0;
    for (let col = -1; col < cols; col++) {
      const cx = col * dx + offset + r;
      polygons.push(hexPoints(cx, cy, r));
    }
  }
  return polygons;
}

// PRNG דטרמיניסטי (mulberry32) — אותה תוצאה בכל render, גם server וגם client,
// כדי שלא יהיה hydration mismatch ושהפיזור לא "יקפוץ" בין טעינות.
function seededRandom(seed) {
  let t = (seed += 0x6d2b79f5);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

// גדלים משוקללים לכיוון קטן — מרגיש מכוון, לא "קונפטי" אחיד.
// עוצמות מאושרות סופית: כפול מהניסיון הראשון (0.07–0.14 → 0.14–0.28),
// אחרי שהראשון התברר חלש מדי לעין בהשוואה בפועל.
const SCATTER_SIZES = [
  { r: 16, weight: 0.4, opacity: 0.28 },
  { r: 20, weight: 0.3, opacity: 0.24 },
  { r: 26, weight: 0.2, opacity: 0.18 },
  { r: 34, weight: 0.1, opacity: 0.14 },
];

// משושים בודדים מפוזרים לרקע העמוד הכללי (לא רשת חוזרת) — כ-10-14 גלויים
// בשוליים בפועל בגלל שהכרטיס במרכז מכסה כ-40% מהרוחב.
export function buildScatteredHexes(W = BG_W, H = BG_H, cell = 180, fillChance = 0.6) {
  const cols = Math.ceil(W / cell);
  const rows = Math.ceil(H / cell);
  const hexes = [];

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const seed = row * 1000 + col;
      if (seededRandom(seed) > fillChance) continue;

      const jx = seededRandom(seed + 1);
      const jy = seededRandom(seed + 2);
      const sizeRoll = seededRandom(seed + 3);
      let acc = 0;
      let size = SCATTER_SIZES[0];
      for (const s of SCATTER_SIZES) {
        acc += s.weight;
        if (sizeRoll <= acc) {
          size = s;
          break;
        }
      }

      hexes.push({
        cx: col * cell + jx * cell,
        cy: row * cell + jy * cell,
        r: size.r,
        opacity: size.opacity,
      });
    }
  }
  return hexes;
}
