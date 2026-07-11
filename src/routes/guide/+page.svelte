<script lang="ts">
  import { fade, fly } from 'svelte/transition';
  import { resolve } from '$app/paths';

  // 모달(팝업) 제어 상태 (Svelte 5 Runes)
  let activeModal = $state<number | null>(null);

  function openModal(id: number) {
    activeModal = id;
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden'; // 뒷 화면 스크롤 잠금
    }
  }

  function closeModal() {
    activeModal = null;
    if (typeof document !== 'undefined') {
      document.body.style.overflow = ''; // 스크롤 해제
    }
  }
</script>

<svelte:head>
  <title>필승 전략 가이드북 · CHOMP</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link
    href="https://fonts.googleapis.com/css2?family=Do+Hyeon&family=Noto+Sans+KR:wght@400;500;700;900&display=swap"
    rel="stylesheet"
  />
</svelte:head>

<div class="page">
  <header class="explain-header">
    <p class="eyebrow">CHOMP MATHEMATICS</p>
    <h1 class="page-title">🧠 필승 전략 가이드북</h1>
    <p class="page-sub">하단의 카드를 선택하면 전체 화면으로 상세한 수학적 시나리오를 감상할 수 있습니다.</p>
  </header>

  <main class="content-container">
    <button class="menu-card" onclick={() => openModal(1)}>
      <div class="card-title-row">
        <span class="card-emoji">💡</span>
        <h2>1. 촘프 게임의 역사와 게임 이론</h2>
      </div>
      <p class="card-preview">1950년대 슈(Schuh)의 약수 게임부터 체르멜로 정리와 조합론적 공정 게임 분석.</p>
      <span class="click-tip">풀스크린으로 읽기 ➔</span>
    </button>

    <button class="menu-card" onclick={() => openModal(2)}>
      <div class="card-title-row">
        <span class="card-emoji">🍕</span>
        <h2>2. 전략 도둑질 논증 (Strategy Stealing)</h2>
      </div>
      <p class="card-preview">선공의 승리를 귀류법으로 완벽하게 증명해내는 비구성적 증명 세계관.</p>
      <span class="click-tip">풀스크린으로 읽기 ➔</span>
    </button>

    <button class="menu-card" onclick={() => openModal(3)}>
      <div class="card-title-row">
        <span class="card-emoji">📊</span>
        <h2>3. 보드 판형별 필승 공식 대백과</h2>
      </div>
      <p class="card-preview">$1 \times n$, 정사각형, $2 \times n$ 보드판에서 사용하는 거울 대칭 알고리즘.</p>
      <span class="click-tip">풀스크린으로 읽기 ➔</span>
    </button>
  </main>

  <footer class="explain-footer">
    <a class="back-btn" href={resolve('/')}>
      ← 게임화면으로 돌아가기
    </a>
    <p class="copyright">© 2026 Sejong Science High School Math Festival.</p>
  </footer>
</div>

