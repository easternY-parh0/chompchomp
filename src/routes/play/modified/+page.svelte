<script lang="ts">
  import { onMount } from 'svelte';
  import { SvelteSet } from 'svelte/reactivity';
  import type { BoardState, Pos, Quadrant, Shape, ModifierFlags } from '$lib/types';
  import { ALL_MODIFIER_KEYS, MODIFIER_INFO, NO_MODIFIERS } from '$lib/types';
  import { createBoard, commitMove, remainingNonPoisonCount, pickRandom } from '$lib/engine';
  import { chooseAiMove } from '$lib/ai';
  import ChompBoard from '$lib/components/ChompBoard.svelte';

  type Phase = 'playing' | 'ai-thinking' | 'life-lost' | 'modifier-draft' | 'game-over';

  const SHAPES: Shape[] = ['rect', 'circle', 'heart', 'star'];

  let lives = $state(3);
  let boardsCleared = $state(0);
  let activeModifiers = $state<SvelteSet<keyof ModifierFlags>>(new SvelteSet());
  let phase = $state<Phase>('playing');
  let message = $state('');
  let draftOptions = $state<(keyof ModifierFlags)[]>([]);
  let lastAiRemoved = $state<Pos[]>([]);

  let board = $state<BoardState>(
    createBoard({ rows: 4, cols: 6, shape: 'rect', isTutorial: true, modifiers: NO_MODIFIERS })
  );

  let currentTier = $derived(boardsCleared + 1);
  let isTutorialTier = $derived(currentTier <= 3);
  const lifeSlots = [0, 1, 2];

  function modifierFlagsFromActive(active: Set<keyof ModifierFlags>): ModifierFlags {
    return {
      doublePoison: active.has('doublePoison'),
      ice: active.has('ice'),
      bomb: active.has('bomb'),
      blackhole: active.has('blackhole'),
      linked: active.has('linked'),
      regrowth: active.has('regrowth'),
      rangeLimited: active.has('rangeLimited')
    };
  }

  function boardSizeForTier(tier: number): { rows: number; cols: number } {
    if (tier <= 3) return { rows: 4, cols: 6 };
    const step = Math.floor((tier - 4) / 2);
    return { rows: Math.min(4 + step, 9), cols: Math.min(6 + step, 10) };
  }

  function startNewBoard(tier: number) {
    const tutorial = tier <= 3;
    const { rows, cols } = boardSizeForTier(tier);
    const shape: Shape = tutorial ? 'rect' : (SHAPES[Math.floor(Math.random() * SHAPES.length)] ?? 'rect');
    const modifiers = tutorial ? NO_MODIFIERS : modifierFlagsFromActive(activeModifiers);

    board = createBoard({ rows, cols, shape, isTutorial: tutorial, modifiers });
    lastAiRemoved = [];
    message = tutorial ? `튜토리얼 ${tier} / 3` : `${tier}번째 판`;
    phase = 'playing';
  }

  onMount(() => {
    startNewBoard(1);
  });

  function handleHumanMove(anchor: Pos, quadrant: Quadrant) {
    if (phase !== 'playing') return;

    const result = commitMove(board, anchor, quadrant);

    if (result.atePoison) {
      lives -= 1;
      message = '앗! 독약을 먹어버렸어요.';
      phase = lives <= 0 ? 'game-over' : 'life-lost';
      return;
    }

    if (remainingNonPoisonCount(board) === 0) {
      handleBoardCleared();
      return;
    }

    phase = 'ai-thinking';
    message = 'AI가 생각 중...';
    setTimeout(runAiTurn, 500 + Math.random() * 500);
  }

  function runAiTurn() {
    const move = chooseAiMove(board, boardsCleared);
    const result = commitMove(board, move.anchor, move.quadrant);
    lastAiRemoved = result.removed;

    if (result.atePoison) {
      handleBoardCleared();
      return;
    }

    if (remainingNonPoisonCount(board) === 0) {
      lives -= 1;
      message = '독약만 남아서 어쩔 수 없이 목숨을 잃었어요.';
      phase = lives <= 0 ? 'game-over' : 'life-lost';
      return;
    }

    phase = 'playing';
    message = isTutorialTier ? `튜토리얼 ${currentTier} / 3` : `${currentTier}번째 판`;
  }

  function handleBoardCleared() {
    boardsCleared += 1;
    const nextTier = boardsCleared + 1;
    const available = ALL_MODIFIER_KEYS.filter((k) => !activeModifiers.has(k));

    if (nextTier >= 4 && available.length > 0) {
      draftOptions = pickRandom(available, Math.min(3, available.length));
      phase = 'modifier-draft';
      message = '보드 클리어! 새 변형을 골라보세요.';
    } else {
      startNewBoard(nextTier);
    }
  }

  function pickModifier(key: keyof ModifierFlags) {
    activeModifiers.add(key);
    startNewBoard(boardsCleared + 1);
  }

  function retryAfterLifeLost() {
    startNewBoard(boardsCleared + 1);
  }

  function restartRun() {
    lives = 3;
    boardsCleared = 0;
    activeModifiers.clear();
    startNewBoard(1);
  }

  function rankTitle(cleared: number): string {
    if (cleared >= 15) return '전설의 초코드래곤 🐉';
    if (cleared >= 10) return '촘프 마스터 👑';
    if (cleared >= 6) return '초콜릿 장인 🎓';
    if (cleared >= 3) return '초콜릿 견습생 🍫';
    return '초콜릿 새싹 🌱';
  }
