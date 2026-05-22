import { computed, signal } from "@angular/core";

const MAX_BROWSER_SIZE_PROBE_PX = Number.MAX_SAFE_INTEGER;

/**
 * Probes the browser for the maximum scrollable coordinate it supports.
 */
function getMaxBrowserSizeProbePx(doc: Document): number {
  const div = doc.createElement("div");
  div.style.position = "absolute";
  div.style.top = `${MAX_BROWSER_SIZE_PROBE_PX}px`;
  doc.body.appendChild(div);
  const size = Math.abs(div.getBoundingClientRect().top);
  doc.body.removeChild(div);
  return size;
}

/**
 * Binary Indexed Tree over item sizes.
 *
 * Replaces the previous O(N) full prefix-sum rebuild that occurred on every
 * `measureItem` call. All hot-path operations are now O(log N):
 *   - Point update (item measured)  : O(log N)
 *   - Prefix sum (scroll offset)    : O(log N)
 *   - Index at offset (scroll -> item) : O(log N) via binary lifting
 */
class BIT {
  public readonly length: number;

  /** 1-indexed BIT; each cell holds a partial range sum. */
  private readonly _tree: Float64Array;

  /** Raw per-item sizes (0-indexed) — kept for O(1) reads and delta calc. */
  private readonly _sizes: Float64Array;

  /** Running total maintained alongside tree updates in O(1). */
  private _total: number;

  constructor(length: number, fillSize: number) {
    this.length = length;
    this._sizes = new Float64Array(length).fill(fillSize);
    this._tree = new Float64Array(length + 1);
    this._total = length * fillSize;

    // O(N) build (vs O(N log N) for N individual insertions)
    for (let i = 1; i <= length; i++) {
      this._tree[i] += fillSize;
      const j = i + (i & -i);
      if (j <= length) {
        this._tree[j] += this._tree[i];
      }
    }
  }

  /** Total size of all items. O(1). */
  public get totalSize(): number {
    return this._total;
  }

  /**
   * Prefix sum of items [0, i) — the virtual scroll offset at the leading
   * edge of item i. O(log N).
   */
  public prefixSum(i: number): number {
    let sum = 0;
    for (let j = i; j > 0; j -= j & -j) {
        sum += this._tree[j];
    }
    return sum;
  }

  /**
   * Update the size of item at 0-based index.
   * Returns true when the size actually changed. O(log N).
   */
  public update(index: number, newSize: number): boolean {
    if (index < 0 || index >= this.length) return false;

    const old = this._sizes[index];
    if (old === newSize) return false;

    const delta = newSize - old;
    this._sizes[index] = newSize;
    this._total += delta;
    for (let i = index + 1; i <= this.length; i += i & -i) {
      this._tree[i] += delta;
    }
    return true;
  }

  /**
   * Returns a new BIT of `newLength` items.
   * Existing measured sizes are preserved up to `min(this.length, newLength)`;
   * new slots are filled with `fillSize`. Rebuilds the BIT in O(N).
   */
  public cloneResized(newLength: number, fillSize: number): BIT {
    const next = new BIT(newLength, fillSize);
    const copyLen = Math.min(this.length, newLength);

    // Copy raw sizes from the old tree.
    next._sizes.set(this._sizes.subarray(0, copyLen));

    // Rebuild BIT and total from scratch in O(N).
    next._tree.fill(0);
    next._total = 0;
    for (let i = 1; i <= newLength; i++) {
      next._tree[i] += next._sizes[i - 1];
      next._total += next._sizes[i - 1];
      const j = i + (i & -i);
      if (j <= newLength) {
        next._tree[j] += next._tree[i];
      }
    }
    return next;
  }

  /**
   * Returns the 0-based index of the last item whose cumulative end offset
   * is ≤ the given scroll offset (binary lifting on the internal tree).
   * O(log N) — semantics are identical to the previous binarySearchPrefixSums
   * result so `getVisibleRange` / overscan logic is unchanged.
   */
  public findIndexAtOffset(offset: number): number {
    if (offset <= 0 || this.length === 0) return 0;

    let idx = 0;
    for (
      let bit = 1 << (31 - Math.clz32(this.length));
      bit > 0;
      bit >>= 1
    ) {
      const next = idx + bit;
      if (next <= this.length && this._tree[next] <= offset) {
        idx = next;
        offset -= this._tree[idx];
      }
    }
    return Math.max(0, idx - 1);
  }
}

/**
 * Describes the currently visible (and over-scanned) range of items.
 */
export interface VisibleRange {
  /** Index of the first rendered item (inclusive) */
  startIndex: number;
  /** Index of the last rendered item (inclusive) */
  endIndex: number;
}

/**
 * Pure scroll-math engine for a single axis of virtual scrolling.
 *
 * Holds all size state as signals so that downstream `computed()` values
 * (visible range, spacer size, translate offset) react automatically
 * whenever item sizes are measured or the item count changes.
 */
