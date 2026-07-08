import type { Shape } from './types';

function pointInPolygon(x: number, y: number, poly: [number, number][]): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

function starPolygon(points: number, outerR: number, innerR: number): [number, number][] {
  const verts: [number, number][] = [];
  const step = Math.PI / points;
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = -Math.PI / 2 + i * step;
    verts.push([r * Math.cos(angle), r * Math.sin(angle)]);
  }
  return verts;
}

const STAR_POLY = starPolygon(5, 1, 0.42);

function toNormalized(r: number, c: number, rows: number, cols: number) {
  const cx = (cols - 1) / 2;
  const cy = (rows - 1) / 2;
  const nx = (c - cx) / (cols / 2);
  const ny = (r - cy) / (rows / 2);
  return { nx, ny };
}

function isInsideShape(shape: Shape, nx: number, ny: number): boolean {
  if (shape === 'rect') return true;
  if (shape === 'circle') return nx * nx + ny * ny <= 1;
  if (shape === 'heart') {
    const hx = nx * 1.15;
    const hy = -ny * 1.15 + 0.3;
    const val = Math.pow(hx * hx + hy * hy - 1, 3) - hx * hx * Math.pow(hy, 3);
    return val <= 0;
  }
  return pointInPolygon(nx, ny, STAR_POLY);
}

export function generateShapeMask(shape: Shape, rows: number, cols: number): boolean[][] {
  const mask: boolean[][] = [];
  let aliveCount = 0;

  for (let r = 0; r < rows; r++) {
    const row: boolean[] = [];
    for (let c = 0; c < cols; c++) {
      const { nx, ny } = toNormalized(r, c, rows, cols);
      const inside = isInsideShape(shape, nx, ny);
      row.push(inside);
      if (inside) aliveCount++;
    }
    mask.push(row);
  }

  const minRequired = Math.max(6, Math.floor(rows * cols * 0.35));
  if (aliveCount < minRequired && shape !== 'rect') {
    return generateShapeMask('rect', rows, cols);
  }
  return mask;
}
