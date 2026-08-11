export const BG_W = 1080;
export const BG_H = 832;
export const BG_R = 44;

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
      const pts = [];
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 180) * (60 * i - 90);
        pts.push(`${(cx + r * Math.cos(angle)).toFixed(1)},${(cy + r * Math.sin(angle)).toFixed(1)}`);
      }
      polygons.push(pts.join(' '));
    }
  }
  return polygons;
}
