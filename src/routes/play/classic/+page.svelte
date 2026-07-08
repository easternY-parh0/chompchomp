<script lang="ts">
  import { fade, fly } from 'svelte/transition';
  import { resolve } from '$app/paths';
  import { onMount } from 'svelte';

  interface GameMode {
    id: string;
    title: string;       // 설명 1에 들어갈 타이틀
    sizeText: string;    // 설명 1에 들어갈 판 크기
    difficulty: number;  // 설명 1에 들어갈 별점
    description: string; // 설명 2에 들어갈 디테일 설명
    flavorText: string;  // 설명 2에 들어갈 플레이버 텍스트
    chocoColor: string;  // 노출된 초콜릿 색상
    labelColor: string;  // 커스텀 브랜드 라벨 배경색
  }

  const modes: GameMode[] = [
    {
      id: 'beginner',
      title: '밀크 초코 (입문)',
      sizeText: '3 × 4 그리드',
      difficulty: 1,
      description: '초콜릿의 기본 규칙을 익히기에 완벽한 미니 사이즈입니다. 게임 이론의 기초를 가볍게 배워보세요.',
      flavorText: '“달콤한 초콜릿 한 조각, 가볍게 시작해 볼까?”',
      chocoColor: '#8c5a3c',
      labelColor: 'linear-gradient(135deg, #a26a47, #734326)'
    },
    {
      id: 'normal',
      title: '다크 초코 (보통)',
      sizeText: '4 × 6 그리드',
      difficulty: 3,
      description: '본격적인 촘프 게임의 심리전이 시작되는 표준 사이즈입니다. 선공과 후공의 치열한 두뇌 싸움!',
      flavorText: '“카카오 72%, 쌉싸름한 두뇌 싸움의 시작!”',
      chocoColor: '#4a2c1a',
      labelColor: 'linear-gradient(135deg, #5c3820, #341e14)'
    },
    {
      id: 'expert',
      title: '가나슈 초코 (전문가)',
      sizeText: '5 × 8 그리드',
      difficulty: 5,
      description: '수많은 경우의 수가 존재합니다. 완벽하게 플레이할 경우 선공이 무조건 이기는 필승 전략을 찾아보세요.',
      flavorText: '“독약 초콜릿을 피하기 위한 치밀한 계산이 필요해.”',
      chocoColor: '#2b1810',
      labelColor: 'linear-gradient(135deg, #3d2314, #1f100a)'
    }
  ];

  let ready = $state(false);
  let currentIndex = $state(0);
  let direction = $state(1); // 1: 우측 이동, -1: 좌측 이동
  
  const currentMode = $derived(modes[currentIndex]);

  onMount(() => {
    ready = true;
  });

  function nextMode() {
    direction = 1;
    currentIndex = (currentIndex + 1) % modes.length;
  }

  function prevMode() {
    direction = -1;
    currentIndex = (currentIndex - 1 + modes.length) % modes.length;
  }
</script>

<svelte:head>
  <title>게임 모드 선택 · CHOMP</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Do+Hyeon&family=Noto+Sans+KR:wght@400;500;700;900&display=swap" rel="stylesheet" />
</svelte:head>

