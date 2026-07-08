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

  function tileEmoji(t: Tile): string {
    if (t.isPoison) return '☠️';
    if (t.isBomb) return '💣';
    if (t.isBlackhole) return '🕳️';
    if (t.linkId !== null) return '🔗';
    if (t.isRegrowth) return '🌱';
    if (t.rangeLimit !== null) return '📏';
    if (t.isIce) return t.hp >= 2 ? '🧊' : '🧊💔';
    return '🍫';
  }
</script>

<div class="chomp-board-wrap">
  <div
    class="chomp-board"
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
            class="cell"
            class:preview={t.alive && previewSet.has(`${r}-${c}`)}
            class:just-removed={lastRemovedSet.has(`${r}-${c}`)}
            class:poison={t.isPoison}
            class:dead={!t.alive}
            class:selected={selectedAnchor?.r === r && selectedAnchor?.c === c}
            disabled={disabled || !t.alive}
            tabindex={t.alive && !disabled ? 0 : -1}
            aria-label={t.isPoison ? '독약 조각' : `초콜릿 조각 ${r + 1}행 ${c + 1}열`}
            onclick={() => selectCell({ r, c })}
            onkeydown={(e) => handleKey(e, { r, c })}
          >
            {#if t.alive}
              <span class="piece" transition:scale={{ duration: 200 }}>{tileEmoji(t)}</span>
            {/if}
          </button>
        {/if}
      {/each}
    {/each}
  </div>

  {#if selectedAnchor}
    <div class="direction-panel">
      {#if !board.isTutorial}
        <p class="direction-hint">어느 방향으로 촘프할까요?</p>
        <div class="direction-grid">
          {#each DIRECTIONS as d (d.quadrant)}
            <button
              type="button"
              class="direction-btn"
              class:active={selectedQuadrant === d.quadrant}
              onclick={() => chooseDirection(d.quadrant)}
            >
              <span class="arrow">{d.arrow}</span>
              <span class="dir-label">{d.label}</span>
            </button>
          {/each}
        </div>
      {/if}
      <div class="panel-actions">
        <button type="button" class="cancel-btn" onclick={cancelSelection}>취소</button>
        <button type="button" class="confirm-btn" onclick={confirmMove}>촘프하기! 🍫</button>
      </div>
    </div>
  {/if}
</div>

<style>
  .chomp-board-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .chomp-board {
    display: grid;
    grid-template-columns: repeat(var(--cols), 1fr);
    gap: 10px;
    max-width: min(96vw, calc(var(--cols) * 5.8rem));
    margin: 0 auto;
  }

  .hole {
    aspect-ratio: 1;
  }

  .cell {
    aspect-ratio: 1;
    border: none;
    font-family: inherit;
    border-radius: 14px;
    background: var(--color-choco, #6b4226);
    display: grid;
    place-items: center;
    font-size: clamp(1.8rem, 5.5vw, 2.6rem);
    cursor: pointer;
    padding: 0;
    transition: background 0.15s, transform 0.15s;
  }

  .cell:disabled {
    cursor: default;
  }

  .cell.dead {
    background: transparent;
  }

  .cell.preview {
    background: rgba(58, 175, 169, 0.55);
    outline: 3px dashed var(--color-mint, #3aafa9);
    outline-offset: -3px;
  }

  .cell.selected {
    transform: translateY(-3px) scale(1.05);
    box-shadow: 0 4px 0 rgba(74, 44, 26, 0.35);
  }

  .cell.poison {
    background: var(--color-poison, #e63946);
  }

  .cell.just-removed {
    animation: flash 0.4s ease;
  }

  .cell:focus-visible {
    outline: 3px solid var(--color-sun, #ffb627);
    outline-offset: 2px;
  }

  @keyframes flash {
    0% {
      background: var(--color-sun, #ffb627);
    }
  }

  .direction-panel {
    background: var(--color-cream, #fff6e9);
    border: 2px solid var(--color-choco, #6b4226);
    border-radius: 18px;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    max-width: 320px;
    width: 100%;
  }

  .direction-hint {
    margin: 0;
    font-size: 0.9rem;
    color: var(--color-choco-dark, #4a2c1a);
    font-weight: 700;
  }

  .direction-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;
    width: 100%;
  }

  .direction-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.15rem;
    border: 2px solid var(--color-choco, #6b4226);
    background: white;
    border-radius: 12px;
    padding: 0.5rem;
    cursor: pointer;
    font-family: inherit;
  }

  .direction-btn.active {
    background: var(--color-mint, #3aafa9);
    color: white;
    border-color: var(--color-mint, #3aafa9);
  }

  .direction-btn .arrow {
    font-size: 1.4rem;
  }

  .direction-btn .dir-label {
    font-size: 0.7rem;
  }

  .panel-actions {
    display: flex;
    gap: 0.5rem;
    width: 100%;
  }

  .cancel-btn,
  .confirm-btn {
    flex: 1;
    border: none;
    border-radius: 999px;
    padding: 0.6rem 1rem;
    font-weight: 700;
    font-family: inherit;
    cursor: pointer;
  }

  .cancel-btn {
    background: #e5d9c8;
    color: var(--color-choco-dark, #4a2c1a);
  }

  .confirm-btn {
    background: var(--color-sun, #ffb627);
    color: var(--color-choco-dark, #4a2c1a);
  }

  @media (prefers-reduced-motion: reduce) {
    .cell {
      transition: none;
      animation: none;
    }
  }
</style>