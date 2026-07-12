<script lang="ts">
  import { resolve } from '$app/paths';

  // 1. 모드 객체의 엄격한 형태 보장을 위한 타입 정의
  type ModeItem = {
    readonly id: string;
    readonly title: string;
    readonly englishTitle: string;
    readonly emoji: string;
    readonly tagline: string;
    readonly desc: string;
    readonly href: string;
    readonly color: string;
  };

  // 2. satisfies 구문으로 정확한 리터럴 경로 보존
  const modes = [
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
  ] as const satisfies readonly ModeItem[]; 

  // 터치 기기 상태 및 인덱스 관리
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
        href={resolve(mode.href)}
        class="split-pane {mode.id}"
        class:is-active={activeId === mode.id}
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
          
          <p class="desc-text">{mode.desc}</p>
          <div class="cta-wrapper">
            <span class="cta-text">입장하기 ⚔️</span>
          </div>
        </div>
      </a>
    {/each}

    <div class="lightning-divider">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none">
        <polyline 
          points="53,-5 43,48 57,45 45,105" 
          stroke="#ffb703" 
          stroke-width="2" 
          fill="none" 
          opacity="0.4" 
          style="filter: drop-shadow(0 0 8px #ffb703);" 
        />
        <polyline 
          points="53,-5 43,48 57,45 45,105" 
          stroke="#ffb703" 
          stroke-width="0.6" 
          fill="none" 
        />
      </svg>
    </div>
  </div>
