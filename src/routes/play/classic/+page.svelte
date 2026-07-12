<script lang="ts">
  import { fade, fly } from 'svelte/transition';
  import { resolve } from '$app/paths';
  import { onMount } from 'svelte';
  
  // 외부로 분리한 데이터 및 타입 불러오기
  import { coursesData as courses } from '$lib/data/courses';

  let ready = $state(false);
  let currentIndex = $state(0);
  let direction = $state(1);
  
  // Svelte 5 $derived 룬을 활용해 현재 선택된 코스 자동 추적
  const currentCourse = $derived(courses[currentIndex]);

  onMount(() => {
    ready = true;
  });

  function nextMode() {
    direction = 1;
    // 데이터 개수가 늘어나거나 줄어들어도 변동된 courses.length에 맞춰 유연하게 순환함
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

  /* 초콜릿 바 패키지 전체 윤곽선 테두리 및 그림자 강화 */
  .chocolate-bar-package {
    position: absolute;
    width: 85%;
    max-width: 760px;
    height: 100%;
    max-height: 340px;
    display: flex;
    border-radius: 16px;
    overflow: hidden;
    /* 고대비 밝은 테두리선 추가하여 배경과 격리 */
    border: 1px solid rgba(255, 246, 233, 0.25);
    /* 아래로 깊게 깔리는 딥 섀도우 처리 */
    box-shadow: 0 30px 70px rgba(0, 0, 0, 0.85), 0 0 0 1px rgba(0, 0, 0, 0.4);
  }

  .part-chocolate {
    width: 18%;
    height: 100%;
    position: relative;
    box-shadow: inset -10px 0 20px rgba(0,0,0,0.3);
    border-right: 1px solid rgba(0, 0, 0, 0.4); /* 호일 경계 엣지 부여 */
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
    /* 호일 양옆에 가느다란 마감 입체선 */
    border-left: 1px solid rgba(255,255,255,0.4);
    border-right: 1px solid rgba(0,0,0,0.4);
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
    background: rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(4px);
    box-shadow: 0 10px 25px rgba(0,0,0,0.4);
  }
  .brand-text {
    display: block;
    font-family: 'Do Hyeon', sans-serif;
    font-size: 3.5rem;
    color: #ffb703;
    letter-spacing: 4px;
    text-shadow: 2px 4px 8px rgba(0, 0, 0, 0.6);
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
    background: rgba(82, 50, 28, 0.4);
    /* 버튼 화살표 영역 테두리 선명화 */
    border: 1px solid rgba(255, 183, 3, 0.25);
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
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
  }
  .arrow-btn:hover {
    background: #ffb703;
    color: #2b1810;
    border-color: #ffb703;
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

  /* 하단 영역 카드 테두리(border) 투명도 상향 및 바깥 어두운 그림자 추가 */
  .glass-card {
    background: rgba(43, 24, 16, 0.6); /* 투명도를 살짝 낮추어 내부 색상 응집력 고정 */
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    /* 테두리 가시성 0.12 -> 0.28로 선명화 */
    border: 1px solid rgba(255, 246, 233, 0.28);
    border-radius: 16px;
    /* 배경이 어두우므로 퍼지는 그림자를 좀 더 진하게 */
    box-shadow: 0 20px 45px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255,255,255,0.1);
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
    /* 수직 분할선 투명도 업그레이드 */
    border-right: 1px solid rgba(255, 246, 233, 0.2);
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
    text-shadow: 0 2px 4px rgba(0,0,0,0.4);
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
    background: rgba(0, 0, 0, 0.4);
    /* 배지 낱개 경계 윤곽선 강화 */
    border: 1px solid rgba(255, 183, 3, 0.4);
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
    opacity: 0.9;
  }

  /* 플레이 시작 버튼 패널 마감 윤곽선 디자인 강화 */
  .play-panel-btn {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-decoration: none;
    transition: all 0.2s ease;
    cursor: pointer;
    background: rgba(255, 183, 3, 0.12);
    /* 기본 테두리를 노란색 계열 테두리로 한 층 명확화 */
    border: 1px solid rgba(255, 183, 3, 0.45);
  }
  .play-panel-btn:hover {
    background: #ffb703;
    border-color: #ffb703;
    transform: translateY(-4px);
    box-shadow: 0 25px 50px rgba(255, 183, 3, 0.25);
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
    text-shadow: 0 2px 4px rgba(0,0,0,0.5);
  }
  .play-panel-btn:hover .play-text { color: #2b1810; text-shadow: none; }
  .play-panel-btn:hover .play-icon { transform: scale(1.2) rotate(-10deg); }

  /* 반응형 모바일 대응 */
  @media (max-width: 1024px) {
    .fullscreen-layout { padding: 1.5rem; height: auto; min-height: 100vh; }
    .chocolate-bar-package { width: 100%; }
    .bottom-dashboard-zone { grid-template-columns: 1fr; height: auto; }
    .animated-desc-contents { grid-template-columns: 1fr; gap: 1.2rem; }
    .desc-part-1 {
      border-right: none;
      border-bottom: 1px solid rgba(255, 246, 233, 0.2);
      padding-right: 0;
      padding-bottom: 1rem;
    }
    .play-panel-btn { padding: 1.5rem; }
  }
</style>