</script>

<svelte:head>
  <title>변형 모드 · 촘프</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link
    href="https://fonts.googleapis.com/css2?family=Do+Hyeon&family=Noto+Sans+KR:wght@400;500;700;900&display=swap"
    rel="stylesheet"
  />
</svelte:head>

<div class="page">
  <header class="topbar">
    <a class="back-link" href="/play">← 모드 선택</a>
    <div class="lives" aria-label="남은 목숨">
      {#each lifeSlots as i (i)}
        <span class="heart">{i < lives ? '❤️' : '🖤'}</span>
      {/each}
    </div>
    <div class="cleared-count">클리어 {boardsCleared}판</div>
  </header>

  {#if activeModifiers.size > 0}
    <div class="modifier-bar">
      {#each Array.from(activeModifiers) as key (key)}
        <span class="modifier-chip" title={MODIFIER_INFO[key].desc}>
          {MODIFIER_INFO[key].emoji} {MODIFIER_INFO[key].name}
        </span>
      {/each}
    </div>
  {/if}

  <p class="status-line">{message}</p>

  <div class="board-wrap">
    <ChompBoard
      {board}
      disabled={phase !== 'playing'}
      lastRemoved={lastAiRemoved}
      onMove={handleHumanMove}
    />

    {#if phase === 'ai-thinking'}
      <div class="overlay soft">
        <p class="overlay-text">🤖 AI가 수를 고르는 중...</p>
      </div>
    {/if}

    {#if phase === 'life-lost'}
      <div class="overlay">
        <div class="overlay-card">
          <p class="overlay-emoji">💥</p>
          <p class="overlay-text">목숨을 하나 잃었어요!</p>
          <p class="overlay-sub">남은 목숨: {lives}</p>
          <button class="primary-btn" onclick={retryAfterLifeLost}>다시 도전하기</button>
        </div>
      </div>
    {/if}

    {#if phase === 'modifier-draft'}
      <div class="overlay">
        <div class="overlay-card wide">
          <p class="overlay-text">보드 클리어! 다음 판에 적용할 변형을 골라보세요</p>
          <div class="draft-grid">
            {#each draftOptions as key (key)}
              <button class="draft-card" onclick={() => pickModifier(key)}>
                <span class="draft-emoji">{MODIFIER_INFO[key].emoji}</span>
                <span class="draft-name">{MODIFIER_INFO[key].name}</span>
                <span class="draft-desc">{MODIFIER_INFO[key].desc}</span>
              </button>
            {/each}
          </div>
        </div>
      </div>
    {/if}

    {#if phase === 'game-over'}
      <div class="overlay">
        <div class="overlay-card">
          <p class="overlay-emoji">😵</p>
          <p class="overlay-text">런 종료!</p>
          <p class="overlay-sub">
            총 <strong>{boardsCleared}판</strong> 클리어<br />
            {rankTitle(boardsCleared)}
          </p>
          <button class="primary-btn" onclick={restartRun}>다시 시작하기</button>
        </div>
      </div>
    {/if}
  </div>
</div>

<style>
  .page {
    --color-bg: #e8f3fa;
    --color-ink: #2b1810;
    --color-choco: #6b4226;
    --color-choco-dark: #4a2c1a;
    --color-poison: #e63946;
    --color-mint: #3aafa9;
    --color-sun: #ffb627;
    --color-cream: #fff6e9;

    background: var(--color-bg);
    color: var(--color-ink);
    font-family: 'Noto Sans KR', system-ui, sans-serif;
    min-height: 100dvh;
    padding: 1.5rem 1rem 3rem;
    box-sizing: border-box;
  }

  .topbar {
    display: flex;
    align-items: center;
    gap: 1rem;
    max-width: 780px;
    margin: 0 auto 1rem;
    flex-wrap: wrap;
  }

  .back-link {
    color: var(--color-choco);
    text-decoration: none;
    font-weight: 700;
    font-size: 0.9rem;
  }

  .lives {
    margin-left: auto;
    display: flex;
    gap: 0.2rem;
    font-size: 1.6rem;
  }

  .cleared-count {
    font-family: 'Do Hyeon', 'Noto Sans KR', sans-serif;
    color: var(--color-choco-dark);
    font-size: 1.2rem;
  }

  .modifier-bar {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    justify-content: center;
    max-width: 780px;
    margin: 0 auto 0.75rem;
  }

  .modifier-chip {
    background: var(--color-cream);
    border: 1px solid var(--color-choco);
    border-radius: 999px;
    padding: 0.25rem 0.7rem;
    font-size: 0.8rem;
    color: var(--color-choco-dark);
  }

  .status-line {
    text-align: center;
    font-family: 'Do Hyeon', 'Noto Sans KR', sans-serif;
    color: var(--color-choco-dark);
    font-size: 1.4rem;
    margin: 0 0 1.5rem;
  }

  .board-wrap {
    position: relative;
    max-width: 780px;
    margin: 0 auto;
    background: var(--color-cream);
    border-radius: 28px;
    padding: 2rem 1.5rem;
    box-shadow: 0 8px 0 rgba(74, 44, 26, 0.12);
  }

  .overlay {
    position: absolute;
    inset: -0.5rem;
    background: rgba(43, 24, 16, 0.6);
    border-radius: 20px;
    display: grid;
    place-items: center;
    padding: 1rem;
  }

  .overlay.soft {
    background: rgba(43, 24, 16, 0.25);
  }

  .overlay-card {
    background: var(--color-cream);
    border-radius: 20px;
    padding: 1.75rem 2rem;
    text-align: center;
    max-width: 320px;
  }

  .overlay-card.wide {
    max-width: 560px;
  }

  .overlay-emoji {
    font-size: 2.5rem;
    margin: 0 0 0.5rem;
  }

  .overlay-text {
    font-family: 'Do Hyeon', 'Noto Sans KR', sans-serif;
    font-size: 1.1rem;
    color: var(--color-choco-dark);
    margin: 0 0 0.5rem;
    line-height: 1.5;
  }

  .overlay-sub {
    margin: 0 0 1rem;
    font-size: 0.95rem;
    line-height: 1.5;
  }

  .primary-btn {
    border: none;
    background: var(--color-mint);
    color: white;
    font-family: 'Do Hyeon', 'Noto Sans KR', sans-serif;
    font-size: 1rem;
    padding: 0.65rem 1.4rem;
    border-radius: 999px;
    cursor: pointer;
  }

  .draft-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 0.75rem;
    margin-top: 0.5rem;
  }

  .draft-card {
    background: white;
    border: 2px solid var(--color-choco);
    border-radius: 16px;
    padding: 1rem 0.75rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.35rem;
    cursor: pointer;
    text-align: center;
    font-family: 'Noto Sans KR', sans-serif;
  }

  .draft-card:hover,
  .draft-card:focus-visible {
    background: var(--color-cream);
    outline: 2px solid var(--color-sun);
  }

  .draft-emoji {
    font-size: 1.8rem;
  }

  .draft-name {
    font-family: 'Do Hyeon', 'Noto Sans KR', sans-serif;
    font-size: 1rem;
    color: var(--color-choco-dark);
  }

  .draft-desc {
    font-size: 0.78rem;
    color: var(--color-choco);
    line-height: 1.4;
  }
</style>