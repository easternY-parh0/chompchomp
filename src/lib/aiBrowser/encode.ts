// 보드 상태 → 신경망 입력 텐서 인코딩. train_app.ipynb 의 encode() 와 채널·순서가 정확히 일치해야 함.
import type { BoardState, ModifierFlags } from '$lib/types';

export const MAX_H = 9;
export const MAX_W = 10;
export const CIN = 18;
export const CANVAS_SIZE = CIN * MAX_H * MAX_W;

// 채널 인덱스 (train_app.ipynb CH 딕셔너리와 동일)
const CH = {
  alive: 0, hole: 1, pad: 2, poison: 3, ice: 4, ice_fresh: 5,
  bomb: 6, blackhole: 7, linked: 8, regrowth: 9,
  regrow_pending: 10, regrow_count: 11,
  m_doublePoison: 12, m_ice: 13, m_bomb: 14, m_blackhole: 15, m_linked: 16, m_regrowth: 17
} as const;
const REGROW_NORM = 2;
const MOD_KEYS: (keyof ModifierFlags)[] = ['doublePoison', 'ice', 'bomb', 'blackhole', 'linked', 'regrowth'];
const MOD_CH = [CH.m_doublePoison, CH.m_ice, CH.m_bomb, CH.m_blackhole, CH.m_linked, CH.m_regrowth];

function at(ch: number, r: number, c: number): number {
  return (ch * MAX_H + r) * MAX_W + c;
}

export function inferModifiers(board: BoardState): ModifierFlags {
  const m: ModifierFlags = {
    doublePoison: false, ice: false, bomb: false, blackhole: false, linked: false, regrowth: false
  };
  let poison = 0;
  for (const row of board.tiles) {
    for (const t of row) {
      if (t.alive && t.isPoison) poison++;
      if (t.alive && t.isIce) m.ice = true;
      if (t.alive && t.isBomb) m.bomb = true;
      if (t.alive && t.isBlackhole) m.blackhole = true;
      if (t.alive && t.linkId !== null) m.linked = true;
      if ((t.alive && t.isRegrowth) || (!t.alive && !t.hole && t.regrowAt !== null)) m.regrowth = true;
    }
  }
  m.doublePoison = poison >= 2;
  return m;
}

// 보드 하나를 out[offset ..] 에 인코딩. out 은 0으로 초기화된 Float32Array 이어야 함.
export function encodeBoard(board: BoardState, modifiers: ModifierFlags, out: Float32Array, offset = 0): void {
  // pad = 1 (캔버스 전체) → 보드 영역만 0으로
  for (let r = 0; r < MAX_H; r++) {
    for (let c = 0; c < MAX_W; c++) out[offset + at(CH.pad, r, c)] = 1;
  }
  for (let r = 0; r < board.rows; r++) {
    for (let c = 0; c < board.cols; c++) {
      out[offset + at(CH.pad, r, c)] = 0;
      const t = board.tiles[r][c];
      if (t.hole) {
        out[offset + at(CH.hole, r, c)] = 1;
        continue;
      }
      if (t.alive) {
        out[offset + at(CH.alive, r, c)] = 1;
        if (t.isPoison) out[offset + at(CH.poison, r, c)] = 1;
        if (t.isIce) {
          out[offset + at(CH.ice, r, c)] = 1;
          if (t.hp >= 2) out[offset + at(CH.ice_fresh, r, c)] = 1;
        }
        if (t.isBomb) out[offset + at(CH.bomb, r, c)] = 1;
        if (t.isBlackhole) out[offset + at(CH.blackhole, r, c)] = 1;
        if (t.linkId !== null) out[offset + at(CH.linked, r, c)] = 1;
        if (t.isRegrowth) out[offset + at(CH.regrowth, r, c)] = 1;
      } else if (t.regrowAt !== null) {
        out[offset + at(CH.regrow_pending, r, c)] = 1;
        const left = Math.max(0, t.regrowAt - board.roundCount);
        out[offset + at(CH.regrow_count, r, c)] = left / REGROW_NORM;
      }
    }
  }
  // 활성 모디파이어 broadcast 플레인
  MOD_KEYS.forEach((k, i) => {
    if (modifiers[k]) {
      for (let r = 0; r < MAX_H; r++) {
        for (let c = 0; c < MAX_W; c++) out[offset + at(MOD_CH[i], r, c)] = 1;
      }
    }
  });
}
