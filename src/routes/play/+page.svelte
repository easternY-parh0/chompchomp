<script lang="ts">
  import { resolve } from '$app/paths';

  type Mode = {
    id: string;
    title: string;
    englishTitle: string;
    emoji: string;
    tagline: string;
    desc: string;
    href: string;
    color: string;
  };

  const modes: Mode[] = [
    {
      id: 'classic',
      title: '기본 모드',
      englishTitle: 'CLASSIC',
      emoji: '🍫',
      tagline: '전통 촘프 그대로',
      desc: '왼쪽 위 독약 조각만 조심하면 돼요. 촘프의 오리지널 규칙 그대로, 매번 같은 판에서 안정적인 전략을 펼쳐보세요.',
      href: '/play/classic',
      color: '#4a2c1a'
    },
    {
      id: 'modified',
      title: '변형 모드',
      englishTitle: 'ENDLESS',
      emoji: '🎲',
      tagline: '이번 판은 무엇이 섞일까?',
      desc: '판마다 랜덤 변형 규칙이 하나씩 무작위로 섞여요. 끝없는 경우의 수 속에서 당신의 한계를 시험하고 생존해 보세요.',
      href: '/play/modified',
      color: '#2b1810'
    }
  ];

  // 모바일 터치 기기 대응 상태 값
  let activeId = $state<string | null>(null);

  function isTouchDevice() {
    return typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches;
  }
</script>

<svelte:head>
  <title>모드 선택 · CHOMP</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Do+Hyeon&family=Noto+Sans+KR:wght@400;500;700;900&display=swap" rel="stylesheet" />
</svelte:head>

