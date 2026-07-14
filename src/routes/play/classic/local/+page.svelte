<script lang="ts">
  import { fade, scale } from 'svelte/transition';
  import { resolve } from '$app/paths';

  // 원래 촘프(Chomp) 규격: 좌측 상단 (0,0)이 독약, 고른 조각 기준 우측·아래 영역이 한꺼번에 사라진다.
  // AI 없이 같은 기기에서 두 사람이 턴을 번갈아 두는 로컬 대전 모드.

  interface SizePreset {
    rows: number;
    cols: number;
    label: string;
    tag: string;
  }

  const SIZE_PRESETS: SizePreset[] = [
    { rows: 3, cols: 4, label: '3 × 4', tag: '쉬움' },
    { rows: 4, cols: 6, label: '4 × 6', tag: '보통' },
    { rows: 5, cols: 7, label: '5 × 7', tag: '어려움' },
    { rows: 6, cols: 9, label: '6 × 9', tag: '풀사이즈' }
  ];

  type Phase = 'setup' | 'playing';

  let phase = $state<Phase>('setup');
  let rows = $state(4);
  let cols = $state(6);
  let grid = $state<boolean[][]>([]);
  let currentPlayer = $state<1 | 2>(1);
  let gameOver = $state(false);
  let winner = $state<1 | 2 | null>(null);
  let moveCount = $state(0);

  function startGame(preset: SizePreset) {
    rows = preset.rows;
    cols = preset.cols;
    grid = Array.from({ length: rows }, () => Array(cols).fill(true));
    currentPlayer = 1;
    gameOver = false;
    winner = null;
    moveCount = 0;
    phase = 'playing';
  }

  function backToSetup() {
    phase = 'setup';
  }

  function chomp(row: number, col: number) {
    if (gameOver || !grid[row][col]) return;

    if (row === 0 && col === 0) {
      grid[0][0] = false;
      gameOver = true;
      // 독약을 먹은 사람이 진다 -> 상대가 승리
      winner = currentPlayer === 1 ? 2 : 1;
      return;
    }

    for (let r = row; r < rows; r++) {
      for (let c = col; c < cols; c++) {
        grid[r][c] = false;
      }
    }
    moveCount += 1;

    let onlyPoisonLeft = true;
    for (let r = 0; r < rows && onlyPoisonLeft; r++) {
      for (let c = 0; c < cols; c++) {
        if (r === 0 && c === 0) continue;
        if (grid[r][c]) {
          onlyPoisonLeft = false;
          break;
        }
      }
    }

    if (onlyPoisonLeft) {
      // 독약만 남았다 -> 다음 차례인 상대가 강제로 독약을 먹어야 하므로 지금 둔 사람이 승리
      gameOver = true;
      winner = currentPlayer;
      return;
    }

    currentPlayer = currentPlayer === 1 ? 2 : 1;
  }
</script>

<svelte:head>
  <title>2인 로컬 대전 · CHOMP</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Do+Hyeon&family=Noto+Sans+KR:wght@500;700;900&display=swap" rel="stylesheet" />
</svelte:head>

