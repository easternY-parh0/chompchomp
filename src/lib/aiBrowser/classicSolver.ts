// 클래식 모드: 표준 촘프(독약 (0,0), se 1방향). 열 폭(width) 튜플로 정확 미제르 minimax.
// train_app.ipynb 의 _classic_best 와 동일 로직. 작은 판(≤5×8)이라 메모이즈로 즉시.
import type { Pos, Quadrant } from '$lib/types';

export interface AiMove {
  anchor: Pos;
  quadrant: Quadrant;
}

interface Solved {
  win: number; // +1 = 두는 쪽 승, -1 = 패
  move: [number, number] | null;
}

const memo = new Map<string, Solved>();

function solve(widths: number[]): Solved {
  const key = widths.join(',');
  const cached = memo.get(key);
  if (cached) return cached;

  const rows = widths.length;
  let fallback: [number, number] | null = null;
  let result: Solved = { win: -1, move: null };

  outer: for (let r = 0; r < rows; r++) {
    for (let c = 0; c < widths[r]; c++) {
      const nw = widths.slice();
      for (let rr = r; rr < rows; rr++) nw[rr] = Math.min(nw[rr], c);
      if (nw.every((w) => w === 0)) {
        if (!fallback) fallback = [r, c]; // 독약만 남기는 수 = 마지막 수단
        continue;
      }
      if (solve(nw).win === -1) {
        result = { win: 1, move: [r, c] };
        break outer;
      }
      if (!fallback) fallback = [r, c];
    }
  }
  if (result.move === null) result = { win: -1, move: fallback };
  memo.set(key, result);
  return result;
}

function gridToWidths(grid: boolean[][]): number[] {
  return grid.map((row) => row.reduce((a, v) => a + (v ? 1 : 0), 0));
}

/**
 * 클래식 최적수. epsilon = 랜덤수 확률(난이도 조절). 반환 quadrant 는 항상 'se'.
 * grid: boolean[][] (true=남음), 독약은 (0,0).
 */
export function chooseClassicMove(grid: boolean[][], epsilon = 0): AiMove {
  const rows = grid.length;
  const cols = grid[0]?.length ?? 0;

  if (Math.random() < epsilon) {
    const valid: [number, number][] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) if (grid[r][c]) valid.push([r, c]);
    }
    const [r, c] = valid[Math.floor(Math.random() * valid.length)];
    return { anchor: { r, c }, quadrant: 'se' };
  }

  const { move } = solve(gridToWidths(grid));
  const [r, c] = move ?? [0, 0];
  return { anchor: { r, c }, quadrant: 'se' };
}
