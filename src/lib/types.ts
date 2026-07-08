export type Shape = 'rect' | 'circle' | 'heart' | 'star';
export type Quadrant = 'se' | 'sw' | 'ne' | 'nw';
export type Player = 'human' | 'ai';

export interface Tile {
  hole: boolean;
  alive: boolean;
  hp: number;
  isPoison: boolean;
  isIce: boolean;
  isBomb: boolean;
  isBlackhole: boolean;
  linkId: number | null;
  isRegrowth: boolean;
  regrowAt: number | null;
  rangeLimit: number | null;
}

export interface ModifierFlags {
  doublePoison: boolean;
  ice: boolean;
  bomb: boolean;
  blackhole: boolean;
  linked: boolean;
  regrowth: boolean;
  rangeLimited: boolean;
}

export const ALL_MODIFIER_KEYS: (keyof ModifierFlags)[] = [
  'doublePoison',
  'ice',
  'bomb',
  'blackhole',
  'linked',
  'regrowth',
  'rangeLimited'
];

export const MODIFIER_INFO: Record<keyof ModifierFlags, { emoji: string; name: string; desc: string }> = {
  doublePoison: {
    emoji: '☠️☠️',
    name: '독약 2개',
    desc: '독약 조각이 2개가 돼요. 둘 중 아무거나 마지막에 먹으면 져요.'
  },
  ice: {
    emoji: '🧊',
    name: '얼음 조각',
    desc: '일부 조각은 내구도 2예요. 한 번 선택되면 금만 가고, 그 조각이 포함된 선택을 한 번 더 받아야 진짜로 사라져요.'
  },
  bomb: {
    emoji: '💣',
    name: '폭발 조각',
    desc: '이 조각을 먹으면 주변 조각 최대 3개가 무작위로 같이 사라져요.'
  },
  blackhole: {
    emoji: '🕳️',
    name: '블랙홀 조각',
    desc: '이 조각을 먹으면 같은 가로줄·세로줄 전체가 통째로 사라져요.'
  },
  linked: {
    emoji: '🔗',
    name: '연결 조각',
    desc: '서로 연결된 두 조각 중 하나가 사라지면, 다른 하나도 보드 어디에 있든 같이 사라져요.'
  },
  regrowth: {
    emoji: '🌱',
    name: '재생 조각',
    desc: '사라진 뒤 몇 턴이 지나면 같은 자리에 다시 생겨나요.'
  },
  rangeLimited: {
    emoji: '📏',
    name: '사정거리 조각',
    desc: '이 조각을 기준으로 고르면, 정해진 칸 수까지만 사라지고 나머지는 그대로 남아요.'
  }
};

export const NO_MODIFIERS: ModifierFlags = {
  doublePoison: false,
  ice: false,
  bomb: false,
  blackhole: false,
  linked: false,
  regrowth: false,
  rangeLimited: false
};

export interface BoardConfig {
  rows: number;
  cols: number;
  shape: Shape;
  isTutorial: boolean;
  modifiers: ModifierFlags;
}

export interface BoardState {
  rows: number;
  cols: number;
  tiles: Tile[][];
  turnCount: number;
  isTutorial: boolean;
}

export interface Pos {
  r: number;
  c: number;
}

export interface MoveResult {
  atePoison: boolean;
  removed: Pos[];
  cracked: Pos[];
  regrewIn: Pos[];
}
