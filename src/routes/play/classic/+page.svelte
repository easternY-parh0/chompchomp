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
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;800&family=Do+Hyeon&family=Noto+Sans+KR:wght@400;500;700;900&family=Playfair+Display:ital,wght@1,500&display=swap" rel="stylesheet" />
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
              <div class="label-bg-pattern {currentCourse.patternType || 'default'}"></div>
              
              <div class="label-border-frame">
                <div class="label-header">
                  <span class="mini-brand">CHOMP CONFECTIONERY</span>
                  <div class="gold-divider"></div>
                </div>

                <div class="label-main-title">
                  <h1 class="eng-title">{currentCourse.labelText || 'FINE CHOCOLATE'}</h1>
                  <p class="eng-subtitle">{currentCourse.subtitle || 'ARTISAN COLLECTION'}</p>
                </div>
                
                <div class="label-footer">
                  <div class="gold-divider"></div>
                  <div class="footer-meta">
                    <span class="edition-tag">3-STAGE COURSE</span>
                    <span class="serial-no">NO. {String(currentIndex + 1).padStart(3, '0')}</span>
                  </div>
                </div>
              </div>
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
    border: 1px solid rgba(255, 246, 233, 0.25);
    box-shadow: 0 30px 70px rgba(0, 0, 0, 0.85), 0 0 0 1px rgba(0, 0, 0, 0.4);
  }

  .part-chocolate {
    width: 18%;
    height: 100%;
    position: relative;
    box-shadow: inset -10px 0 20px rgba(0,0,0,0.4);
    border-right: 1px solid rgba(0, 0, 0, 0.5);
  }
  .choco-pattern {
    position: absolute;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent 45%, rgba(0,0,0,0.3) 50%, transparent 55%),
                linear-gradient(0deg, transparent 45%, rgba(0,0,0,0.3) 50%, transparent 55%);
    background-size: 40px 40px;
  }

  .part-foil {
    width: 8%;
    height: 100%;
    background: linear-gradient(135deg, #e6e6e6, #adadad, #ffffff, #8a8a8a);
    position: relative;
    z-index: 2;
    box-shadow: 8px 0 15px rgba(0,0,0,0.4), -5px 0 15px rgba(0,0,0,0.3);
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

/* ----------------------------------------------------
   * 100% 불투명 처리된 프리미엄 라벨 디자인
   * ---------------------------------------------------- */
/* ----------------------------------------------------
   * 100% 완전 불투명(Solid) 프리미엄 라벨 디자인
   * ---------------------------------------------------- */
  .part-label {
    flex-grow: 1;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 2rem 2.5rem;
    box-sizing: border-box;
    position: relative;
    z-index: 3; /* 은박지(z-index:2)보다 위로 올려서 경계를 확실히 덮음 */
    
    /* [핵심] 투명도 없는 순수 단색/그라디언트 렌더링 강제 */
    background-clip: padding-box;
    
    /* 좌측 은박지 영역과의 경계선에 단단한 입체감과 짙은 그림자 부여 */
    border-left: 1px solid rgba(0, 0, 0, 0.4);
    box-shadow: 
      inset -10px 0 30px rgba(0, 0, 0, 0.5), /* 우측 내부 어두운 음영 */
      inset 15px 0 25px rgba(0, 0, 0, 0.6),  /* 좌측 은박지로부터 떨어지는 짙은 그림자 */
      -8px 0 15px rgba(0, 0, 0, 0.5);        /* 은박지 위로 겹쳐지는 외부 그림자 */
  }

  /* 라벨 내부의 은은한 고급 배경 패턴 스키마들 */
  .label-bg-pattern {
    position: absolute;
    top: 0; left: 0; width: 100%; height: 100%;
    /* 완전 불투명한 바탕(labelColor) 위에 자연스럽게 녹아들도록 변경 */
    opacity: 0.05; 
    pointer-events: none;
    z-index: 1;
  }
  
  .label-bg-pattern.stripe {
    background-image: repeating-linear-gradient(90deg, #fff, #fff 4px, transparent 4px, transparent 20px);
  }
  
  .label-bg-pattern.ornament {
    background-image: radial-gradient(circle at 50% 50%, #fff 10%, transparent 20%),
                      radial-gradient(circle at 0 0, #fff 10%, transparent 20%);
    background-size: 24px 24px;
  }
  
  .label-bg-pattern.diamond {
    background: 
      linear-gradient(135deg, #fff 25%, transparent 25%) -10px 0,
      linear-gradient(225deg, #fff 25%, transparent 25%) -10px 0,
      linear-gradient(315deg, #fff 25%, transparent 25%),
      linear-gradient(45deg, #fff 25%, transparent 25%);
    background-size: 20px 20px;
  }

  .label-bg-pattern.default {
    background-image: linear-gradient(45deg, #fff 25%, transparent 25%, transparent 75%, #fff 75%);
    background-size: 30px 30px;
  }

/* 프레임 내부까지 완벽하게 불투명하게 만들고 싶을 때 적용할 스크립트 */
  .label-border-frame {
    width: 100%;
    height: 100%;
    border: 1px solid rgba(212, 175, 55, 0.65);
    outline: 3px double rgba(212, 175, 55, 0.45);
    outline-offset: -8px;
    padding: 2rem;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    z-index: 2;
    
    /* 투명도 없는 묵직한 다크 브라운으로 내부를 채워 투명감 차단 */
    background-color: #1a0f0a; 
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  }

  /* 골드 파트 구분선 */
  .gold-divider {
    width: 60px;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.7), transparent);
    margin: 0.4rem auto;
  }

  .label-header {
    text-align: center;
  }
  .mini-brand {
    font-family: 'Cinzel', serif;
    font-size: 0.65rem;
    letter-spacing: 4px;
    color: rgba(212, 175, 55, 0.9);
    font-weight: 600;
  }

  /* 메인 영어 타이틀 영역 */
  .label-main-title {
    text-align: center;
    margin: auto 0;
  }
  .eng-title {
    font-family: 'Cinzel', serif;
    font-size: 2.2rem;
    font-weight: 800;
    color: #f3e5ab; 
    letter-spacing: 5px;
    margin: 0 0 0.3rem 0;
    /* 불투명 배경 위에서 글씨가 더 튀어나와 보이도록 그림자 강화 */
    text-shadow: 0 4px 12px rgba(0, 0, 0, 0.9), 0 0 2px rgba(212, 175, 55, 0.6);
    line-height: 1.2;
  }
  .eng-subtitle {
    font-family: 'Playfair Display', serif;
    font-style: italic;
    font-size: 0.85rem;
    color: #fff6e9;
    letter-spacing: 2px;
    margin: 0;
    opacity: 0.85;
  }

  .label-footer {
    width: 100%;
    text-align: center;
  }
  .footer-meta {
    display: flex;
    justify-content: space-between;
    width: 85%;
    margin: 0.3rem auto 0 auto;
    font-family: 'Cinzel', serif;
    font-size: 0.65rem;
    letter-spacing: 2px;
    color: rgba(255, 246, 233, 0.55);
  }
  .edition-tag {
    color: rgba(212, 175, 55, 0.75);
  }

  /* ----------------------------------------------------
   * 화살표 버튼 및 하단 대시보드 구조
   * ---------------------------------------------------- */
  .arrow-btn {
    background: rgba(82, 50, 28, 0.4);
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

  .bottom-dashboard-zone {
    display: grid;
    grid-template-columns: 3fr 1fr;
    gap: 1.5rem;
    width: 100%;
    height: 180px;
    min-height: 180px;
  }

  .glass-card {
    background: rgba(43, 24, 16, 0.6);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 246, 233, 0.28);
    border-radius: 16px;
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

  .play-panel-btn {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-decoration: none;
    transition: all 0.2s ease;
    cursor: pointer;
    background: rgba(255, 183, 3, 0.12);
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

  /* 반응형 처리 */
  @media (max-width: 1024px) {
    .fullscreen-layout { padding: 1.5rem; height: auto; min-height: 100vh; }
    .chocolate-bar-package { width: 100%; height: 280px; }
    .bottom-dashboard-zone { grid-template-columns: 1fr; height: auto; }
    .animated-desc-contents { grid-template-columns: 1fr; gap: 1.2rem; }
    .desc-part-1 {
      border-right: none;
      border-bottom: 1px solid rgba(255, 246, 233, 0.2);
      padding-right: 0;
      padding-bottom: 1rem;
    }
    .play-panel-btn { padding: 1.5rem; }
    .main-branding .brand-title { font-size: 2rem; }
    .luxury-sub-title { font-size: 1.1rem; }
  }
</style>