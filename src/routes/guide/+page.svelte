<script lang="ts">
  import { fade, fly } from 'svelte/transition';
  import { resolve } from '$app/paths';
  import { guideArticles } from '$lib/data/guideData';
  
  let activeModal = $state<number | null>(null);

  // 현재 활성화된 모달 데이터 연산 계산 (Runes)
  let currentArticle = $derived(guideArticles.find(a => a.id === activeModal) || null);

  function openModal(id: number) {
    activeModal = id;
    if (typeof document !== 'undefined') document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    activeModal = null;
    if (typeof document !== 'undefined') document.body.style.overflow = '';
  }

  // MathJax 수식 재렌더링 트리거
  $effect(() => {
    if (activeModal !== null && typeof window !== 'undefined' && (window as any).MathJax) {
      setTimeout(() => {
        (window as any).MathJax.typesetPromise?.();
      }, 50);
    }
  });

  // 보드 피스 상태 분기를 간단히 제어하는 헬퍼 함수
  function getPieceProps(piece: string) {
    if (piece.startsWith('sym-a')) return { class: 'guide-piece sym-a-style', text: piece.split(':')[1] || '' };
    if (piece.startsWith('sym-b')) return { class: 'guide-piece sym-b-style', text: piece.split(':')[1] || '' };
    
    switch (piece) {
      case 'poison': return { class: 'guide-piece poison-style', text: '☠️' };
      case 'target': return { class: 'guide-piece target-style', text: '🎯' };
      case 'eaten': return { class: 'guide-piece eaten-style', text: '' };
      case 'normal': default: return { class: 'guide-piece', text: '' };
    }
  }
</script>

<svelte:head>
  <title>필승 전략 가이드북 · CHOMP</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Do+Hyeon&family=Noto+Sans+KR:wght@400;500;700;900&display=swap" rel="stylesheet" />
  <script>
    window.MathJax = {
      tex: { inlineMath: [['\\(', '\\)']], displayMath: [['$$', '$$']], processEscapes: true },
      options: { skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre'] }
    };
  </script>
  <script id="MathJax-script" async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"></script>
</svelte:head>

<div class="page">
  <header class="explain-header">
    <p class="eyebrow">CHOMP MATHEMATICS</p>
    <h1 class="page-title">🧠 필승 전략 가이드북</h1>
    <p class="page-sub">하단의 카드를 선택하면 전체 화면으로 상세한 수학적 시나리오를 감상할 수 있습니다.</p>
  </header>

  <main class="content-container">
    {#each guideArticles as article}
      <button class="menu-card" onclick={() => openModal(article.id)}>
        <div class="card-title-row">
          <span class="card-emoji">{article.emoji}</span>
          <h2>{article.title}</h2>
        </div>
        <p class="card-preview">{article.preview}</p>
        <span class="click-tip">읽기 ➔</span>
      </button>
    {/each}
  </main>

  <footer class="explain-footer">
    <a class="back-btn" href={resolve('/')}>← 게임화면으로 돌아가기</a>
    <p class="copyright">© 2026 Sejong Science High School Math Festival.</p>
  </footer>
</div>

{#if activeModal !== null && currentArticle}
  <div class="fullscreen-viewer" transition:fade={{ duration: 250 }}>
    <nav class="fullscreen-navbar">
      <div class="nav-left">
        <span class="nav-badge">PART 0{currentArticle.id}</span>
      </div>
      <button class="nav-close-btn" onclick={closeModal}>← 목록으로 돌아가기</button>
    </nav>

    <div class="fullscreen-body" transition:fly={{ y: 30, duration: 400 }}>
      <div class="article-container">
        <h1 class="article-main-title">{currentArticle.emoji} {currentArticle.title.split('. ')[1]}</h1>
        
        <div class="article-text">
          {#each currentArticle.sections as section}
            {#if section.type === 'subtitle'}
              <h3>{section.text}</h3>
            {:else if section.type === 'paragraph'}
              <p>{@html section.text}</p>
            {:else if section.type === 'callout'}
              <div class="info-callout"><p>{@html section.text}</p></div>
            {:else if section.type === 'highlight'}
              <p class="summary-highlight">{@html section.text}</p>
            {:else if section.type === 'board'}
              <div class={section.caption ? "inline-board-box" : "inline-board-box-mini"}>
                {#if section.caption}<span class="board-caption">{section.caption}</span>{/if}
                
                <div class="guide-board {section.layoutClass}">
                  {#each section.pieces || [] as piece}
                    {@const props = getPieceProps(piece)}
                    <div class={props.class}>
                      {#if props.text === '☠️'}
                        <span class="skull-icon">☠️</span>
                      {:else}
                        {props.text}
                        {#if !props.text && piece === 'normal'}<div class="indent"></div>{/if}
                      {/if}
                    </div>
                  {/each}
                </div>
                
                {#if section.subDesc}<p class="board-sub-desc">{section.subDesc}</p>{/if}
              </div>
            {/if}
          {/each}
        </div>
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

  /* 몰입형 풀스크린 뷰어 스타일 */
  .fullscreen-viewer {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: #1e0f08;
    z-index: 10000;
    display: flex;
    flex-direction: column;
  }

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

  .fullscreen-body {
    flex: 1;
    overflow-y: auto;
    padding: 3rem 1.5rem;
    box-sizing: border-box;
  }

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

  .article-text {
    font-size: 1.08rem;
    line-height: 1.85;
    color: #ffffff;
  }

  .article-text p {
    margin: 0 0 1.5rem 0;
    color: #f7ede2;
  }

  .article-text h3 {
    font-size: 1.4rem;
    color: var(--color-gold);
    margin: 2.5rem 0 1rem 0;
    border-left: 4px solid var(--color-gold);
    padding-left: 0.75rem;
  }

  /* MathJax LaTeX 수식 전용 테두리 여백 규격 수정 */
  :global(.mjx-chtml) {
    color: var(--color-gold) !important;
    background: rgba(0, 0, 0, 0.2);
    padding: 2px 6px;
    border-radius: 4px;
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

  /* 그리드 관련 */
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