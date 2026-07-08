<script lang="ts">
  import { fade, fly } from 'svelte/transition';
  import { resolve } from '$app/paths';
  import { onMount } from 'svelte';

  // 각 라운드(판)의 정보를 담는 타입
  interface GameRound {
    roundNumber: number;
    rows: number;
    cols: number;
    sizeText: string;
  }

  // 하나의 초콜릿(코스)을 정의하는 타입
  interface GameCourse {
    id: '1' | '2' | '3'; // SvelteKit 라우트 타입 에러 방지를 위해 리터럴로 엄격하게 고정
    title: string;       // 코스 이름 (설명 1)
    difficulty: number;  // 코스 난이도 (설명 1)
    description: string; // 코스 설명 (설명 2)
    flavorText: string;  // 플레이버 텍스트 (설명 2)
    chocoColor: string;  
    labelColor: string;  
    rounds: GameRound[]; // 이 코스에 배정된 고정 판 3개
  }

  // 각 코스별 3개의 판 구조 세팅
  const courses: GameCourse[] = [
    {
      id: '1',
      title: '밀크 가나슈 코스',
      difficulty: 1,
      description: '촘프의 기초부터 다지는 입문 코스입니다. 점진적으로 크기가 커지는 3개의 판을 정복하며 필승 전략의 감을 잡으세요.',
      flavorText: '“달콤한 밀크 초코와 함께 가볍게 워밍업!”',
      chocoColor: '#8c5a3c',
      labelColor: 'linear-gradient(135deg, #a26a47, #734326)',
      rounds: [
        { roundNumber: 1, rows: 2, cols: 3, sizeText: '2 × 3' },
        { roundNumber: 2, rows: 3, cols: 3, sizeText: '3 × 3' },
        { roundNumber: 3, rows: 3, cols: 4, sizeText: '3 × 4' }
      ]
    },
    {
      id: '2',
      title: '다크 카카오 코스',
      difficulty: 3,
      description: '본격적인 대칭성과 수학적 균형이 요구되는 보통 난이도 코스입니다. 한 치의 양보도 없는 3연속 심리전이 펼쳐집니다.',
      flavorText: '“카카오 72%, 가로세로의 균형을 무너뜨려라.”',
      chocoColor: '#4a2c1a',
      labelColor: 'linear-gradient(135deg, #5c3820, #341e14)',
      rounds: [
        { roundNumber: 1, rows: 4, cols: 4, sizeText: '4 × 4' },
        { roundNumber: 2, rows: 3, cols: 5, sizeText: '3 × 5' },
        { roundNumber: 3, rows: 4, cols: 6, sizeText: '4 × 6' }
      ]
    },
    {
      id: '3',
      title: '블랙 가드너 코스',
      difficulty: 5,
      description: '수학자 데이비드 게일의 난제를 마스터하는 전문가 코스입니다. 거대한 경우의 수 속에서 완벽한 선공의 필승 루트를 증명하세요.',
      flavorText: '“마지막 독약 조각을 남기기 위한 치밀한 3단계 설계.”',
      chocoColor: '#2b1810',
      labelColor: 'linear-gradient(135deg, #3d2314, #1f100a)',
      rounds: [
        { roundNumber: 1, rows: 5, cols: 5, sizeText: '5 × 5' },
        { roundNumber: 2, rows: 4, cols: 7, sizeText: '4 × 7' },
        { roundNumber: 3, rows: 5, cols: 8, sizeText: '5 × 8' }
      ]
    }
  ];

  let ready = $state(false);
  let currentIndex = $state(0);
  let direction = $state(1);
  
  const currentCourse = $derived(courses[currentIndex]);

  onMount(() => {
    ready = true;
  });

  function nextMode() {
    direction = 1;
    currentIndex = (currentIndex + 1) % courses.length;
  }

  function prevMode() {
    direction = -1;
    currentIndex = (currentIndex - 1 + courses.length) % courses.length;
  }
</script>

<svelte:head>
  <title>게임 코스 선택 · CHOMP</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Do+Hyeon&family=Noto+Sans+KR:wght@400;500;700;900&display=swap" rel="stylesheet" />
</svelte:head>