<div class="game-wrapper">
  {#if phase === 'setup'}
    <div class="setup-screen" transition:fade={{ duration: 200 }}>
      <a class="exit-btn" href={resolve('/play/classic')}>← 코스 선택으로</a>
      <h1 class="setup-title">🍫 2인 로컬 대전</h1>
      <p class="setup-sub">AI 없이, 같은 기기에서 친구와 번갈아 두세요. 좌측 상단 독약 조각(☠️)을 상대에게 먹이면 승리!</p>

      <div class="preset-grid">
        {#each SIZE_PRESETS as preset (preset.label)}
          <button class="preset-card" onclick={() => startGame(preset)}>
            <span class="preset-tag">{preset.tag}</span>
            <span class="preset-size">{preset.label}</span>
          </button>
        {/each}
      </div>
    </div>
  {:else}
    <header class="game-header-bar">
      <button class="exit-btn as-button" onclick={backToSetup}>← 판 크기 다시 고르기</button>
      <div class="center-status">
        <span class="course-tag">2인 로컬 대전</span>
        <h1 class="stage-indicator">{rows} × {cols}</h1>
      </div>
      <div class="turn-badge" class:player-two={currentPlayer === 2}>
        플레이어 {currentPlayer} 차례
      </div>
    </header>

    <main class="board-container">
      {#if grid.length > 0}
        <div
          class="chocolate-board"
          style:grid-template-rows="repeat({rows}, 1fr)"
          style:grid-template-columns="repeat({cols}, 1fr)"
        >
          {#each grid as row, rIdx}
            {#each row as isPresent, cIdx}
              <button
                class="choco-piece"
                class:is-poison={rIdx === 0 && cIdx === 0}
                class:eaten={!isPresent}
                disabled={!isPresent || gameOver}
                onclick={() => chomp(rIdx, cIdx)}
                aria-label="{rIdx}행 {cIdx}열 초콜릿 조각"
              >
                {#if isPresent}
                  <div class="piece-inner">
                    {#if rIdx === 0 && cIdx === 0}
                      <span class="poison-skull">☠️</span>
                    {:else}
                      <span class="deco-indent"></span>
                    {/if}
                  </div>
                {/if}
              </button>
            {/each}
          {/each}
        </div>
      {/if}
    </main>

    <p class="move-count">지금까지 총 {moveCount}번 베어 물었습니다.</p>

    <footer class="bottom-guide-hint">
      <p class="hint-text">💡 <b>규칙 리마인더:</b> 선택한 조각의 <b>오른쪽 아래 영역</b>이 한꺼번에 잘려 나갑니다. 좌측 상단의 해골 독약 조각(☠️)을 상대가 먹게 만드는 쪽이 승리합니다!</p>
    </footer>

    {#if gameOver}
      <div class="modal-overlay" transition:fade>
        <div class="modal-window glass-panel" transition:scale={{ duration: 300, start: 0.95 }}>
          <h2 class="result-title success">🎉 플레이어 {winner} 승리!</h2>
          <p class="result-body">
            플레이어 {winner === 1 ? 2 : 1}이(가) 독약 조각을 먹고 말았습니다.
          </p>
          <div class="modal-btn-group">
            <a class="action-modal-btn exit" href={resolve('/play/classic')}>코스 선택으로</a>
            <button class="action-modal-btn retry" onclick={backToSetup}>판 크기 다시 고르기</button>
          </div>
        </div>
      </div>
    {/if}
  {/if}
</div>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    background-color: #1a0f0a;
    color: #fff6e9;
    font-family: 'Noto Sans KR', sans-serif;
    user-select: none;
  }

  .game-wrapper {
    width: 100vw;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    box-sizing: border-box;
    padding: 2rem;
    position: relative;
  }

  /* ── 판 크기 선택 화면 ── */
  .setup-screen {
    max-width: 640px;
    margin: 4rem auto;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
  }

  .setup-title {
    font-family: 'Do Hyeon', sans-serif;
    font-size: 2.2rem;
    margin: 1rem 0 0.25rem;
    color: #fff;
  }

  .setup-sub {
    font-size: 1rem;
    line-height: 1.6;
    color: #fff6e9;
    opacity: 0.8;
    margin: 0 0 1.5rem;
  }

  .preset-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
    width: 100%;
  }

  .preset-card {
    background: rgba(82, 50, 28, 0.35);
    border: 1px solid rgba(255, 246, 233, 0.15);
    border-radius: 16px;
    padding: 1.5rem 1rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.4rem;
    cursor: pointer;
    color: #fff6e9;
    transition: transform 0.15s, background 0.15s, border-color 0.15s;
  }

  .preset-card:hover {
    background: rgba(255, 183, 3, 0.15);
    border-color: #ffb703;
    transform: translateY(-3px);
  }

  .preset-tag {
    font-size: 0.75rem;
    color: #ffb703;
    font-weight: 700;
    letter-spacing: 0.5px;
  }

  .preset-size {
    font-family: 'Do Hyeon', sans-serif;
    font-size: 1.5rem;
    color: #fff;
  }

  /* ── 상단 헤더바 ── */
  .game-header-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: rgba(82, 50, 28, 0.25);
    border: 1px solid rgba(255, 246, 233, 0.08);
    padding: 1rem 2rem;
    border-radius: 12px;
    backdrop-filter: blur(8px);
  }

  .exit-btn {
    color: rgba(255, 246, 233, 0.6);
    text-decoration: none;
    font-size: 0.95rem;
    transition: color 0.2s;
    background: none;
    border: none;
    font-family: inherit;
    cursor: pointer;
  }

  .exit-btn:hover {
    color: #ffb703;
  }

  .exit-btn.as-button {
    padding: 0;
  }

  .center-status {
    text-align: center;
  }

  .course-tag {
    font-size: 0.8rem;
    color: #ffb703;
    font-weight: 700;
    letter-spacing: 1px;
  }

  .stage-indicator {
    font-family: 'Do Hyeon', sans-serif;
    font-size: 1.8rem;
    margin: 0;
    color: #fff;
  }

  .turn-badge {
    background: #ffb703;
    color: #2b1810;
    font-weight: 900;
    padding: 0.5rem 1.2rem;
    border-radius: 20px;
    font-size: 0.9rem;
    box-shadow: 0 4px 10px rgba(255, 183, 3, 0.2);
    transition: all 0.3s ease;
  }

  .turn-badge.player-two {
    background: #52321c;
    color: #ffb703;
    box-shadow: none;
  }

  /* ── 보드 ── */
  .board-container {
    flex-grow: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 2rem;
  }

  .chocolate-board {
    display: grid;
    gap: 10px;
    padding: 18px;
    border-radius: 16px;
    background: #3d2314;
    box-shadow: 0 30px 60px rgba(0, 0, 0, 0.6), inset 0 0 20px rgba(0, 0, 0, 0.4);
    width: 100%;
    max-width: 620px;
    aspect-ratio: 4 / 3;
  }

  .choco-piece {
    background: #7a4c2d;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    padding: 5px;
    box-sizing: border-box;
    box-shadow: 0 6px 0 #54341e, 0 8px 15px rgba(0, 0, 0, 0.4);
    transition: transform 0.1s, box-shadow 0.1s, opacity 0.4s ease-out;
    position: relative;
  }

  .choco-piece:hover:not(:disabled) {
    transform: translateY(-2px);
    filter: brightness(1.1);
  }

  .choco-piece:active:not(:disabled) {
    transform: translateY(4px);
    box-shadow: 0 2px 0 #54341e;
  }

  .choco-piece.is-poison {
    background: #9d3a3a;
    box-shadow: 0 6px 0 #6e2525, 0 8px 15px rgba(0, 0, 0, 0.4);
  }

  .choco-piece.eaten {
    opacity: 0;
    pointer-events: none;
    transform: scale(0.8);
  }

  .piece-inner {
    width: 100%;
    height: 100%;
    border: 2px solid rgba(255, 255, 255, 0.08);
    border-radius: 4px;
    display: flex;
    justify-content: center;
    align-items: center;
    box-sizing: border-box;
    box-shadow: inset 0 4px 8px rgba(0, 0, 0, 0.2);
  }

  .deco-indent {
    width: 40%;
    height: 40%;
    border: 2px solid rgba(0, 0, 0, 0.15);
    border-radius: 2px;
  }

  .poison-skull {
    font-size: 1.8rem;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5));
  }

  .move-count {
    text-align: center;
    font-size: 0.9rem;
    color: #ffb703;
    margin: 0.5rem 0 0;
    font-weight: 500;
  }

  /* ── 하단 가이드 ── */
  .bottom-guide-hint {
    text-align: center;
    background: rgba(0, 0, 0, 0.2);
    padding: 0.8rem 1.5rem;
    border-radius: 8px;
    max-width: 700px;
    margin: 1rem auto 0;
  }

  .hint-text {
    margin: 0;
    font-size: 0.9rem;
    color: #fff6e9;
    opacity: 0.75;
    line-height: 1.5;
  }

  /* ── 모달 ── */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.65);
    backdrop-filter: blur(6px);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 100;
  }

  .glass-panel {
    background: rgba(43, 24, 16, 0.85);
    border: 1px solid rgba(255, 246, 233, 0.15);
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
  }

  .modal-window {
    width: 90%;
    max-width: 460px;
    border-radius: 20px;
    padding: 2.5rem;
    text-align: center;
    box-sizing: border-box;
  }

  .result-title {
    font-family: 'Do Hyeon', sans-serif;
    font-size: 2.2rem;
    margin: 0 0 1rem 0;
  }

  .result-title.success {
    color: #4ade80;
  }

  .result-body {
    font-size: 1.05rem;
    line-height: 1.6;
    color: #fff6e9;
    opacity: 0.85;
    margin: 0 0 2rem 0;
  }

  .action-modal-btn {
    display: inline-block;
    font-family: 'Do Hyeon', sans-serif;
    font-size: 1.2rem;
    padding: 0.8rem 2rem;
    border-radius: 8px;
    cursor: pointer;
    text-decoration: none;
    border: none;
    transition: background 0.2s;
  }

  .modal-btn-group {
    display: flex;
    gap: 1rem;
  }

  .action-modal-btn.exit {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
    flex: 1;
  }

  .action-modal-btn.exit:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  .action-modal-btn.retry {
    background: #ffb703;
    color: #1a0f0a;
    flex: 1;
  }

  .action-modal-btn.retry:hover {
    background: #e0a100;
  }

  @media (max-width: 640px) {
    .game-wrapper { padding: 1rem; }
    .game-header-bar { padding: 0.6rem 1rem; }
    .stage-indicator { font-size: 1.4rem; }
    .chocolate-board { padding: 10px; gap: 6px; }
    .poison-skull { font-size: 1.3rem; }
    .preset-grid { grid-template-columns: 1fr; }
  }
</style>
