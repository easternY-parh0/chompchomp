<script lang="ts">
  import { scale } from 'svelte/transition';
  import { SvelteSet } from 'svelte/reactivity';
  import type { BoardState, Pos, Quadrant, Tile } from '../types';
  import { computeSelection } from '../engine';

  let {
    board,
    disabled = false,
    lastRemoved = [],
    onMove
  }: {
    board: BoardState;
    disabled?: boolean;
    lastRemoved?: Pos[];
    onMove: (anchor: Pos, quadrant: Quadrant) => void;
  } = $props();

  const rowIndices = $derived(Array.from({ length: board.rows }, (_, i) => i));
  const colIndices = $derived(Array.from({ length: board.cols }, (_, i) => i));

  const DIRECTIONS: { quadrant: Quadrant; arrow: string; label: string }[] = [
    { quadrant: 'nw', arrow: '↖', label: '왼쪽 위' },
    { quadrant: 'ne', arrow: '↗', label: '오른쪽 위' },
    { quadrant: 'sw', arrow: '↙', label: '왼쪽 아래' },
    { quadrant: 'se', arrow: '↘', label: '오른쪽 아래' }
  ];

  let selectedAnchor = $state<Pos | null>(null);
  let selectedQuadrant = $state<Quadrant>('se');

  let previewSet = $derived.by(() => {
    if (!selectedAnchor) return new SvelteSet<string>();
    const cells = computeSelection(board, selectedAnchor, selectedQuadrant);
    return new SvelteSet(cells.map((p) => `${p.r}-${p.c}`));
  });

  let lastRemovedSet = $derived(new SvelteSet(lastRemoved.map((p) => `${p.r}-${p.c}`)));

  function selectCell(pos: Pos) {
    if (disabled) return;
    const t = board.tiles[pos.r][pos.c];
    if (t.hole || !t.alive) return;

    if (selectedAnchor && selectedAnchor.r === pos.r && selectedAnchor.c === pos.c) {
      selectedAnchor = null;
      return;
    }
    selectedAnchor = pos;
    selectedQuadrant = 'se';
  }

  function chooseDirection(q: Quadrant) {
    selectedQuadrant = q;
  }

  function confirmMove() {
    if (!selectedAnchor) return;
    onMove(selectedAnchor, selectedQuadrant);
    selectedAnchor = null;
  }

  function cancelSelection() {
    selectedAnchor = null;
  }

  function handleKey(e: KeyboardEvent, pos: Pos) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    selectCell(pos);
  }

  function tileEmoji(t: Tile): string | null {
    if (t.isPoison) return '☠️';
    if (t.isBomb) return '💣';
    if (t.isBlackhole) return '🕳️';
    if (t.linkId !== null) return '🔗';
    if (t.isRegrowth) return '🌱';
    if (t.isIce) return '🧊';
    return null;
  }

  function regrowCountdown(t: Tile): number {
    if (t.regrowAt === null) return 0;
    return Math.max(t.regrowAt - board.roundCount, 0);
  }

  function selectedLabel(pos: Pos): string {
    return `선택한 조각: ${pos.r + 1}행 ${pos.c + 1}열`;
  }
</script>

