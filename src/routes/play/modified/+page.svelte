<script lang="ts">
  import { fade, scale } from 'svelte/transition';
  import { onMount } from 'svelte';
  import { SvelteSet } from 'svelte/reactivity';
  import { resolve } from '$app/paths';
  import type { BoardState, Pos, Quadrant, Shape, ModifierFlags } from '$lib/types';
  import { ALL_MODIFIER_KEYS, MODIFIER_INFO, NO_MODIFIERS } from '$lib/types';
  import { createBoard, commitMove, pickRandom, advanceRound } from '$lib/engine';
  import { chooseAiMove } from '$lib/ai';
  import { requestModifiedMove, warmupModels, MODIFIED_MODELS } from '$lib/aiBrowser';
  import ChompBoard from '$lib/components/ChompBoard.svelte';

  type Phase = 'playing' | 'ai-thinking' | 'life-lost' | 'modifier-draft' | 'game-over';

  const SHAPES: Shape[] = ['rect', 'circle', 'heart', 'star'];

  let lives = $state(3);
  let boardsCleared = $state(0);
  let activeModifiers = new SvelteSet<keyof ModifierFlags>();
  let phase = $state<Phase>('playing');
  let message = $state('');
  let draftOptions = $state<(keyof ModifierFlags)[]>([]);
  let lastAiRemoved = $state<Pos[]>([]);
  let lastAiMove = $state<{ anchor: Pos; quadrant: Quadrant } | null>(null);
  
  // 💡 본게임 돌입 폭죽 이펙트 트리거용 상태 추가
  let isCelebration = $state(false); 

  let board = $state<BoardState>(
    createBoard({ rows: 2, cols: 4, shape: 'rect', isTutorial: true, modifiers: NO_MODIFIERS })
  );

  let currentTier = $derived(boardsCleared + 1);
  let isTutorialTier = $derived(currentTier <= 3);
  let isAiTurn = $derived(phase === 'ai-thinking');
  const lifeSlots = [0, 1, 2];

  const AI_LEVEL_NAMES = ['매우 쉬움', '쉬움', '보통', '어려움'];
  const AI_LEVELS = MODIFIED_MODELS.map((m, i) => ({
    value: i,
    label: `${AI_LEVEL_NAMES[i] ?? `레벨${i}`} (${m.ckpt} model, T=${m.temp.toFixed(1)})`
  }));
  let aiDifficulty = $state(2);

  function modifierFlagsFromActive(active: Set<keyof ModifierFlags>): ModifierFlags {
    return {
      doublePoison: active.has('doublePoison'),
      ice: active.has('ice'),
      bomb: active.has('bomb'),
      blackhole: active.has('blackhole'),
      linked: active.has('linked'),
      regrowth: active.has('regrowth')
    };
  }

  const TUTORIAL_SIZES: Record<number, { rows: number; cols: number }> = {
    1: { rows: 2, cols: 4 },
    2: { rows: 4, cols: 4 },
    3: { rows: 4, cols: 6 }
  };

  function boardSizeForTier(tier: number): { rows: number; cols: number } {
    if (tier <= 3) return TUTORIAL_SIZES[tier] ?? TUTORIAL_SIZES[1];
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
    lastAiMove = null;

    // 💡 4번째 판(본게임) 진입 시 폭죽 타이머 가동
    if (tier === 4) {
      isCelebration = true;
      message = `✨ 본 게임 시작! 변형 모드에 돌입합니다! ✨`;
      setTimeout(() => {
        isCelebration = false;
      }, 3000); 
    } else {
      message = tutorial ? `튜토리얼 ${tier} / 3` : `${tier}번째 판`;
    }

    phase = 'playing';
  }

  onMount(() => {
    startNewBoard(1);
    warmupModels();
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

    phase = 'ai-thinking';
    message = 'AI가 생각 중...';
    setTimeout(runAiTurn, 500 + Math.random() * 500);
  }

  async function runAiTurn() {
    let move;
    try {
      move = await requestModifiedMove(board, boardsCleared, activeModifiers, aiDifficulty);
    } catch (e) {
      console.warn('ONNX AI 실패 — 로컬 휴리스틱 폴백', e);
      move = chooseAiMove(board, boardsCleared);
    }
    lastAiMove = move;
    const result = commitMove(board, move.anchor, move.quadrant);
    lastAiRemoved = result.removed;

    if (result.atePoison) {
      handleBoardCleared();
      return;
    }

    advanceRound(board);

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
    href="https://fonts.googleapis.com/css2?family=Do+Hyeon&family=Noto+Sans+KR:wght@500;700;900&display=swap"
    rel="stylesheet"
  />
</svelte:head>

<div class="game-wrapper">
  <p class="sr-only" role="status" aria-live="polite">{message}</p>

  <header class="game-header-bar">
    <a class="exit-btn" href={resolve("/play")}>← 나가기</a>
    <div class="center-status">
      <span class="course-tag">{isTutorialTier ? '튜토리얼 코스' : '변형 모드'}</span>
      <h1 class="stage-indicator">
        {#if isTutorialTier}
          STAGE 0{currentTier} <span class="size-spec">(연습)</span>
        {:else}
          {currentTier}번째 판
        {/if}
      </h1>
    </div>
    <div class="turn-badge" class:ai-active={isAiTurn}>
      {isAiTurn ? 'AI 생각중...' : '당신의 턴'}
    </div>
  </header>

  <div class="stat-row">
    <label class="ai-level">
      <span class="ai-level-label">AI 난이도</span>
      <select bind:value={aiDifficulty} aria-label="AI 난이도 선택">
        {#each AI_LEVELS as lv (lv.value)}
          <option value={lv.value}>{lv.label}</option>
        {/each}
      </select>
    </label>
    <div class="lives" aria-label="남은 목숨">
      {#each lifeSlots as i (i)}
        <span class="heart">{i < lives ? '❤️' : '🖤'}</span>
      {/each}
    </div>
    <div class="cleared-count">클리어 {boardsCleared}판</div>
  </div>

  {#if activeModifiers.size > 0}
    <div class="modifier-bar">
      {#each Array.from(activeModifiers) as key (key)}
        <span class="modifier-chip" title={MODIFIER_INFO[key].desc}>
          {MODIFIER_INFO[key].emoji} {MODIFIER_INFO[key].name}
        </span>
      {/each}
    </div>
  {/if}

  <main class="board-container">
    <ChompBoard
      {board}
      disabled={phase !== 'playing'}
      lastRemoved={lastAiRemoved}
      aiMove={lastAiMove}
      onMove={handleHumanMove}
    />
  </main>

  <footer class="bottom-guide-hint">
    <p class="hint-text">
      💡 <b>규칙 리마인더:</b> 고른 조각 기준 <b>선택한 방향</b>의 조각이 전부 사라져요. 좌측 위
      해골 독약 조각(☠️)을 상대가 먹게 만들면 승리!
    </p>
  </footer>

  {#if phase === 'life-lost'}
    <div class="modal-overlay" transition:fade>
      <div class="modal-window glass-panel" transition:scale={{ duration: 300, start: 0.95 }}>
        <h2 class="result-title fail">독약 섭취 😢</h2>
        <p class="result-body">앗! 독약을 먹어버렸어요.<br />남은 목숨: {lives}</p>
        <button class="action-modal-btn retry" onclick={retryAfterLifeLost}>다시 도전하기</button>
      </div>
    </div>
  {/if}

  {#if phase === 'modifier-draft'}
    <div class="modal-overlay" transition:fade>
      <div class="modal-window glass-panel wide" transition:scale={{ duration: 300, start: 0.95 }}>
        <h2 class="result-title success">STAGE CLEAR! 🎉</h2>
        <p class="result-body">다음 판에 적용할 변형을 하나 골라보세요</p>
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
    <div class="modal-overlay" transition:fade>
      <div class="modal-window final-glass-panel" transition:scale={{ duration: 400 }}>
        <div class="trophy-space">{boardsCleared >= 10 ? '🏆' : '😵'}</div>
        <h2 class="result-title final">런 종료!</h2>
        <p class="result-body">
          총 <b>{boardsCleared}판</b> 클리어<br />
          {rankTitle(boardsCleared)}
        </p>
        <button class="action-modal-btn finish" onclick={restartRun}>다시 시작하기</button>
      </div>
    </div>
  {/if}

  {#if isCelebration}
    <div class="celebration-overlay" transition:fade={{ duration: 400 }}>
      <div class="celebration-text" transition:scale={{ duration: 600, start: 0.6 }}>
        <span class="sub-title">TUTORIAL COMPLETE</span>
        <h2>본 게임 서막 개시! ⚔️</h2>
        <p>지금부터 변형 모드가 완벽히 적용됩니다!</p>
      </div>
      
      <div class="confetti-container">
        {#each Array(40) as _, i}
          <div 
            class="confetti" 
            style="
              --delay: {Math.random() * 0.6}s; 
              --x: {Math.random() * 100}vw; 
              --color: {['#ffb703', '#4ade80', '#f87171', '#38bdf8'][i % 4]};
              --duration: {2.0 + Math.random() * 1.5}s;
            "
          ></div>
        {/each}
      </div>
    </div>
  {/if}
</div>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    background-color: #1a0f0a;
    color: #fff6e9;
    font-family: 'Noto Sans KR', sans-serif;
  }

  .game-wrapper {
    min-height: 100dvh;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.25rem;
    box-sizing: border-box;
    padding: 1.5rem 1rem 2.5rem;
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
  }

  .game-header-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    width: 100%;
    max-width: 780px;
    background: rgba(82, 50, 28, 0.25);
    border: 1px solid rgba(255, 246, 233, 0.08);
    padding: 1rem 1.5rem;
    border-radius: 12px;
    backdrop-filter: blur(8px);
    box-sizing: border-box;
  }

  .exit-btn {
    color: rgba(255, 246, 233, 0.6);
    text-decoration: none;
    font-size: 0.9rem;
    transition: color 0.2s;
    white-space: nowrap;
  }
  .exit-btn:hover {
    color: #ffb703;
  }

  .center-status {
    text-align: center;
  }
  .course-tag {
    font-size: 0.75rem;
    color: #ffb703;
    font-weight: 700;
    letter-spacing: 1px;
  }
  .stage-indicator {
    font-family: 'Do Hyeon', sans-serif;
    font-size: 1.4rem;
    margin: 0;
    color: #fff;
  }
  .size-spec {
    font-size: 1rem;
    opacity: 0.6;
  }

  .turn-badge {
    background: #ffb703;
    color: #1a0f0a;
    font-weight: 900;
    padding: 0.5rem 1.1rem;
    border-radius: 20px;
    font-size: 0.85rem;
    white-space: nowrap;
    box-shadow: 0 4px 10px rgba(255, 183, 3, 0.2);
    transition: all 0.3s ease;
  }
  .turn-badge.ai-active {
    background: #52321c;
    color: #ffb703;
    box-shadow: none;
  }

  .stat-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.75rem 1.25rem;
  }

  .ai-level {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    flex: 1 1 100%;
    margin-right: auto;
  }
  .ai-level-label {
    font-size: 0.75rem;
    color: rgba(255, 246, 233, 0.6);
    font-weight: 700;
    letter-spacing: 0.5px;
    white-space: nowrap;
  }
  .ai-level select {
    font-family: 'Noto Sans KR', sans-serif;
    font-size: 0.8rem;
    color: #1a0f0a;
    background: #ffb703;
    border: none;
    border-radius: 8px;
    padding: 0.35rem 0.6rem;
    cursor: pointer;
    box-shadow: 0 3px 8px rgba(255, 183, 3, 0.2);
    max-width: 13rem;
  }
  .ai-level select:focus-visible {
    outline: 2px solid #fff6e9;
    outline-offset: 2px;
  }

  .lives {
    display: flex;
    gap: 0.2rem;
    font-size: 1.4rem;
  }

  .cleared-count {
    font-family: 'Do Hyeon', sans-serif;
    font-size: 1.05rem;
    color: #ffb703;
  }

  .modifier-bar {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    justify-content: center;
    max-width: 780px;
  }

  .modifier-chip {
    background: rgba(255, 246, 233, 0.08);
    border: 1px solid rgba(255, 246, 233, 0.15);
    border-radius: 999px;
    padding: 0.25rem 0.7rem;
    font-size: 0.78rem;
    color: #fff6e9;
  }

  .board-container {
    width: 100%;
    display: flex;
    justify-content: center;
    padding: 0.5rem 0;
  }

  .bottom-guide-hint {
    text-align: center;
    background: rgba(0, 0, 0, 0.2);
    padding: 0.8rem 1.5rem;
    border-radius: 8px;
    max-width: 700px;
    box-sizing: border-box;
  }
  .hint-text {
    margin: 0;
    font-size: 0.85rem;
    color: #fff6e9;
    opacity: 0.75;
    line-height: 1.5;
  }

  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.65);
    backdrop-filter: blur(6px);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 100;
    padding: 1rem;
    box-sizing: border-box;
  }

  .glass-panel {
    background: rgba(43, 24, 16, 0.85);
    border: 1px solid rgba(255, 246, 233, 0.15);
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
  }

  .final-glass-panel {
    background: rgba(26, 15, 10, 0.9);
    border: 2px solid #ffb703;
    box-shadow: 0 30px 60px rgba(255, 183, 3, 0.15);
  }

  .modal-window {
    width: 100%;
    max-width: 420px;
    border-radius: 20px;
    padding: 2.25rem 2rem;
    text-align: center;
    box-sizing: border-box;
  }

  .modal-window.wide {
    max-width: 560px;
  }

  .result-title {
    font-family: 'Do Hyeon', sans-serif;
    font-size: 1.9rem;
    margin: 0 0 1rem;
  }
  .result-title.success {
    color: #4ade80;
  }
  .result-title.fail {
    color: #f87171;
  }
  .result-title.final {
    color: #ffb703;
  }

  .result-body {
    font-size: 1rem;
    line-height: 1.6;
    color: #fff6e9;
    opacity: 0.85;
    margin: 0 0 1.75rem;
  }

  .trophy-space {
    font-size: 3.5rem;
    margin-bottom: 0.5rem;
  }

  .action-modal-btn {
    display: inline-block;
    width: 100%;
    box-sizing: border-box;
    font-family: 'Do Hyeon', sans-serif;
    font-size: 1.1rem;
    padding: 0.75rem 2rem;
    border-radius: 8px;
    cursor: pointer;
    text-decoration: none;
    border: none;
    transition: background 0.2s;
  }

  .action-modal-btn.retry {
    background: #ffb703;
    color: #1a0f0a;
  }
  .action-modal-btn.retry:hover {
    background: #e0a100;
  }

  .action-modal-btn.finish {
    background: #ffb703;
    color: #1a0f0a;
  }
  .action-modal-btn.finish:hover {
    background: #e0a100;
  }

  .draft-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 0.75rem;
  }

  .draft-card {
    background: rgba(255, 246, 233, 0.05);
    border: 1px solid rgba(255, 246, 233, 0.15);
    border-radius: 14px;
    padding: 1rem 0.75rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.35rem;
    cursor: pointer;
    text-align: center;
    font-family: 'Noto Sans KR', sans-serif;
    color: #fff6e9;
  }

  .draft-card:hover,
  .draft-card:focus-visible {
    background: rgba(255, 183, 3, 0.15);
    border-color: #ffb703;
    outline: none;
  }

  .draft-emoji {
    font-size: 1.7rem;
  }

  .draft-name {
    font-family: 'Do Hyeon', sans-serif;
    font-size: 1rem;
    color: #ffb703;
  }

  .draft-desc {
    font-size: 0.75rem;
    opacity: 0.75;
    line-height: 1.4;
  }

  /* 💡 본게임 돌입 오버레이 스타일 추가 */
  .celebration-overlay {
    position: fixed;
    inset: 0;
    z-index: 150;
    background: rgba(26, 15, 10, 0.88);
    backdrop-filter: blur(5px);
    display: flex;
    justify-content: center;
    align-items: center;
    pointer-events: none;
  }

  .celebration-text {
    text-align: center;
    z-index: 152;
  }

  .celebration-text .sub-title {
    font-size: 0.9rem;
    color: #ffb703;
    font-weight: 900;
    letter-spacing: 4px;
    display: block;
    margin-bottom: 0.5rem;
    animation: textPulse 0.8s infinite alternate ease-in-out;
  }

  .celebration-text h2 {
    font-family: 'Do Hyeon', sans-serif;
    font-size: 3.2rem;
    margin: 0;
    color: #fff;
    text-shadow: 0 0 25px rgba(255, 183, 3, 0.7);
  }

  .celebration-text p {
    font-size: 1.15rem;
    color: rgba(255, 246, 233, 0.8);
    margin: 0.75rem 0 0 0;
  }

  .confetti-container {
    position: absolute;
    inset: 0;
    overflow: hidden;
    z-index: 151;
  }

  .confetti {
    position: absolute;
    top: -30px;
    left: var(--x);
    width: 8px;
    height: 22px;
    background-color: var(--color);
    border-radius: 3px;
    opacity: 0;
    animation: confettiFall var(--duration) linear infinite;
    animation-delay: var(--delay);
  }

  @keyframes confettiFall {
    0% {
      transform: translateY(0) rotate(0deg);
      opacity: 1;
    }
    100% {
      transform: translateY(105vh) rotate(540deg);
      opacity: 0;
    }
  }

  @keyframes textPulse {
    0% { transform: scale(1); }
    100% { transform: scale(1.06); }
  }

  @media (max-width: 640px) {
    .game-header-bar {
      flex-wrap: wrap;
      justify-content: center;
      text-align: center;
    }
    .stage-indicator {
      font-size: 1.2rem;
    }
    .celebration-text h2 {
      font-size: 2.2rem;
    }
    .celebration-text p {
      font-size: 1rem;
    }
  }
</style>