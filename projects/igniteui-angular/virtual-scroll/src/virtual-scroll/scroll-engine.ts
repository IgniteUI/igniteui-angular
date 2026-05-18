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
 * Builds a prefix sums array from the given sizes array.
 * The prefix sums array has one more element than the sizes array,
 * where the first element is 0 and each subsequent element is the sum of all previous sizes.
 * This allows for efficient calculation of the total size up to any index in the sizes array.
 */
function buildPrefixSums(sizes: readonly number[]): number[] {
  const sums = new Array<number>(sizes.length + 1);
  sums[0] = 0;
  for (let i = 0; i < sizes.length; i++) {
    sums[i + 1] = sums[i] + sizes[i];
  }
  return sums;
}

/**
 * Performs a binary search on the prefix sums array to find the largest index such that prefixSums[index] <= target.
 * This is used to efficiently determine how many items can fit within a given scroll position.
 * The function returns the index of the last item that fits within the target scroll position.
 * If the target is smaller than the first prefix sum, it returns -1, indicating that no items fit.
 */
function binarySearchPrefixSums(
  prefixSums: readonly number[],
  target: number,
): number {
  let low = 0;
  let high = prefixSums.length - 1;

  while (low < high) {
    const mid = (low + high + 1) >> 1;
    if (prefixSums[mid] <= target) {
      low = mid;
    } else {
      high = mid - 1;
    }
  }

  return Math.max(0, low - 1);
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

  /** Per-item measured or estimated sizes in px. */
  private readonly _itemSizes = signal<number[]>([]);

  /**
   * Prefix-sum array of item sizes, where prefixSums[i] is the total size of items[0] through items[i-1].
   */
  public readonly prefixSums = computed<number[]>(() =>
    buildPrefixSums(this._itemSizes()),
  );

  /** Total virtual size of all items in px. */
  public readonly totalSize = computed<number>(() => {
    const pSum = this.prefixSums();
    return pSum[pSum.length - 1] ?? 0;
  });

  /** Actual DOM space size (clamped to the maximum browser size) */
  public readonly domSize = computed<number>(() =>
    this._virtualRatio !== 1 ? this._maxBrowserSize : this.totalSize(),
  );

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
    const current = this._itemSizes();
    if (length === current.length) return;

    const next = current.slice(0, length);
    while (next.length < length) {
      next.push(estimatedSize);
    }
    this._itemSizes.set(next);
    this._updateVirtualRatio();
  }

  /**
   * Records the measured DOM size for a single item.
   * Triggers a signal update so all downstream computed values react.
   */
  public measureItem(index: number, size: number): void {
    const current = this._itemSizes();
    if (index < 0 || index >= current.length) return;
    if (current[index] === size) return;

    const next = current.slice();
    next[index] = size;
    this._itemSizes.set(next);
    this._updateVirtualRatio();
  }

  /**
   * Returns the DOM scroll offset in pixels that brings item at `index` into view
   * at the leading edge of the viewport.
   */
  public getScrollOffsetForIndex(index: number): number {
    const pSums = this.prefixSums();
    if (index <= 0) return 0;

    const clamped = Math.min(index, pSums.length - 1);
    const virtualOffset = pSums[clamped];
    return virtualOffset / this._virtualRatio;
  }

  /** Returns the item index at the given DOM scroll position. */
  public getIndexAtScroll(scrollPosition: number): number {
    const virtualPosition = scrollPosition * this._virtualRatio;
    const pSum = this.prefixSums();
    if (virtualPosition <= 0 || pSum.length <= 1) return 0;

    return binarySearchPrefixSums(pSum, virtualPosition);
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
    const endScrollPosition = scrollPosition + viewportSize;
    const endRaw = this.getIndexAtScroll(endScrollPosition);
    const end = Math.min(totalItems - 1, endRaw + overScan);

    return { startIndex: start, endIndex: end };
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
    const pSums = this.prefixSums();
    if (index <= 0) return 0;

    const clamped = Math.min(index, pSums.length - 1);
    const virtualOffset = pSums[clamped];
    return virtualOffset / this._virtualRatio;
  }

  private _updateVirtualRatio(): void {
    const totalSize = this.totalSize();
    this._virtualRatio =
      this._maxBrowserSize === Infinity || totalSize <= this._maxBrowserSize
        ? 1
        : totalSize / this._maxBrowserSize;
  }
}