<div class="split-screen-container">
  <header class="floating-header">
    <p class="eyebrow">CHOMP · MODE SELECT</p>
    <h1>어떤 초콜릿으로 시작할까요?</h1>
  </header>

  <div 
    class="split-wrapper" 
    class:hover-classic={activeId === 'classic'}
    class:hover-modified={activeId === 'modified'}
  >
    {#each modes as mode (mode.id)}
      <a
        href={mode.href}
        class="split-pane {mode.id}"
        style:--pane-color={mode.color}
        onmouseenter={() => { if (!isTouchDevice()) activeId = mode.id; }}
        onmouseleave={() => { if (!isTouchDevice()) activeId = null; }}
        onclick={(e) => {
          if (isTouchDevice() && activeId !== mode.id) {
            e.preventDefault();
            activeId = mode.id;
          }
        }}
      >
        <div class="bg-watermark">{mode.englishTitle}</div>

        <div class="pane-content">
          <span class="mode-emoji">{mode.emoji}</span>
          <h2 class="english-heading">{mode.englishTitle}</h2>
          <h3 class="korean-heading">{mode.title}</h3>
          <p class="tagline">{mode.tagline}</p>
          
          <div class="glass-desc-box">
            <p class="desc-text">{mode.desc}</p>
            <span class="cta-text">입장하기 ⚔️</span>
          </div>
        </div>
      </a>
    {/each}

    <div class="lightning-divider">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none">
        <polyline points="53,-5 43,48 57,45 45,105" stroke="#ffb703" stroke-width="2" fill="none" opacity="0.4" style="filter: drop-shadow(0 0 8px #ffb703);" />
        <polyline points="53,-5 43,48 57,45 45,105" stroke="#ffb703" stroke-width="0.6" fill="none" />
      </svg>
    </div>
  </div>
</div>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    background-color: #1a0f0a;
    overflow: hidden;
    font-family: 'Noto Sans KR', system-ui, sans-serif;
  }

  .split-screen-container {
    width: 100vw;
    height: 100vh;
    position: relative;
    display: flex;
    flex-direction: column;
  }

  .floating-header {
    position: absolute;
    top: 3rem;
    left: 50%;
    transform: translateX(-50%);
    z-index: 20;
    text-align: center;
    pointer-events: none;
    width: 100%;
  }

  .eyebrow {
    font-weight: 700;
    font-size: 0.85rem;
    letter-spacing: 0.15em;
    color: #ffb703;
    margin: 0 0 0.4rem;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);
  }

  .floating-header h1 {
    font-family: 'Do Hyeon', sans-serif;
    font-size: clamp(1.6rem, 4vw, 2.4rem);
    color: #fff6e9;
    margin: 0;
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.9);
  }

  .split-wrapper {
    position: relative;
    width: 100%;
    height: 100%;
  }

  /* ----------------------------------------------------
   * [핵심 변경] 전체 화면 공통 좌표계 맵핑형 판넬 레이아웃
   * ---------------------------------------------------- */
  .split-pane {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    text-decoration: none;
    color: #fff;
    /* clip-path 자체를 부드럽게 애니메이션화 */
    transition: clip-path 0.55s cubic-bezier(0.25, 1, 0.3, 1);
  }

  /* --- 1. 기본 상태 (정중앙 50% 기준 번개 절단면) --- */
  .split-pane.classic {
    background: linear-gradient(135deg, var(--pane-color), #23120a);
    z-index: 1;
    /* 번개 모양 다각형 커팅 (SVG viewBox 좌표와 완벽 동기화) */
    clip-path: polygon(0 0, 53% 0, 43% 48%, 57% 45%, 45% 100%, 0 100%);
  }

  .split-pane.modified {
    background: linear-gradient(135deg, #1f100a, var(--pane-color));
    z-index: 0; /* 클래식이 위를 깎아내므로 밑에 깔아두기만 하면 완벽하게 맞물림 */
  }

  /* --- 2. CLASSIC 호버 상태 (오른쪽으로 번개선 이동 +15%) --- */
  .split-wrapper:has(.classic:hover) .split-pane.classic,
  .split-wrapper.hover-classic .split-pane.classic {
    clip-path: polygon(0 0, 68% 0, 58% 48%, 72% 45%, 60% 100%, 0 100%);
  }

  /* --- 3. ENDLESS(MODIFIED) 호버 상태 (왼쪽으로 번개선 이동 -15%) --- */
  .split-wrapper:has(.modified:hover) .split-pane.classic,
  .split-wrapper.hover-modified .split-pane.classic {
    clip-path: polygon(0 0, 38% 0, 28% 48%, 42% 45%, 30% 100%, 0 100%);
  }

  /* ----------------------------------------------------
   * 중앙 실선 일치화 애니메이션
   * ---------------------------------------------------- */
  .lightning-divider {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 10;
    transition: transform 0.55s cubic-bezier(0.25, 1, 0.3, 1);
  }
  .lightning-divider svg { width: 100%; height: 100%; }

  /* 호버 상태에 맞춰 중앙선도 정확히 15% 가로 슬라이딩 */
  .split-wrapper:has(.classic:hover) .lightning-divider,
  .split-wrapper.hover-classic .lightning-divider {
    transform: translateX(15%);
  }
  .split-wrapper:has(.modified:hover) .lightning-divider,
  .split-wrapper.hover-modified .lightning-divider {
    transform: translateX(-15%);
  }

  /* ----------------------------------------------------
   * 텍스트 영역 가시성 및 다이내믹 포지셔닝
   * ---------------------------------------------------- */
  .pane-content {
    position: absolute;
    top: 52%;
    z-index: 5;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 320px;
    text-align: center;
    transform: translate(-50%, -50%);
    transition: left 0.55s cubic-bezier(0.25, 1, 0.3, 1), right 0.55s cubic-bezier(0.25, 1, 0.3, 1);
  }

  /* 텍스트 박스가 번개선 이동에 맞춰 부드럽게 도망쳐 가림 현상 방지 */
  .classic .pane-content { left: 25%; }
  .split-wrapper:has(.classic:hover) .classic .pane-content,
  .split-wrapper.hover-classic .classic .pane-content { left: 28%; }
  .split-wrapper:has(.modified:hover) .classic .pane-content,
  .split-wrapper.hover-modified .classic .pane-content { left: 18%; }

  .modified .pane-content { right: 25%; transform: translate(50%, -50%); }
  .split-wrapper:has(.classic:hover) .modified .pane-content,
  .split-wrapper.hover-classic .modified .pane-content { right: 18%; }
  .split-wrapper:has(.modified:hover) .modified .pane-content,
  .split-wrapper.hover-modified .modified .pane-content { right: 28%; }

  .mode-emoji {
    font-size: 3.5rem;
    margin-bottom: 0.5rem;
    filter: drop-shadow(0 4px 8px rgba(0,0,0,0.4));
  }

  .english-heading {
    font-family: 'Do Hyeon', sans-serif;
    font-size: 3.2rem;
    letter-spacing: 2px;
    margin: 0;
    color: #ffb703;
    text-shadow: 0 4px 10px rgba(0,0,0,0.6);
  }

  .korean-heading {
    font-size: 1.25rem;
    font-weight: 500;
    color: #fff6e9;
    margin: 0.2rem 0;
  }

  .tagline {
    font-size: 0.9rem;
    color: #ffb703;
    opacity: 0.8;
    margin: 0 0 1.5rem;
  }

  .glass-desc-box {
    background: rgba(15, 8, 4, 0.75);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 246, 233, 0.15);
    border-radius: 14px;
    padding: 1.25rem;
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.5);
  }

  .split-pane:hover .glass-desc-box {
    background: rgba(43, 24, 16, 0.88);
    border-color: rgba(255, 183, 3, 0.4);
  }

  .desc-text {
    margin: 0 0 0.8rem;
    font-size: 0.88rem;
    line-height: 1.5;
    color: #fff6e9;
    word-break: keep-all;
  }

  .cta-text {
    font-family: 'Do Hyeon', sans-serif;
    font-size: 1.1rem;
    color: #ffb703;
  }

  .bg-watermark {
    position: absolute;
    font-family: 'Do Hyeon', sans-serif;
    font-size: 15vw;
    opacity: 0.025;
    color: #fff;
    user-select: none;
    pointer-events: none;
    white-space: nowrap;
    top: 40%;
  }
  .classic .bg-watermark { left: 4vw; transform: translateY(-50%) rotate(-5deg); }
  .modified .bg-watermark { right: 4vw; transform: translateY(-50%) rotate(5deg); }

  /* ----------------------------------------------------
   * 모바일 수직 분할 구조 대응
   * ---------------------------------------------------- */
  @media (max-width: 768px) {
    .floating-header { top: 1.5rem; }
    .split-wrapper { display: flex; flex-direction: column; height: 100%; }
    .split-pane { position: relative; width: 100% !important; height: 50vh !important; clip-path: none !important; }
    .split-pane.classic { border-bottom: 2px solid rgba(255, 183, 3, 0.2); }
    .pane-content { position: relative; top: auto; left: auto !important; right: auto !important; margin: 7rem auto 0; transform: none !important; }
    .lightning-divider, .bg-watermark { display: none; }
  }
</style>