{#if activeModal !== null}
  <div class="fullscreen-viewer" transition:fade={{ duration: 250 }}>
    
    <nav class="fullscreen-navbar">
      <div class="nav-left">
        <span class="nav-badge">PART 0{activeModal}</span>
      </div>
      <button class="nav-close-btn" onclick={closeModal}>
        ← 목록으로 돌아가기
      </button>
    </nav>

    <div class="fullscreen-body" transition:fly={{ y: 30, duration: 400 }}>
      <div class="article-container">
        
        {#if activeModal === 1}
          <h1 class="article-main-title">💡 촘프 게임의 역사와 게임 이론</h1>
          
          <div class="article-text">
            <h3>📜 촘프의 역사: 약수 게임에서 초콜릿으로</h3>
            <p>
              촘프 게임의 수학적 모태는 1952년 네덜란드의 수학자 <b>프레드 슈(Fred Schuh)</b>가 고안한 <b>'약수 게임(Divisor Game)'</b>으로 거슬러 올라갑니다. 
              특정 자연수 $N$을 정해둔 뒤, 플레이어들이 교대로 약수 중 하나를 선택하고 그 수와 배수들을 지워나가며 마지막에 '1'을 고르는 사람이 지는 대수적 규칙이었습니다.
            </p>
            
            <div class="inline-board-box">
              <span class="board-caption">[도표 1-1] 프레드 슈의 초기 1차원 약수 보드 기하학적 모사 ($1 \times 5$)</span>
              <div class="guide-board layout-1xn">
                <div class="guide-piece poison-style"><span class="skull-icon">☠️ (1)</span></div>
                <div class="guide-piece">2</div>
                <div class="guide-piece">4</div>
                <div class="guide-piece">8</div>
                <div class="guide-piece">16</div>
              </div>
              <p class="board-sub-desc">선택된 수의 배수 계열을 소거하는 1차원 선형 대수 매트릭스 형태</p>
            </div>

            <p>
              이후 1974년, 미국의 수학자이자 경제학자인 <b>데이비드 게일(David Gale)</b>이 이 복잡한 수식 게임을 사각형 격자판 형태의 규칙으로 리디자인하면서 현재의 <b>'CHOMP(촘프)'</b>라는 직관적인 이름이 탄생했습니다. 천재 수학 저술가 마틴 가드너가 이를 대중에 소개하며 조합론의 핵심 과제로 부상했습니다.
            </p>

            <div class="inline-board-box">
              <span class="board-caption">[도표 1-2] 데이비드 게일이 정립한 2차원 초콜릿 격자 보드 ($3 \times 3$)</span>
              <div class="guide-board layout-3x3">
                <div class="guide-piece poison-style"><span class="skull-icon">☠️</span></div>
                <div class="guide-piece"><div class="indent"></div></div>
                <div class="guide-piece"><div class="indent"></div></div>
                <div class="guide-piece"><div class="indent"></div></div>
                <div class="guide-piece"><div class="indent"></div></div>
                <div class="guide-piece"><div class="indent"></div></div>
                <div class="guide-piece"><div class="indent"></div></div>
                <div class="guide-piece"><div class="indent"></div></div>
                <div class="guide-piece"><div class="indent"></div></div>
              </div>
              <p class="board-sub-desc">2차원 평면 좌표축 개념을 결합하여 가독성과 직관성을 극대화한 현대적 촘프 보드</p>
            </div>

            <h3>🧩 조합론적 게임 이론 (Combinatorial Game Theory)</h3>
            <p>
              촘프는 조합론적 게임 이론에서 <b>'유한 불완전 배제 공정 게임(Finite Impartial Game)'</b>의 완벽한 표본입니다. 
              양측이 동일한 조건에서 대칭적으로 돌을 두며, 비기는 경우가 없고 유한한 횟수 내에 게임이 무조건 종료됩니다. 
              따라서 <b>체르멜로의 정리(Zermelo's Theorem)</b>에 의해, 이 게임은 선공과 후공 중 어느 한쪽에 100% 승리를 가져다주는 <b>'필승 전략'</b>이 무조건 설계되어 있습니다.
            </p>
          </div>
        {/if}

        {#if activeModal === 2}
          <h1 class="article-main-title">🍕 전략 도둑질 논증 (Strategy Stealing)</h1>
          
          <div class="article-text">
            <h3>💡 비구성적 존재 증명: "답은 있지만 알려주지는 않는다"</h3>
            <p>
              전략 도둑질 논증은 크기가 $1 \times 1$보다 큰 모든 사각형 촘프 게임 보드에서 <b>"무조건 선공이 승리한다"</b>는 정리를 유도해내는 수학적 귀류법 체계입니다. 수학에서 말하는 대표적인 비구성적 증명(Non-constructive proof)으로, 승리의 존재성은 확증하지만 정작 첫 수로 어디를 두어야 하는지는 비밀에 붙입니다.
            </p>

            <div class="info-callout">
              <p><b>[귀류법적 가정]</b> 후공에게 판을 어떻게 받아도 무조건 승리하는 절대적 마법의 '필승 전략 S'가 존재한다고 귀류법 가정을 세워봅시다.</p>
            </div>

            <p><b>스텝 1 (선공의 유인책):</b> 선공은 첫 차례에 보드의 맨 오른쪽 아래 맨 구석에 위치한 조각<b>(가장 영향력이 적은 단 1칸)</b>만 톡 깨물어 먹고 후공에게 보드를 넘깁니다.</p>

            <div class="inline-board-box">
              <span class="board-caption">① 선공의 첫 수: 우하단 구석탱이 1조각만 살짝 제거</span>
              <div class="guide-board layout-3x3">
                <div class="guide-piece poison-style"><span class="skull-icon">☠️</span></div>
                <div class="guide-piece"><div class="indent"></div></div>
                <div class="guide-piece"><div class="indent"></div></div>
                <div class="guide-piece"><div class="indent"></div></div>
                <div class="guide-piece"><div class="indent"></div></div>
                <div class="guide-piece"><div class="indent"></div></div>
                <div class="guide-piece"><div class="indent"></div></div>
                <div class="guide-piece"><div class="indent"></div></div>
                <div class="guide-piece eaten-style"></div>
              </div>
            </div>

            <p><b>스텝 2 (후공의 응수):</b> 후공은 자신이 가지고 있다고 가정한 필승 전략 S의 매뉴얼을 꺼내어, 현재 판에서 가장 완벽한 킬러 좌표인 특정 포인트 <b>🎯</b>를 타격하여 격자를 파괴할 것입니다.</p>

            <div class="inline-board-box">
              <span class="board-caption">② 후공이 자신의 필승 전략 S를 적용해 대응 사격한 배치 (🎯 위치)</span>
              <div class="guide-board layout-3x3">
                <div class="guide-piece poison-style"><span class="skull-icon">☠️</span></div>
                <div class="guide-piece"><div class="indent"></div></div>
                <div class="guide-piece"><div class="indent"></div></div>
                <div class="guide-piece"><div class="indent"></div></div>
                <div class="guide-piece target-style">🎯</div>
                <div class="guide-piece"><div class="indent"></div></div>
                <div class="guide-piece"><div class="indent"></div></div>
                <div class="guide-piece"><div class="indent"></div></div>
                <div class="guide-piece eaten-style"></div>
              </div>
            </div>

            <p><b>스텝 3 (논리적 모순 발생):</b> 여기서 수학적 뇌정지가 찾아옵니다. 후공이 🎯를 먹어서 만들어낸 그 이상적인 필승의 배치 상태는, 사실 <b>선공이 첫 번째 차례에 애초부터 🎯 조각을 바로 선택했어도 똑같이 만들어낼 수 있었던 형태</b>입니다.</p>

            <div class="inline-board-box">
              <span class="board-caption">③ 선공이 애초에 첫 수로 ②번 모양을 가로채서 선점해 버린 형태</span>
              <div class="guide-board layout-3x3">
                <div class="guide-piece poison-style"><span class="skull-icon">☠️</span></div>
                <div class="guide-piece"><div class="indent"></div></div>
                <div class="guide-piece"><div class="indent"></div></div>
                <div class="guide-piece"><div class="indent"></div></div>
                <div class="guide-piece eaten-style"></div>
                <div class="guide-piece eaten-style"></div>
                <div class="guide-piece"><div class="indent"></div></div>
                <div class="guide-piece eaten-style"></div>
                <div class="guide-piece eaten-style"></div>
              </div>
            </div>

            <p class="summary-highlight">
              결론적으로 후공이 이기기 위해 준비한 모든 마법의 패는 선공이 첫 턴에 '도둑질(Stealing)'해서 똑같이 재현해 버릴 수 있습니다. 따라서 "후공에게 필승 전략이 있다"는 가정은 모순을 일으켜 파괴되며, <b>촘프 게임은 항상 선공의 필승만이 존재함</b>이 증명됩니다.
            </p>
          </div>
        {/if}

        {#if activeModal === 3}
          <h1 class="article-main-title">📊 보드 판형별 승리 공식 대백과</h1>
          
          <div class="article-text">
            <p class="intro-lead">귀류법적 존재 증명을 넘어, 특정한 직사각형 및 규격을 가진 필드에서는 기계적으로 대응하여 무조건 이길 수 있는 마스터 알고리즘이 정립되어 있습니다.</p>
            
            <div class="rule-card-item">
              <h3>⭐ 유형 A. 가로형 한 줄 보드 ($1 \times n$)</h3>
              <p><b>승리 알고리즘:</b> 난이도가 가장 낮습니다. 선공은 첫 턴에 독약 바로 우측 옆 칸(🎯)을 씹어 삼킵니다. 이 한 수로 독약을 제외한 우측 라인의 모든 초콜릿이 단 한 번에 증발하게 되며, 후공은 강제로 독약을 삼키고 즉사하게 됩니다.</p>
              
              <div class="inline-board-box-mini">
                <div class="guide-board layout-1xn">
                  <div class="guide-piece poison-style"><span class="skull-icon">☠️</span></div>
                  <div class="guide-piece target-style">🎯</div>
                  <div class="guide-piece"><div class="indent"></div></div>
                  <div class="guide-piece"><div class="indent"></div></div>
                  <div class="guide-piece"><div class="indent"></div></div>
                </div>
              </div>
            </div>

            <div class="rule-card-item">
              <h3>⭐ 유형 B. 정사각형 보드 ($n \times n$)</h3>
              <p><b>승리 알고리즘 [대각선 거울 복사]:</b> 선공은 첫 수로 메인 대각선 대칭점인 <b>(2, 2) 위치를 정밀 타격</b>해 우측 하단 덩어리를 소거합니다. 그러면 독약을 중심으로 가로축과 세로축의 길이가 똑같은 완벽한 대칭형 'L'자 보드가 남습니다. 이후 후공이 가로를 $k$칸 깎아 먹으면 선공은 세로를 똑같이 $k$칸 깎으며 대칭 매칭을 복사 유지하면 백전백승합니다.</p>
              
              <div class="inline-board-box-mini">
                <div class="guide-board layout-3x3">
                  <div class="guide-piece poison-style"><span class="skull-icon">☠️</span></div>
                  <div class="guide-piece sym-a-style">A1</div>
                  <div class="guide-piece sym-b-style">B1</div>
                  <div class="guide-piece sym-a-style">A2</div>
                  <div class="guide-piece eaten-style"></div>
                  <div class="guide-piece eaten-style"></div>
                  <div class="guide-piece sym-b-style">B2</div>
                  <div class="guide-piece eaten-style"></div>
                  <div class="guide-piece eaten-style"></div>
                </div>
                <p class="board-sub-desc">대칭축을 기준으로 상대방이 깎아낸 분량만큼 반대 축을 똑같이 상쇄하는 거울 공식</p>
              </div>
            </div>

            <div class="rule-card-item">
              <h3>⭐ 유형 C. 2열 격자 보드 ($2 \times n$)</h3>
              <p><b>승리 알고리즘 [시차 1칸 마진 유지형]:</b> 선공은 아래쪽 행의 가장 우측 조각을 끊어내어 <b>'첫 번째 행의 잔존 칸수가 두 번째 행의 잔존 칸수보다 무조건 항상 1개 더 많은 상태'</b>를 요새처럼 유지합니다. 상대방이 위를 깎아 균형을 맞추려 하거나 아래를 더 깎으면, 다음 선공 턴에 이 1칸 차이 마진 공식이 복구되도록 대응 계산을 해주는 것으로 우승 궤도를 사수할 수 있습니다.</p>
              
              <div class="inline-board-box-mini">
                <div class="guide-board layout-2xn">
                  <div class="guide-piece poison-style"><span class="skull-icon">☠️</span></div>
                  <div class="guide-piece"><div class="indent"></div></div>
                  <div class="guide-piece"><div class="indent"></div></div>
                  <div class="guide-piece"><div class="indent"></div></div>
                  <div class="guide-piece"><div class="indent"></div></div>
                  <div class="guide-piece"><div class="indent"></div></div>
                  <div class="guide-piece"><div class="indent"></div></div>
                  <div class="guide-piece eaten-style"></div>
                </div>
                <p class="board-sub-desc">윗줄 4칸, 아랫줄 3칸으로 정확히 1칸 격차의 마진 밸런스가 유지된 필승 국면</p>
              </div>
            </div>
          </div>
        {/if}

      </div>
    </div>
  </div>
{/if}

<style>
  :global(body) {
    margin: 0;
    background-color: #1e0f08;
  }

  /* 메인 가이드북 베이스 스킨 스타일 */
  .page {
    --color-bg: #321b11;
    --color-ink: #fff6e9;
    --color-choco: #6b4226;
    --color-choco-dark: #1e0f08;
    --color-gold: #ffb703;
    --color-milk: #f3e9dc;
    --color-card-bg: #4a291a;

    background: var(--color-bg);
    color: var(--color-ink);
    font-family: 'Noto Sans KR', system-ui, sans-serif;
    padding: 3rem 1.5rem 4rem;
    max-width: 760px;
    margin: 0 auto;
    box-sizing: border-box;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  h1, h2, h3 {
    font-family: 'Do Hyeon', sans-serif;
    font-weight: 400;
    color: var(--color-gold);
    margin: 0;
  }

  .explain-header {
    text-align: center;
    padding-bottom: 3rem;
  }

  .eyebrow {
    letter-spacing: 0.1em;
    font-weight: 700;
    font-size: 0.9rem;
    color: var(--color-gold);
    margin: 0 0 0.5rem;
  }

  .page-title {
    font-size: clamp(2.2rem, 5vw, 2.8rem);
    color: #ffffff;
    margin-bottom: 0.8rem;
  }

  .page-sub {
    font-size: 1.05rem;
    color: var(--color-milk);
    opacity: 0.85;
  }

  /* 메인 카드 대시보드 구조 */
  .content-container {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .menu-card {
    background: var(--color-card-bg);
    border-radius: 16px;
    padding: 1.8rem 2rem;
    box-shadow: 0 5px 0 rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 246, 233, 0.06);
    text-align: left;
    cursor: pointer;
    width: 100%;
    box-sizing: border-box;
    transition: transform 0.2s, border-color 0.2s;
  }

  .menu-card:hover {
    transform: translateY(-2px);
    border-color: var(--color-gold);
    background: #573120;
  }

  .card-title-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 0.6rem;
  }

  .card-emoji { font-size: 1.5rem; }
  .menu-card h2 { color: #ffffff; font-size: 1.35rem; }
  .card-preview { color: var(--color-milk); opacity: 0.8; margin: 0 0 1rem 0; font-size: 0.95rem; }
  .click-tip { font-family: 'Do Hyeon', sans-serif; color: var(--color-gold); font-size: 0.95rem; }

  /* ==========================================
     [교정 핵심] 몰입형 풀스크린 뷰어 스타일 컴포넌트
     ========================================== */
  .fullscreen-viewer {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: #1e0f08; /* 완전히 독립된 어두운 브라운 배경으로 글자 가독성 100% 보장 */
    z-index: 10000;
    display: flex;
    flex-direction: column;
  }

  /* 풀스크린 상단 고정 네비게이션바 */
  .fullscreen-navbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 2rem;
    background: #140a05;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }

  .nav-badge {
    font-family: 'Do Hyeon', sans-serif;
    background: var(--color-gold);
    color: #140a05;
    padding: 0.25rem 0.75rem;
    border-radius: 6px;
    font-size: 0.9rem;
    font-weight: bold;
  }

  .nav-close-btn {
    background: #321b11;
    border: 1px solid rgba(255,255,255,0.1);
    color: #ffffff;
    font-family: 'Do Hyeon', sans-serif;
    font-size: 1rem;
    padding: 0.5rem 1.2rem;
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.2s;
  }
  .nav-close-btn:hover {
    background: var(--color-choco);
  }

  /* 본문 문서 스크롤바 바인딩 */
  .fullscreen-body {
    flex: 1;
    overflow-y: auto;
    padding: 3rem 1.5rem;
    box-sizing: border-box;
  }

  /* 실제 책/도큐먼트 형태의 너비 제한 중앙 정렬 컨테이너 */
  .article-container {
    max-width: 680px;
    margin: 0 auto;
  }

  .article-main-title {
    font-size: 2.2rem;
    color: #ffffff;
    border-bottom: 3px solid #321b11;
    padding-bottom: 1rem;
    margin-bottom: 2rem;
    text-shadow: 2px 2px 0px rgba(0,0,0,0.4);
  }

  /* 타이포그래피 정밀 가독성 교정 사양 */
  .article-text {
    font-size: 1.08rem;
    line-height: 1.85;
    color: #ffffff; /* 글자색을 완전한 화이트로 고정하여 대비 강도 극대화 */
  }

  .article-text p {
    margin: 0 0 1.5rem 0;
    color: #f7ede2; /* 살짝 따뜻한 소프트 화이트 배정 */
  }

  .article-text h3 {
    font-size: 1.4rem;
    color: var(--color-gold);
    margin: 2.5rem 0 1rem 0;
    border-left: 4px solid var(--color-gold);
    padding-left: 0.75rem;
  }

  .info-callout {
    background: #140a05;
    padding: 1.25rem 1.6rem;
    border-radius: 12px;
    margin: 1.8rem 0;
    border: 1px solid rgba(255, 183, 3, 0.2);
  }
  .info-callout p { margin: 0; color: #ffffff; }

  .summary-highlight {
    color: var(--color-gold) !important;
    font-weight: 700;
    background: rgba(255, 183, 3, 0.06);
    padding: 1.25rem;
    border-radius: 12px;
    margin-top: 2rem;
    border: 1px dashed var(--color-gold);
  }

  .rule-card-item {
    background: #140a05;
    padding: 1.6rem;
    border-radius: 16px;
    margin-bottom: 1.8rem;
    border: 1px solid rgba(255,255,255,0.03);
  }
  .rule-card-item h3 { color: #ffffff; margin-bottom: 0.75rem; font-size: 1.25rem; }
  .rule-card-item p { color: #e1d3c7; font-size: 1rem; margin: 0; }

  /* ==========================================
     문맥 중간 유동형 인터랙티브 초콜릿 그리드 
     ========================================== */
  .inline-board-box {
    background: rgba(0, 0, 0, 0.4);
    padding: 1.5rem;
    border-radius: 16px;
    margin: 1.5rem 0 2rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    border: 1px solid rgba(255, 255, 255, 0.04);
  }

  .inline-board-box-mini {
    margin-top: 1.25rem;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .board-caption {
    font-family: 'Do Hyeon', sans-serif;
    font-size: 0.95rem;
    color: var(--color-gold);
    margin-bottom: 1rem;
    letter-spacing: 0.3px;
  }

  .board-sub-desc {
    font-size: 0.85rem;
    color: #a89488;
    margin: 0.8rem 0 0 0 !important;
    text-align: center;
    line-height: 1.4;
  }

  /* 격자 제어 프레임 */
  .guide-board {
    display: grid;
    gap: 6px;
    background: #140a05;
    padding: 12px;
    border-radius: 12px;
    width: fit-content;
    box-shadow: inset 0 0 15px rgba(0,0,0,0.8);
  }
  
  .layout-1xn { grid-template-rows: 1fr; grid-template-columns: repeat(5, 1fr); }
  .layout-3x3 { grid-template-rows: repeat(3, 1fr); grid-template-columns: repeat(3, 1fr); }
  .layout-2xn { grid-template-rows: repeat(2, 1fr); grid-template-columns: repeat(4, 1fr); }

  .guide-piece {
    width: 40px;
    height: 40px;
    background: #7a4c2d;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Do Hyeon', sans-serif;
    font-size: 0.9rem;
    color: var(--color-gold);
    box-shadow: 0 3px 0 #4a2c1a;
  }

  .guide-piece.poison-style { background: #ba3c3c; box-shadow: 0 3px 0 #802424; color: #fff; }
  .guide-piece.target-style { background: #ffb703; box-shadow: 0 3px 0 #b38000; color: #1e0f08; font-size: 1.05rem; }
  .guide-piece.eaten-style { opacity: 0.04; box-shadow: none; background: rgba(255, 255, 255, 0.1); }
  .guide-piece.sym-a-style { background: #5c8240; box-shadow: 0 3px 0 #3b5429; color: #fff; }
  .guide-piece.sym-b-style { background: #4a758c; box-shadow: 0 3px 0 #2b4554; color: #fff; }

  .indent { width: 35%; height: 35%; border: 1px solid rgba(0,0,0,0.15); border-radius: 2px; }
  .skull-icon { font-size: 1rem; }

  /* 푸터 제어 */
  .explain-footer {
    margin-top: auto;
    padding-top: 4rem;
    text-align: center;
  }

  .back-btn {
    display: inline-block;
    text-decoration: none;
    font-family: 'Do Hyeon', sans-serif;
    font-size: 1.1rem;
    background: var(--color-choco);
    color: #ffffff;
    padding: 0.75rem 2.2rem;
    border-radius: 50px;
    box-shadow: 0 4px 0 var(--color-choco-dark);
  }
  .back-btn:hover { background: #825232; }
  .copyright { margin-top: 1.5rem; font-size: 0.8rem; color: rgba(255,255,255,0.12); }
</style>