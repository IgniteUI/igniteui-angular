import { computed, signal } from "@angular/core";
import { clamp } from "igniteui-angular/core";
import type { ScrollAlignment, VisibleRange } from "./types";

/** The maximum scroll coordinate is a per-document constant, so probe once. */
const _maxBrowserSizeCache = new WeakMap<Document, number>();

/** Measures the largest scroll coordinate the browser can represent. */
function probeMaxBrowserSize(doc: Document): number {
  const cached = _maxBrowserSizeCache.get(doc);
  if (cached !== undefined) {
    return cached;
  }

  const container = doc.body ?? doc.documentElement;
  if (!container) {
    return Number.POSITIVE_INFINITY;
  }

  const probe = doc.createElement("div");
  probe.style.position = "absolute";
  probe.style.top = `${Number.MAX_SAFE_INTEGER}px`;
  probe.style.width = "0";
  probe.style.height = "0";
  probe.style.visibility = "hidden";
  container.appendChild(probe);

  // The rect is viewport relative, so add back how far the document is scrolled.
  const scrollOffset = doc.documentElement?.scrollTop ?? 0;
  const size = Math.abs(probe.getBoundingClientRect().top) + scrollOffset;
  container.removeChild(probe);

  _maxBrowserSizeCache.set(doc, size);
  return size;
}

/** The item holds the estimate. */
const UNMEASURED = 0;
/** The item was measured under an older estimate. */
const MEASURED = 1;
/** The item was measured under the current estimate. */
const SAMPLED = 2;

/**
 * Binary Indexed Tree (Fenwick tree) over item sizes. Each hot-path operation
 * is O(log N): point update (item measured), prefix sum (scroll offset), and
 * index at offset (scroll to item, through binary lifting).
 *
 * The tree holds only the measured sizes and the number of measured items.
 * Each unmeasured item counts as `estimate`, so an estimate change is O(1).
 */
class SizeTree {
  public readonly length: number;

  /** The size of each unmeasured item. */
  public estimate: number;

  /** A 1-indexed BIT of the measured sizes. */
  private readonly _sums: Float64Array;

  /** A 1-indexed BIT of the number of measured items. */
  private readonly _counts: Int32Array;

  /** Raw measured sizes, 0-indexed. Kept for O(1) delta calculation. */
  private readonly _sizes: Float64Array;

  /** `UNMEASURED`, `MEASURED` or `SAMPLED` for each item. */
  private readonly _states: Uint8Array;

  private _measuredCount = 0;
  private _measuredTotal = 0;

  /** Count and size sum of the `SAMPLED` items. */
  private _sampleCount = 0;
  private _sampleTotal = 0;

  /**
   * The highest power of two <= `length`, for the binary lifting in
   * `findIndexAtOffset`. Precomputed because that runs on each scroll event.
   */
  private readonly _topBit: number;

  /** Builds the tree in one O(N) pass. Without `states`, no item is measured. */
  constructor(
    length: number,
    estimate: number,
    sizes = new Float64Array(length),
    states = new Uint8Array(length),
  ) {
    this.length = length;
    this.estimate = estimate;
    this._sizes = sizes;
    this._states = states;
    this._sums = new Float64Array(length + 1);
    this._counts = new Int32Array(length + 1);
    this._topBit = length > 0 ? 1 << (31 - Math.clz32(length)) : 0;

    for (let i = 1; i <= length; i++) {
      const state = states[i - 1];

      if (state !== UNMEASURED) {
        const size = sizes[i - 1];
        this._sums[i] += size;
        this._counts[i]++;
        this._measuredCount++;
        this._measuredTotal += size;

        if (state === SAMPLED) {
          this._sampleCount++;
          this._sampleTotal += size;
        }
      }

      const parent = i + (i & -i);
      if (parent <= length) {
        this._sums[parent] += this._sums[i];
        this._counts[parent] += this._counts[i];
      }
    }
  }

  /** Total size of all items. O(1). */
  public get totalSize(): number {
    return (
      this._measuredTotal + (this.length - this._measuredCount) * this.estimate
    );
  }

  /** The average size of the `SAMPLED` items, or `0` if there are none. */
  public get sampleAverage(): number {
    return this._sampleCount > 0 ? this._sampleTotal / this._sampleCount : 0;
  }

  /** Whether each item before `index` is measured. O(log N). */
  public isMeasuredBefore(index: number): boolean {
    let count = 0;
    for (let j = index; j > 0; j -= j & -j) {
      count += this._counts[j];
    }
    return count === index;
  }

