<script lang="ts">
  import { scale } from 'svelte/transition';
  import { SvelteSet } from 'svelte/reactivity';
  import type { BoardState, Pos, Quadrant, Tile } from '../types';
  import { computeSelection } from '../engine';

  let {
    board,
    disabled = false,
    lastRemoved = [],
    aiMove = null,
    onMove
  }: {
    board: BoardState;
    disabled?: boolean;
    lastRemoved?: Pos[];
    aiMove?: { anchor: Pos; quadrant: Quadrant } | null;
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

  function directionArrow(q: Quadrant): string {
    return DIRECTIONS.find((d) => d.quadrant === q)?.arrow ?? '↘';
  }

  function directionLabel(q: Quadrant): string {
    return DIRECTIONS.find((d) => d.quadrant === q)?.label ?? '';
  }

  let selectedAnchor = $state<Pos | null>(null);
  let selectedQuadrant = $state<Quadrant>('se');

  let previewSet = $derived.by(() => {
    if (!selectedAnchor) return new SvelteSet<string>();
    const cells = computeSelection(board, selectedAnchor, selectedQuadrant);
    return new SvelteSet(cells.map((p) => `${p.r}-${p.c}`));
  });

  let lastRemovedSet = $derived(new SvelteSet(lastRemoved.map((p) => `${p.r}-${p.c}`)));

  // AI가 실제로 "먹은"(죽어있는) 칸만 X 마커 대상. 재생 예정 칸은 별도 ghost UI가 이미 있으므로 제외.
  let eatenMarks = $derived(
    lastRemoved.filter((p) => {
      const t = board.tiles[p.r]?.[p.c];
      return t && !t.alive && !(t.isRegrowth && t.regrowAt !== null);
    })
  );

  // 💡 그리드 트랙에 전혀 관여하지 않는 절대좌표(%) 계산. rows/cols 어떤 값이어도 항상 안전.
  function cellCenterPercent(r: number, c: number): { left: number; top: number } {
    const left = ((c + 0.5) / board.cols) * 100;
    const top = ((r + 0.5) / board.rows) * 100;
    return { left, top };
  }

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
  <div class="board-viewport">
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

      <!-- 💡 그리드 트랙과 완전히 분리된 절대좌표 오버레이 레이어. 레이아웃에 영향 없음. -->
      <div class="marker-layer" aria-hidden="true">
        {#each eatenMarks as p (`eat-${p.r}-${p.c}`)}
          {@const pos = cellCenterPercent(p.r, p.c)}
          <span class="eaten-mark-x" style="left:{pos.left}%; top:{pos.top}%;">✕</span>
        {/each}

        {#if aiMove}
          {@const pos = cellCenterPercent(aiMove.anchor.r, aiMove.anchor.c)}
          <span class="ai-move-badge" style="left:{pos.left}%; top:{pos.top}%;">
            {directionArrow(aiMove.quadrant)}
          </span>
        {/if}
      </div>
    </div>
  </div>

  <div class="control-bar">
    {#if aiMove}
      <p class="ai-move-caption">
        🤖 AI: {aiMove.anchor.r + 1}행 {aiMove.anchor.c + 1}열 · {directionLabel(aiMove.quadrant)}
        {directionArrow(aiMove.quadrant)}
      </p>
    {/if}

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
    flex-direction: row;
    align-items: flex-start;
    justify-content: center;
    gap: 1.5rem;
    width: 100%;
  }

  /* 💡 대형 보드가 와도 깨지지 않고 가로 스크롤을 지원하는 뷰포트 레이어 */
  .board-viewport {
    flex: 0 1 auto;
    max-width: 100%;
    overflow-x: auto;
    overflow-y: hidden;
    display: flex;
    justify-content: flex-start;
    padding: 12px 0;
    box-sizing: border-box;
    -webkit-overflow-scrolling: touch;
  }

  /* 💡 너비/높이를 고정하는 대신 조각 수에 따라 자동으로 팽창하도록 변경 */
  .chocolate-board {
    display: grid;
    /* 💡 조각 하나의 크기를 54px 고정형태로 지정하여 찌그러짐 원천 차단 */
    grid-template-columns: repeat(var(--cols), 54px);
    grid-template-rows: repeat(var(--rows), 54px);
    gap: 8px;
    background: #3d2314;
    padding: 18px;
    border-radius: 16px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5), inset 0 0 20px rgba(0, 0, 0, 0.4);
    width: max-content;
    height: max-content;
    box-sizing: border-box;
    flex-shrink: 0;
    position: relative;
  }

  .hole {
    width: 100%;
    height: 100%;
  }

  .choco-piece {
    width: 100%;
    height: 100%;
    /* 💡 완벽한 정사각형 비율 유지 */
    aspect-ratio: 1 / 1;
    border: none;
    font-family: inherit;
    border-radius: 8px;
    background: #7a4c2d;
    box-shadow: 0 5px 0 #54341e, 0 6px 12px rgba(0, 0, 0, 0.35);
    display: grid;
    place-items: center;
    padding: 4px;
    box-sizing: border-box;
    cursor: pointer;
    position: relative;
    transition: transform 0.1s, box-shadow 0.1s, opacity 0.3s ease-out, background 0.15s;
  }

  .choco-piece:hover:not(:disabled) {
    transform: translateY(-2px);
    filter: brightness(1.1);
  }

  .choco-piece:active:not(:disabled) {
    transform: translateY(3px);
    box-shadow: 0 2px 0 #54341e;
  }

  .choco-piece:disabled {
    cursor: default;
  }

  .choco-piece.is-poison {
    background: #9d3a3a;
    box-shadow: 0 5px 0 #6e2525, 0 6px 12px rgba(0, 0, 0, 0.35);
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
    box-shadow: 0 9px 0 #54341e, 0 0 0 3px #ffb703, 0 10px 16px rgba(0, 0, 0, 0.4);
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
    box-shadow: inset 0 4px 6px rgba(0, 0, 0, 0.25);
    /* 💡 조각 크기가 고정이므로 폰트 크기도 가독성이 뛰어난 고정값(1.45rem)으로 매칭 */
    font-size: 1.45rem;
  }

  .crack-badge {
    position: absolute;
    bottom: -1px;
    right: -1px;
    font-size: 0.55em;
    line-height: 1;
    background: #1a0f0a;
    border-radius: 999px;
    padding: 0.15em 0.25em;
  }

  .deco-indent {
    width: 45%;
    height: 45%;
    border: 2px solid rgba(0, 0, 0, 0.18);
    border-radius: 3px;
    background: rgba(0, 0, 0, 0.05);
  }

  .regrow-ghost {
    position: relative;
    display: grid;
    place-items: center;
    width: 100%;
    height: 100%;
  }

  .regrow-ghost .ghost-icon {
    font-size: 1.2rem;
    opacity: 0.35;
    filter: grayscale(50%);
  }

  .regrow-ghost .regrow-count {
    position: absolute;
    bottom: 1px;
    right: 1px;
    min-width: 1.2em;
    text-align: center;
    background: #1a0f0a;
    color: #fff6e9;
    font-size: 0.65rem;
    line-height: 1.4;
    border-radius: 999px;
    padding: 0 0.3em;
  }

  /* 💡 그리드 트랙과 완전히 분리된 절대좌표 오버레이. width/height 100%로 chocolate-board 위에만 얹힘 */
  .marker-layer {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 5;
  }

  .eaten-mark-x {
    position: absolute;
    transform: translate(-50%, -50%);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    font-size: 0.7rem;
    line-height: 1;
    color: #ffb4a8;
    background: rgba(20, 10, 5, 0.6);
    border-radius: 999px;
    animation: eatenFade 1.1s ease forwards;
  }

  @keyframes eatenFade {
    0% {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1);
    }
    100% {
      opacity: 0;
      transform: translate(-50%, -50%) scale(0.7);
    }
  }

  /* 💡 AI가 고른 칸 중심에 뜨는 작은 방향 뱃지 */
  .ai-move-badge {
    position: absolute;
    transform: translate(-50%, -50%);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    font-size: 0.7rem;
    line-height: 1;
    color: #1a0f0a;
    background: #ffb703;
    border-radius: 999px;
    box-shadow: 0 0 6px rgba(255, 183, 3, 0.8);
    animation: badgePulse 1s ease-in-out infinite;
  }

  @keyframes badgePulse {
    0%, 100% {
      opacity: 0.75;
      transform: translate(-50%, -50%) scale(0.95);
    }
    50% {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1.1);
    }
  }

  .control-bar {
    background: rgba(82, 50, 28, 0.25);
    border: 1px solid rgba(255, 246, 233, 0.08);
    border-radius: 12px;
    backdrop-filter: blur(8px);
    padding: 1.1rem 1.5rem;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
    flex: 0 1 300px;
    min-width: 240px;
    box-sizing: border-box;
  }

  .ai-move-caption {
    margin: 0;
    font-size: 0.78rem;
    color: #ffb703;
    background: rgba(255, 183, 3, 0.08);
    border: 1px solid rgba(255, 183, 3, 0.22);
    border-radius: 8px;
    padding: 0.4rem 0.6rem;
    text-align: center;
    line-height: 1.4;
  }

  .control-body {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    width: 100%;
  }

  .control-body.tutorial-body {
    align-items: center;
  }

  .direction-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;
    width: 100%;
  }

  .action-col {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    width: 100%;
  }

  .control-body.tutorial-body .action-col {
    max-width: 260px;
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

  /* 💡 좁은 화면에서는 보드 위 / 컨트롤 아래로 스택 */
  @media (max-width: 860px) {
    .chomp-board-wrap {
      flex-direction: column;
      align-items: center;
    }

    .board-viewport {
      width: 100%;
      justify-content: center;
    }

    .control-bar {
      width: 100%;
      max-width: 560px;
      flex: 0 1 auto;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .choco-piece {
      transition: none;
      animation: none;
    }
    .eaten-mark-x,
    .ai-move-badge {
      animation: none;
    }
  }
</style>