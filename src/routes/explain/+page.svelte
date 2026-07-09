<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { scale, fade } from 'svelte/transition';
  import { SvelteSet } from 'svelte/reactivity';
  import { resolve } from '$app/paths';

  type StrategyMode = 'stealing' | 'square' | 'twoRows';
  type Cell = { r: number; c: number };

  // ============ 1. 전략 페이지 상태 관리 ============
  let activeTab = $state<StrategyMode>('stealing');

  // 시각화용 미니 보드 상태
  let rows = $derived(activeTab === 'twoRows' ? 2 : 3);
  let cols = $derived(activeTab === 'twoRows' ? 4 : 3);
  
  let board = $state<boolean[][]>([]);
  let hoverTarget = $state<Cell | null>(null);
  let stepDescription = $state<string>('');
  let animTimer: any = null;
  let animStep = 0;

  // 보드 리셋 헬퍼
  function initBoard(r: number, c: number, fill = true) {
    return Array.from({ length: r }, () => Array.from({ length: c }, () => fill));
  }

  // 우하단 초콜릿 지우기
  function bite(r: number, c: number) {
    for (let rr = 0; rr < board.length; rr++) {
      for (let cc = 0; cc < board[0].length; cc++) {
        if (rr >= r && cc >= c) board[rr][cc] = false;
      }
    }
  }

  // 미리보기 영역 계산
  let previewSet = $derived.by(() => {
    const set = new SvelteSet<string>();
    if (!hoverTarget) return set;
    for (let rr = 0; rr < board.length; rr++) {
      for (let cc = 0; cc < board[0].length; cc++) {
        if (rr >= hoverTarget.r && cc >= hoverTarget.c && board[rr][cc]) {
          set.add(rr + '-' + cc);
        }
      }
    }
    return set;
  });

  // ============ 2. 전략별 자동 애니메이션 스크립트 ============
  function playStrategyAnimation() {
    if (animTimer) clearTimeout(animTimer);
    animStep = 0;
    
    const loop = () => {
      if (activeTab === 'stealing') {
        const sequence = [
          { desc: "가장 오른쪽 아래 조각(우하단 모서리) 딱 한 칸만 떼어먹는 상상을 해봅니다.", move: () => { board = initBoard(3, 3); hoverTarget = { r: 2, c: 2 }; }, delay: 1500 },
          { desc: "툭! 한 칸만 사라졌습니다. 이제 이 상태에서 '후공'이 이기는 완벽한 한 수가 존재한다고 칩시다.", move: () => { hoverTarget = null; bite(2, 2); }, delay: 2000 },
          { desc: "그렇다면 선공은 애초에 첫 수로 그 '후공의 필승 수'를 먼저 두어 가로챌 수 있습니다!", move: () => { board = initBoard(3, 3); hoverTarget = { r: 1, c: 1 }; }, delay: 2000 },
          { desc: "이를 수학에서 '전략 도둑질(Strategy Stealing)'이라 부르며, 선공 필승을 증명하는 강력한 무기입니다.", move: () => { hoverTarget = null; bite(1, 1); }, delay: 2500 }
        ];
        const current = sequence[animStep % sequence.length];
        stepDescription = current.desc;
        current.move();
        animStep++;
        animTimer = setTimeout(loop, current.delay);
      } 
      
      else if (activeTab === 'square') {
        const sequence = [
          { desc: "정사각형 보드판에서는 대칭성을 이용합니다. 첫 수로 독약 바로 우하단인 (1,1)을 저격합니다.", move: () => { board = initBoard(3, 3); hoverTarget = { r: 1, c: 1 }; }, delay: 1800 },
          { desc: "가운데가 뻥 뚫리며 위쪽 줄과 왼쪽 줄이 동일한 길이의 'ㄴ'자 대칭 형태가 됩니다.", move: () => { hoverTarget = null; bite(1, 1); }, delay: 1800 },
          { desc: "만약 상대방이 위쪽 초콜릿을 1칸 갉아먹는다면?", move: () => { hoverTarget = { r: 0, c: 2 }; }, delay: 1500 },
          { desc: "스르륵 사라진 만큼, 우리도 대칭축을 기준으로 반대편 왼쪽 초콜릿을 똑같이 1칸 복사해서 먹어줍니다.", move: () => { hoverTarget = null; bite(0, 2); setTimeout(() => { bite(2, 0); }, 600); }, delay: 2200 },
          { desc: "상대가 어떤 파괴를 하든 대칭으로 완벽하게 복사 대응하면, 결국 선공은 절대로 독약을 먹지 않습니다.", move: () => {}, delay: 2500 }
        ];
        const current = sequence[animStep % sequence.length];
        stepDescription = current.desc;
        current.move();
        animStep++;
        animTimer = setTimeout(loop, current.delay);
      } 
      
      else if (activeTab === 'twoRows') {
        const sequence = [
          { desc: "딱 2줄만 있는 보드에서는 '마법의 길이 공식'이 성립합니다. 목표는 [윗줄 길이 - 아랫줄 길이 = 1] 만들기!", move: () => { board = initBoard(2, 4); hoverTarget = { r: 1, c: 3 }; }, delay: 1800 },
          { desc: "첫 수로 아랫줄 맨 오른쪽 끝을 먹어 윗줄은 4칸, 아랫줄은 3칸으로 만듭니다. (차이는 정확히 1칸)", move: () => { hoverTarget = null; bite(1, 3); }, delay: 2000 },
          { desc: "상대방이 윗줄을 먹어 윗줄이 2칸으로 줄어들면, 공식 균형이 깨집니다. (윗줄 2칸, 아랫줄 3칸)", move: () => { hoverTarget = { r: 0, c: 2 }; }, delay: 1500 },
          { desc: "싹둑! 상대가 줄인 만큼 우리도 아랫줄을 다시 밀어붙여 [윗줄 2칸, 아랫줄 1칸]으로 만듭니다. 차이는 다시 1칸!", move: () => { hoverTarget = null; bite(0, 2); setTimeout(() => { bite(1, 1); }, 600); }, delay: 2500 },
          { desc: "이 규칙을 무한 반복하면 결국 아랫줄은 통째로 전멸하고 윗줄엔 독약 딱 한 칸만 남겨서 승리하게 됩니다.", move: () => {}, delay: 2500 }
        ];
        const current = sequence[animStep % sequence.length];
        stepDescription = current.desc;
        current.move();
        animStep++;
        animTimer = setTimeout(loop, current.delay);
      }
    };
    
    loop();
  }

  function handleTabChange(tab: StrategyMode) {
    activeTab = tab;
    playStrategyAnimation();
  }

  onMount(() => {
    playStrategyAnimation();
  });

  onDestroy(() => {
    if (animTimer) clearTimeout(animTimer);
  });