<div class="chomp-board-wrap">
  <div
    class="chocolate-board"
    style="--rows:{board.rows}; --cols:{board.cols}"
    role="group"
    aria-label="촘프 보드"
  >
    {#each rowIndices as r (r)}
      {#each colIndices as c (c)}
        {@const t = board.tiles[r][c]}
        {#if t.hole}
          <div class="hole" aria-hidden="true"></div>
        {:else}
          <button
            type="button"
            class="choco-piece"
            class:preview={t.alive && previewSet.has(`${r}-${c}`)}
            class:just-removed={lastRemovedSet.has(`${r}-${c}`)}
            class:is-poison={t.isPoison}
            class:eaten={!t.alive}
            class:regrowing={!t.alive && t.isRegrowth && t.regrowAt !== null}
            class:selected={selectedAnchor?.r === r && selectedAnchor?.c === c}
            disabled={disabled || !t.alive}
            tabindex={t.alive && !disabled ? 0 : -1}
            aria-label={t.isPoison ? '독약 조각' : `초콜릿 조각 ${r + 1}행 ${c + 1}열`}
            onclick={() => selectCell({ r, c })}
            onkeydown={(e) => handleKey(e, { r, c })}
          >
            {#if t.alive}
              {@const glyph = tileEmoji(t)}
              <div class="piece-inner">
                {#if glyph}
                  <span class="piece-glyph" transition:scale={{ duration: 200 }}>{glyph}</span>
                  {#if t.isIce && t.hp === 1}
                    <span class="crack-badge" aria-label="금이 갔어요">💔</span>
                  {/if}
                {:else}
                  <span class="deco-indent"></span>
                {/if}
              </div>
            {:else if t.isRegrowth && t.regrowAt !== null}
              <div class="regrow-ghost" aria-label="{regrowCountdown(t)}라운드 후 재생">
                <span class="ghost-icon">🌱</span>
                <span class="regrow-count">{regrowCountdown(t)}</span>
              </div>
            {/if}
          </button>
        {/if}
      {/each}
    {/each}
  </div>

  <div class="control-bar">
    <p class="control-hint" class:selected-hint={selectedAnchor !== null}>
      {selectedAnchor ? selectedLabel(selectedAnchor) : '🍫 먹고 싶은 조각을 하나 골라보세요'}
    </p>

    <div class="control-body" class:tutorial-body={board.isTutorial}>
      {#if !board.isTutorial}
        <div class="direction-grid">
          {#each DIRECTIONS as d (d.quadrant)}
            <button
              type="button"
              class="direction-btn"
              class:active={selectedAnchor !== null && selectedQuadrant === d.quadrant}
              disabled={selectedAnchor === null}
              onclick={() => chooseDirection(d.quadrant)}
            >
              <span class="arrow">{d.arrow}</span>
              <span class="dir-label">{d.label}</span>
            </button>
          {/each}
        </div>
      {/if}

      <div class="action-col">
        <button type="button" class="confirm-btn" disabled={selectedAnchor === null} onclick={confirmMove}>
          촘프하기! 🍫
        </button>
        <button type="button" class="cancel-btn" disabled={selectedAnchor === null} onclick={cancelSelection}>
          취소
        </button>
      </div>
    </div>
  </div>
</div>

<style>
  .chomp-board-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.25rem;
    width: 100%;
  }

  .chocolate-board {
    display: grid;
    grid-template-columns: repeat(var(--cols), 1fr);
    grid-template-rows: repeat(var(--rows), 1fr);
    gap: 8px;
    background: #3d2314;
    padding: 18px;
    border-radius: 16px;
    box-shadow: 0 30px 60px rgba(0, 0, 0, 0.6), inset 0 0 20px rgba(0, 0, 0, 0.4);
    width: min(92vw, 480px);
    height: min(60vh, 400px);
    box-sizing: border-box;
    margin: 0 auto;
  }

  .hole {
    width: 100%;
    height: 100%;
  }

  .choco-piece {
    width: 100%;
    height: 100%;
    border: none;
    font-family: inherit;
    border-radius: 8px;
    background: #7a4c2d;
    box-shadow: 0 6px 0 #54341e, 0 8px 15px rgba(0, 0, 0, 0.4);
    display: grid;
    place-items: center;
    padding: 4px;
    box-sizing: border-box;
    cursor: pointer;
    position: relative;
    transition: transform 0.1s, box-shadow 0.1s, opacity 0.4s ease-out, background 0.15s;
  }

  .choco-piece:hover:not(:disabled) {
    transform: translateY(-2px);
    filter: brightness(1.1);
  }

  .choco-piece:active:not(:disabled) {
    transform: translateY(4px);
    box-shadow: 0 2px 0 #54341e;
  }

  .choco-piece:disabled {
    cursor: default;
  }

  .choco-piece.is-poison {
    background: #9d3a3a;
    box-shadow: 0 6px 0 #6e2525, 0 8px 15px rgba(0, 0, 0, 0.4);
  }

  .choco-piece.eaten {
    opacity: 0;
    pointer-events: none;
    transform: scale(0.8);
  }

  .choco-piece.regrowing {
    opacity: 1;
    pointer-events: none;
    transform: scale(1);
    background: rgba(255, 246, 233, 0.06);
    box-shadow: inset 0 0 0 1px rgba(255, 246, 233, 0.1);
  }

  .choco-piece.preview {
    outline: 3px dashed #ffb703;
    outline-offset: -3px;
    filter: brightness(1.15);
  }

  .choco-piece.selected {
    transform: translateY(-4px);
    box-shadow: 0 10px 0 #54341e, 0 0 0 3px #ffb703, 0 12px 20px rgba(0, 0, 0, 0.45);
  }

  .choco-piece.just-removed {
    animation: flash 0.4s ease;
  }

  .choco-piece:focus-visible {
    outline: 3px solid #ffb703;
    outline-offset: 2px;
  }

  @keyframes flash {
    0% {
      background: #ffb703;
    }
  }

  .piece-inner {
    position: relative;
    width: 100%;
    height: 100%;
    border-radius: 4px;
    display: grid;
    place-items: center;
    box-shadow: inset 0 4px 8px rgba(0, 0, 0, 0.2);
    font-size: clamp(0.9rem, calc(220px / var(--cols)), 2rem);
  }

  .crack-badge {
    position: absolute;
    bottom: 1px;
    right: 1px;
    font-size: 0.5em;
    line-height: 1;
    background: #1a0f0a;
    border-radius: 999px;
    padding: 0.15em 0.25em;
  }

  .deco-indent {
    width: 40%;
    height: 40%;
    border: 2px solid rgba(0, 0, 0, 0.2);
    border-radius: 2px;
    background: rgba(0, 0, 0, 0.08);
  }

  .regrow-ghost {
    position: relative;
    display: grid;
    place-items: center;
    width: 100%;
    height: 100%;
  }

  .regrow-ghost .ghost-icon {
    font-size: clamp(0.7rem, calc(160px / var(--cols)), 1.5rem);
    opacity: 0.35;
    filter: grayscale(50%);
  }

  .regrow-ghost .regrow-count {
    position: absolute;
    bottom: 2px;
    right: 2px;
    min-width: 1.2em;
    text-align: center;
    background: #1a0f0a;
    color: #fff6e9;
    font-size: 0.7rem;
    line-height: 1.5;
    border-radius: 999px;
    padding: 0 0.35em;
  }

  .control-bar {
    background: rgba(82, 50, 28, 0.25);
    border: 1px solid rgba(255, 246, 233, 0.08);
    border-radius: 12px;
    backdrop-filter: blur(8px);
    padding: 1.1rem 1.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    width: 100%;
    max-width: 560px;
    min-height: 92px;
    justify-content: center;
    box-sizing: border-box;
  }

  .control-body {
    display: flex;
    flex-direction: row;
    align-items: stretch;
    gap: 1.25rem;
    width: 100%;
  }

  .control-body.tutorial-body {
    justify-content: center;
  }

  .direction-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;
    flex: 1 1 55%;
  }

  .action-col {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 0.6rem;
    flex: 1 1 45%;
  }

  .control-body.tutorial-body .action-col {
    flex: 0 1 260px;
  }

  .control-hint {
    margin: 0;
    font-size: 0.95rem;
    color: #fff6e9;
    opacity: 0.75;
    text-align: center;
  }

  .control-hint.selected-hint {
    opacity: 1;
    font-weight: 700;
    color: #ffb703;
  }

  .direction-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.15rem;
    border: 1px solid rgba(255, 246, 233, 0.15);
    background: rgba(255, 246, 233, 0.05);
    color: #fff6e9;
    border-radius: 10px;
    padding: 0.5rem;
    cursor: pointer;
    font-family: inherit;
  }

  .direction-btn.active {
    background: #ffb703;
    color: #1a0f0a;
    border-color: #ffb703;
  }

  .direction-btn .arrow {
    font-size: 1.4rem;
  }

  .direction-btn .dir-label {
    font-size: 0.7rem;
  }

  .cancel-btn,
  .confirm-btn {
    width: 100%;
    border: none;
    border-radius: 8px;
    padding: 0.65rem 1rem;
    font-weight: 700;
    font-family: 'Do Hyeon', inherit;
    cursor: pointer;
    box-sizing: border-box;
  }

  .confirm-btn {
    padding: 0.9rem 1rem;
    font-size: 1.05rem;
  }

  .cancel-btn {
    background: rgba(255, 255, 255, 0.1);
    color: #fff6e9;
  }

  .confirm-btn {
    background: #4ade80;
    color: #1a0f0a;
  }

  .direction-btn:disabled,
  .cancel-btn:disabled,
  .confirm-btn:disabled {
    opacity: 0.35;
    cursor: default;
    filter: grayscale(60%);
  }

  .direction-btn:hover:not(:disabled) {
    border-color: #ffb703;
  }

  .cancel-btn:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.2);
  }

  .confirm-btn:hover:not(:disabled) {
    background: #22c55e;
  }

  @media (prefers-reduced-motion: reduce) {
    .choco-piece {
      transition: none;
      animation: none;
    }
  }
</style>