  /**
   * Prefix sum of items [0, i): the virtual scroll offset at the leading
   * edge of item i. O(log N).
   */
  public prefixSum(i: number): number {
    let sum = 0;
    let count = 0;
    for (let j = i; j > 0; j -= j & -j) {
      sum += this._sums[j];
      count += this._counts[j];
    }
    return sum + (i - count) * this.estimate;
  }

  /**
   * Sets the size of the item at a 0-based index and marks it `SAMPLED`.
   * Returns true when the size changed. O(log N).
   */
  public update(index: number, size: number): boolean {
    if (index < 0 || index >= this.length) {
      return false;
    }

    const state = this._states[index];
    const isNew = state === UNMEASURED;
    const old = isNew ? 0 : this._sizes[index];
    const delta = size - old;

    this._states[index] = SAMPLED;
    this._sizes[index] = size;
    this._measuredTotal += delta;
    this._sampleTotal += state === SAMPLED ? delta : size;

    if (state !== SAMPLED) {
      this._sampleCount++;
    }
    if (isNew) {
      this._measuredCount++;
    }

    if (isNew || delta !== 0) {
      for (let i = index + 1; i <= this.length; i += i & -i) {
        this._sums[i] += delta;
        if (isNew) {
          this._counts[i]++;
        }
      }
    }

    return size !== (isNew ? this.estimate : old);
  }

  /**
   * Returns a new tree of `newLength` items. Measured sizes are kept up to
   * `min(this.length, newLength, retainCount)`, and the other items are
   * unmeasured. Pass a `retainCount` below the item count when the data
   * behind those indices changed identity. O(N).
   */
  public cloneResized(newLength: number, retainCount = newLength): SizeTree {
    const retained = Math.max(0, Math.min(this.length, newLength, retainCount));
    const sizes = new Float64Array(newLength);
    const states = new Uint8Array(newLength);

    sizes.set(this._sizes.subarray(0, retained));
    states.set(this._states.subarray(0, retained));
    return new SizeTree(newLength, this.estimate, sizes, states);
  }

  /**
   * Starts a new sample: `sampleAverage` then counts only the items measured
   * after this call. O(N).
   */
  public startSample(): void {
    for (let i = 0; i < this.length; i++) {
      if (this._states[i] === SAMPLED) {
        this._states[i] = MEASURED;
      }
    }
    this._sampleCount = 0;
    this._sampleTotal = 0;
  }

  /**
   * Returns the 0-based index of the item containing the scroll `offset`:
   * the largest i where `prefixSum(i) <= offset < prefixSum(i + 1)`. O(log N).
   */
  public findIndexAtOffset(offset: number): number {
    if (offset <= 0 || this.length === 0) {
      return 0;
    }

    let index = 0;
    let remaining = offset;

    for (let bit = this._topBit; bit > 0; bit >>= 1) {
      const next = index + bit;
      if (next > this.length) {
        continue;
      }

      // Node `next` covers the `bit` items after `index`.
      const size = this._sums[next] + (bit - this._counts[next]) * this.estimate;
      if (size <= remaining) {
        index = next;
        remaining -= size;
      }
    }
    return Math.min(this.length - 1, index);
  }
}

/**
 * Pure scroll-math engine for one axis of virtual scrolling. A Fenwick tree
 * holds all size state, exposed through signals so downstream `computed()`
 * values (visible range, spacer size, translate offset) react to any change
 * of item sizes or item count.
 *
 * ### Virtual and DOM coordinates
 *
 * Browsers limit how far an element can scroll. When the total item size is
 * larger than that limit, the engine maps the *virtual* scroll range
 * (`0…totalSize - viewport`) onto the *DOM* scroll range the browser can
 * represent (`0…domSize - viewport`), see `_scrollRanges`. Incoming scroll
 * positions are converted to virtual offsets, outgoing offsets to DOM ones.
 * Items render at their real pixel size, so item sizes are always virtual.
 */
export class VirtualScrollEngine {
  private _maxBrowserSize = Number.POSITIVE_INFINITY;

  private _tree: SizeTree | null = null;

  /** The estimate last given to `resize` or `updateEstimatedSize`. */
  private _configuredEstimate = Number.NaN;

  /** Whether `adaptEstimate` has applied a measured average. */
  private _hasAdaptedEstimate = false;

  /** Bumped on every structural change: resize, measurement or estimate. */
  private readonly _version = signal(0);

  /**
   * Read this from a `computed()` to make it recompute on any size change.
   * `totalSize` and `domSize` already do.
   */
  public readonly version = this._version.asReadonly();

