<script lang="ts">
  // Une poignée qu'on tire pour redimensionner un panneau, comme dans VS Code.
  let { axis, value = $bindable(), min, max, invert = false, onEnd }: {
    /** `x` redimensionne une largeur, `y` une hauteur. */
    axis: "x" | "y";
    value: number;
    min: number;
    max: number;
    /** Le panneau grandit quand on tire vers la gauche ou vers le haut. */
    invert?: boolean;
    onEnd?: () => void;
  } = $props();

  let start: { pos: number; value: number } | null = null;

  function down(event: PointerEvent) {
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    start = { pos: axis === "x" ? event.clientX : event.clientY, value };
    document.body.style.cursor = axis === "x" ? "col-resize" : "row-resize";
  }

  function move(event: PointerEvent) {
    if (!start) return;
    const delta = (axis === "x" ? event.clientX : event.clientY) - start.pos;
    value = Math.round(Math.min(max, Math.max(min, start.value + (invert ? -delta : delta))));
  }

  function up() {
    if (!start) return;
    start = null;
    document.body.style.cursor = "";
    onEnd?.();
  }
</script>

<div
  class="splitter {axis}"
  role="separator"
  aria-orientation={axis === "x" ? "vertical" : "horizontal"}
  aria-valuenow={value}
  aria-valuemin={min}
  aria-valuemax={max}
  onpointerdown={down}
  onpointermove={move}
  onpointerup={up}
  onpointercancel={up}
></div>

<style>
  .splitter { position: absolute; z-index: 5; touch-action: none; }
  .splitter::after { content: ""; position: absolute; background: var(--accent); opacity: 0; transition: opacity 0.15s 0.1s; }
  .splitter:hover::after, .splitter:active::after { opacity: 1; }
  .x { top: 0; bottom: 0; right: -3px; width: 6px; cursor: col-resize; }
  .x::after { top: 0; bottom: 0; left: 2px; width: 2px; }
  .y { left: 0; right: 0; top: -3px; height: 6px; cursor: row-resize; }
  .y::after { left: 0; right: 0; top: 2px; height: 2px; }
</style>