</script>

<svelte:head>
  <title>촘프 필승 전략의 비밀 · 수학체험전</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Do+Hyeon&family=Noto+Sans+KR:wght@400;500;700;900&display=swap" rel="stylesheet" />
</svelte:head>

<div class="page">
  <header class="hero">
    <p class="eyebrow">세종과학고등학교 수학체험전 · MATHEMATICS</p>
    <h1 class="shiny-title">🧐 초콜릿 판에 숨겨진 선공 필승의 비밀</h1>
    <p class="hero-sub">
      촘프(CHOMP)는 운에 기댄 게임이 아닙니다. 수학적 원리를 알면 <br>
      <strong>첫 번째 플레이어가 무조건 승리하는 비법</strong>이 정해져 있습니다. 그 메커니즘을 파헤쳐 봅시다!
    </p>
  </header>

  <div class="strategy-tabs">
    <button class="tab-btn" class:active={activeTab === 'stealing'} onclick={() => handleTabChange('stealing')}>
      <span class="tab-icon">🥷</span> 전략 도둑질 논증
    </button>
    <button class="tab-btn" class:active={activeTab === 'square'} onclick={() => handleTabChange('square')}>
      <span class="tab-icon">📐</span> 정사각형 보드 필승법
    </button>
    <button class="tab-btn" class:active={activeTab === 'twoRows'} onclick={() => handleTabChange('twoRows')}>
      <span class="tab-icon">📊</span> 2줄 보드 연산 공식
    </button>
  </div>

  <section class="strategy-viewer">
    <div class="viewer-grid">
      
      <div class="theory-side">
        {#if activeTab === 'stealing'}
          <h2>개념 1. 전략 도둑질 (Strategy Stealing Argument)</h2>
          <blockquote>
            "후공에게 승리 경로가 있다면, 선공은 첫 턴에 그 경로를 훔쳐올 수 있다!"
          </blockquote>
          <p class="theory-text">
            수학자 데이비드 게일(David Gale)이 증명한 유서 깊은 이론입니다. 촘프 게임은 무승부가 없고, 판이 유한하며, 정보가 모두 공개된 유한결정게임입니다. 
          </p>
          <p class="theory-text">
            만약 후공에게 필승법이 존재한다고 가정해 봅시다. 선공이 맨 오른쪽 아래 구석탱이 조각 하나($2 \times 2$ 위치)만 떼어먹었을 때, 후공이 어떤 승리의 한 수를 던질 것입니다. 하지만 선공은 애초에 첫 턴에 그 자리를 자신이 먼저 먹어버림으로써 <strong>후공의 승리 전략을 통째로 훔쳐(Steal) 올 수 있습니다.</strong> 따라서 후공의 필승법 존재 가정이 모순이 되어 선공 필승이 확정됩니다.
          </p>
        {:else}
          {#if activeTab === 'square'}
            <h2>개념 2. 대칭성(Symmetry)을 이용한 무한 루프</h2>
            <blockquote>
              "대각선을 접는 선 삼아 완벽한 미러링을 구현하라!"
            </blockquote>
            <p class="theory-text">
              보드판이 $n \times n$ 형태의 정사각형일 때 사용할 수 있는 직관적이고 강력한 실전 필승 권법입니다. 
            </p>
            <p class="theory-text">
              선공은 첫 이동으로 독약 조각의 대각선 바로 아래인 $(1, 1)$ 좌표를 먹어 치웁니다. 이렇게 하면 가로축의 초콜릿 개수와 세로축의 초콜릿 개수가 기하학적으로 완벽히 똑같은 대칭 상태가 됩니다. 이후 후공이 가로축을 파괴하면 우리는 세로축을 똑같은 양만큼 파괴하고, 후공이 세로축을 갉아먹으면 가로축을 똑같이 갉아먹어 <strong>대칭 균형</strong>을 유지합니다. 결국 후공이 마지막 남은 독약을 먹게 만듭니다.
            </p>
          {:else}
            <h2>개념 3. $2 \times n$ 보드판의 대수적 공식</h2>
            <blockquote>
              "황금률: $a - b = 1$ 의 상태를 깨뜨리지 마라!"
            </blockquote>
            <p class="theory-text">
              초콜릿 판이 단 두 줄($2 \times n$)로 이루어져 있다면, 수학적인 길이 방정식을 활용하여 100% 승리를 굳힐 수 있습니다.
            </p>
            <p class="theory-text">
              윗줄의 길이를 $a$, 아랫줄의 길이를 $b$라고 정의해 봅시다. 게임이 시작하자마자 선공은 아랫줄 맨 오른쪽 끝 조각을 먹어 아랫줄의 길이를 윗줄보다 정확히 1칸 짧게 만듭니다($a - b = 1$). 이후 상대방이 윗줄($a$)을 어떻게 건드리든, 내 차례가 왔을 때 아랫줄($b$)의 길이를 조정해 다시 <strong>차이가 정확히 1이 되도록 세팅</strong>해 돌려줍니다. 이 연산 루프에 갇힌 후공은 자멸하게 됩니다.
            </p>
          {/if}
        {/if}
      </div>

      <div class="visual-side">
        <div class="interactive-box">
          <p class="box-caption">🔍 공식 구현 시뮬레이션 애니메이션</p>
          
          <div class="dynamic-board" style="--display-rows:{rows}; --display-cols:{cols}">
            {#if board.length > 0}
              {#each Array.from({ length: rows }) as _, r}
                {#each Array.from({ length: cols }) as _, c}
                  <div 
                    class="simulation-cell"
                    class:poison={r === 0 && c === 0}
                    class:preview={board[r]?.[c] && previewSet.has(r + '-' + c)}
                  >
                    {#if board[r]?.[c]}
                      <span class="simulation-piece" transition:scale={{ duration: 200 }}>
                        {r === 0 && c === 0 ? '☠️' : '🍫'}
                      </span>
                    {/if}
                  </div>
                {/each}
              {/each}
            {/if}
          </div>

          <div class="toast-desc-panel" transition:fade>
            <p class="step-badge">현재 단계 원리</p>
            <p class="live-desc">{stepDescription}</p>
          </div>
        </div>
      </div>

    </div>
  </section>

  <section class="summary-section" aria-labelledby="summary-title">
    <h2 id="summary-title">수학체험전 마스터 가이드 💡</h2>
    <div class="summary-cards">
      <div class="summary-card">
        <h3>⚡ 존재의 증명 vs 방법의 증명</h3>
        <p>
          전략 도둑질 논증은 선공의 필승법이 <strong>"존재한다"</strong>는 사실은 완벽히 알려주지만, 판이 아주 거대해지면 구체적으로 <strong>"어디를 먼저 먹어야 하는지"</strong>는 알려주지 않는 신비로운 비건설적 증명(Non-constructive proof)입니다!
        </p>
      </div>
      <div class="summary-card">
        <h3>🎯 부스에서 백전백승하는 법</h3>
        <p>
          체험전 부스에서 친구들과 대결을 펼칠 때는 판의 크기를 확인하세요! 정사각형이 나오면 무조건 선공을 잡고 <strong style="color:var(--color-gold)">(1,1) 센터 저격</strong> 후 완벽한 거울 대칭 복사를 이어 나가면 절대 지지 않습니다.
        </p>
      </div>
    </div>
  </section>

  <footer class="cta">
    <p>필승 공식의 메커니즘을 눈으로 확인하셨나요? 이제 실전 판에서 연승을 기록해 보세요!</p>
    <a class="cta-btn" href={resolve('/play')}>검증하러 메인 화면 가기 →</a>
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
    max-width: 960px;
    margin: 0 auto;
    box-sizing: border-box;
  }

  h1, h2, h3 {
    font-family: 'Do Hyeon', 'Noto Sans KR', sans-serif;
    font-weight: 400;
    color: var(--color-gold);
    margin: 0;
  }

  .hero {
    text-align: center;
    padding: 2.5rem 1rem 1.5rem;
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
    font-size: clamp(1.8rem, 5vw, 2.8rem);
    text-shadow: 2px 2px 0px var(--color-choco-dark);
    margin-bottom: 0.75rem;
    color: #fff;
    position: relative;
    display: inline-block;
    padding: 0 10px;
  }

  .hero-sub {
    font-size: 1.05rem;
    line-height: 1.6;
    max-width: 60ch;
    margin: 0 auto;
    color: var(--color-milk);
  }

  /* ----------------------------------------------------
   * 탭 메뉴 스타일링
   * ---------------------------------------------------- */
  .strategy-tabs {
    display: flex;
    justify-content: center;
    gap: 0.75rem;
    margin-top: 2rem;
    flex-wrap: wrap;
  }

  .tab-btn {
    border: none;
    background: var(--color-card-bg);
    color: var(--color-milk);
    padding: 0.8rem 1.4rem;
    border-radius: 14px;
    cursor: pointer;
    font-family: 'Do Hyeon', sans-serif;
    font-size: 1.1rem;
    box-shadow: 0 4px 0 var(--color-choco-dark);
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    border: 1px solid rgba(255, 246, 233, 0.05);
  }

  .tab-btn:hover {
    background: var(--color-choco-light);
    color: #fff;
  }

  .tab-btn.active {
    background: var(--color-gold);
    color: var(--color-choco-dark);
    box-shadow: 0 4px 0 #cc9200;
    transform: translateY(-2px);
  }

  .tab-icon {
    font-size: 1.2rem;
  }

  /* ----------------------------------------------------
   * 메인 이론 뷰어 및 시각화 그리드
   * ---------------------------------------------------- */
  .strategy-viewer {
    background: var(--color-card-bg);
    border-radius: 24px;
    padding: 2.5rem 2rem;
    margin-top: 1.5rem;
    box-shadow: 0 8px 0 rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 246, 233, 0.1);
  }

  .viewer-grid {
    display: grid;
    grid-template-columns: 1.2fr 1fr;
    gap: 2.5rem;
    align-items: start;
  }

  .theory-side h2 {
    font-size: 1.6rem;
    margin-bottom: 1rem;
    color: #fff;
  }

  blockquote {
    margin: 0 0 1.25rem 0;
    padding: 0.6rem 1rem;
    background: rgba(0,0,0,0.2);
    border-left: 4px solid var(--color-gold);
    border-radius: 0 8px 8px 0;
    font-style: italic;
    font-size: 1.05rem;
    color: var(--color-gold);
    font-weight: 500;
  }

  .theory-text {
    font-size: 0.98rem;
    line-height: 1.7;
    color: var(--color-milk);
    margin: 0 0 1rem;
    word-break: keep-all;
  }

  /* 오른쪽 시각화 패널 */
  .visual-side {
    width: 100%;
  }

  .interactive-box {
    background: var(--color-cream);
    border-radius: 20px;
    padding: 1.5rem;
    border: 2px solid var(--color-choco-dark);
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .box-caption {
    font-size: 0.85rem;
    color: var(--color-gold);
    margin: 0 0 1.5rem;
    font-weight: 500;
  }

  .dynamic-board {
    display: grid;
    grid-template-columns: repeat(var(--display-cols), 1fr);
    gap: 10px;
    width: 100%;
    max-width: 280px;
    aspect-ratio: var(--display-cols) / var(--display-rows);
    margin-bottom: 1.5rem;
  }

  .simulation-cell {
    aspect-ratio: 1;
    background: var(--color-choco);
    border-radius: 10px;
    display: grid;
    place-items: center;
    font-size: 1.8rem;
    box-shadow: inset -3px -3px 0px rgba(0,0,0,0.3);
    position: relative;
  }

  .simulation-cell.preview {
    background: rgba(255, 183, 3, 0.35);
    outline: 3px dashed var(--color-gold);
    outline-offset: -3px;
  }

  .simulation-cell.poison {
    background: rgba(157, 2, 8, 0.3);
    border: 1px dashed var(--color-poison);
  }

  .toast-desc-panel {
    background: rgba(0, 0, 0, 0.4);
    border-radius: 12px;
    padding: 1rem;
    width: 100%;
    box-sizing: border-box;
    border: 1px solid rgba(255, 255, 255, 0.05);
    min-height: 85px;
  }

  .step-badge {
    font-size: 0.75rem;
    text-transform: uppercase;
    color: var(--color-gold);
    font-weight: 700;
    margin: 0 0 0.25rem 0;
    letter-spacing: 0.05em;
  }

  .live-desc {
    margin: 0;
    font-size: 0.9rem;
    line-height: 1.5;
    color: var(--color-milk);
    word-break: keep-all;
  }

  /* ----------------------------------------------------
   * 하단 요약 카드 영역
   * ---------------------------------------------------- */
  .summary-section {
    background: transparent;
    box-shadow: none;
    border: none;
    padding: 2rem 0 0;
  }

  .summary-section h2 {
    font-size: 1.5rem;
    margin-bottom: 1.25rem;
    border-bottom: 2px dashed rgba(255, 183, 3, 0.2);
    padding-bottom: 0.5rem;
  }

  .summary-cards {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.25rem;
  }

  .summary-card {
    background: var(--color-card-bg);
    border-radius: 18px;
    padding: 1.5rem;
    border: 1px solid rgba(255, 246, 233, 0.08);
    box-shadow: 0 6px 0 rgba(0,0,0,0.2);
  }

  .summary-card h3 {
    font-size: 1.15rem;
    color: #fff;
    margin-bottom: 0.6rem;
  }

  .summary-card p {
    margin: 0;
    font-size: 0.92rem;
    line-height: 1.6;
    color: var(--color-milk);
    word-break: keep-all;
  }

  /* ----------------------------------------------------
   * 하단 CTA 영역
   * ---------------------------------------------------- */
  .cta {
    text-align: center;
    margin-top: 3rem;
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
    box-shadow: 0 3px 0 #cc9200;
  }

  /* 반응형 브레이크포인트 */
  @media (max-width: 820px) {
    .viewer-grid {
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }
    .summary-cards {
      grid-template-columns: 1fr;
    }
  }
</style>