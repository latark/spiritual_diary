/**
 * Геометрия «цветка эмоций».
 * Лепесток — мягкая каплевидно-листовая форма: у основания (к центру) лепестки
 * соприкасаются боками примерно до середины, затем сужаются к скруглённому кончику.
 * Никаких тонких острых лучей — форма должна читаться как безопасная, не как нож.
 */

export interface Pt {
  x: number;
  y: number;
}

function smoothstep(t: number): number {
  return t * t * (3 - 2 * t);
}

/**
 * Полуширина лепестка (в радианах) в зависимости от доли длины t (0 — основание, 1 — кончик).
 * Держим полную ширину (соприкосновение) до plateau, затем плавно сужаем почти к нулю.
 */
function halfAngleAt(t: number, hmax: number): number {
  const plateau = 0.42;
  if (t <= plateau) return hmax;
  const u = (t - plateau) / (1 - plateau);
  return hmax * (1 - smoothstep(u));
}

export function petalPoints(
  cx: number,
  cy: number,
  angle: number,
  innerR: number,
  outerR: number,
  sector: number,
  steps = 12,
): Pt[] {
  const hmax = (sector / 2) * 0.82; // зазор между лепестками: соприкасаются, но без нахлёста
  const pts: Pt[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const r = innerR + (outerR - innerR) * t;
    const a = angle - halfAngleAt(t, hmax);
    pts.push({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) });
  }
  // правый край: от кончика к основанию, без дублирования самой вершины
  for (let i = steps - 1; i >= 0; i--) {
    const t = i / steps;
    const r = innerR + (outerR - innerR) * t;
    const a = angle + halfAngleAt(t, hmax);
    pts.push({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) });
  }
  return pts;
}

/** Замкнутый сглаженный контур (Catmull-Rom → кубические безье). */
export function smoothClosedPath(points: Pt[]): string {
  const n = points.length;
  if (n < 3) return '';
  const f = (v: number) => v.toFixed(2);
  const first = points[0]!;
  let d = `M ${f(first.x)} ${f(first.y)} `;
  for (let i = 0; i < n; i++) {
    const p0 = points[(i - 1 + n) % n]!;
    const p1 = points[i]!;
    const p2 = points[(i + 1) % n]!;
    const p3 = points[(i + 2) % n]!;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += `C ${f(c1x)} ${f(c1y)}, ${f(c2x)} ${f(c2y)}, ${f(p2.x)} ${f(p2.y)} `;
  }
  return d + 'Z';
}

export function petalPath(
  cx: number,
  cy: number,
  angle: number,
  innerR: number,
  outerR: number,
  sector: number,
): string {
  return smoothClosedPath(petalPoints(cx, cy, angle, innerR, outerR, sector));
}

/** Угол i-го лепестка из n, начиная сверху (−90°), по часовой стрелке. */
export function petalAngle(i: number, n: number): number {
  return (-90 + (i * 360) / n) * (Math.PI / 180);
}

/** Точка для подписи на заданном радиусе вдоль угла. */
export function pointAt(cx: number, cy: number, angle: number, r: number): Pt {
  return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
}

/** Радиальный поворот подписи (градусы) с переворотом на левой половине, чтобы текст не был вверх ногами. */
export function radialLabelRotation(angle: number): number {
  const deg = angle * (180 / Math.PI);
  const norm = ((deg % 360) + 360) % 360;
  return norm > 90 && norm < 270 ? deg + 180 : deg;
}

/** Воспринимаемая яркость цвета (#rrggbb) → выбор тёмного/светлого текста на лепестке. */
export function luminance(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

export function readableText(hex: string): string {
  return luminance(hex) < 150 ? '#F2EDFF' : '#241433';
}
