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
  let result: Solved = { win: -1, move: null };
  
  let bestFallback: [number, number] | null = null;
  let bestFallbackScore = -Infinity;

  outer: for (let r = 0; r < rows; r++) {
    for (let c = 0; c < widths[r]; c++) {
      const nw = widths.slice();
      for (let rr = r; rr < rows; rr++) nw[rr] = Math.min(nw[rr], c);
      
      const isDeadly = nw.every((w) => w === 0);
      
      // 1. 필승수가 있다면 바로 선택
      if (!isDeadly && solve(nw).win === -1) {
        result = { win: 1, move: [r, c] };
        break outer;
      }

      // 2. 패배 상황에서의 차선책 점수 설계
      let score = 0;

      if (isDeadly) {
        score = -99999; // 즉시 자살은 여전히 최하위
      } else {
        const activeRows = nw.filter(w => w > 0).length;
        const maxCols = Math.max(...nw);
        
        // [체크] 방금 내가 둔 수로 인해 맵이 얼마나 깎였는가?
        const currentCells = widths.reduce((a, b) => a + b, 0);
        const nextCells = nw.reduce((a, b) => a + b, 0);
        const consumed = currentCells - nextCells; // 이번에 먹은 양

        // 기피 조건 1: 외줄 만들기 (상대 필승 형태)
        if (activeRows === 1 || maxCols === 1) {
          score -= 1000;
        }

        // 기피 조건 2: 한 칸씩 갉아먹으며 겜 늘어지게 만들기
        // 패배 확정인데 1칸만 야금야금 먹는 비겁한(?) 수에 큰 패널티 부여
        if (consumed === 1) {
          score -= 500;
        }

        // 선호 조건: 정사각형에 가까운 형태 유지 (대칭성이 있어 유저가 실수하기 쉬움)
        // 가로/세로 길이 차이가 적을수록 가점
        const shapeDiff = Math.abs(activeRows - maxCols);
        score += (100 - shapeDiff * 10);

        // 약간의 랜덤성(타이브레이커)을 주어 매번 똑같은 구석을 파먹지 않게 합니다.
        score += (r + c) * 0.1; 
      }

      if (score > bestFallbackScore || bestFallback === null) {
        bestFallbackScore = score;
        bestFallback = [r, c];
      }
    }
  }
  
  if (result.move === null) {
    result = { win: -1, move: bestFallback };
  }
  
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
