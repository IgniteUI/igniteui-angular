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

/**
 * Fills `tree` with the partial range sums of `sizes` in one O(N) pass.
 * `tree` is a 1-indexed Fenwick array of `sizes.length + 1` zeroed entries.
 * Returns the total sum.
 */
function buildTree(tree: Float64Array, sizes: Float64Array): number {
  const length = sizes.length;
  let total = 0;

  for (let i = 1; i <= length; i++) {
    tree[i] += sizes[i - 1];
    total += sizes[i - 1];

    const parent = i + (i & -i);
    if (parent <= length) {
      tree[parent] += tree[i];
    }
  }
  return total;
}

/**
 * Binary Indexed Tree (Fenwick tree) over item sizes. Each hot-path operation
 * is O(log N): point update (item measured), prefix sum (scroll offset), and
 * index at offset (scroll to item, through binary lifting).
 */
class SizeTree {
  public readonly length: number;

  /** A 1-indexed BIT. Each cell holds a partial range sum. */
  private readonly _tree: Float64Array;

  /** Raw per-item sizes, 0-indexed. Kept for O(1) reads and delta calculation. */
  private readonly _sizes: Float64Array;

  /**
   * Flags the indices holding a DOM-measured size (`1`) instead of an
   * estimate (`0`). `applyEstimate` changes only the estimated entries.
   */
  private readonly _measured: Uint8Array;

  /** Running total. Updated together with the tree in O(1). */
  private _total: number;

  /**
   * The highest power of two <= `length`, for the binary lifting in
   * `findIndexAtOffset`. Precomputed because that runs on each scroll event.
   */
  private readonly _topBit: number;

  private constructor(
    sizes: Float64Array,
    tree: Float64Array,
    total: number,
    measured: Uint8Array,
  ) {
    this.length = sizes.length;
    this._sizes = sizes;
    this._tree = tree;
    this._total = total;
    this._measured = measured;
    this._topBit = this.length > 0 ? 1 << (31 - Math.clz32(this.length)) : 0;
  }

  /** Creates a tree of `length` unmeasured items, each set to `fillSize`. O(N). */
  public static filled(length: number, fillSize: number): SizeTree {
    return SizeTree._build(
      new Float64Array(length).fill(fillSize),
      new Uint8Array(length),
    );
  }

  /** Builds a tree from a sizes array and its matching measured flags. O(N). */
  private static _build(sizes: Float64Array, measured: Uint8Array): SizeTree {
    const tree = new Float64Array(sizes.length + 1);
    const total = buildTree(tree, sizes);
    return new SizeTree(sizes, tree, total, measured);
  }

  /** Total size of all items. O(1). */
  public get totalSize(): number {
    return this._total;
  }

  /**
   * Prefix sum of items [0, i): the virtual scroll offset at the leading
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
   * Sets the size of the item at a 0-based index and marks it measured, so
   * later `applyEstimate` calls leave it alone. Returns true when the size
   * changed. O(log N).
   */
  public update(index: number, newSize: number): boolean {
    if (index < 0 || index >= this.length) {
      return false;
    }

    const old = this._sizes[index];
    this._measured[index] = 1;

    if (old === newSize) {
      return false;
    }

    const delta = newSize - old;
    this._sizes[index] = newSize;
    this._total += delta;

    for (let i = index + 1; i <= this.length; i += i & -i) {
      this._tree[i] += delta;
    }
    return true;
  }

  /**
   * Returns a new tree of `newLength` items in one O(N) pass. Sizes and
   * measured flags are kept up to `min(this.length, newLength, retainCount)`.
   * The remainder is filled with `fillSize` and marked unmeasured. Pass a
   * `retainCount` below the item count when the data behind those indices
   * changed identity.
   */
  public cloneResized(
    newLength: number,
    fillSize: number,
    retainCount = newLength,
  ): SizeTree {
    const sizes = new Float64Array(newLength).fill(fillSize);
    const measured = new Uint8Array(newLength);
    const retained = Math.max(0, Math.min(this.length, newLength, retainCount));

    sizes.set(this._sizes.subarray(0, retained));
    measured.set(this._measured.subarray(0, retained));
    return SizeTree._build(sizes, measured);
  }

