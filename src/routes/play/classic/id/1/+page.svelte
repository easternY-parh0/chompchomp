<script lang="ts">
  import { fade, scale, fly } from 'svelte/transition';
  import { resolve } from '$app/paths';
  import { onMount } from 'svelte';

  // 코스 내부의 라운드 데이터 정의
  interface RoundConfig {
    roundNumber: number;
    rows: number;
    cols: number;
    sizeText: string;
  }

  const roundsData: RoundConfig[] = [
    { roundNumber: 1, rows: 2, cols: 3, sizeText: '2 × 3' },
    { roundNumber: 2, rows: 3, cols: 3, sizeText: '3 × 3' },
    { roundNumber: 3, rows: 3, cols: 4, sizeText: '3 × 4' }
  ];

  // 게임 상태 관리를 위한 $state (Svelte 5)
  let currentRoundIdx = $state(0);
  let currentRound = $derived(roundsData[currentRoundIdx]);
  
  // 현재 판의 초콜릿 그리드 상태 (true: 존재함, false: 먹어서 없어짐)
  let grid = $state<boolean[][]>([]);
  let gameOver = $state(false);
  let gameSuccess = $state(false); // 전체 코스 완전 클리어 여부
  let isAiTurn = $state(false);
  let winner = $state<'PLAYER' | 'AI' | null>(null);

  // 현재 라운드가 바뀔 때마다 보드 새로 초기화
  function initBoard() {
    gameOver = false;
    winner = null;
    isAiTurn = false;
    
    const rows = currentRound.rows;
    const cols = currentRound.cols;
    
    // 행렬 초기화 (모든 조각이 살아있는 상태 true)
    grid = Array.from({ length: rows }, () => Array(cols).fill(true));
  }

  // 컴포넌트 마운트 및 라운드 변경 감시 효과
  onMount(() => {
    initBoard();
  });

  // 초콜릿 조각 선택 함수 (Chomp 룰: 클릭한 곳의 우측 하단 영역을 전부 파괴)
  function chomp(row: number, col: number, player: 'PLAYER' | 'AI') {
    if (gameOver || !grid[row][col]) return;
    
    // 독약 조각(0, 0)을 먹었을 경우 해당 턴의 플레이어 패배
    if (row === 0 && col === 0) {
      grid[0][0] = false;
      gameOver = true;
      winner = player === 'PLAYER' ? 'AI' : 'PLAYER';
      return;
    }

    // 선택한 조각 기준 오른쪽 아래 영역 전부 제거
    for (let r = row; r < currentRound.rows; r++) {
      for (let c = col; c < currentRound.cols; c++) {
        grid[r][c] = false;
      }
    }

    // 다음 턴 전환 또는 승패 검사
    checkGameState(player);
  }

  function checkGameState(lastPlayer: 'PLAYER' | 'AI') {
    // 독약 조각(0, 0)만 남았는지 체크
    let onlyPoisonLeft = true;
    for (let r = 0; r < currentRound.rows; r++) {
      for (let c = 0; c < currentRound.cols; c++) {
        if (r === 0 && c === 0) continue;
        if (grid[r]?.[c] === true) {
          onlyPoisonLeft = false;
          break;
        }
      }
    }

    // 다른 조각이 없고 독약만 남았다면 다음 차례인 사람이 무조건 패배하므로 현재 플레이어가 승리
    if (onlyPoisonLeft) {
      gameOver = true;
      winner = lastPlayer;
      return;
    }

    // 턴 교체 및 간단한 AI 행동 유도
    if (lastPlayer === 'PLAYER') {
      isAiTurn = true;
      setTimeout(triggerAiTurn, 800);
    } else {
      isAiTurn = false;
    }
  }

  // 간단한 AI 로직 (남아있는 무작위 조각 중 하나를 선택, 가급적 0,0은 피함)
  function triggerAiTurn() {
    if (gameOver) return;

    let validMoves: {r: number, c: number}[] = [];
    for (let r = 0; r < currentRound.rows; r++) {
      for (let c = 0; c < currentRound.cols; c++) {
        if (r === 0 && c === 0) continue; // 독약은 최후순위
        if (grid[r][c]) validMoves.push({ r, c });
      }
    }

    // 만약 독약밖에 안 남았다면 어쩔 수 없이 0,0을 먹음
    if (validMoves.length === 0 && grid[0][0]) {
      chomp(0, 0, 'AI');
      return;
    }

    // 랜덤 초이스
    const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];
    chomp(randomMove.r, randomMove.c, 'AI');
  }

  // 다음 라운드로 진행 또는 성공 처리
  function handleNextStage() {
    if (currentRoundIdx < roundsData.length - 1) {
      currentRoundIdx += 1;
      initBoard();
    } else {
      gameSuccess = true;
    }
  }
