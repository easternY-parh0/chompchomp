<script lang="ts">
  import { resolve } from '$app/paths';
  
  type Mode = {
    id: string;
    title: string;
    emoji: string;
    tagline: string;
    desc: string;
    href: string;
    featured?: boolean;
  };

  const modes: Mode[] = [
    {
      id: 'classic',
      title: '기본 모드',
      emoji: '🍫',
      tagline: '전통 촘프 그대로',
      desc: '왼쪽 위 독약 조각만 조심하면 돼요. 촘프의 오리지널 규칙 그대로, 매번 같은 판에서 즐겨보세요.',
      href: '/play/classic',
      featured: true
    },
    {
      id: 'modified',
      title: '변형 모드',
      emoji: '🎲',
      tagline: '이번 판은 무엇이 섞일까?',
      desc: '판마다 랜덤 변형 규칙이 하나씩 섞여요. 같은 판은 두 번 다시 없어요 — 끝까지 살아남아 보세요.',
      href: '/play/modified'
    }
  ];

  let flippedId = $state<string | null>(null);

  function isTouchDevice() {
    return typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches;
  }

  function handleCardClick(e: MouseEvent, mode: Mode) {
    if (isTouchDevice() && flippedId !== mode.id) {
      e.preventDefault();
      flippedId = mode.id;
    }
  }

  function handleCardKeydown(mode: Mode) {
    if (isTouchDevice()) flippedId = mode.id;
  }
</script>

<svelte:head>
  <title>모드 선택 · 촘프</title>
</svelte:head>

<div class="page">
  <header class="hero">
    <p class="eyebrow">CHOMP · MODE SELECT</p>
    <h1>어떤 초콜릿으로 할까요?</h1>
    <p class="hero-sub">기본 그대로 갈지, 매번 달라지는 변형으로 갈지 골라보세요.</p>
  </header>

  <div class="grid">
    {#each modes as mode (mode.id)}
      <a
        class="mode-card"
        class:featured={mode.featured}
        class:flipped={flippedId === mode.id}
        href={mode.href}
        onclick={(e) => handleCardClick(e, mode)}
        onfocus={() => handleCardKeydown(mode)}
      >
        {#if mode.featured}
          <span class="badge">기본</span>
        {/if}
        <div class="card-inner">
          <div class="card-face card-front">
            <span class="card-emoji">{mode.emoji}</span>
            <h2 class="card-title">{mode.title}</h2>
            <p class="card-tagline">{mode.tagline}</p>
          </div>
          <div class="card-face card-back">
            <p class="card-desc">{mode.desc}</p>
            <span class="card-cta">시작하기 →</span>
          </div>
        </div>
      </a>
    {/each}
  </div>
  <p>Visit <a href={resolve('/rules')}> rules</a> to read the rules</p>
</div>

<style>
  .page {
    --color-bg: #e8f3fa;
    --color-ink: #2b1810;
    --color-choco: #6b4226;
    --color-choco-dark: #4a2c1a;
    --color-poison: #e63946;
    --color-mint: #3aafa9;
    --color-sun: #ffb627;
    --color-cream: #fff6e9;

    background: var(--color-bg);
    color: var(--color-ink);
    font-family: 'Noto Sans KR', system-ui, sans-serif;
    min-height: 100dvh;
    padding: 2.5rem 1.25rem 4rem;
    box-sizing: border-box;
  }

  .hero {
    text-align: center;
    max-width: 640px;
    margin: 0 auto 2.5rem;
  }

  .eyebrow {
    font-weight: 700;
    font-size: 0.8rem;
    letter-spacing: 0.08em;
    color: var(--color-mint);
    margin: 0 0 0.6rem;
  }

  .hero h1 {
    font-family: 'Do Hyeon', 'Noto Sans KR', sans-serif;
    font-weight: 400;
    font-size: clamp(1.8rem, 5vw, 2.6rem);
    color: var(--color-choco-dark);
    margin: 0 0 0.6rem;
  }

  .hero-sub {
    margin: 0;
    font-size: 1rem;
    color: var(--color-choco);
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 2rem;
    max-width: 760px;
    margin: 0 auto;
  }

  .mode-card {
    position: relative;
    display: block;
    aspect-ratio: 3 / 4;
    text-decoration: none;
    color: inherit;
    perspective: 1200px;
    border-radius: 20px;
  }

  .mode-card:focus-visible {
    outline: 3px solid var(--color-sun);
    outline-offset: 4px;
  }

  .badge {
    position: absolute;
    top: -0.6rem;
    left: 1rem;
    z-index: 2;
    background: var(--color-sun);
    color: var(--color-choco-dark);
    font-family: 'Do Hyeon', sans-serif;
    font-size: 0.8rem;
    padding: 0.25rem 0.75rem;
    border-radius: 999px;
    box-shadow: 0 2px 0 rgba(74, 44, 26, 0.3);
  }

  .card-inner {
    position: relative;
    width: 100%;
    height: 100%;
    transform-style: preserve-3d;
    transition: transform 0.6s cubic-bezier(0.4, 0.2, 0.2, 1);
  }

  .mode-card:hover .card-inner,
  .mode-card:focus-visible .card-inner,
  .mode-card.flipped .card-inner {
    transform: rotateY(180deg);
  }

  .card-face {
    position: absolute;
    inset: 0;
    backface-visibility: hidden;
    border-radius: 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 1.25rem;
    box-shadow: 0 6px 0 rgba(74, 44, 26, 0.15);
  }

  .card-front {
    background: var(--color-choco);
    color: white;
  }

  .mode-card.featured .card-front {
    background: var(--color-choco-dark);
    border: 3px solid var(--color-sun);
  }

  .card-emoji {
    font-size: 3.6rem;
    margin-bottom: 0.75rem;
  }

  .card-title {
    font-family: 'Do Hyeon', 'Noto Sans KR', sans-serif;
    font-weight: 400;
    font-size: 1.6rem;
    margin: 0 0 0.4rem;
  }

  .card-tagline {
    margin: 0;
    font-size: 0.95rem;
    opacity: 0.85;
  }

  .card-back {
    background: var(--color-cream);
    color: var(--color-choco-dark);
    border: 2px solid var(--color-choco);
    transform: rotateY(180deg);
    gap: 0.75rem;
  }

  .card-desc {
    margin: 0;
    font-size: 0.95rem;
    line-height: 1.6;
  }

  .card-cta {
    font-family: 'Do Hyeon', 'Noto Sans KR', sans-serif;
    font-size: 1.1rem;
    color: var(--color-mint);
  }

  @media (max-width: 480px) {
    .grid {
      grid-template-columns: 1fr;
      max-width: 340px;
    }
    .mode-card {
      aspect-ratio: 16 / 10;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .card-inner {
      transition: none;
    }
  }
</style>