<script lang="ts">
  type Crumb = {
    id: number;
    x: number;
    y: number;
    size: number;
    dx: number;
    dy: number;
    duration: number;
    rotate: number;
  };

  let { active = false }: { active?: boolean } = $props();

  let visible = $state(false);
  let phase = $state<'enter' | 'hold' | 'exit'>('enter');
  let logoEl: HTMLDivElement | undefined = $state();
  let crumbs = $state<Crumb[]>([]);
  let nextCrumbId = 0;

  const MIN_VISIBLE_MS = 850; // 너무 짧게 반짝하고 사라지지 않도록 하는 최소 노출 시간
  const EXIT_MS = 700; // 부서지는 연출 + 페이드아웃에 걸리는 시간

  let shownAt = 0;
  let pendingHide: ReturnType<typeof setTimeout> | undefined;
  let enterTimer: ReturnType<typeof setTimeout> | undefined;

  $effect(() => {
    if (active) {
      clearTimeout(pendingHide);
      clearTimeout(enterTimer);
      visible = true;
      phase = 'enter';
      shownAt = Date.now();
      enterTimer = setTimeout(() => {
        if (phase === 'enter') phase = 'hold';
      }, 500);
    } else if (visible && phase !== 'exit') {
      const elapsed = Date.now() - shownAt;
      const wait = Math.max(MIN_VISIBLE_MS - elapsed, 0);
      pendingHide = setTimeout(startExit, wait);
    }

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(pendingHide);
    };
  });

  function startExit() {
    phase = 'exit';
    spawnCrumbs();
    setTimeout(() => {
      visible = false;
      crumbs = [];
    }, EXIT_MS);
  }

  function spawnCrumbs() {
    if (!logoEl) return;
    const rect = logoEl.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const made: Crumb[] = [];
    for (let i = 0; i < 24; i++) {
      const angle = Math.random() * Math.PI * 2;
      const velocity = Math.random() * 150 + 50;
      made.push({
        id: nextCrumbId++,
        x: centerX,
        y: centerY,
        size: Math.random() * 8 + 4,
        dx: Math.cos(angle) * velocity,
        dy: Math.sin(angle) * velocity + 100,
        duration: Math.random() * 500 + 400,
        rotate: Math.random() * 360
      });
    }
    crumbs = made;
  }

  function removeCrumb(id: number) {
    crumbs = crumbs.filter((c) => c.id !== id);
  }

  // 부스러기 하나가 화면에 나타나는 순간 딱 한 번 날아가는 애니메이션을 재생하는 액션.
  // DOM 노드를 직접 만들거나 붙이지 않고, 이미 Svelte가 렌더링한 노드에 애니메이션만 건다.
  function flyAway(node: HTMLElement, crumb: Crumb) {
    const anim = node.animate(
      [
        { transform: 'translate(0,0) scale(1) rotate(0deg)', opacity: 1 },
        {
          transform: `translate(${crumb.dx}px, ${crumb.dy}px) scale(0) rotate(${crumb.rotate}deg)`,
          opacity: 0
        }
      ],
      { duration: crumb.duration, easing: 'cubic-bezier(0.1,0.8,0.3,1)' }
    );
    anim.onfinish = () => removeCrumb(crumb.id);

    return {
      destroy() {
        anim.cancel();
      }
    };
  }
</script>

{#if visible}
  <div class="loading-container" class:exit={phase === 'exit'}>
    <span class="sr-only" role="status">페이지를 불러오는 중입니다</span>
    <div class="logo-wrap" class:shatter={phase === 'exit'} bind:this={logoEl}>
      <div class="part left-part">
        <span class="char">C</span>
        <span class="char">H</span>
        <span class="char">O</span>
      </div>

      <div class="part right-part">
        <span class="char">M</span>
        <span class="char">P</span>
        <span class="char">!</span>
      </div>
    </div>

    {#each crumbs as crumb (crumb.id)}
      <div
        class="crumb"
        style="left:{crumb.x}px; top:{crumb.y}px; width:{crumb.size}px; height:{crumb.size}px;"
        use:flyAway={crumb}
      ></div>
    {/each}
  </div>
{/if}

<style>
  @import url('https://fonts.googleapis.com/css2?family=Oi&display=swap');

  .loading-container {
    --milk-chocolate: #6b4226;
    --dark-chocolate: #4a2c1a;
    --bg-color: #fff6e9;

    position: fixed;
    inset: 0;
    background-color: var(--bg-color);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
    overflow: hidden;
    transition: opacity 0.35s ease 0.35s;
  }

  .loading-container.exit {
    opacity: 0;
    pointer-events: none;
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
  }

  .logo-wrap {
    display: flex;
    font-family: 'Oi', serif;
    font-size: clamp(2.5rem, 8vw, 5rem);
    color: var(--milk-chocolate);
    text-shadow: 3px 5px 0px var(--dark-chocolate);
    user-select: none;
  }

  .part {
    display: flex;
    transition: transform 0.4s cubic-bezier(0.25, 1, 0.5, 1);
  }

  .char {
    display: inline-block;
    opacity: 0;
    transform: scale(0.3) translateY(50px);
    animation: popIn 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
  }

  .left-part .char:nth-child(1) { animation-delay: 0.05s; }
  .left-part .char:nth-child(2) { animation-delay: 0.15s; }
  .left-part .char:nth-child(3) { animation-delay: 0.25s; }
  .right-part .char:nth-child(1) { animation-delay: 0.35s; }
  .right-part .char:nth-child(2) { animation-delay: 0.45s; }
  .right-part .char:nth-child(3) { animation-delay: 0.55s; }

  @keyframes popIn {
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }

  .logo-wrap.shatter .left-part {
    transform: translateX(-30px) translateY(20px) rotate(-15deg);
  }
  .logo-wrap.shatter .right-part {
    transform: translateX(30px) translateY(25px) rotate(12deg);
  }

  .crumb {
    position: absolute;
    background-color: #6b4226;
    border-radius: 2px;
    pointer-events: none;
    box-shadow: 1px 2px 0px #4a2c1a;
  }

  @media (prefers-reduced-motion: reduce) {
    .char, .part, .loading-container {
      animation: none !important;
      transition: none !important;
    }
  }
</style>