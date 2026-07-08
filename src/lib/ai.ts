import type { BoardState, Pos, Quadrant } from './types';
import { commitMove, listLegalMoves, cloneBoard, remainingNonPoisonCount, pickRandom } from './engine';

export type Difficulty = 0 | 1 | 2 | 3;

const BRANCH_CAP = 10;

export function difficultyForBoard(boardsCleared: number, isTutorial: boolean): Difficulty {
  if (isTutorial) return 0;
  if (boardsCleared < 6) return 1;
  if (boardsCleared < 10) return 2;
  return 3;
}

interface Candidate {
  anchor: Pos;
  quadrant: Quadrant;
  atePoison: boolean;
  score: number;
}

interface ScoredMove {
  move: { anchor: Pos; quadrant: Quadrant };
  board: BoardState;
  atePoison: boolean;
  quick: number;
}

function evaluate(state: BoardState): number {
  return -remainingNonPoisonCount(state);
}

function simulate(state: BoardState, anchor: Pos, quadrant: Quadrant) {
  const clone = cloneBoard(state);
  const result = commitMove(clone, anchor, quadrant);
  return { board: clone, result };
}

function topMovesByHeuristic(
  state: BoardState,
  moves: { anchor: Pos; quadrant: Quadrant }[]
): ScoredMove[] {
  const scored: ScoredMove[] = moves.map((move) => {
    const { board, result } = simulate(state, move.anchor, move.quadrant);
    if (result.atePoison) {
      return { move, board, atePoison: true, quick: -1000 };
    }
    const remaining = remainingNonPoisonCount(board);
    const quick = remaining === 0 ? 1000 : evaluate(board);
    return { move, board, atePoison: false, quick };
  });
  scored.sort((a, b) => b.quick - a.quick);
  return scored;
}

function scoreMoveShallow(state: BoardState, depth: number): number {
  const moves = listLegalMoves(state);
  if (moves.length === 0) return 0;

  const scored = topMovesByHeuristic(state, moves).slice(0, BRANCH_CAP);
  let best = -Infinity;
  for (const s of scored) {
    if (s.atePoison) {
      best = Math.max(best, -1000);
      continue;
    }
    const remaining = remainingNonPoisonCount(s.board);
    if (remaining === 0) {
      best = Math.max(best, 1000);
      continue;
    }
    const value = depth <= 1 ? s.quick : -scoreMoveShallow(s.board, depth - 1);
    best = Math.max(best, value);
  }
  return best;
}

function pickBestMove(state: BoardState, depth: number): Candidate[] {
  const moves = listLegalMoves(state);
  const scored = topMovesByHeuristic(state, moves);
  const deepenCount = depth > 1 ? Math.max(BRANCH_CAP, 15) : 0;

  const candidates: Candidate[] = scored.map((s, i) => {
    if (s.atePoison) {
      return { ...s.move, atePoison: true, score: -1000 };
    }
    const remaining = remainingNonPoisonCount(s.board);
    if (remaining === 0) {
      return { ...s.move, atePoison: false, score: 1000 };
    }
    const useDeep = depth > 1 && i < deepenCount;
    const score = useDeep ? -scoreMoveShallow(s.board, depth - 1) : s.quick;
    return { ...s.move, atePoison: false, score };
  });

  candidates.sort((a, b) => b.score - a.score);
  return candidates;
}

export function chooseAiMove(state: BoardState, boardsCleared: number): { anchor: Pos; quadrant: Quadrant } {
  const difficulty = difficultyForBoard(boardsCleared, state.isTutorial);
  const allMoves = listLegalMoves(state);
  if (allMoves.length === 0) {
    throw new Error('둘 수 있는 수가 없어요');
  }

  if (difficulty === 0) {
    const safeMoves = allMoves.filter((m) => !simulate(state, m.anchor, m.quadrant).result.atePoison);
    const pool = safeMoves.length > 0 ? safeMoves : allMoves;
    return pickRandom(pool, 1)[0];
  }

  const depth = difficulty === 1 ? 1 : difficulty === 2 ? 2 : 3;
  const randomness = difficulty === 1 ? 0.35 : difficulty === 2 ? 0.15 : 0.05;

  const ranked = pickBestMove(state, depth);
  const nonLosing = ranked.filter((c) => !c.atePoison);
  const pool = nonLosing.length > 0 ? nonLosing : ranked;

  if (Math.random() < randomness && pool.length > 1) {
    const idx = 1 + Math.floor(Math.random() * Math.min(3, pool.length - 1));
    return pool[idx];
  }
  return pool[0];
}