  /** Total virtual size of all items in px. */
  public readonly totalSize = computed<number>(() => {
    this._version();
    return this._tree?.totalSize ?? 0;
  });

  /**
   * Total size in DOM space, clamped to the maximum browser size.
   *
   * Depends on `_version` directly rather than on `totalSize()`. The maximum
   * can change while the total does not (it is probed after the first
   * render), and an unchanged `totalSize` would not propagate.
   */
  public readonly domSize = computed<number>(() => {
    this._version();
    return Math.min(this._tree?.totalSize ?? 0, this._maxBrowserSize);
  });

  /**
   * Probes the document's maximum scroll coordinate and rescales. Notifies,
   * because the probe can only run after the first render, by which point
   * `domSize` has already been read at the uncompressed total.
   */
  public initMaxBrowserSize(doc: Document): void {
    this._maxBrowserSize = probeMaxBrowserSize(doc);
    this._invalidate();
  }

  /**
   * Resizes the internal sizes array to `length`. Measured sizes below
   * `retainCount` are kept, and the other items are unmeasured. Callers that
   * only append can keep the default `retainCount`. Callers whose data
   * changed identity at some index must pass that index, so the stale
   * measurements after it are discarded.
   *
   * Unmeasured items take `estimatedSize`, or keep the adapted average while
   * `estimatedSize` is unchanged.
   */
  public resize(
    length: number,
    estimatedSize: number,
    retainCount = length,
  ): void {
    if (this._tree?.length === length && retainCount >= length) {
      return;
    }

    this._tree =
      this._tree?.cloneResized(length, retainCount) ??
      new SizeTree(length, estimatedSize);

    if (this._configureEstimate(estimatedSize)) {
      this._tree.estimate = estimatedSize;
    }
    this._invalidate();
  }

  /** Records the measured DOM size for a single item. */
  public measureItem(index: number, size: number): void {
    if (this._tree?.update(index, size)) {
      this._invalidate();
    }
  }

  /**
   * Applies a new estimate to every item not yet measured in the DOM. Use
   * this when `estimatedItemSize` changes but the item count does not,
   * because `resize` is then a no-op.
   */
  public updateEstimatedSize(estimatedSize: number): void {
    if (this._configureEstimate(estimatedSize)) {
      this._applyEstimate(estimatedSize);
    }
  }

  /**
   * Sets the unmeasured estimate to the average size measured since the
   * estimate was configured; older sizes may predate a density change. After
   * the first call, applies only while every item before `windowStart` is
   * measured, so rendered items cannot shift.
   */
  public adaptEstimate(windowStart: number): void {
    const tree = this._tree;
    if (!tree?.sampleAverage) {
      return;
    }
    if (this._hasAdaptedEstimate && !tree.isMeasuredBefore(windowStart)) {
      return;
    }

    this._hasAdaptedEstimate = true;
    this._applyEstimate(tree.sampleAverage);
  }

  /**
   * Returns the DOM scroll offset in px that puts the item at `index` at the
   * leading edge of a `viewportSize` px viewport.
   */
  public getScrollOffsetForIndex(index: number, viewportSize: number): number {
    if (!this._tree || index <= 0) {
      return 0;
    }
    return this._toDom(
      this._tree.prefixSum(Math.min(index, this._tree.length)),
      viewportSize,
    );
  }

  /**
   * Returns the DOM scroll offset that positions the item at `index` in a
   * `viewportSize` px viewport, aligned by `align` and clamped to the
   * reachable scroll range.
   *
   * The slack is computed in virtual space against the item's real size and
   * converted to DOM space once, at the end. Under compression one DOM pixel
   * is several virtual pixels, so mixed coordinates would scale the slack.
   */
  public getAlignedScrollOffset(
    index: number,
    viewportSize: number,
    align: ScrollAlignment,
  ): number {
    const bounds = this._itemBounds(index);
    if (!bounds) {
      return 0;
    }

    const [start, end] = bounds;
    const slack = viewportSize - Math.max(0, end - start);
    let offset = start;

    if (align === "center") {
      offset -= slack / 2;
    } else if (align === "end") {
      offset -= slack;
    }

    return clamp(
      this._toDom(offset, viewportSize),
      0,
      Math.max(0, this.domSize() - viewportSize),
    );
  }

