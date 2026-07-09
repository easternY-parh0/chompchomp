import type { BoardConfig, BoardState, Tile, Pos, Quadrant, MoveResult, ModifierFlags } from './types';
import { generateShapeMask } from './shapes';

const REGROWTH_ROUND_DELAY = 2;

function emptyTile(hole: boolean): Tile {
  return {
    hole,
    alive: !hole,
    hp: 1,
    isPoison: false,
    isIce: false,
    isBomb: false,
    isBlackhole: false,
    linkId: null,
    isRegrowth: false,
    regrowAt: null
  };
}

export function pickRandom<T>(arr: T[], n: number): T[] {
  const pool = [...arr];
  const picked: T[] = [];
  for (let i = 0; i < n && pool.length > 0; i++) {
    const idx = Math.floor(Math.random() * pool.length);
    picked.push(pool.splice(idx, 1)[0]);
  }
  return picked;
}

function aliveNonSpecialPositions(state: BoardState, exclude: Set<string>): Pos[] {
  const out: Pos[] = [];
  for (let r = 0; r < state.rows; r++) {
    for (let c = 0; c < state.cols; c++) {
      const t = state.tiles[r][c];
      const key = `${r}-${c}`;
      if (
        !t.hole &&
        t.alive &&
        !t.isPoison &&
        !t.isIce &&
        !t.isBomb &&
        !t.isBlackhole &&
        t.linkId === null &&
        !t.isRegrowth &&
        !exclude.has(key)
      ) {
        out.push({ r, c });
      }
    }
  }
  return out;
}

export function createBoard(config: BoardConfig): BoardState {
  const shape = config.isTutorial ? 'rect' : config.shape;
  const mask = generateShapeMask(shape, config.rows, config.cols);
  const tiles: Tile[][] = mask.map((row) => row.map((alive) => emptyTile(!alive)));

  const state: BoardState = {
    rows: config.rows,
    cols: config.cols,
    tiles,
    turnCount: 0,
    roundCount: 0,
    isTutorial: config.isTutorial
  };

  if (config.isTutorial) {
    state.tiles[0][0].isPoison = true;
  } else {
    const alivePositions: Pos[] = [];
    for (let r = 0; r < state.rows; r++) {
      for (let c = 0; c < state.cols; c++) {
        if (state.tiles[r][c].alive) alivePositions.push({ r, c });
      }
    }
    const poisonCount = config.modifiers.doublePoison ? 2 : 1;
    const chosen = pickRandom(alivePositions, Math.min(poisonCount, alivePositions.length));
    chosen.forEach((p) => (state.tiles[p.r][p.c].isPoison = true));
    applyModifierSetup(state, config.modifiers);
  }

  return state;
}

function applyModifierSetup(state: BoardState, modifiers: ModifierFlags): void {
  const used = new Set<string>();
  const claim = (positions: Pos[]) => positions.forEach((p) => used.add(`${p.r}-${p.c}`));

  if (modifiers.ice) {
    const candidates = aliveNonSpecialPositions(state, used);
    const count = Math.max(2, Math.floor(candidates.length * 0.18));
    const picked = pickRandom(candidates, count);
    picked.forEach((p) => {
      state.tiles[p.r][p.c].isIce = true;
      state.tiles[p.r][p.c].hp = 2;
    });
    claim(picked);
  }

  if (modifiers.bomb) {
    const candidates = aliveNonSpecialPositions(state, used);
    const picked = pickRandom(candidates, Math.min(2, candidates.length));
    picked.forEach((p) => (state.tiles[p.r][p.c].isBomb = true));
    claim(picked);
  }

  if (modifiers.blackhole) {
    const candidates = aliveNonSpecialPositions(state, used);
    const picked = pickRandom(candidates, Math.min(1, candidates.length));
    picked.forEach((p) => (state.tiles[p.r][p.c].isBlackhole = true));
    claim(picked);
  }

  if (modifiers.linked) {
    const candidates = aliveNonSpecialPositions(state, used);
    const evenCount = candidates.length - (candidates.length % 2);
    const picked = pickRandom(candidates, Math.min(4, evenCount));
    for (let i = 0; i < picked.length; i += 2) {
      const linkId = i / 2 + 1;
      state.tiles[picked[i].r][picked[i].c].linkId = linkId;
      state.tiles[picked[i + 1].r][picked[i + 1].c].linkId = linkId;
    }
    claim(picked);
  }

  if (modifiers.regrowth) {
    const candidates = aliveNonSpecialPositions(state, used);
    const picked = pickRandom(candidates, Math.min(3, candidates.length));
    picked.forEach((p) => (state.tiles[p.r][p.c].isRegrowth = true));
    claim(picked);
  }
}

export function classifyQuadrant(anchor: Pos, target: Pos): Quadrant {
  const rowSign = target.r >= anchor.r ? 1 : -1;
  const colSign = target.c >= anchor.c ? 1 : -1;
  if (rowSign > 0 && colSign > 0) return 'se';
  if (rowSign > 0 && colSign < 0) return 'sw';
  if (rowSign < 0 && colSign > 0) return 'ne';
  return 'nw';
}

export function computeSelection(state: BoardState, anchor: Pos, quadrant: Quadrant): Pos[] {
  const effective = state.isTutorial ? 'se' : quadrant;
  const rowSign = effective === 'se' || effective === 'sw' ? 1 : -1;
  const colSign = effective === 'se' || effective === 'ne' ? 1 : -1;

  const out: Pos[] = [];
  for (let r = 0; r < state.rows; r++) {
    if (rowSign > 0 ? r < anchor.r : r > anchor.r) continue;
    for (let c = 0; c < state.cols; c++) {
      if (colSign > 0 ? c < anchor.c : c > anchor.c) continue;
      const t = state.tiles[r][c];
      if (t.hole || !t.alive) continue;
      out.push({ r, c });
    }
  }
  return out;
}