</script>

<svelte:head>
  <title>밀크 가나슈 코스 진행중 · CHOMP</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Do+Hyeon&family=Noto+Sans+KR:wght@500;700;900&display=swap" rel="stylesheet" />
</svelte:head>

<div class="game-wrapper">
  <header class="game-header-bar">
    <a class="exit-btn" href={resolve('/play')}>← 탈출하기</a>
    <div class="center-status">
      <span class="course-tag">밀크 가나슈 코스</span>
      <h1 class="stage-indicator">STAGE 0{currentRound.roundNumber} <span class="size-spec">({currentRound.sizeText})</span></h1>
    </div>
    <div class="turn-badge" class:ai-active={isAiTurn}>
      {isAiTurn ? 'AI 분석중...' : '당신의 턴'}
    </div>
  </header>

  <main class="board-container">
    {#if grid.length > 0}
      <div 
        class="chocolate-board" 
        style:grid-template-rows="repeat({currentRound.rows}, 1fr)"
        style:grid-template-columns="repeat({currentRound.cols}, 1fr)"
      >
        {#each grid as row, rIdx}
          {#each row as isPresent, cIdx}
            <button
              class="choco-piece"
              class:is-poison={rIdx === 0 && cIdx === 0}
              class:eaten={!isPresent}
              disabled={!isPresent || isAiTurn || gameOver}
              onclick={() => chomp(rIdx, cIdx, 'PLAYER')}
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

  <footer class="bottom-guide-hint">
    <p class="hint-text">💡 <b>규칙 리마인더:</b> 선택한 조각의 <b>오른쪽 아래 영역</b>이 한꺼번에 잘려 나갑니다. 좌측 상단의 해골 독약 조각(☠️)을 먹게 만드는 쪽이 승리합니다!</p>
  </footer>

  {#if gameOver && !gameSuccess}
    <div class="modal-overlay" transition:fade>
      <div class="modal-window glass-panel" transition:scale={{ duration: 300, start: 0.95 }}>
        {#if winner === 'PLAYER'}
          <h2 class="result-title success">STAGE CLEAR! 🎉</h2>
          <p class="result-body">훌륭합니다! 완벽한 연산으로 AI를 막다른 길로 몰아넣었습니다.</p>
          <button class="action-modal-btn next" onclick={handleNextStage}>
            {currentRoundIdx === roundsData.length - 1 ? '최종 결과 확인하기 →' : '다음 스테이지 전진 →'}
          </button>
        {:else}
          <h2 class="result-title fail">독약 섭취 (GAME OVER) 😢</h2>
          <p class="result-body">AI의 설계에 말려들어 해골 초콜릿을 삼키고 말았습니다.</p>
          <div class="modal-btn-group">
            <a class="action-modal-btn exit" href={resolve('/play')}>코스 선택으로</a>
            <button class="action-modal-btn retry" onclick={initBoard}>다시 도전</button>
          </div>
        {/if}
      </div>
    </div>
  {/if}

  {#if gameSuccess}
    <div class="modal-overlay" transition:fade>
      <div class="modal-window final-glass-panel" transition:scale={{ duration: 400 }}>
        <div class="trophy-space">🏆</div>
        <h2 class="result-title final">밀크 가나슈 완파!</h2>
        <p class="result-body">3개의 스테이지 시나리오를 연달아 정복하셨습니다.<br>이제 더 높은 차원의 <b>'다크 카카오 코스'</b>에 도전할 자격이 주어졌습니다.</p>
        <a class="action-modal-btn finish" href={resolve('/play/classic')}>코스 선택 화면으로 복귀</a>
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
    user-select: none;
  }

  .game-wrapper {
    width: 100vw;
    height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    box-sizing: border-box;
    padding: 2rem;
    position: relative;
    overflow: hidden;
  }

  /* 상단 헤더바 */
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
  }
  .exit-btn:hover { color: #ffb703; }

  .center-status { text-align: center; }
  .course-tag { font-size: 0.8rem; color: #ffb703; font-weight: 700; letter-spacing: 1px; }
  .stage-indicator { font-family: 'Do Hyeon', sans-serif; font-size: 1.8rem; margin: 0; color: #fff; }
  .size-spec { font-size: 1.2rem; opacity: 0.6; }

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
  .turn-badge.ai-active {
    background: #52321c;
    color: #ffb703;
    box-shadow: none;
  }

  /* ----------------------------------------------------
   * 초콜릿 인터랙티브 보드판 디자인
   * ---------------------------------------------------- */
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
    background: #3d2314;
    padding: 18px;
    border-radius: 16px;
    box-shadow: 0 30px 60px rgba(0,0,0,0.6), inset 0 0 20px rgba(0,0,0,0.4);
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
    box-shadow: 0 6px 0 #54341e, 0 8px 15px rgba(0,0,0,0.4);
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
    box-shadow: 0 6px 0 #6e2525, 0 8px 15px rgba(0,0,0,0.4);
  }

  /* 먹혀서 없어진 그리드 조각 스타일 */
  .choco-piece.eaten {
    opacity: 0;
    pointer-events: none;
    transform: scale(0.8);
  }

  .piece-inner {
    width: 100%;
    height: 100%;
    border: 2px solid rgba(255,255,255,0.08);
    border-radius: 4px;
    display: flex;
    justify-content: center;
    align-items: center;
    box-sizing: border-box;
    box-shadow: inset 0 4px 8px rgba(0,0,0,0.2);
  }

  .deco-indent {
    width: 40%;
    height: 40%;
    border: 2px solid rgba(0,0,0,0.15);
    border-radius: 2px;
  }

  .poison-skull { font-size: 1.8rem; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5)); }

  /* 하단 가이드 팁 */
  .bottom-guide-hint {
    text-align: center;
    background: rgba(0, 0, 0, 0.2);
    padding: 0.8rem 1.5rem;
    border-radius: 8px;
    max-width: 700px;
    margin: 0 auto;
  }
  .hint-text { margin: 0; font-size: 0.9rem; color: #fff6e9; opacity: 0.75; line-height: 1.5; }

  /* ----------------------------------------------------
   * 모달 창 팝업 레이아웃 (Glassmorphism)
   * ---------------------------------------------------- */
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

  .final-glass-panel {
    background: rgba(26, 15, 10, 0.9);
    border: 2px solid #ffb703;
    box-shadow: 0 30px 60px rgba(255, 183, 3, 0.15);
  }

  .modal-window {
    width: 90%;
    max-width: 460px;
    border-radius: 20px;
    padding: 2.5rem;
    text-align: center;
    box-sizing: border-box;
  }

  .result-title { font-family: 'Do Hyeon', sans-serif; font-size: 2.2rem; margin: 0 0 1rem 0; }
  .result-title.success { color: #4ade80; }
  .result-title.fail { color: #f87171; }
  .result-title.final { color: #ffb703; }

  .result-body { font-size: 1.05rem; line-height: 1.6; color: #fff6e9; opacity: 0.85; margin: 0 0 2rem 0; }

  .trophy-space { font-size: 4rem; margin-bottom: 1rem; animation: float 2s infinite ease-in-out; }

  /* 모달 인터랙션 버튼 정의 */
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

  .action-modal-btn.next { background: #4ade80; color: #1a0f0a; width: 100%; box-sizing: border-box; }
  .action-modal-btn.next:hover { background: #22c55e; }

  .modal-btn-group { display: flex; gap: 1rem; }
  .action-modal-btn.exit { background: rgba(255,255,255,0.1); color: #fff; flex: 1; }
  .action-modal-btn.exit:hover { background: rgba(255,255,255,0.2); }
  .action-modal-btn.retry { background: #ffb703; color: #1a0f0a; flex: 1; }
  .action-modal-btn.retry:hover { background: #e0a100; }

  .action-modal-btn.finish { background: #ffb703; color: #1a0f0a; width: 100%; box-sizing: border-box; }

  @keyframes float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }

  @media (max-width: 640px) {
    .game-wrapper { padding: 1rem; }
    .game-header-bar { padding: 0.6rem 1rem; }
    .stage-indicator { font-size: 1.4rem; }
    .chocolate-board { padding: 10px; gap: 6px; }
    .poison-skull { font-size: 1.3rem; }
  }
</style>