  /**
   * Sets `estimatedSize` on each unmeasured item. Returns true when at least
   * one size changed.
   *
   * One estimate change can touch most of the list, so this rebuilds in one
   * O(N) pass instead of one O(log N) `update` per item.
   */
  public applyEstimate(estimatedSize: number): boolean {
    let changed = false;

    for (let i = 0; i < this.length; i++) {
      if (!this._measured[i] && this._sizes[i] !== estimatedSize) {
        this._sizes[i] = estimatedSize;
        changed = true;
      }
    }

    if (!changed) {
      return false;
    }

    this._tree.fill(0);
    this._total = buildTree(this._tree, this._sizes);
    return true;
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
      if (next <= this.length && this._tree[next] <= remaining) {
        index = next;
        remaining -= this._tree[index];
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
 * larger than that limit, the engine compresses the *virtual* space
 * (`0…totalSize`) into the *DOM* space the browser can represent
 * (`0…domSize`) by the factor `_virtualRatio`. Offsets crossing that boundary
 * are scaled: incoming scroll positions are multiplied by the ratio, outgoing
 * offsets are divided by it. Items render at their real pixel size, so item
 * sizes are always virtual.
 */
export class VirtualScrollEngine {
  private _maxBrowserSize = Number.POSITIVE_INFINITY;

  /**
   * `totalSize / maxBrowserSize` while the content is too large for the
   * browser's scroll range; `1` otherwise. Maps virtual onto DOM positions.
   */
  private _virtualRatio = 1;

  private _tree: SizeTree | null = null;

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
   * Depends on `_version` directly rather than on `totalSize()`. The ratio
   * can change while the total does not (the browser maximum is probed after
   * the first render), and an unchanged `totalSize` would not propagate.
   */
  public readonly domSize = computed<number>(() => {
    this._version();
    const total = this._tree?.totalSize ?? 0;
    return this._virtualRatio !== 1 ? this._maxBrowserSize : total;
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
   * `retainCount` are kept, the remainder falls back to `estimatedSize`.
   * Callers that only append can keep the default `retainCount`. Callers
   * whose data changed identity at some index must pass that index, so the
   * stale measurements after it are discarded.
   */
  public resize(
    length: number,
    estimatedSize: number,
    retainCount = length,
  ): void {
    if (this._tree?.length === length && retainCount >= length) {
      return;
    }

    this._tree = this._tree
      ? this._tree.cloneResized(length, estimatedSize, retainCount)
      : SizeTree.filled(length, estimatedSize);
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
    if (this._tree?.applyEstimate(estimatedSize)) {
      this._invalidate();
    }
  }

  /**
   * Returns the DOM scroll offset in px that puts the item at `index` at the
   * leading edge of the viewport.
   */
  public getScrollOffsetForIndex(index: number): number {
    if (!this._tree || index <= 0) {
      return 0;
    }
    return (
      this._tree.prefixSum(Math.min(index, this._tree.length)) /
      this._virtualRatio
    );
  }

  /**
   * Returns the DOM scroll offset that positions the item at `index` in a
   * `viewportSize` px viewport, aligned by `align` and clamped to the
   * reachable scroll range.
   *
   * The slack is computed in virtual space against the item's real size and
   * converted to DOM space once, at the end. One DOM pixel equals
   * `_virtualRatio` virtual pixels, so mixed coordinates would scale the slack.
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
      offset / this._virtualRatio,
      0,
      Math.max(0, this.domSize() - viewportSize),
    );
  }

  /**
   * Whether the item at `index` needs no further scrolling at the given DOM
   * scroll position: it is either fully inside the viewport, or larger than
   * the viewport and covering it. The second case matches native
   * `scrollIntoView({ block: 'nearest' })`.
   */
  public isIndexInView(
    index: number,
    scrollPosition: number,
    viewportSize: number,
  ): boolean {
    const bounds = this._itemBounds(index);
    if (!bounds) {
      return false;
    }

    const [start, end] = bounds;
    const viewStart = Math.max(0, scrollPosition) * this._virtualRatio;
    const viewEnd = viewStart + viewportSize;

    const contained = start >= viewStart && end <= viewEnd;
    const spanning = start <= viewStart && end >= viewEnd;

    return contained || spanning;
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

    // The viewport is not scaled by the virtual ratio. Items render at their
    // real pixel size, so a `viewportSize` px viewport always shows that many
    // virtual pixels of items, at any compression of the scroll range.
    const startOffset = Math.max(0, scrollPosition) * this._virtualRatio;
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

  private _invalidate(): void {
    this._updateVirtualRatio();
    this._version.update((v) => v + 1);
  }

  private _updateVirtualRatio(): void {
    const totalSize = this._tree?.totalSize ?? 0;
    this._virtualRatio =
      totalSize <= this._maxBrowserSize ? 1 : totalSize / this._maxBrowserSize;
  }
}