export class VirtualScrollEngine {
  private _maxBrowserSize = Infinity;

  /**
   * The ratio `totalSize / maxBrowserSize` when `totalSize` exceeds the
   * maximum DOM coordinate the browser supports; `1` otherwise.
   * Used to map virtual scroll positions to DOM scroll positions.
   */
  private _virtualRatio = 1;

  private _tree: BIT | null = null;

  /**
   * Incremented on every structural change (resize or measurement).
   * Downstream `computed()` values depend on this to stay reactive.
   */
  private readonly _version = signal(0);

  /** Total virtual size of all items in px. */
  public readonly totalSize = computed<number>(() => {
    this._version();
    return this._tree?.totalSize ?? 0;
  });

  /** Actual DOM space size (clamped to the maximum browser size) */
  public readonly domSize = computed<number>(() => {
    // Always read totalSize() to maintain a stable dependency on _version.
    // If we branch on _virtualRatio first and return early, totalSize() is
    // never called in the compression case, so Angular drops the dependency
    // and domSize is frozen forever — subsequent measureItem() calls would
    // never invalidate it.
    const total = this.totalSize();
    return this._virtualRatio !== 1 ? this._maxBrowserSize : total;
  });

  /**
   * Initializes the maximum browser size by probing the document, and updates the virtual ratio accordingly.
   */
  public initMaxBrowserSize(doc: Document): void {
    this._maxBrowserSize = getMaxBrowserSizeProbePx(doc);
    this._updateVirtualRatio();
  }

  /**
   * Grows or shrinks the internal sizes array to `length`.
   * New entries are filled with `estimatedSize`.
   * Existing measured sizes are preserved.
   */
  public resize(length: number, estimatedSize: number): void {
    if (this._tree?.length === length) return;

    this._tree = this._tree
      ? this._tree.cloneResized(length, estimatedSize)
      : new BIT(length, estimatedSize);
    this._updateVirtualRatio();
    this._version.update((v) => v + 1);
  }

  /**
   * Records the measured DOM size for a single item.
   * Triggers a signal update so all downstream computed values react.
   */
  public measureItem(index: number, size: number): void {
    if (!this._tree?.update(index, size)) return;

    this._updateVirtualRatio();
    this._version.update((v) => v + 1);
  }

  /**
   * Returns the DOM scroll offset in pixels that brings item at `index` into view
   * at the leading edge of the viewport.
   */
  public getScrollOffsetForIndex(index: number): number {
    if (!this._tree || index <= 0) return 0;

    const clamped = Math.min(index, this._tree.length);
    return this._tree.prefixSum(clamped) / this._virtualRatio;
  }

  /** Returns the item index at the given DOM scroll position. */
  public getIndexAtScroll(scrollPosition: number): number {
    if (!this._tree || scrollPosition <= 0) return 0;
    return this._tree.findIndexAtOffset(scrollPosition * this._virtualRatio);
  }

  /**
   * Returns the visible + over-scanned item range for the given scroll state.
   */
  public getVisibleRange(
    scrollPosition: number,
    viewportSize: number,
    overScan: number,
    totalItems: number,
  ): VisibleRange {
    if (totalItems === 0 || viewportSize <= 0) {
      return { startIndex: 0, endIndex: -1 };
    }

    const start = Math.max(0, this.getIndexAtScroll(scrollPosition) - overScan);
    const end = Math.min(
      totalItems - 1,
      this.getIndexAtScroll(scrollPosition + viewportSize) + overScan,
    );

    return { startIndex: start, endIndex: end };
  }

  /**
   * Returns the sum of actual measured sizes for items in [startIndex, endIndex].
   * Used by the component to detect when the rendered range overflows `domSize`
   * under coordinate compression (variable heights + large datasets).
   */
  public getPhysicalRangeSize(startIndex: number, endIndex: number): number {
    if (!this._tree) return 0;

    const start = Math.max(0, startIndex);
    const end = Math.min(Math.max(endIndex + 1, start), this._tree.length);
    return this._tree.prefixSum(end) - this._tree.prefixSum(start);
  }

  /**
   * Returns the CSS `translateY` / `translateX` value (px) to apply to the
   * absolutely-positioned content wrapper.
   *
   * The content wrapper is `position: absolute; top: 0; left: 0` inside a
   * track element that is `totalSize` px tall/wide. Translating it to
   * `getContentPosition(startIndex)` places the first rendered item exactly
   * at its virtual scroll position within the track.
   */
  public getContentPosition(index: number): number {
    if (!this._tree || index <= 0) return 0;

    const clamped = Math.min(index, this._tree.length);
    return this._tree.prefixSum(clamped) / this._virtualRatio;
  }

  private _updateVirtualRatio(): void {
    const totalSize = this._tree?.totalSize ?? 0;
    this._virtualRatio =
      this._maxBrowserSize === Infinity || totalSize <= this._maxBrowserSize
        ? 1
        : totalSize / this._maxBrowserSize;
  }
}
