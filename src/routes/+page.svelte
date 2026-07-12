<script lang="ts">
  import { fade, fly } from 'svelte/transition';
  import { resolve } from '$app/paths';
  import { onMount } from 'svelte';

  // 인트로 애니메이션을 위한 상태
  let ready = $state(false);

  onMount(() => {
    ready = true;
  });
</script>

<svelte:head>
  <title>달콤살벌 초콜릿 사수 작전 · CHOMP</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Do+Hyeon&family=Noto+Sans+KR:wght@400;500;700;900&display=swap" rel="stylesheet" />
</svelte:head>

<div class="page-wrapper">
  {#if ready}
    <header class="hero-section" in:fly={{ y: -20, duration: 800 }}>
      <p class="eyebrow" in:fade={{ delay: 200 }}>세종과학고등학교 수학체험전</p>
      <h1 class="hero-title">달콤살벌 초콜릿 사수 작전!</h1>
      <p class="hero-sub" in:fade={{ delay: 400 }}>
        초콜릿 속에 숨겨진 수학적 필승 전략을 찾아라!<br />
        게임 이론 기반의 턴제 심리 보드게임, <strong>촘프(CHOMP)</strong>
      </p>
    </header>

    <main class="dashboard-content" in:fly={{ y: 20, duration: 800, delay: 300 }}>
      
      <section class="primary-zone">
        <div class="mega-match-card">
          <div class="mode-badge">AI MATCH</div>
          <div class="icon-wrapper pulse-effect">🤖</div>
          <h2>인공지능 AI 대결하기</h2>
          <p class="match-desc">
            촘프의 수학적 필승 공식을 완벽하게 학습한 <strong>AI 초코봇</strong>이 당신을 기다립니다.<br>
            한순간의 방심도 패배로 이어지는 최적의 수 계산 속에서 끝까지 살아남아 보세요!
          </p>
          <a class="action-btn primary-btn" href={resolve('/play')}>
            AI 초코봇과 대결 시작 →
          </a>
        </div>
      </section>

      <section class="secondary-zone">
        
        <div class="sub-guide-card">
          <div class="sub-icon">document</div>
          <div class="sub-text-block">
            <h3>게임 규칙 알아보기</h3>
            <p>독약 초콜릿의 위치와 그리드를 베어 무는 규칙을 인터랙티브 가이드로 빠르게 마스터합니다.</p>
          </div>
          <a class="action-btn secondary-btn" href={resolve('/rules')}>
            규칙 보기
          </a>
        </div>

        <div class="sub-guide-card">
          <div class="sub-icon">brain</div>
          <div class="sub-text-block">
            <h3>필승 전략 파헤치기</h3>
            <p>수학적 '전략 도둑질 논증' 시뮬레이션을 통해 선공이 무조건 승리하는 비밀 공식을 확인하세요.</p>
          </div>
          <a class="action-btn secondary-btn" href={resolve('/guide')}>
            공식 확인
          </a>
        </div>

      </section>
    </main>

    <section class="math-insight-box" in:fade={{ delay: 600 }}>
      <h3>💡 CHOMP 게임 속 재미있는 수학 이론</h3>
      <p>
        촘프는 수학자 데이비드 게일(David Gale)이 고안한 <strong>'유한 임의 전략 게임'</strong>입니다. 
        양측이 완벽한 최적의 수를 둔다면 <strong>먼저 시작하는 사람(선공)이 무조건 승리</strong>한다는 결론이 증명되어 있습니다. 
        AI 초코봇을 무너뜨릴 수 있는 첫 번째 수의 비밀을 직접 찾아보세요!
      </p>
    </section>

    <footer class="page-footer" in:fade={{ delay: 800 }}>
      <p>© 2026 Sejong Science High School Math Festival. All rights reserved.</p>
    </footer>
  {/if}
</div>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    background-color: #120905;
    overflow-x: hidden;
  }

  /* 글로벌 테마 변수 및 기본 레이아웃 구성 */
  .page-wrapper {
    --bg-gradient: radial-gradient(circle at top center, #2c160b 0%, #120905 100%);
    --color-gold: #ffb703;
    --color-text-main: #fffcf7;
    --color-text-sub: #dccbc0;
    --card-bg-dark: #23130a;
    --card-bg-light: #2f1b10;
    --card-border: rgba(255, 183, 3, 0.15);

    background: var(--bg-gradient);
    color: var(--color-text-main);
    font-family: 'Noto Sans KR', system-ui, sans-serif;
    min-height: 100vh;
    padding: 3rem 1.5rem;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
  }

  h1, h2, h3 {
    font-family: 'Do Hyeon', sans-serif;
    font-weight: 400;
    margin: 0;
    letter-spacing: 0.5px;
  }

  /* -----------------------------------------
   * 헤더 텍스트 섹션 (줄바꿈 최적화)
   * ----------------------------------------- */
  .hero-section {
    text-align: center;
    margin-bottom: 2.5rem;
    max-width: 800px;
    width: 100%;
  }

  .eyebrow {
    font-size: 0.9rem;
    font-weight: 700;
    letter-spacing: 0.15em;
    color: var(--color-gold);
    margin: 0 0 0.6rem;
  }

  .hero-title {
    font-size: clamp(2rem, 5vw, 3rem);
    color: #ffffff;
    margin-bottom: 0.8rem;
    text-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
  }

  .hero-sub {
    font-size: 1.05rem;
    line-height: 1.6;
    color: var(--color-text-sub);
    word-break: keep-all;
  }

  .hero-sub strong {
    color: var(--color-gold);
    font-weight: 500;
  }

  /* -----------------------------------------
   * 메인 대시보드 컨테이너
   * ----------------------------------------- */
  .dashboard-content {
    width: 100%;
    max-width: 860px;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  /* 메인 상단 AI 카드 디자인 패키지 */
  .primary-zone {
    width: 100%;
  }

  .mega-match-card {
    background: linear-gradient(145deg, #2b170c, #1a0d06);
    border: 1px solid var(--color-gold);
    border-radius: 24px;
    padding: 2.5rem 2rem;
    text-align: center;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
    position: relative;
    box-sizing: border-box;
  }

  .mode-badge {
    position: absolute;
    top: -12px;
    left: 50%;
    transform: translateX(-50%);
    background: var(--color-gold);
    color: #120905;
    font-family: 'Do Hyeon', sans-serif;
    font-size: 0.85rem;
    padding: 0.25rem 1.25rem;
    border-radius: 30px;
    font-weight: 700;
    box-shadow: 0 4px 10px rgba(255, 183, 3, 0.2);
  }

  .icon-wrapper {
    font-size: 4rem;
    margin-bottom: 0.4rem;
    display: inline-block;
  }

  .pulse-effect {
    animation: floatingIcon 3s infinite ease-in-out;
  }

  @keyframes floatingIcon {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-6px); }
  }

  .mega-match-card h2 {
    font-size: 2.2rem;
    color: #ffffff;
    margin-bottom: 0.8rem;
  }

  .match-desc {
    font-size: 1.02rem;
    line-height: 1.6;
    color: var(--color-text-sub);
    margin: 0 auto 1.8rem;
    max-width: 620px;
    word-break: keep-all;
  }

  .match-desc strong {
    color: var(--color-gold);
  }

  /* -----------------------------------------
   * 하단 서브 메뉴 가로 나열 단락
   * ----------------------------------------- */
  .secondary-zone {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.2rem;
    width: 100%;
  }

  .sub-guide-card {
    background: var(--card-bg-dark);
    border: 1px solid var(--card-border);
    border-radius: 18px;
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: flex-start;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
    box-sizing: border-box;
    transition: background-color 0.2s, border-color 0.2s;
  }

  .sub-guide-card:hover {
    background-color: var(--card-bg-light);
    border-color: rgba(255, 183, 3, 0.3);
  }

  /* 아이콘을 이모지 대신 유연한 텍스트 배지로 대체 코디네이션 */
  .sub-icon {
    font-family: 'Do Hyeon', sans-serif;
    font-size: 0.75rem;
    background: rgba(255, 255, 255, 0.06);
    color: var(--color-gold);
    padding: 0.2rem 0.6rem;
    border-radius: 4px;
    text-transform: uppercase;
    margin-bottom: 0.8rem;
    letter-spacing: 1px;
  }

  .sub-text-block {
    width: 100%;
    text-align: left;
    margin-bottom: 1.5rem;
  }

  .sub-text-block h3 {
    font-size: 1.35rem;
    color: #ffffff;
    margin-bottom: 0.4rem;
  }

  .sub-text-block p {
    margin: 0;
    font-size: 0.9rem;
    line-height: 1.5;
    color: var(--color-text-sub);
    opacity: 0.85;
    word-break: keep-all;
  }

  /* -----------------------------------------
   * 유니버설 공통 단추 스타일링 공정
   * ----------------------------------------- */
  .action-btn {
    display: inline-block;
    text-decoration: none;
    font-family: 'Do Hyeon', sans-serif;
    text-align: center;
    border-radius: 12px;
    box-sizing: border-box;
    transition: transform 0.1s ease, filter 0.2s;
  }

  .action-btn:active {
    transform: scale(0.98);
  }

  /* 메인 대형 시작 단추 */
  .primary-btn {
    font-size: 1.3rem;
    padding: 0.9rem 3.5rem;
    background: var(--color-gold);
    color: #120905;
    font-weight: bold;
    box-shadow: 0 4px 15px rgba(255, 183, 3, 0.25);
  }

  .primary-btn:hover {
    filter: brightness(1.1);
  }

  /* 서브 가이드용 납작 단추 */
  .secondary-btn {
    font-size: 1rem;
    padding: 0.6rem 0;
    width: 100%;
    background: rgba(255, 255, 255, 0.05);
    color: var(--color-text-main);
    border: 1px solid rgba(255, 255, 255, 0.1);
    transition: background 0.2s, border-color 0.2s, color 0.2s;
  }

  .sub-guide-card:hover .secondary-btn {
    background: var(--color-gold);
    color: #120905;
    border-color: var(--color-gold);
    font-weight: bold;
  }

  /* -----------------------------------------
   * 하단 정보 지식 보관소 박스
   * ----------------------------------------- */
  .math-insight-box {
    width: 100%;
    max-width: 860px;
    background: rgba(0, 0, 0, 0.3);
    border-radius: 16px;
    padding: 1.25rem 1.75rem;
    margin-top: 2.5rem;
    border-left: 4px solid var(--color-gold);
    box-sizing: border-box;
    text-align: left;
  }

  .math-insight-box h3 {
    font-size: 1.15rem;
    margin-bottom: 0.4rem;
    color: var(--color-gold);
  }

  .math-insight-box p {
    margin: 0;
    font-size: 0.9rem;
    line-height: 1.6;
    color: var(--color-text-sub);
    word-break: keep-all;
  }

  .math-insight-box strong {
    color: #ffffff;
    font-weight: 500;
  }

  /* 푸터 지지대 */
  .page-footer {
    text-align: center;
    margin-top: 3rem;
    font-size: 0.8rem;
    color: rgba(220, 203, 192, 0.3);
  }

  /* -----------------------------------------
   * 모바일 스크린 대응 레이아웃 다이내믹 커스텀
   * ----------------------------------------- */
  @media (max-width: 768px) {
    .page-wrapper {
      padding: 2rem 1rem;
    }

    .mega-match-card {
      padding: 2rem 1.25rem;
    }

    .mega-match-card h2 {
      font-size: 1.8rem;
    }

    .match-desc {
      font-size: 0.95rem;
    }

    .primary-btn {
      font-size: 1.15rem;
      padding: 0.8rem 0;
      width: 100%;
    }

    .secondary-zone {
      grid-template-columns: 1fr; /* 세로 1열로 떨어지게 조율 */
      gap: 1rem;
    }

    .sub-guide-card {
      padding: 1.25rem;
    }
    
    .sub-text-block {
      margin-bottom: 1rem;
    }
  }
</style>