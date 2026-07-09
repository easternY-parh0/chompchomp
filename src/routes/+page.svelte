<script lang="ts">
  import { fade, fly } from 'svelte/transition';
  import { resolve } from '$app/paths';

  // 인트로 애니메이션을 위한 상태
  let ready = $state(false);

  // 컴포넌트 마운트 시 애니메이션 시작 트리거
  import { onMount } from 'svelte';
  onMount(() => {
    ready = true;
  });
</script>

<svelte:head>
  <title>달콤살벌 초콜릿 사수 작전 · CHOMP</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link
    href="https://fonts.googleapis.com/css2?family=Do+Hyeon&family=Noto+Sans+KR:wght@400;500;700;900&display=swap"
    rel="stylesheet"
  />
</svelte:head>

<div class="page">
  {#if ready}
    <header class="hero" in:fly={{ y: -30, duration: 800 }}>
      <p class="eyebrow" in:fade={{ delay: 200 }}>세종과학고등학교 수학체험전</p>
      <h1 class="shiny-title">🍫 달콤살벌 초콜릿 사수 작전!</h1>
      <p class="hero-sub" in:fade={{ delay: 400 }}>
        초콜릿 속에 숨겨진 수학적 필승 전략을 찾아라!<br />
        게임 이론을 기반으로 한 턴제 심리 보드게임, <strong>촘프(CHOMP)</strong>에 오신 것을 환영합니다.
      </p>
    </header>

    <main class="menu-container" in:fly={{ y: 30, duration: 800, delay: 300 }}>
      <div class="menu-grid">
        
        <div class="menu-card rules-card">
          <div class="card-icon">📖</div>
          <h2>게임 규칙 알아보기</h2>
          <p>독약은 어디에 있을까요? 초콜릿을 어떻게 베어 무는지 움직이는 애니메이션 예시와 함께 쉽고 빠르게 규칙을 마스터해 보세요.</p>
          <a class="menu-btn rules-btn" href={resolve('/rules')}>
            규칙 보러가기 →
          </a>
        </div>

        <div class="menu-card explain-card">
          <div class="card-icon">🧠</div>
          <h2>필승 전략 파헤치기</h2>
          <p>촘프 게임은 왜 항상 선공이 이길까요? 전략 도둑질 논증과 보드 판형별 100% 승리 공식을 시뮬레이션과 함께 수학적으로 알아봅니다.</p>
          <a class="menu-btn explain-btn" href={resolve('/explain')}>
            필승 공식 확인 →
          </a>
        </div>

        <div class="menu-card play-card">
          <div class="card-icon">⚔️</div>
          <h2>실전 게임 대결하기</h2>
          <p>밀크 초코 팀 vs 화이트 초코 팀! 친구와 함께 한 기기에서 실시간으로 턴을 주고받으며 치열한 두뇌 싸움을 시작하세요.</p>
          <a class="menu-btn play-btn" href={resolve('/play')}>
            실전 대결 시작 →
          </a>
        </div>

      </div>
    </main>

    <section class="math-note" in:fade={{ delay: 600 }}>
      <h3>💡 촘프(CHOMP) 게임 속 수학 이야기</h3>
      <p>
        촘프 게임은 수학자 데이비드 게일(David Gale)이 고안한 대표적인 <strong>'유한 임의 전략 게임'</strong>입니다. 
        놀랍게도 이 게임은 두 플레이어가 완벽하게 플레이할 경우, <strong>먼저 시작하는 사람(선공)이 항상 이길 수 있는 필승 전략</strong>이 존재한다는 것이 수학적으로 증명되어 있습니다! 과연 어떤 규칙으로 초콜릿을 먹어야 무조건 승리할 수 있을지 직접 플레이하며 비밀을 파헤쳐 보세요!
      </p>
    </section>

    <footer class="footer" in:fade={{ delay: 800 }}>
      <p>© 2026 Sejong Science High School Math Festival. All rights reserved.</p>
    </footer>
  {/if}
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
    --color-gold: #ffb703;
    --color-milk: #f3e9dc;
    --color-card-bg: #52321c;

    background: var(--color-bg);
    color: var(--color-ink);
    font-family: 'Noto Sans KR', system-ui, sans-serif;
    padding: 3rem 1.25rem 4rem;
    max-width: 1040px; /* 3카드가 여유롭게 들어가도록 max-width 상향 조정 */
    margin: 0 auto;
    box-sizing: border-box;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  h1, h2, h3 {
    font-family: 'Do Hyeon', 'Noto Sans KR', sans-serif;
    font-weight: 400;
    color: var(--color-gold);
    margin: 0;
  }

  /* 헤더 스타일링 */
  .hero {
    text-align: center;
    padding: 1.5rem 1rem 2.5rem;
  }

  .eyebrow {
    letter-spacing: 0.08em;
    font-weight: 700;
    font-size: 0.95rem;
    color: var(--color-gold);
    text-transform: uppercase;
    margin: 0 0 0.8rem;
  }

  .shiny-title {
    font-size: clamp(2.2rem, 6vw, 3.5rem);
    text-shadow: 3px 3px 0px var(--color-choco-dark);
    margin-bottom: 1rem;
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
    font-size: 1.15rem;
    line-height: 1.7;
    max-width: 55ch;
    margin: 0 auto;
    color: var(--color-milk);
  }

  .hero-sub strong {
    color: var(--color-gold);
  }

  /* 메뉴 카드 그리드 (3열 레이아웃으로 변경) */
  .menu-container {
    margin-top: 1rem;
  }

  .menu-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
  }

  .menu-card {
    background: var(--color-card-bg);
    border-radius: 24px;
    padding: 2.5rem 1.5rem;
    text-align: center;
    box-shadow: 0 8px 0 rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 246, 233, 0.1);
    display: flex;
    flex-direction: column;
    align-items: center;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .menu-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 0 rgba(0, 0, 0, 0.25);
  }

  .card-icon {
    font-size: 3.5rem;
    margin-bottom: 1rem;
  }

  .menu-card h2 {
    font-size: 1.6rem;
    margin-bottom: 1rem;
    color: #fff;
    text-shadow: 1px 1px 0px var(--color-choco-dark);
    word-break: keep-all;
  }

  .menu-card p {
    margin: 0 0 2rem;
    font-size: 0.95rem;
    color: var(--color-milk);
    line-height: 1.6;
    flex-grow: 1;
    word-break: keep-all;
  }

  /* 공통 메뉴 버튼 스타일 */
  .menu-btn {
    display: inline-block;
    width: 100%;
    max-width: 240px;
    text-decoration: none;
    font-family: 'Do Hyeon', sans-serif;
    font-size: 1.2rem;
    padding: 0.9rem 1.5rem;
    border-radius: 999px;
    font-weight: 700;
    transition: background 0.2s, transform 0.1s, color 0.2s;
    box-sizing: border-box;
  }

  /* 규칙 버튼 */
  .rules-btn {
    background: var(--color-choco);
    color: var(--color-ink);
    box-shadow: 0 5px 0 var(--color-choco-dark);
  }

  .rules-btn:hover {
    background: var(--color-choco-light);
  }

  /* 필승 전략 버튼 (Deep Choco 기반 골드 포인트 스타일) */
  .explain-btn {
    background: var(--color-choco-dark);
    color: var(--color-gold);
    border: 2px solid var(--color-gold);
    box-shadow: 0 5px 0 rgba(0, 0, 0, 0.4);
    padding: 0.78rem 1.5rem; /* 보더 두께만큼 패딩 미세 조정 */
  }

  .explain-btn:hover {
    background: var(--color-gold);
    color: var(--color-choco-dark);
  }

  /* 실전 버튼 */
  .play-btn {
    background: var(--color-gold);
    color: var(--color-choco-dark);
    box-shadow: 0 5px 0 #cc9200;
  }

  .play-btn:hover {
    filter: brightness(1.05);
  }

  .menu-btn:active {
    transform: translateY(3px);
    box-shadow: 0 2px 0 rgba(0, 0, 0, 0.4);
  }

  /* 하단 수학 노트 섹션 */
  .math-note {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 20px;
    padding: 1.5rem 2rem;
    margin-top: 3rem;
    border: 1px dashed rgba(255, 183, 3, 0.3);
  }

  .math-note h3 {
    font-size: 1.3rem;
    margin-bottom: 0.6rem;
  }

  .math-note p {
    margin: 0;
    font-size: 0.95rem;
    line-height: 1.6;
    color: var(--color-milk);
  }

  .math-note strong {
    color: var(--color-gold);
  }

  /* 푸터 */
  .footer {
    text-align: center;
    margin-top: auto;
    padding-top: 3rem;
    font-size: 0.85rem;
    color: rgba(243, 233, 220, 0.4);
  }

  /* 태블릿 및 모바일 대응 */
  @media (max-width: 860px) {
    .menu-grid {
      grid-template-columns: 1fr; /* 세로 1열로 깔끔하게 떨어지도록 유도 */
      gap: 1.5rem;
      max-width: 400px;
      margin: 0 auto;
    }

    .menu-card {
      padding: 2rem 1.5rem;
    }
  }
</style>