</div>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    background-color: #1a0f0a;
    font-family: 'Noto Sans KR', system-ui, sans-serif;
  }

  .split-screen-container {
    width: 100vw;
    height: 100vh;
    position: relative;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  /* 상단 헤더 타이틀 */
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

  /* 데스크탑 기본 분할 형태 */
  .split-pane {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    text-decoration: none;
    color: #fff;
    transition: clip-path 0.55s cubic-bezier(0.25, 1, 0.3, 1), filter 0.3s;
  }

  .split-pane.classic {
    background: linear-gradient(135deg, var(--pane-color), #23120a);
    z-index: 1;
    clip-path: polygon(0 0, 53% 0, 43% 48%, 57% 45%, 45% 100%, 0 100%);
  }

  .split-pane.modified {
    background: linear-gradient(135deg, #1f100a, var(--pane-color));
    z-index: 0;
  }

  /* 클래식 호버 시 커팅 다각형 우측 확장 */
  .split-wrapper:has(.classic:hover) .split-pane.classic,
  .split-wrapper.hover-classic .split-pane.classic {
    clip-path: polygon(0 0, 68% 0, 58% 48%, 72% 45%, 60% 100%, 0 100%);
  }

  /* 변형 모드 호버 시 클래식 영역 좌측 축소 */
  .split-wrapper:has(.modified:hover) .split-pane.classic,
  .split-wrapper.hover-modified .split-pane.classic {
    clip-path: polygon(0 0, 38% 0, 28% 48%, 42% 45%, 30% 100%, 0 100%);
  }

  /* 중앙 번개 구분선 제어 */
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

  .lightning-divider svg {
    width: 100%;
    height: 100%;
  }

  .split-wrapper:has(.classic:hover) .lightning-divider,
  .split-wrapper.hover-classic .lightning-divider {
    transform: translateX(15%);
  }

  .split-wrapper:has(.modified:hover) .lightning-divider,
  .split-wrapper.hover-modified .lightning-divider {
    transform: translateX(-15%);
  }

  /* 텍스트 배치 및 모션 오프셋 */
  .pane-content {
    position: absolute;
    top: 52%;
    z-index: 5;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 340px;
    text-align: center;
    transform: translate(-50%, -50%);
    transition: left 0.55s cubic-bezier(0.25, 1, 0.3, 1), right 0.55s cubic-bezier(0.25, 1, 0.3, 1), transform 0.3s;
  }

  .classic .pane-content {
    left: 25%;
  }

  .split-wrapper:has(.classic:hover) .classic .pane-content,
  .split-wrapper.hover-classic .classic .pane-content {
    left: 28%;
  }

  .split-wrapper:has(.modified:hover) .classic .pane-content,
  .split-wrapper.hover-modified .classic .pane-content {
    left: 18%;
  }

  .modified .pane-content {
    right: 25%;
    transform: translate(50%, -50%);
  }

  .split-wrapper:has(.classic:hover) .modified .pane-content,
  .split-wrapper.hover-classic .modified .pane-content {
    right: 18%;
  }

  .split-wrapper:has(.modified:hover) .modified .pane-content,
  .split-wrapper.hover-modified .modified .pane-content {
    right: 28%;
  }

  /* 타이포그래피 상세 상세 스타일 */
  .mode-emoji {
    font-size: 3.5rem;
    margin-bottom: 0.5rem;
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.4));
    transition: transform 0.3s ease;
  }

  .split-pane:hover .mode-emoji {
    transform: scale(1.15) rotate(-5deg);
  }

  .english-heading {
    font-family: 'Do Hyeon', sans-serif;
    font-size: 3.4rem;
    letter-spacing: 2px;
    margin: 0;
    color: #ffb703;
    text-shadow: 0 4px 10px rgba(0, 0, 0, 0.6);
  }

  .korean-heading {
    font-size: 1.4rem;
    font-weight: 700;
    color: #fff6e9;
    margin: 0.3rem 0;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  }

  .tagline {
    font-size: 0.95rem;
    color: #ffb703;
    font-weight: 500;
    opacity: 0.9;
    margin: 0 0 1.2rem;
  }

  /* 박스를 없애고 배경에 유연하게 동화시킨 오픈형 텍스트 구조 */
  .desc-text {
    margin: 0 0 1.5rem;
    font-size: 0.92rem;
    line-height: 1.6;
    color: #fff6e9;
    opacity: 0.75;
    word-break: keep-all;
    max-width: 300px;
    text-shadow: 0 2px 6px rgba(0, 0, 0, 0.7);
    transition: opacity 0.3s, transform 0.3s;
  }

  .split-pane:hover .desc-text {
    opacity: 1;
    transform: translateY(-2px);
  }

  .cta-wrapper {
    position: relative;
    padding: 0.5rem 1.5rem;
  }

  .cta-text {
    font-family: 'Do Hyeon', sans-serif;
    font-size: 1.2rem;
    color: #fff6e9;
    border-bottom: 2px solid transparent;
    padding-bottom: 4px;
    transition: color 0.3s, border-color 0.3s, text-shadow 0.3s;
  }

  .split-pane:hover .cta-text {
    color: #ffb703;
    border-color: #ffb703;
    text-shadow: 0 0 8px rgba(255, 183, 3, 0.6);
  }

  /* 거대 배경 워터마크 문자 */
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

  .classic .bg-watermark {
    left: 4vw;
    transform: translateY(-50%) rotate(-4deg);
  }

  .modified .bg-watermark {
    right: 4vw;
    transform: translateY(-50%) rotate(4deg);
  }

  /* ----------------------------------------------------
   * [대폭 개선] 모바일 인터페이스 고도화 대응 규격 (768px 이하)
   * ---------------------------------------------------- */
  @media (max-width: 768px) {
    .floating-header {
      top: 2rem;
    }

    .floating-header h1 {
      font-size: 1.6rem;
      padding: 0 1rem;
    }

    .split-wrapper {
      display: flex;
      flex-direction: column;
      height: 100vh;
      width: 100vw;
    }

    /* 상하 정비율 50% 유연 배치 기법 적용 및 클리핑 무력화 */
    .split-pane {
      position: relative;
      flex: 1;
      width: 100% !important;
      height: 50vh !important;
      clip-path: none !important;
      display: flex;
      justify-content: center;
      align-items: center;
      transition: flex 0.4s ease, filter 0.3s;
    }

    .split-pane.classic {
      background: linear-gradient(180deg, var(--pane-color), #23120a);
      border-bottom: 1px solid rgba(255, 183, 3, 0.15);
    }

    .split-pane.modified {
      background: linear-gradient(180deg, #1f100a, var(--pane-color));
    }

    /* 터치 상태(is-active)일 때 활성화된 카드를 넓혀 가독성 극대화 */
    .split-pane.is-active {
      flex: 1.4;
      filter: brightness(1.15);
    }

    /* 비활성화된 나머지 카드는 축소 제어 */
    .split-wrapper:has(.is-active) .split-pane:not(.is-active) {
      flex: 0.6;
      filter: brightness(0.6) blur(1px);
    }

    /* 모바일 맞춤형 중앙 정렬 오버라이드 및 고정 마진 제거 */
    .pane-content {
      position: relative;
      top: auto;
      left: auto !important;
      right: auto !important;
      transform: none !important;
      width: 85%;
      max-width: 320px;
      padding: 1rem 0;
      box-sizing: border-box;
    }

    .mode-emoji {
      font-size: 2.6rem;
      margin-bottom: 0.2rem;
    }

    .english-heading {
      font-size: 2.4rem;
    }

    .korean-heading {
      font-size: 1.15rem;
      margin: 0.1rem 0;
    }

    .tagline {
      font-size: 0.85rem;
      margin-bottom: 0.5rem;
    }

    .desc-text {
      font-size: 0.82rem;
      line-height: 1.5;
      margin-bottom: 0.8rem;
      opacity: 0.85; /* 모바일은 항상 보일 수 있도록 베이스 상향 조정 */
    }

    .cta-text {
      font-size: 1.05rem;
      color: #ffb703;
      border-color: rgba(255, 183, 3, 0.3);
    }

    /* 불필요 장식 요소 격리 정리 */
    .lightning-divider, 
    .bg-watermark {
      display: none !important;
    }
  }
</style>