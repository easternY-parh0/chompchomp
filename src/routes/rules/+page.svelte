<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { scale, fade } from 'svelte/transition';
  import { SvelteSet } from 'svelte/reactivity';
  import { resolve } from '$app/paths';

  type Team = 'A' | 'B';
  type Cell = { r: number; c: number };

  // ============ 1. 메인 인터랙티브 보드 (샌드박스) ============
  const ROWS = 4;
  const COLS = 6;
  const rowIndices = Array.from({ length: ROWS }, (_, i) => i);
  const colIndices = Array.from({ length: COLS }, (_, i) => i);

  const TEAM: Record<Team, { label: string; emoji: string; color: string }> = {
    A: { label: '밀크 초코 팀', emoji: '🟫', color: '#ffb703' },
    B: { label: '화이트 초코 팀', emoji: '⬜', color: '#eae2b7' }
  };

  function freshBoard(): boolean[][] {
    return Array.from({ length: ROWS }, () => Array.from({ length: COLS }, () => true));
  }

  let board = $state<boolean[][]>(freshBoard());
  let turn = $state<Team>('A');
  let hoverTarget = $state<Cell | null>(null);
  let gameOver = $state(false);
  let loser = $state<Team | null>(null);
  let moveCount = $state(0);

  let previewSet = $derived.by(() =>
    hoverTarget ? computePreview(hoverTarget.r, hoverTarget.c, ROWS, COLS, board) : new SvelteSet<string>()
  );

  function computePreview(r: number, c: number, maxR: number, maxC: number, currentBoard: boolean[][]): SvelteSet<string> {
    const set = new SvelteSet<string>();
    for (let rr = 0; rr < maxR; rr++) {
      for (let cc = 0; cc < maxC; cc++) {
        if (rr >= r && cc >= c && currentBoard[rr][cc]) set.add(rr + '-' + cc);
      }
    }
    return set;
  }

  function onCellMouseEnter(r: number, c: number) {
    if (gameOver || !board[r][c]) {
      hoverTarget = null;
      return;
    }
    hoverTarget = { r, c };
  }

  function onCellMouseLeave() {
    hoverTarget = null;
  }

  function handleCellClick(r: number, c: number) {
    if (gameOver || !board[r][c]) return;
    const atePoison = r === 0 && c === 0;

    for (let rr = 0; rr < ROWS; rr++) {
      for (let cc = 0; cc < COLS; cc++) {
        if (rr >= r && cc >= c && board[rr][cc]) board[rr][cc] = false;
      }
    }
    moveCount += 1;

    if (atePoison) {
      gameOver = true;
      loser = turn;
      hoverTarget = null;
      return;
    }
    turn = turn === 'A' ? 'B' : 'A';
    hoverTarget = null;
  }

  function resetGame() {
    board = freshBoard();
    turn = 'A';
    hoverTarget = null;
    gameOver = false;
    loser = null;
    moveCount = 0;
  }

  // ============ 2. 규칙 설명용 슬라이드 애니메이션 보드 ============
  const rules = [
    {
      id: 1,
      desc: "n행 m열의 초콜릿 판에서 게임이 시작됩니다. 맨 왼쪽 위 조각에는 치명적인 독약이 발려 있습니다.",
      visual: "setup"
    },
    {
      id: 2,
      desc: "자신의 차례가 되면 현재 남은 초콜릿 중 먹고 싶은 조각을 하나 선택합니다. 선택한 조각을 기준으로 우측과 아래에 있는 모든 초콜릿 조각이 한 번에 베어 물어지며 사라집니다.",
      visual: "select"
    },
    {
      id: 3,
      desc: "차례가 번갈아 진행되면서 보드 위의 초콜릿 영역은 점차 줄어들게 됩니다. 서로 번갈아 조각을 지우며 결국 마지막 한 조각이 남을 때까지 영역이 좁혀집니다.",
      visual: "loop"
    },
    {
      id: 4,
      desc: "결국 마지막에 남은 독약 조각을 강제로 선택하여 먹게 되는 플레이어가 최종적으로 패배합니다.",
      visual: "lose"
    }
  ];

  let currentSlide = $state(0);

  const MINI_ROWS = 3;
  const MINI_COLS = 4;
  const miniRowIndices = Array.from({ length: MINI_ROWS }, (_, i) => i);
  const miniColIndices = Array.from({ length: MINI_COLS }, (_, i) => i);

  // ⚡ 속도를 제어하는 가변 타이머 상수 설정
  const BASE_SPEED = 600;       // 일반적인 단계 전환 속도 (빠르게 진행)
  const RESET_DELAY = 2200;     // 애니메이션 전체 동작 후 리셋 직전의 긴 정지 시간

  let miniBoard = $state<boolean[][]>(
    Array.from({ length: MINI_ROWS }, () => Array.from({ length: MINI_COLS }, () => true))
  );
  
  let miniHoverTarget = $state<Cell | null>(null);
  let isLoseState = $state(false);
  let miniTimer: ReturnType<typeof setTimeout> | null = null;
  let miniCycleStep = 0;

  let miniPreviewSet = $derived.by(() =>
    miniHoverTarget ? computePreview(miniHoverTarget.r, miniHoverTarget.c, MINI_ROWS, MINI_COLS, miniBoard) : new SvelteSet<string>()
  );

  // 모든 칸을 가득 채우는 헬퍼
  function fillMiniBoard(val: boolean) {
    return Array.from({ length: MINI_ROWS }, () => Array.from({ length: MINI_COLS }, () => val));
  }

  // 특정 좌표 기준 우하단 제거 헬퍼
  function biteMiniBoard(r: number, c: number) {
    for (let rr = 0; rr < MINI_ROWS; rr++) {
      for (let cc = 0; cc < MINI_COLS; cc++) {
        if (rr >= r && cc >= c) miniBoard[rr][cc] = false;
      }
    }
  }

  function updateMiniVisual() {
    const currentVisual = rules[currentSlide].visual;
    
    miniHoverTarget = null;
    isLoseState = false;

    let isLastStep = false; // 현재 루프의 최종 결과물인지 체크하기 위한 스위치

    if (currentVisual === 'setup') {
      miniBoard = fillMiniBoard(true);
      isLastStep = true; // 1번 슬라이드는 상태가 고정되어 있으므로 매 틱이 종료 상태와 같습니다.
    } 
    else if (currentVisual === 'select') {
      const subStep = miniCycleStep % 3;
      if (subStep === 0) {
        miniBoard = fillMiniBoard(true);
      } else if (subStep === 1) {
        miniHoverTarget = { r: 1, c: 2 }; // 먹을 영역 미리보기
      } else {
        miniBoard = fillMiniBoard(true);
        biteMiniBoard(1, 2); // 먹기 완료
        isLastStep = true;   // ⚡ 결과물이 모두 나타난 상태
      }
    } 
    else if (currentVisual === 'loop') {
      const subStep = miniCycleStep % 7;
      
      if (subStep === 0) {
        miniBoard = fillMiniBoard(true);
        biteMiniBoard(1, 2);
      } else if (subStep === 1) {
        miniHoverTarget = { r: 2, c: 0 };
      } else if (subStep === 2) {
        biteMiniBoard(2, 0);
      } else if (subStep === 3) {
        miniHoverTarget = { r: 0, c: 1 };
      } else if (subStep === 4) {
        biteMiniBoard(0, 1);
      } else if (subStep === 5) {
        miniHoverTarget = { r: 1, c: 0 };
      } else {
        biteMiniBoard(1, 0); // 결국 (0, 0)과 (0, 1)만 남게 됨
        isLastStep = true;   // ⚡ 루프 사이클 마지막 단계
      }
    } 
    else if (currentVisual === 'lose') {
      const subStep = miniCycleStep % 2;
      if (subStep === 0) {
        miniBoard = fillMiniBoard(false);
        miniBoard[0][0] = true;
      } else {
        miniBoard[0][0] = false;
        isLoseState = true; 
        isLastStep = true;   // ⚡ 패배 오버레이가 올라온 최종 시점
      }
    }

    // ⚡ 마지막 단계 플래그에 따라 다음 타이머 대기 시간을 가변 결정
    const nextDelay = isLastStep ? RESET_DELAY : BASE_SPEED;

    miniTimer = setTimeout(() => {
      miniCycleStep += 1;
      updateMiniVisual();
    }, nextDelay);
  }

  // 타이머 작동 연쇄를 구동시키는 헬퍼
  function startMiniTimer() {
    stopMiniTimer();
    updateMiniVisual();
  }

  // 기존 타이머를 안정적으로 해제하는 헬퍼
  function stopMiniTimer() {
    if (miniTimer) {
      clearTimeout(miniTimer);
      miniTimer = null;
    }
  }

  function handleSlideChange(newSlideIndex: number) {
    stopMiniTimer();
    currentSlide = newSlideIndex;
    miniCycleStep = 0;
    startMiniTimer();
  }

  onMount(() => {
    startMiniTimer();
  });

  onDestroy(() => {
    stopMiniTimer();
  });

  function nextSlide() {
    const target = (currentSlide + 1) % rules.length;
    handleSlideChange(target);
  }

  function prevSlide() {
    const target = (currentSlide - 1 + rules.length) % rules.length;
    handleSlideChange(target);
  }