<div class="fullscreen-layout">
  {#if ready}
    <section class="top-carousel-zone">
      <button class="arrow-btn" onclick={prevMode} aria-label="이전 코스">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 19l-7-7 7-7"/></svg>
      </button>
      
      <div class="chocolate-viewport">
        {#key currentIndex}
          <div 
            class="chocolate-bar-package"
            in:fly={{ x: 300 * direction, opacity: 0, duration: 450 }}
            out:fly={{ x: -300 * direction, opacity: 0, duration: 450 }}
          >
            <div class="part-chocolate" style:background={currentCourse.chocoColor}>
              <div class="choco-pattern"></div>
            </div>
            
            <div class="part-foil">
              <div class="foil-texture"></div>
            </div>
            
            <div class="part-label" style:background={currentCourse.labelColor}>
              <div class="label-branding">
                <span class="brand-text">CHOMP</span>
                <span class="edition-text">3-STAGE COURSE</span>
              </div>
              <div class="placeholder-tag">라벨 플레이스홀더 ({currentCourse.id}.png)</div>
            </div>
          </div>
        {/key}
      </div>

      <button class="arrow-btn" onclick={nextMode} aria-label="다음 코스">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 5l7 7-7 7"/></svg>
      </button>
    </section>

    <footer class="bottom-dashboard-zone" in:fly={{ y: 40, duration: 600, delay: 200 }}>
      
      <div class="glass-card desc-panel">
        {#key currentIndex}
          <div class="animated-desc-contents" in:fade={{ duration: 250 }}>
            
            <div class="desc-part-1">
              <h2 class="course-title">{currentCourse.title}</h2>
              <div class="stars">
                {'★'.repeat(currentCourse.difficulty)}{'☆'.repeat(5 - currentCourse.difficulty)}
              </div>
              
              <div class="course-roadmap">
                {#each currentCourse.rounds as round (round.roundNumber)}
                  <div class="round-badge-item">
                    <span class="round-lbl">R{round.roundNumber}</span>
                    <span class="round-size">{round.sizeText}</span>
                  </div>
                {/each}
              </div>
            </div>

            <div class="desc-part-2">
              <p class="main-text">{currentCourse.description}</p>
              <p class="flavor-text">{currentCourse.flavorText}</p>
            </div>
            
          </div>
        {/key}
      </div>

      <a class="glass-card play-panel-btn" href={resolve(`/play/classic/id/${currentCourse.id}` as any)}>
        <span class="play-icon">⚔️</span>
        <span class="play-text">코스 시작</span>
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
   * 상단 캐러셀 라벨 구조
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
  .arrow-btn svg { width: 32px; height: 32px; }

  /* ----------------------------------------------------
   * 하단 Glassmorphic 대시보드 구조 (설명 1 + 설명 2 통합 카드)
   * ---------------------------------------------------- */
  .bottom-dashboard-zone {
    display: grid;
    grid-template-columns: 3fr 1fr;
    gap: 1.5rem;
    width: 100%;
    height: 180px;
    min-height: 180px;
  }

  .glass-card {
    background: rgba(82, 50, 28, 0.35);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 246, 233, 0.12);
    border-radius: 16px;
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3);
    box-sizing: border-box;
  }

  .desc-panel {
    padding: 1.5rem 2.5rem;
    overflow: hidden;
  }
  .animated-desc-contents {
    display: grid;
    grid-template-columns: 1.2fr 2fr;
    height: 100%;
    align-items: center;
    gap: 2.5rem;
  }

  .desc-part-1 {
    border-right: 1px solid rgba(255, 246, 233, 0.1);
    padding-right: 2rem;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }
  .course-title {
    font-family: 'Do Hyeon', sans-serif;
    font-size: 1.8rem;
    color: #fff;
    margin: 0;
  }
  .stars {
    color: #ffb703;
    font-size: 0.95rem;
    letter-spacing: 1px;
  }
  
  .course-roadmap {
    display: flex;
    gap: 0.5rem;
    margin-top: 0.5rem;
  }
  .round-badge-item {
    background: rgba(0, 0, 0, 0.25);
    border: 1px solid rgba(255, 183, 3, 0.2);
    border-radius: 6px;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0.3rem 0.6rem;
    min-width: 55px;
  }
  .round-lbl {
    font-size: 0.7rem;
    color: #ffb703;
    font-weight: 700;
  }
  .round-size {
    font-size: 0.85rem;
    font-weight: 800;
    color: #fff;
  }

  .desc-part-2 {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 0.5rem;
  }
  .main-text {
    margin: 0;
    font-size: 1rem;
    line-height: 1.6;
    color: #fff6e9;
  }
  .flavor-text {
    margin: 0;
    font-size: 0.85rem;
    font-style: italic;
    color: #ffb703;
    opacity: 0.8;
  }

  /* 플레이 시작 버튼 패널 */
  .play-panel-btn {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-decoration: none;
    transition: all 0.2s ease;
    cursor: pointer;
    background: rgba(255, 183, 3, 0.15);
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
  }
  .play-panel-btn:hover .play-text { color: #2b1810; }
  .play-panel-btn:hover .play-icon { transform: scale(1.2) rotate(-10deg); }

  /* 반응형 모바일 대응 */
  @media (max-width: 1024px) {
    .fullscreen-layout { padding: 1.5rem; height: auto; min-height: 100vh; }
    .chocolate-bar-package { width: 100%; }
    .bottom-dashboard-zone { grid-template-columns: 1fr; height: auto; }
    .animated-desc-contents { grid-template-columns: 1fr; gap: 1.2rem; }
    .desc-part-1 {
      border-right: none;
      border-bottom: 1px solid rgba(255, 246, 233, 0.1);
      padding-right: 0;
      padding-bottom: 1rem;
    }
    .play-panel-btn { padding: 1.5rem; }
  }
</style>