<div class="fullscreen-layout">
  {#if ready}
    <section class="top-carousel-zone">
      <button class="arrow-btn" onclick={prevMode} aria-label="이전 모드">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 19l-7-7 7-7"/></svg>
      </button>
      
      <div class="chocolate-viewport">
        {#key currentIndex}
          <div 
            class="chocolate-bar-package"
            in:fly={{ x: 300 * direction, opacity: 0, duration: 450 }}
            out:fly={{ x: -300 * direction, opacity: 0, duration: 450 }}
          >
            <div class="part-chocolate" style:background={currentMode.chocoColor}>
              <div class="choco-pattern"></div>
            </div>
            
            <div class="part-foil">
              <div class="foil-texture"></div>
            </div>
            
            <div class="part-label" style:background={currentMode.labelColor}>
              <div class="label-branding">
                <span class="brand-text">CHOMP</span>
                <span class="edition-text">PREMIUM CHOCOLATE</span>
              </div>
              <div class="placeholder-tag">라벨 플레이스홀더 ({currentMode.id}.png)</div>
            </div>
          </div>
        {/key}
      </div>

      <button class="arrow-btn" onclick={nextMode} aria-label="다음 모드">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 5l7 7-7 7"/></svg>
      </button>
    </section>

    <footer class="bottom-dashboard-zone" in:fly={{ y: 40, duration: 600, delay: 200 }}>
      
      <div class="glass-card desc-panel">
        {#key currentIndex}
          <div class="animated-desc-contents" in:fade={{ duration: 250 }}>
            <div class="desc-part-1">
              <h2 class="mode-title">{currentMode.title}</h2>
              <div class="meta-info">
                <span class="size-badge">{currentMode.sizeText}</span>
                <div class="stars">
                  {'★'.repeat(currentMode.difficulty)}{'☆'.repeat(5 - currentMode.difficulty)}
                </div>
              </div>
            </div>

            <div class="desc-part-2">
              <p class="main-text">{currentMode.description}</p>
              <p class="flavor-text">{currentMode.flavorText}</p>
            </div>
          </div>
        {/key}
      </div>

      <a class="glass-card play-panel-btn" href={resolve(`/play/${currentMode.id}`)}>
        <span class="play-icon">⚔️</span>
        <span class="play-text">작전 개시</span>
      </a>

    </footer>
  {/if}
</div>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    background-color: #2b1810;
    background-image: radial-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px);
    background-size: 32px 32px;
    overflow-x: hidden;
  }

  .fullscreen-layout {
    width: 100vw;
    height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    box-sizing: border-box;
    padding: 3rem 4rem;
    gap: 2rem;
  }

  /* ----------------------------------------------------
   * [상단] 와이어프레임 완벽 대응 초콜릿 패키지 뷰어
   * ---------------------------------------------------- */
  .top-carousel-zone {
    flex-grow: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    gap: 2rem;
  }

  .chocolate-viewport {
    flex-grow: 1;
    height: 100%;
    max-height: 420px;
    position: relative;
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  /* 초콜릿 바 결합체 본체 (초콜릿 + 호일 + 라벨) */
  .chocolate-bar-package {
    position: absolute;
    width: 85%;
    max-width: 760px;
    height: 100%;
    max-height: 340px;
    display: flex;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
  }

  /* 파트 1: 왼쪽 노출된 초콜릿 */
  .part-chocolate {
    width: 18%;
    height: 100%;
    position: relative;
    box-shadow: inset -10px 0 20px rgba(0,0,0,0.3);
  }
  .choco-pattern {
    position: absolute;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent 45%, rgba(0,0,0,0.2) 50%, transparent 55%),
                linear-gradient(0deg, transparent 45%, rgba(0,0,0,0.2) 50%, transparent 55%);
    background-size: 40px 40px;
  }

  /* 파트 2: 중간 은박지 호일 */
  .part-foil {
    width: 10%;
    height: 100%;
    background: linear-gradient(135deg, #e6e6e6, #adadad, #ffffff, #8a8a8a);
    position: relative;
    z-index: 2;
    box-shadow: 5px 0 15px rgba(0,0,0,0.3), -5px 0 15px rgba(0,0,0,0.3);
  }
  .foil-texture {
    position: absolute;
    width: 100%;
    height: 100%;
    opacity: 0.15;
    background-image: repeating-linear-gradient(45deg, #000 0px, #000 2px, transparent 2px, transparent 8px);
  }

  /* 파트 3: 오른쪽 커스텀 브랜드 라벨 디자인 영역 */
  .part-label {
    flex-grow: 1;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 3rem;
    box-sizing: border-box;
    position: relative;
  }
  .label-branding {
    border: 2px solid rgba(255, 183, 3, 0.4);
    padding: 2rem 4rem;
    text-align: center;
    background: rgba(0, 0, 0, 0.2);
    backdrop-filter: blur(4px);
  }
  .brand-text {
    display: block;
    font-family: 'Do Hyeon', sans-serif;
    font-size: 3.5rem;
    color: #ffb703;
    letter-spacing: 4px;
    text-shadow: 2px 4px 8px rgba(0, 0, 0, 0.5);
  }
  .edition-text {
    font-size: 0.85rem;
    letter-spacing: 3px;
    color: #fff6e9;
    opacity: 0.7;
  }
  .placeholder-tag {
    position: absolute;
    bottom: 1rem;
    right: 1.5rem;
    font-size: 0.8rem;
    color: rgba(255, 246, 233, 0.4);
  }

  /* 큰 조작 화살표 버튼 */
  .arrow-btn {
    background: rgba(82, 50, 28, 0.3);
    border: 1px solid rgba(255, 246, 233, 0.1);
    color: #ffb703;
    width: 60px;
    height: 120px;
    border-radius: 12px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    flex-shrink: 0;
  }
  .arrow-btn:hover {
    background: #ffb703;
    color: #2b1810;
    transform: scale(1.05);
  }
  .arrow-btn svg {
    width: 32px;
    height: 32px;
  }

  /* ----------------------------------------------------
   * [하단] Glassmorphic 하단 보드 레이아웃 스타일링
   * ---------------------------------------------------- */
  .bottom-dashboard-zone {
    display: grid;
    grid-template-columns: 3fr 1fr; /* 설명판과 버튼판 가로 분할 배정 */
    gap: 1.5rem;
    width: 100%;
    height: 160px;
    min-height: 160px;
  }

  /* 공통 글래스모피즘 베이스 기조 스타일링 */
  .glass-card {
    background: rgba(82, 50, 28, 0.35);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 246, 233, 0.12);
    border-radius: 16px;
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3);
    box-sizing: border-box;
  }

  /* [설명판 내부 종횡 정렬] */
  .desc-panel {
    padding: 1.5rem 2.5rem;
    overflow: hidden;
  }
  .animated-desc-contents {
    display: grid;
    grid-template-columns: 1fr 2fr; /* 설명 1 : 설명 2 내부 격자 */
    height: 100%;
    align-items: center;
    gap: 3rem;
  }

  /* 설명 1 (타이틀 & 스펙 요소) */
  .desc-part-1 {
    border-right: 1px solid rgba(255, 246, 233, 0.1);
    padding-right: 2rem;
  }
  .mode-title {
    font-family: 'Do Hyeon', sans-serif;
    font-size: 2rem;
    color: #fff;
    margin: 0 0 0.5rem 0;
  }
  .meta-info {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  .size-badge {
    background: #ffb703;
    color: #4a2c1a;
    font-weight: 800;
    font-size: 0.85rem;
    padding: 0.2rem 0.5rem;
    border-radius: 4px;
  }
  .stars {
    color: #ffb703;
    letter-spacing: 1px;
    font-size: 1rem;
  }

  /* 설명 2 (상세 내용 및 플레이버 텍스트 요소) */
  .desc-part-2 {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 0.4rem;
  }
  .main-text {
    margin: 0;
    font-size: 1.05rem;
    line-height: 1.6;
    color: #fff6e9;
  }
  .flavor-text {
    margin: 0;
    font-size: 0.9rem;
    font-style: italic;
    color: #ffb703;
    opacity: 0.8;
  }

  /* [플레이 버튼 전용 스타일링] */
  .play-panel-btn {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-decoration: none;
    transition: all 0.2s ease;
    cursor: pointer;
    background: rgba(255, 183, 3, 0.15); /* 플레이 버튼 특유의 강조 틴트 */
    border-color: rgba(255, 183, 3, 0.3);
  }
  .play-panel-btn:hover {
    background: #ffb703;
    border-color: #ffb703;
    transform: translateY(-4px);
  }
  .play-icon {
    font-size: 1.8rem;
    margin-bottom: 0.2rem;
    transition: transform 0.2s;
  }
  .play-text {
    font-family: 'Do Hyeon', sans-serif;
    font-size: 1.4rem;
    color: #fff;
    font-weight: 700;
  }
  .play-panel-btn:hover .play-text {
    color: #2b1810;
  }
  .play-panel-btn:hover .play-icon {
    transform: scale(1.2) rotate(-10deg);
  }

  /* ----------------------------------------------------
   * 해상도 반응형 미디어 쿼리
   * ---------------------------------------------------- */
  @media (max-width: 1024px) {
    .fullscreen-layout {
      padding: 1.5rem;
    }
    .chocolate-bar-package {
      width: 100%;
    }
    .bottom-dashboard-zone {
      grid-template-columns: 1fr;
      height: auto;
    }
    .animated-desc-contents {
      grid-template-columns: 1fr;
      gap: 1rem;
    }
    .desc-part-1 {
      border-right: none;
      border-bottom: 1px solid rgba(255, 246, 233, 0.1);
      padding-right: 0;
      padding-bottom: 0.5rem;
    }
    .play-panel-btn {
      padding: 1.5rem;
    }
  }
</style>