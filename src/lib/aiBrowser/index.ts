// 브라우저 사이드 AI 공개 API. 페이지는 이 두 함수만 쓴다.
// 변형 모드 = 난이도별 ONNX 신경망 + 1-스텝 lookahead(engine.ts 재사용).
// 클래식 모드 = 정확 미제르 minimax(classicSolver).
import type { BoardState, ModifierFlags, Pos, Quadrant } from '$lib/types';
import { listLegalMoves, cloneBoard, commitMove, remainingNonPoisonCount } from '$lib/engine';
import { encodeBoard, CANVAS_SIZE } from './encode';
import { valueBatch, warmup } from './net';
import { chooseClassicMove } from './classicSolver';

export interface AiMove {
  anchor: Pos;
  quadrant: Quadrant;
}

// ── 변형 모드: 난이도(0..3) → (체크포인트 모델, temperature) ──
// train_app.ipynb 의 난이도 매핑과 동일: 1k/10k/50k/200k.
export interface DiffModel {
  url: string;
  temp: number;
}
export const MODIFIED_MODELS: DiffModel[] = [
  { url: '/models/chomp_1k.onnx', temp: 2.0 }, // 0: 튜토리얼/매우 쉬움
  { url: '/models/chomp_10k.onnx', temp: 1.0 }, // 1: 쉬움
  { url: '/models/chomp_50k.onnx', temp: 0.5 }, // 2: 보통
  { url: '/models/chomp_200k.onnx', temp: 0.1 } // 3: 어려움  (0.0 으로 두면 '최강')
];

// boardsCleared → 난이도(0..3). ai.ts 의 difficultyForBoard 구간과 동일.
function difficultyFor(board: BoardState, boardsCleared: number): number {
  if (board.isTutorial) return 0;
  if (boardsCleared < 6) return 1;
  if (boardsCleared < 10) return 2;
  return 3;
}

function hasPendingNonPoisonRegrow(b: BoardState): boolean {
  for (const row of b.tiles) {
    for (const t of row) {
      if (!t.alive && !t.hole && t.regrowAt !== null && !t.isPoison) return true;
    }
  }
  return false;
}

function modifiersFromSet(active: Set<keyof ModifierFlags>): ModifierFlags {
  return {
    doublePoison: active.has('doublePoison'),
    ice: active.has('ice'),
    bomb: active.has('bomb'),
    blackhole: active.has('blackhole'),
    linked: active.has('linked'),
    regrowth: active.has('regrowth')
  };
}

/** 변형 모드 AI. 앱의 activeModifiers(SvelteSet)를 그대로 넘긴다. */
export async function requestModifiedMove(
  board: BoardState,
  boardsCleared: number,
  activeModifiers: Set<keyof ModifierFlags>,
  difficultyOverride?: number
): Promise<AiMove> {
  const diff = difficultyOverride ?? difficultyFor(board, boardsCleared);
  const clamped = Math.max(0, Math.min(MODIFIED_MODELS.length - 1, diff));
  const { url, temp } = MODIFIED_MODELS[clamped];
  const modifiers = modifiersFromSet(activeModifiers);
  const moves = listLegalMoves(board);
  if (moves.length === 0) throw new Error('no legal moves');

  const scores = new Array<number>(moves.length).fill(0);
  const needIdx: number[] = [];
  const encodings: Float32Array[] = [];

  for (let i = 0; i < moves.length; i++) {
    const nb = cloneBoard(board);
    const res = commitMove(nb, moves[i].anchor, moves[i].quadrant);
    if (res.atePoison) {
      scores[i] = -1; // 내가 독약 먹음
    } else if (remainingNonPoisonCount(nb) === 0 && !hasPendingNonPoisonRegrow(nb)) {
      scores[i] = 1; // 상대가 강제로 독약 먹게 됨
    } else {
      const enc = new Float32Array(CANVAS_SIZE);
      encodeBoard(nb, modifiers, enc, 0);
      encodings.push(enc);
      needIdx.push(i);
    }
  }

  if (needIdx.length > 0) {
    const data = new Float32Array(needIdx.length * CANVAS_SIZE);
    encodings.forEach((e, j) => data.set(e, j * CANVAS_SIZE));
    const values = await valueBatch(url, data, needIdx.length);
    needIdx.forEach((i, j) => {
      scores[i] = -values[j]; // 결과는 상대 차례 → 내 점수 = -value
    });
  }

  const choice = temp <= 0 ? argmax(scores) : sampleSoftmax(scores, temp);
  return moves[choice];
}

/** 클래식 모드 AI. difficulty = 코스 난이도(1/3/5). 신경망 없이 minimax. */
export async function requestClassicMove(grid: boolean[][], difficulty: number): Promise<AiMove> {
  const epsilon = difficulty >= 5 ? 0.0 : difficulty >= 3 ? 0.2 : 0.5;
  return chooseClassicMove(grid, epsilon);
}

/** (선택) 변형 모델 4개 미리 로드. 예: 게임 시작 onMount 에서 호출. */
export function warmupModels(): Promise<void> {
  return warmup(MODIFIED_MODELS.map((m) => m.url));
}

function argmax(a: number[]): number {
  let bi = 0;
  for (let i = 1; i < a.length; i++) if (a[i] > a[bi]) bi = i;
  return bi;
}

function sampleSoftmax(scores: number[], temp: number): number {
  const m = Math.max(...scores);
  const ex = scores.map((s) => Math.exp((s - m) / temp));
  const sum = ex.reduce((a, b) => a + b, 0);
  let r = Math.random() * sum;
  for (let i = 0; i < ex.length; i++) {
    r -= ex[i];
    if (r <= 0) return i;
  }
  return ex.length - 1;
}