export function commitMove(state: BoardState, anchor: Pos, quadrant: Quadrant): MoveResult {
  const selection = computeSelection(state, anchor, quadrant);

  const removed: Pos[] = [];
  const cracked: Pos[] = [];
  const removedKeys = new Set<string>();

  const removeTile = (r: number, c: number): void => {
    const key = `${r}-${c}`;
    if (removedKeys.has(key)) return;
    const t = state.tiles[r][c];
    if (t.hole || !t.alive) return;
    t.alive = false;
    removedKeys.add(key);
    removed.push({ r, c });

    if (t.isRegrowth) {
      t.regrowAt = state.roundCount + REGROWTH_ROUND_DELAY;
    }

    if (t.isBomb) {
      const neighborOffsets = [
        { dr: -1, dc: 0 },
        { dr: 1, dc: 0 },
        { dr: 0, dc: -1 },
        { dr: 0, dc: 1 },
        { dr: -1, dc: -1 },
        { dr: -1, dc: 1 },
        { dr: 1, dc: -1 },
        { dr: 1, dc: 1 }
      ];
      const neighbors = neighborOffsets
        .map((o) => ({ r: r + o.dr, c: c + o.dc }))
        .filter(
          (p) =>
            p.r >= 0 &&
            p.r < state.rows &&
            p.c >= 0 &&
            p.c < state.cols &&
            !state.tiles[p.r][p.c].hole &&
            state.tiles[p.r][p.c].alive
        );
      const blastTargets = pickRandom(neighbors, Math.min(3, neighbors.length));
      blastTargets.forEach((p) => removeTile(p.r, p.c));
    }

    if (t.isBlackhole) {
      for (let cc = 0; cc < state.cols; cc++) {
        if (cc !== c) removeTile(r, cc);
      }
      for (let rr = 0; rr < state.rows; rr++) {
        if (rr !== r) removeTile(rr, c);
      }
    }

    if (t.linkId !== null) {
      for (let rr = 0; rr < state.rows; rr++) {
        let matched = false;
        for (let cc = 0; cc < state.cols; cc++) {
          if (rr === r && cc === c) continue;
          const other = state.tiles[rr][cc];
          if (other.alive && other.linkId === t.linkId) {
            removeTile(rr, cc);
            matched = true;
            break;
          }
        }
        if (matched) break;
      }
    }
  };

  for (const p of selection) {
    const t = state.tiles[p.r][p.c];
    if (t.hole || !t.alive) continue;
    if (t.hp > 1) {
      t.hp -= 1;
      cracked.push(p);
      continue;
    }
    removeTile(p.r, p.c);
  }

  state.turnCount += 1;

  // 폭탄/블랙홀/연결 연쇄로 "직접 고르지 않은" 독약이 같이 사라지는 경우도 있으므로,
  // 최초 선택 범위가 아니라 이번 수로 실제로 사라진 모든 칸을 기준으로 판정한다.
  const atePoison = removed.some((p) => state.tiles[p.r][p.c].isPoison);

  return { atePoison, removed, cracked };
}

/**
 * 사람 한 번 + AI 한 번 = 1라운드. 이 함수는 AI 턴이 끝난 직후,
 * 즉 한 라운드가 완전히 끝났을 때만 호출한다.
 * 재생 조각들의 카운트다운을 이때만 줄이고, 0이 되면 되살린다.
 */
export function advanceRound(state: BoardState): Pos[] {
  state.roundCount += 1;
  const revived: Pos[] = [];
  for (let r = 0; r < state.rows; r++) {
    for (let c = 0; c < state.cols; c++) {
      const t = state.tiles[r][c];
      if (!t.alive && !t.hole && t.regrowAt !== null && t.regrowAt <= state.roundCount) {
        t.alive = true;
        t.regrowAt = null;
        t.hp = 1;
        revived.push({ r, c });
      }
    }
  }
  return revived;
}

export function remainingNonPoisonCount(state: BoardState): number {
  let n = 0;
  for (let r = 0; r < state.rows; r++) {
    for (let c = 0; c < state.cols; c++) {
      const t = state.tiles[r][c];
      if (!t.hole && t.alive && !t.isPoison) n++;
    }
  }
  return n;
}

export function cloneBoard(state: BoardState): BoardState {
  return {
    rows: state.rows,
    cols: state.cols,
    turnCount: state.turnCount,
    roundCount: state.roundCount,
    isTutorial: state.isTutorial,
    tiles: state.tiles.map((row) => row.map((t) => ({ ...t })))
  };
}

export function listLegalMoves(state: BoardState): { anchor: Pos; quadrant: Quadrant }[] {
  const quadrants: Quadrant[] = state.isTutorial ? ['se'] : ['se', 'sw', 'ne', 'nw'];
  const moves: { anchor: Pos; quadrant: Quadrant }[] = [];
  const seen = new Set<string>();

  for (let r = 0; r < state.rows; r++) {
    for (let c = 0; c < state.cols; c++) {
      const t = state.tiles[r][c];
      if (t.hole || !t.alive) continue;
      for (const q of quadrants) {
        const selection = computeSelection(state, { r, c }, q);
        if (selection.length === 0) continue;
        const key = selection
          .map((p) => `${p.r}-${p.c}`)
          .sort()
          .join(',');
        if (seen.has(key)) continue;
        seen.add(key);
        moves.push({ anchor: { r, c }, quadrant: q });
      }
    }
  }
  return moves;
}