  /**
   * Returns the DOM scroll offset that brings the item at `index` into view
   * as `position` asks. `nearest` follows native `scrollIntoView`: an item in
   * view, or one that covers the viewport, keeps `scrollPosition`, and any
   * other item scrolls the smallest distance to an edge alignment.
   *
   * Example: 50px items in a 300px viewport at offset 0. Item 10 spans
   * 500-550, so `nearest` returns 250 (end aligned) and `start` returns 500.
   */
  public resolveScrollOffset(
    index: number,
    scrollPosition: number,
    viewportSize: number,
    position: ScrollLogicalPosition,
  ): number {
    if (position === "nearest") {
      const start = this.getAlignedScrollOffset(index, viewportSize, "start");
      const end = this.getAlignedScrollOffset(index, viewportSize, "end");
      return clamp(scrollPosition, Math.min(start, end), Math.max(start, end));
    }

    return this.getAlignedScrollOffset(
      index,
      viewportSize,
      position === "center" || position === "end" ? position : "start",
    );
  }

  /** Returns the visible and over-scanned item range for the given scroll state. */
  public getVisibleRange(
    scrollPosition: number,
    viewportSize: number,
    overScan: number,
  ): VisibleRange {
    if (!this._tree || this._tree.length === 0 || viewportSize <= 0) {
      return { startIndex: 0, endIndex: -1 };
    }

    // The viewport is not compressed. Items render at their real pixel size,
    // so a `viewportSize` px viewport always shows that many virtual pixels of
    // items, at any compression of the scroll range.
    const startOffset = this._toVirtual(scrollPosition, viewportSize);
    const first = this._tree.findIndexAtOffset(startOffset);
    const last = this._tree.findIndexAtOffset(startOffset + viewportSize);

    return {
      startIndex: Math.max(0, first - overScan),
      endIndex: Math.min(this._tree.length - 1, last + overScan),
    };
  }

  /**
   * Sum of the real sizes of the items in [startIndex, endIndex]. The render
   * pass uses it to clamp the content translate offset, so rendered items do
   * not overflow past `domSize` under coordinate compression.
   */
  public getPhysicalRangeSize(startIndex: number, endIndex: number): number {
    if (!this._tree) {
      return 0;
    }

    const start = Math.max(0, startIndex);
    const end = Math.min(Math.max(endIndex + 1, start), this._tree.length);
    return this._tree.prefixSum(end) - this._tree.prefixSum(start);
  }

  /**
   * The virtual [start, end] offsets of the item at `index`, clamped into the
   * item range. Null while there are no items.
   */
  private _itemBounds(index: number): [number, number] | null {
    if (!this._tree || this._tree.length === 0) {
      return null;
    }

    const clamped = clamp(index, 0, this._tree.length - 1);
    return [this._tree.prefixSum(clamped), this._tree.prefixSum(clamped + 1)];
  }

  /**
   * Records a changed configured estimate and starts a new sample. Returns
   * false for an unchanged one, which keeps the adapted average.
   */
  private _configureEstimate(estimatedSize: number): boolean {
    if (estimatedSize === this._configuredEstimate) {
      return false;
    }

    this._configuredEstimate = estimatedSize;
    this._tree?.startSample();
    return true;
  }

  private _applyEstimate(estimatedSize: number): void {
    if (!this._tree || this._tree.estimate === estimatedSize) {
      return;
    }

    this._tree.estimate = estimatedSize;
    this._invalidate();
  }

  private _invalidate(): void {
    this._version.update((v) => v + 1);
  }

  /**
   * A virtual offset as the DOM scroll position that shows it, for a
   * `viewportSize` px viewport.
   */
  private _toDom(virtualOffset: number, viewportSize: number): number {
    const [virtualRange, domRange] = this._scrollRanges(viewportSize);
    return (virtualOffset * domRange) / virtualRange;
  }

  /**
   * A DOM scroll position as the virtual offset it shows, for a
   * `viewportSize` px viewport.
   */
  private _toVirtual(domOffset: number, viewportSize: number): number {
    const [virtualRange, domRange] = this._scrollRanges(viewportSize);
    return (Math.max(0, domOffset) * virtualRange) / domRange;
  }

  /**
   * The virtual and DOM scroll ranges to map between; the identity while the
   * content fits the browser's limit. One viewport of items renders at real
   * size at any scroll position, so both ranges exclude it: mapping the totals
   * instead would leave the last `viewport * (ratio - 1)` virtual pixels past
   * the largest DOM offset. Callers multiply before dividing, so exact
   * positions come back exact.
   */
  private _scrollRanges(viewportSize: number): [number, number] {
    const totalSize = this._tree?.totalSize ?? 0;
    const domRange = this._maxBrowserSize - viewportSize;

    if (totalSize <= this._maxBrowserSize || domRange <= 0) {
      return [1, 1];
    }
    return [totalSize - viewportSize, domRange];
  }
}
