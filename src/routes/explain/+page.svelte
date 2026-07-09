<script lang="ts">
  import { fade, fly } from 'svelte/transition';
  import { resolve } from '$app/paths';

  // 인트로 애니메이션 상태
  let ready = $state(false);

  import { onMount } from 'svelte';
  onMount(() => {
    ready = true;
  });
</script>

<svelte:head>
  <title>필승 전략 파헤치기 · CHOMP</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link
    href="https://fonts.googleapis.com/css2?family=Do+Hyeon&family=Noto+Sans+KR:wght@400;500;700;900&display=swap"
    rel="stylesheet"
  />
</svelte:head>

<div class="page">
  {#if ready}
    <header class="explain-header" in:fly={{ y: -20, duration: 800 }}>
      <p class="eyebrow">CHOMP MATHEMATICS</p>
      <h1 class="page-title">🧠 필승 전략 파헤치기</h1>
      <p class="page-sub">촘프 게임 속에 숨겨진 수학적 비밀을 알아보는 공간입니다.</p>
    </header>

    <main class="content-container" in:fade={{ delay: 300, duration: 600 }}>
      
      <section class="content-box">
        <h2>💡 1. 촘프 게임과 게임 이론</h2>
        <div class="placeholder-text">
          <p class="notice">✍️ 동료분이 내용을 정리해서 보내주시면 이 자리에 넣어주세요.</p>
          </div>
      </section>

      <section class="content-box">
        <h2>🍕 2. 전략 도둑질 논증 (Strategy Stealing)</h2>
        <div class="placeholder-text">
          <p class="notice">✍️ 전략 도둑질 논증에 관한 설명이 들어갈 공간입니다.</p>
          </div>
      </section>

      <section class="content-box">
        <h2>📊 3. 보드 판형별 승리 공식</h2>
        <div class="placeholder-text">
          <p class="notice">✍️ $2 \times n$ 이나 $3 \times n$ 등 판형별 필승 전략 설명이 들어갈 공간입니다.</p>
          </div>
      </section>

    </main>

    <footer class="explain-footer" in:fade={{ delay: 600 }}>
      <a class="back-btn" href={resolve('/')}>
        ← 메인 메뉴로 돌아가기
      </a>
      <p class="copyright">© 2026 Sejong Science High School Math Festival.</p>
    </footer>
  {/if}
</div>

<style>
  :global(body) {
    margin: 0;
    background-color: #2b1810;
  }

  .page {
    /* 메인 페이지와 완벽히 일치하는 초콜릿 색상 팔레트 */
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
    max-width: 800px; /* 읽기 편하도록 본문 폭 최적화 */
    margin: 0 auto;
    box-sizing: border-box;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  h1, h2 {
    font-family: 'Do Hyeon', sans-serif;
    font-weight: 400;
    color: var(--color-gold);
    margin: 0;
  }

  /* 헤더 스타일 */
  .explain-header {
    text-align: center;
    padding: 1rem 0 2rem;
  }

  .eyebrow {
    letter-spacing: 0.08em;
    font-weight: 700;
    font-size: 0.9rem;
    color: var(--color-gold);
    margin: 0 0 0.5rem;
    opacity: 0.8;
  }

  .page-title {
    font-size: clamp(2rem, 5vw, 2.8rem);
    text-shadow: 2px 2px 0px var(--color-choco-dark);
    color: #fff;
    margin-bottom: 0.8rem;
  }

  .page-sub {
    font-size: 1.05rem;
    color: var(--color-milk);
    margin: 0;
    opacity: 0.9;
  }

  /* 콘텐츠 박스 스타일 */
  .content-container {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    margin-top: 1rem;
  }

  .content-box {
    background: var(--color-card-bg);
    border-radius: 20px;
    padding: 2rem;
    box-shadow: 0 6px 0 rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(255, 246, 233, 0.05);
  }

  .content-box h2 {
    font-size: 1.5rem;
    color: var(--color-gold);
    border-bottom: 2px solid var(--color-choco);
    padding-bottom: 0.6rem;
    margin-bottom: 1.2rem;
  }

  /* 임시 안내 텍스트 스타일 */
  .placeholder-text {
    min-height: 100px; /* 텍스트가 없을 때도 형태를 유지하도록 설정 */
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px dashed rgba(255, 183, 3, 0.2);
    border-radius: 12px;
    background: rgba(0, 0, 0, 0.15);
    padding: 1.5rem;
    box-sizing: border-box;
  }

  .notice {
    margin: 0;
    font-size: 0.95rem;
    color: var(--color-milk);
    opacity: 0.6;
    text-align: center;
    line-height: 1.5;
    word-break: keep-all;
  }

  /* 하단 및 버튼 스타일 */
  .explain-footer {
    margin-top: auto;
    padding-top: 4rem;
    text-align: center;
  }

  .back-btn {
    display: inline-block;
    text-decoration: none;
    font-family: 'Do Hyeon', sans-serif;
    font-size: 1.15rem;
    background: var(--color-choco);
    color: var(--color-ink);
    padding: 0.8rem 2rem;
    border-radius: 999px;
    box-shadow: 0 4px 0 var(--color-choco-dark);
    transition: background 0.2s, transform 0.1s;
  }

  .back-btn:hover {
    background: var(--color-choco-light);
  }

  .back-btn:active {
    transform: translateY(2px);
    box-shadow: 0 2px 0 rgba(0, 0, 0, 0.4);
  }

  .copyright {
    margin-top: 2rem;
    font-size: 0.85rem;
    color: rgba(243, 233, 220, 0.3);
  }
</style>