</script>

<svelte:head>
  <title>촘프(CHOMP) 게임 규칙</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link
    href="https://fonts.googleapis.com/css2?family=Do+Hyeon&family=Noto+Sans+KR:wght@400;500;700;900&display=swap"
    rel="stylesheet"
  />
</svelte:head>

<div class="page">
  <header class="hero">
    <p class="eyebrow">세종과학고등학교 수학체험전 · CHOMP</p>
    <h1 class="shiny-title">🍫 달콤살벌 초콜릿 사수 작전!</h1>
    <p class="hero-sub">
      마지막에 <strong>독약이 발린 조각</strong>을 먹는 사람이 지는 턴제 수학 게임, <br>
      촘프의 규칙을 알아봅시다!
    </p>
  </header>

  <section class="story" aria-labelledby="story-title">
    <h2 id="story-title">게임 규칙 ({currentSlide + 1} / {rules.length})</h2>

    <div class="story-grid">
      <div class="slide-container">
        <div class="slide-content">
          <span class="step-num">{rules[currentSlide].id}</span>
          <p class="slide-desc">{rules[currentSlide].desc}</p>
        </div>
        <div class="slide-nav">
          <button class="nav-btn" onclick={prevSlide} aria-label="이전 규칙">◀ 이전</button>
          <div class="dots">
            {#each rules as rule, i (rule.id)}
              <button 
                class="dot" 
                class:active={i === currentSlide} 
                onclick={() => handleSlideChange(i)} 
                aria-label={`${rule.id}번 규칙 보기`}
              ></button>
            {/each}
          </div>
          <button class="nav-btn" onclick={nextSlide} aria-label="다음 규칙">다음 ▶</button>
        </div>
      </div>

      <div class="mini-demo" class:lose-active={isLoseState} aria-hidden="true">
        <p class="mini-caption">플레이 애니메이션 예시</p>
        <div class="mini-board-wrapper">
          <div class="mini-board" style="--mini-cols:{MINI_COLS}">
            {#each miniRowIndices as r (r)}
              {#each miniColIndices as c (c)}
                <div
                  class="mini-cell"
                  class:poison={r === 0 && c === 0}
                  class:preview={miniBoard[r][c] && miniPreviewSet.has(r + '-' + c)}
                >
                  {#if miniBoard[r][c]}
                    <span class="mini-piece" transition:scale={{ duration: 250 }}>
                      {r === 0 && c === 0 ? '☠️' : '🍫'}
                    </span>
                  {/if}
                </div>
              {/each}
            {/each}
          </div>
          {#if isLoseState}
            <div class="lose-overlay" transition:fade={{ duration: 200 }}>
              <span class="lose-x">❌</span>
              <p class="lose-alert">독약 섭취! 패배</p>
            </div>
          {/if}
        </div>
      </div>
    </div>
  </section>

  <section class="controls" aria-labelledby="controls-title">
    <h2 id="controls-title">간편한 조작 방법 🖱️</h2>
    <div class="control-cards">
      <div class="control-card">
        <span class="control-icon">👆</span>
        <strong>초콜릿 조각 클릭하기</strong>
        <p>먹고 싶은 초콜릿 조각 위에 마우스를 올리면 먹힐 영역이 미리 보이고, 클릭하는 순간 조각들이 우적우적 사라집니다!</p>
      </div>
    </div>
  </section>

  <section class="playground" aria-labelledby="playground-title">
    <h2 id="playground-title">직접 먹어보세요! 🍫</h2>
    <p class="playground-sub">친구와 함께 자리에 앉아 순서대로 패드를 터치하거나 마우스로 클릭하며 연습해 보세요.</p>

    <div class="turn-indicator">
      <span class="turn-dot" style="background:{TEAM[turn].color}"></span>
      {#if !gameOver}
        <span class="turn-text">지금은 <strong>{TEAM[turn].emoji} {TEAM[turn].label}</strong> 차례예요!</span>
      {:else}
        <span class="turn-text-ended">게임이 끝났어요!</span>
      {/if}
      <button class="reset-btn" onclick={() => resetGame()}>🔄 다시하기</button>
    </div>

    <div
      class="board"
      style="--rows:{ROWS}; --cols:{COLS}"
      role="region"
      aria-label="촘프 게임 보드"
      onmouseleave={() => onCellMouseLeave()}
    >
      {#each rowIndices as r (r)}
        {#each colIndices as c (c)}
          <button
            type="button"
            class="cell"
            class:poison={r === 0 && c === 0}
            class:preview={board[r][c] && previewSet.has(r + '-' + c)}
            disabled={!board[r][c] || gameOver}
            aria-label={r === 0 && c === 0 ? '독약 조각' : `초콜릿 조각 ${r + 1}행 ${c + 1}열`}
            onmouseenter={() => onCellMouseEnter(r, c)}
            onclick={() => handleCellClick(r, c)}
          >
            {#if board[r][c]}
              <span class="piece" transition:scale={{ duration: 220 }}>
                {r === 0 && c === 0 ? '☠️' : '🍫'}
              </span>
            {/if}
          </button>
        {/each}
      {/each}

      {#if gameOver && loser}
        <div class="overlay" transition:fade={{ duration: 200 }}>
          <div class="overlay-card">
            <p class="overlay-emoji">😱</p>
            <p class="overlay-text">
              <strong>{TEAM[loser].emoji} {TEAM[loser].label}</strong>이(가)<br>
              독약 조각을 먹고 말았어요!
            </p>
            <p class="overlay-winner">
              🎉 {TEAM[loser === 'A' ? 'B' : 'A'].label} 승리! 🎉
            </p>
            <button class="reset-btn big" onclick={() => resetGame()}>다시 대결하기</button>
          </div>
        </div>
      {/if}
    </div>

    <p class="move-count">지금까지 총 {moveCount}번 베어 물었습니다.</p>
  </section>

  <footer class="cta">
    <p>규칙을 완벽하게 마스터하셨나요? 이제 랭킹 매치로 이동하세요!</p>
    <a class="cta-btn" href={resolve('/play')}>실전 게임 시작하기 →</a>
  </footer>
</div>

<style>
  :global(body) {
    margin: 0;
    background-color: #2b1810;
  }

  .page {
    --color-bg: #3d2314;
    --color-ink: #fff6e9;
    --color-choco: #6b4226;
    --color-choco-dark: #4a2c1a;
    --color-choco-light: #8c5a3c;
    --color-poison: #9d0208;
    --color-milk: #f3e9dc;
    --color-gold: #ffb703;
    --color-cream: #2b1810;
    --color-card-bg: #52321c;

    background: var(--color-bg);
    color: var(--color-ink);
    font-family: 'Noto Sans KR', system-ui, sans-serif;
    padding: 2rem 1.25rem 4rem;
    max-width: 920px;
    margin: 0 auto;
    box-sizing: border-box;
  }

  h1, h2 {
    font-family: 'Do Hyeon', 'Noto Sans KR', sans-serif;
    font-weight: 400;
    color: var(--color-gold);
    margin: 0;
  }

  .hero {
    text-align: center;
    padding: 2.5rem 1rem 2rem;
  }

  .eyebrow {
    letter-spacing: 0.08em;
    font-weight: 700;
    font-size: 0.9rem;
    color: var(--color-gold);
    text-transform: uppercase;
    margin: 0 0 0.6rem;
  }

  .shiny-title {
    font-size: clamp(2.2rem, 6vw, 3.2rem);
    text-shadow: 2px 2px 0px var(--color-choco-dark);
    margin-bottom: 0.75rem;
    color: #fff;
    position: relative;
    display: inline-block;
    overflow: hidden;
    padding: 0 10px;
  }

  .shiny-title::after {
    content: '';
    position: absolute;
    top: 0;
    left: -150%;
    width: 50%;
    height: 100%;
    background: linear-gradient(
      to right,
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0.4) 50%,
      rgba(255, 255, 255, 0) 100%
    );
    transform: skewX(-25deg);
    animation: shine 4s infinite ease-in-out;
  }

  @keyframes shine {
    0% { left: -150%; }
    20% { left: 150%; }
    100% { left: 150%; }
  }

  .hero-sub {
    font-size: 1.1rem;
    line-height: 1.6;
    max-width: 50ch;
    margin: 0 auto;
    color: var(--color-milk);
  }

  section {
    background: var(--color-card-bg);
    border-radius: 24px;
    padding: 2rem 1.5rem;
    margin-top: 2rem;
    box-shadow: 0 8px 0 rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 246, 233, 0.1);
  }

  section h2 {
    font-size: 1.6rem;
    margin-bottom: 1.25rem;
    border-bottom: 2px dashed rgba(255, 183, 3, 0.3);
    padding-bottom: 0.5rem;
  }

  .story-grid {
    display: grid;
    grid-template-columns: 1.3fr 1fr;
    gap: 1.5rem;
    align-items: center;
  }

  .slide-container {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-height: 200px;
    background: rgba(0, 0, 0, 0.15);
    padding: 1.5rem;
    border-radius: 18px;
    border: 1px solid rgba(255, 255, 255, 0.05);
  }

  .slide-content {
    display: flex;
    gap: 1rem;
    align-items: flex-start;
  }

  .slide-desc {
    margin: 0;
    font-size: 1.05rem;
    line-height: 1.7;
    color: var(--color-milk);
  }

  .slide-nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 1.5rem;
  }

  .nav-btn {
    border: none;
    background: var(--color-choco);
    color: var(--color-ink);
    padding: 0.5rem 1rem;
    border-radius: 8px;
    cursor: pointer;
    font-family: 'Do Hyeon', sans-serif;
    font-size: 0.95rem;
    box-shadow: 0 3px 0 var(--color-choco-dark);
    transition: background 0.2s;
  }

  .nav-btn:hover {
    background: var(--color-choco-light);
  }

  .nav-btn:active {
    transform: translateY(2px);
    box-shadow: 0 1px 0 var(--color-choco-dark);
  }

  .dots {
    display: flex;
    gap: 0.5rem;
  }

  .dot {
    border: none;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.2);
    cursor: pointer;
    padding: 0;
    transition: background 0.2s, transform 0.2s;
  }

  .dot.active {
    background: var(--color-gold);
    transform: scale(1.2);
  }

  .step-num {
    flex-shrink: 0;
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
    background: var(--color-gold);
    color: var(--color-choco-dark);
    display: grid;
    place-items: center;
    font-weight: 700;
    font-family: 'Do Hyeon', sans-serif;
  }

  .mini-demo {
    background: var(--color-cream);
    border-radius: 18px;
    padding: 1.2rem;
    text-align: center;
    border: 2px solid var(--color-choco-dark);
    transition: background-color 0.3s ease, border-color 0.3s ease;
  }

  .mini-demo.lose-active {
    background-color: rgba(157, 2, 8, 0.25);
    border-color: var(--color-poison);
  }

  .mini-caption {
    font-size: 0.85rem;
    color: var(--color-gold);
    margin: 0 0 0.75rem;
    font-weight: 500;
  }

  .mini-board-wrapper {
    position: relative;
    max-width: 240px;
    margin: 0 auto;
  }

  .mini-board {
    display: grid;
    grid-template-columns: repeat(var(--mini-cols), 1fr);
    gap: 6px;
  }

  .mini-cell {
    aspect-ratio: 1;
    background: var(--color-choco-dark);
    border-radius: 8px;
    display: grid;
    place-items: center;
    font-size: 1.2rem;
  }

  .mini-cell.preview {
    background: rgba(255, 183, 3, 0.25);
    outline: 2px dashed var(--color-gold);
    outline-offset: -2px;
  }

  .mini-cell.poison {
    background: rgba(157, 2, 8, 0.4);
    border: 1px dashed var(--color-poison);
  }

  .lose-overlay {
    position: absolute;
    inset: 0;
    background: rgba(157, 2, 8, 0.6);
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 5;
    border: 2px solid var(--color-poison);
  }

  .lose-x {
    font-size: 3rem;
    filter: drop-shadow(0 0 10px rgba(0,0,0,0.5));
    animation: pulse 0.5s infinite alternate;
  }

  .lose-alert {
    margin: 0.25rem 0 0;
    font-family: 'Do Hyeon', sans-serif;
    color: #fff;
    font-size: 1.1rem;
    text-shadow: 1px 1px 4px rgba(0,0,0,0.8);
  }

  @keyframes pulse {
    from { transform: scale(0.9); }
    to { transform: scale(1.1); }
  }

  .control-cards {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .control-card {
    background: var(--color-cream);
    border-radius: 16px;
    padding: 1.5rem;
    text-align: center;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    border: 1px solid var(--color-choco-dark);
  }

  .control-icon {
    font-size: 2.2rem;
  }

  .control-card strong {
    font-size: 1.1rem;
    color: var(--color-gold);
  }

  .control-card p {
    margin: 0;
    font-size: 0.95rem;
    color: var(--color-milk);
    line-height: 1.6;
  }

  .playground-sub {
    color: var(--color-milk);
    margin: -0.5rem 0 1.5rem;
    font-size: 0.95rem;
  }

  .turn-indicator {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
    background: var(--color-cream);
    padding: 0.75rem 1.25rem;
    border-radius: 14px;
    border: 1px solid var(--color-choco-dark);
  }

  .turn-dot {
    width: 1rem;
    height: 1rem;
    border-radius: 50%;
    display: inline-block;
    box-shadow: 0 0 8px rgba(255, 183, 3, 0.6);
  }

  .turn-text {
    font-size: 1rem;
    color: #fff;
  }
  
  .turn-text strong {
    color: var(--color-gold);
  }

  .turn-text-ended {
    font-size: 1rem;
    color: #ff4d6d;
    font-weight: bold;
  }

  .board {
    position: relative;
    display: grid;
    grid-template-columns: repeat(var(--cols), 1fr);
    gap: 10px;
    user-select: none;
  }

  .cell {
    aspect-ratio: 1;
    border: none;
    border-radius: 12px;
    background: var(--color-choco);
    box-shadow: inset -4px -4px 0px rgba(0,0,0,0.4), inset 4px 4px 0px rgba(255,255,255,0.1);
    display: grid;
    place-items: center;
    font-size: clamp(1.4rem, 5vw, 2.2rem);
    cursor: pointer;
    padding: 0;
    transition: background 0.1s, transform 0.1s;
  }

  .cell:disabled {
    cursor: default;
    background: transparent;
    box-shadow: none;
  }

  .cell:not(:disabled):hover {
    transform: scale(1.02);
    background: var(--color-choco-light);
  }

  .cell.preview {
    background: rgba(255, 183, 3, 0.45) !important;
    outline: 3px dashed var(--color-gold);
    outline-offset: -3px;
  }

  .cell.poison {
    background: var(--color-poison);
  }

  .overlay {
    position: absolute;
    inset: -10px;
    background: rgba(0, 0, 0, 0.75);
    border-radius: 20px;
    display: grid;
    place-items: center;
    z-index: 10;
  }

  .overlay-card {
    background: var(--color-card-bg);
    border: 2px solid var(--color-gold);
    border-radius: 24px;
    padding: 2rem;
    text-align: center;
    max-width: 280px;
    box-shadow: 0 12px 30px rgba(0,0,0,0.6);
  }

  .overlay-emoji {
    font-size: 3rem;
    margin: 0 0 0.5rem;
  }

  .overlay-text {
    margin: 0 0 1rem;
    line-height: 1.6;
    color: var(--color-milk);
    font-size: 1rem;
  }
  
  .overlay-text strong {
    color: var(--color-gold);
  }

  .overlay-winner {
    font-family: 'Do Hyeon', sans-serif;
    color: #fff;
    background: rgba(255, 183, 3, 0.2);
    padding: 0.5rem;
    border-radius: 8px;
    font-size: 1.2rem;
    margin: 0 0 1.5rem;
    border: 1px dashed var(--color-gold);
  }

  .reset-btn {
    margin-left: auto;
    border: none;
    background: var(--color-gold);
    color: var(--color-choco-dark);
    padding: 0.6rem 1.2rem;
    border-radius: 999px;
    font-family: 'Do Hyeon', sans-serif;
    font-size: 0.95rem;
    cursor: pointer;
    font-weight: bold;
    box-shadow: 0 4px 0 #cc9200;
  }

  .reset-btn:active {
    transform: translateY(2px);
    box-shadow: 0 2px 0 #cc9200;
  }

  .reset-btn.big {
    margin: 0 auto;
    padding: 0.75rem 1.75rem;
    font-size: 1.05rem;
    display: block;
  }

  .move-count {
    text-align: center;
    font-size: 0.9rem;
    color: var(--color-gold);
    margin: 1.5rem 0 0;
    font-weight: 500;
  }

  .cta {
    text-align: center;
    margin-top: 2.5rem;
    padding: 1rem;
  }

  .cta p {
    color: var(--color-milk);
  }

  .cta-btn {
    display: inline-block;
    margin-top: 0.75rem;
    background: var(--color-gold);
    color: var(--color-choco-dark);
    text-decoration: none;
    font-weight: 700;
    padding: 0.9rem 2.2rem;
    border-radius: 999px;
    font-family: 'Do Hyeon', sans-serif;
    font-size: 1.1rem;
    box-shadow: 0 6px 0 #cc9200;
  }

  .cta-btn:hover {
    filter: brightness(1.05);
  }

  .cta-btn:active {
    transform: translateY(3px);
  }

  @media (max-width: 560px) {
    .story-grid {
      grid-template-columns: 1fr;
    }
  }
</style>