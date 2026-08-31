import { isPlatformBrowser, NgTemplateOutlet } from "@angular/common";
import {
  afterNextRender,
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  DOCUMENT,
  effect,
  ElementRef,
  inject,
  input,
  NgZone,
  OnDestroy,
  output,
  PLATFORM_ID,
  signal,
  TemplateRef,
  untracked,
  viewChild,
} from "@angular/core";
import { clamp, isLeftToRight } from "igniteui-angular/core";
import { VirtualScrollEngine } from "./scroll-engine";
import {
  IgxVsItemContext,
  ScrollAlignment,
  VirtualScrollDataRequest,
  VirtualScrollState,
  VisibleRange,
} from "./types";
import { IgxVirtualItemDirective } from "./virtual-scroll-item.directive";

/** Defaults for the inputs, also used as the fallback for invalid values. */
const DEFAULT_OVER_SCAN = 2;
const DEFAULT_ESTIMATED_ITEM_SIZE = 50;

/** How close to the end of `data` the window must get to emit `dataRequest`. */
const DATA_REQUEST_THRESHOLD = 5;
const DATA_REQUEST_MIN_COUNT = 20;
const DATA_REQUEST_OVER_SCAN_FACTOR = 4;

/** Give-up bounds for the two loops that wait for the layout to stabilize. */
const MAX_LAYOUT_SETTLE_PASSES = 20;
const MAX_SCROLL_CORRECTION_PASSES = 5;

const SCROLL_END_TIMEOUT_MS = 2000;
const SCROLL_OFFSET_EPSILON_PX = 1;

/** How long the scroll position must stay unchanged to count as settled. */
const SCROLL_IDLE_MS = 100;

/**
 * Upper limit on one `requestAnimationFrame` wait. A hidden tab or a detached
 * element gets no frames, and `layoutComplete` must still resolve there.
 */
const LAYOUT_FRAME_TIMEOUT_MS = 100;

const EMPTY_RANGE: VisibleRange = Object.freeze({ startIndex: 0, endIndex: -1 });

function rangesEqual(a: VisibleRange, b: VisibleRange): boolean {
  return a.startIndex === b.startIndex && a.endIndex === b.endIndex;
}

function statesEqual(
  a: VirtualScrollState | null,
  b: VirtualScrollState,
): boolean {
  return (
    a !== null &&
    rangesEqual(a, b) &&
    a.viewportSize === b.viewportSize &&
    a.totalSize === b.totalSize
  );
}

/** The data index an item wrapper carries, or -1 when it has none. */
function itemIndex(element: Element): number {
  const index = Number.parseInt(
    (element as HTMLElement).dataset["vsIndex"] ?? "",
    10,
  );
  return Number.isInteger(index) && index >= 0 ? index : -1;
}

function onAbort(abort: AbortSignal, cancel: () => void): void {
  abort.addEventListener("abort", cancel, { once: true });
}

/**
 * A virtual scroll component for large lists. Only the items visible in the
 * viewport (plus a configurable over-scan) are rendered.
 *
 * @igxModule IgxVirtualScrollModule
 * @igxTheme igx-virtual-scroll-theme
 * @igxKeywords virtual, scroll, virtualization, list
 * @igxGroup Grids & Lists
 *
 * @example
 * ```html
 * <igx-virtual-scroll [data]="items" style="height: 400px">
 *   <ng-template igxVirtualItem let-item let-i="index">
 *     <div>{{ i }}: {{ item }}</div>
 *   </ng-template>
 * </igx-virtual-scroll>
 * ```
 */
@Component({
  selector: "igx-virtual-scroll",
  templateUrl: "./virtual-scroll.component.html",
  styleUrls: ["./virtual-scroll.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet],
  host: {
    class: "igx-virtual-scroll",
    role: "list",
    "[class.igx-virtual-scroll--vertical]": "_isVertical()",
    "[class.igx-virtual-scroll--horizontal]": "!_isVertical()",
  },
})
export class IgxVirtualScrollComponent<T> implements OnDestroy {
  //#region Dependency injection

  private readonly _hostRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly _zone = inject(NgZone);
  private readonly _document = inject(DOCUMENT);
  private readonly _isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  //#endregion

  //#region Internal state

  private readonly _engine = new VirtualScrollEngine();

  private _viewportResizeObserver: ResizeObserver | null = null;
  private _itemResizeObserver: ResizeObserver | null = null;
  private _onScroll: (() => void) | null = null;

  /** Elements currently registered with the item resize observer. */
  private readonly _observedItems = new Set<Element>();

  /** The data index each observed wrapper element last hosted. */
  private readonly _observedItemIndexes = new WeakMap<Element, number>();

  /**
   * The live scroll offset on the active axis. A plain field, not a signal:
   * `_visibleRange` reads it but is invalidated by `_scrollTick`, so a scroll
   * that does not move the rendered window schedules no work.
   */
  private _scrollPosition = 0;

  /** Bumped only when a scroll actually moves the rendered window. */
  private readonly _scrollTick = signal(0);

  private readonly _viewportSize = signal(0);

  /** The `data` array as of the previous change, for `_firstChangedIndex`. */
  private _previousData: T[] | undefined;

  private _lastEmittedState: VirtualScrollState | null = null;
  private _hasPendingDataRequest = false;

  /**
   * The `startIndex` of the last emitted `dataRequest`, which is also the
   * item count at that emit. See `_checkDataRequest`.
   */
  private _lastDataRequestIndex = -1;

  private _layoutCompletePromise: Promise<void> | null = null;
  private _scrollRequestId = 0;

  //#endregion

  //#region View and content children

  private readonly _itemDirective = contentChild(IgxVirtualItemDirective);

  private readonly _contentDivRef =
    viewChild<ElementRef<HTMLElement>>("contentDiv");

  //#endregion

  //#region Public inputs

  /**
   * The array of items to virtualize.
   *
   * Compared by reference: mutating the array in place (`data.push(...)`)
   * causes no update. Assign a new array instead. The `dataRequest` flow
   * also expects a new array.
   */
  public readonly data = input<T[]>([]);

  /**
   * Scroll orientation of the virtual scroll.
   * Can be either "vertical" or "horizontal".
   * Default is "vertical".
   */
  public readonly orientation = input<"vertical" | "horizontal">("vertical");

  /**
   * Number of extra items to render beyond the visible area of the viewport.
   * Higher values reduce blank flashes during fast scrolling but may impact performance.
   * Default is 2.
   */
  public readonly overScan = input<number>(DEFAULT_OVER_SCAN);

  /**
   * Estimated item size in pixels used before an item is measured in the DOM.
   * The engine replaces this with the actual measured size after the first render of each item.
   * Default is 50 pixels.
   * Setting this to a value close to the actual average item size can improve initial rendering performance.
   */
  public readonly estimatedItemSize = input<number>(DEFAULT_ESTIMATED_ITEM_SIZE);

  /**
   * Item template provided programmatically. Takes precedence over a content
   * `ng-template[igxVirtualItem]` when both are provided.
   *
   * Items are measured by their border box, so margins accumulate as drift
   * down the list. Use padding on the item, or a gap on a wrapper, instead.
   *
   * Only the current window is in the DOM, so assistive technology cannot
   * infer an item's position from the markup. Templates that render a role
   * with set semantics (`listitem`, `option`, `row`, ...) should map the
   * context's `index` and `count` onto `aria-posinset` and `aria-setsize`.
   */
  public readonly itemTemplate = input<TemplateRef<IgxVsItemContext<T>> | null>(
    null,
  );

  //#endregion

  //#region Public outputs

  /** Emitted when the rendered virtual window changes. */
  public readonly stateChange = output<VirtualScrollState>();

  /**
   * Emitted when the rendered window comes within a few items of the end of
   * `data`. Also emitted on the first render, when the loaded items do not
   * fill the viewport. Listen to this event to append more items
   * (infinite / remote scrolling).
   */
  public readonly dataRequest = output<VirtualScrollDataRequest>();

  //#endregion

  //#region Derived state

  protected readonly _isVertical = computed(
    () => this.orientation() === "vertical",
  );

  protected readonly _resolvedTemplate = computed(
    () => this.itemTemplate() ?? this._itemDirective()?.template ?? null,
  );

  /** `data`, guarded against a nullish value set by the consumer. */
  private readonly _items = computed<T[]>(() => this.data() ?? []);

  /** The configured `overScan`, normalized to a non-negative integer. */
  private readonly _normalizedOverScan = computed(() => {
    const value = Number(this.overScan());
    return Number.isFinite(value)
      ? Math.max(0, Math.floor(value))
      : DEFAULT_OVER_SCAN;
  });

  /** The configured `estimatedItemSize`, normalized to a positive number. */
  private readonly _normalizedItemSize = computed(() => {
    const value = Number(this.estimatedItemSize());
    return Number.isFinite(value) && value > 0
      ? value
      : DEFAULT_ESTIMATED_ITEM_SIZE;
  });

  /**
   * The window to render for the current scroll position and viewport. Empty
   * until an item template is resolved, because nothing renders without one.
   *
   * The scroll position is read from the plain `_scrollPosition` field so
   * that a recompute triggered by a measurement uses the live offset, while
   * `_scrollTick` limits recomputes to scrolls that actually move the window.
   */
  private readonly _visibleRange = computed<VisibleRange>(
    () => {
      // Depend on the engine so the range recomputes whenever item sizes or
      // the item count change.
      this._engine.version();
      this._scrollTick();

      return this._resolvedTemplate()
        ? this._engine.getVisibleRange(
            this._scrollPosition,
            this._viewportSize(),
            this._normalizedOverScan(),
          )
        : EMPTY_RANGE;
    },
    { equal: rangesEqual },
  );

  /** The track size, in DOM space. */
  protected readonly _spaceSize = this._engine.domSize;

  /** The item contexts for the currently rendered window, in render order. */
  protected readonly _renderedItems = computed<IgxVsItemContext<T>[]>(() => {
    const { startIndex, endIndex } = this._visibleRange();
    const items = this._items();

    const rendered: IgxVsItemContext<T>[] = [];
    for (let i = startIndex; i <= endIndex; i++) {
      rendered.push(new IgxVsItemContext<T>(items[i], i, items.length));
    }
    return rendered;
  });

  /**
   * The `translateY` / `translateX` for the content wrapper. It is absolutely
   * positioned at the origin of a `domSize` px track, so translating it to
   * the first rendered item's offset puts that item at its virtual position.
   */
  protected readonly _contentTransform = computed(() => {
    // The offsets below are plain reads of the engine's size state, so depend
    // on its version explicitly.
    this._engine.version();
    const range = this._visibleRange();

    // Under coordinate compression item positions are scaled down but item
    // sizes are not. Without this cap the rendered range would overflow past
    // domSize at the end of the list, pushing the last items beyond the
    // maximum browser scroll coordinate.
    const position = clamp(
      this._engine.getScrollOffsetForIndex(range.startIndex),
      0,
      this._engine.domSize() -
        this._engine.getPhysicalRangeSize(range.startIndex, range.endIndex),
    );

    if (this._isVertical()) {
      return `translateY(${position}px)`;
    }

    // In RTL the wrapper is anchored to the right edge of the track, so it
    // translates towards the negative (leading) direction.
    return `translateX(${this._isLTR() ? position : -position}px)`;
  });

  //#endregion

  constructor() {
    // Sync the engine's item count with `data`, discarding the measurements
    // of items whose identity changed.
    effect(() => {
      const items = this._items();
      untracked(() => {
        const previous = this._previousData;
        this._previousData = items;
        this._engine.resize(
          items.length,
          this._normalizedItemSize(),
          this._firstChangedIndex(previous, items),
        );
        // New data (or a reset) clears any in-flight data request so the next
        // approach to the end of the list can emit again.
        this._hasPendingDataRequest = false;
      });
    });

    // Re-apply the estimate when it changes but the item count does not,
    // because `resize` is then a no-op.
    effect(() => {
      const size = this._normalizedItemSize();
      untracked(() => this._engine.updateEstimatedSize(size));
    });

    // The scroll offset of the previous axis does not carry over.
    effect(() => {
      this.orientation();
      untracked(() => {
        if (!this._isBrowser) {
          return;
        }

        this._measureViewport();
        this._scrollPosition = this._currentAxisScroll();
        this._scrollTick.update((v) => v + 1);
      });
    });

    afterNextRender(() => {
      this._engine.initMaxBrowserSize(this._document);
      this._measureViewport();
      this._setupScrollListener();
      this._setupViewportResizeObserver();
    });

    // Runs after the DOM reflects the current window, and re-runs whenever
    // the window or the engine's sizes change.
    afterRenderEffect({
      read: () => {
        this._visibleRange();
        this._engine.version();
        untracked(() => {
          this._scheduleItemMeasurement();
          this._checkDataRequest();
          this._emitStateChange();
        });
      },
    });
  }

  public ngOnDestroy(): void {
    this._teardown();
  }

  //#region Public API

  /**
   * Resolves when the virtual scroll has settled: the current render pass is
   * complete, the item-size measurements it triggers are complete, and so
   * are the renders those measurements schedule.
   */
  public get layoutComplete(): Promise<void> {
    if (!this._layoutCompletePromise) {
      this._layoutCompletePromise = this._resolveLayoutComplete();
    }
    return this._layoutCompletePromise;
  }

  /**
   * Scrolls to the specified item index.
   *
   * Items outside the rendered window have only an estimated size, so the
   * first jump can miss the target. The items at the landing point are then
   * measured and the scroll position is corrected, until the offset is
   * stable. The returned promise resolves on that final offset; callers that
   * need only the first, approximate scroll can ignore it.
   *
   * @param index The index of the item to scroll to.
   * @param options `block` / `inline` select the alignment (`start`,
   * `center`, `end` or `nearest`); `behavior` selects `auto` or `smooth`.
   */
  public async scrollToIndex(
    index: number,
    options?: ScrollIntoViewOptions,
  ): Promise<void> {
    const clampedIndex = clamp(index, 0, Math.max(0, this._items().length - 1));

    // A newer call supersedes a correction loop that still runs for a
    // previous call, for example under rapid, repeated calls.
    const requestId = ++this._scrollRequestId;

    let offset = this._getAlignedScrollOffset(clampedIndex, options);
    await this._scrollAndWaitForEnd(offset, options?.behavior ?? "auto");

    for (let i = 0; i < MAX_SCROLL_CORRECTION_PASSES; i++) {
      await this.layoutComplete;

      if (requestId !== this._scrollRequestId) {
        return;
      }

      const corrected = this._getAlignedScrollOffset(clampedIndex, options);
      if (Math.abs(corrected - offset) < SCROLL_OFFSET_EPSILON_PX) {
        break;
      }

      offset = corrected;
      await this._scrollAndWaitForEnd(offset, "auto");

      if (requestId !== this._scrollRequestId) {
        return;
      }
    }
  }

  //#endregion

  //#region Scrolling

  /** Whether the host element is laid out left-to-right. */
  private _isLTR(): boolean {
    return isLeftToRight(this._hostRef.nativeElement);
  }

  /** The current real scroll position on the active axis, normalized for RTL. */
  private _currentAxisScroll(): number {
    const host = this._hostRef.nativeElement;

    if (this._isVertical()) {
      return host.scrollTop;
    }

    // Standards-compliant browsers expose a negative scrollLeft in RTL.
    return this._isLTR() ? host.scrollLeft : -host.scrollLeft;
  }

  /** Applies a scroll offset to the active axis, accounting for RTL. */
  private _applyScroll(offset: number, behavior: ScrollBehavior): void {
    const host = this._hostRef.nativeElement;

    if (this._isVertical()) {
      host.scrollTo({ top: offset, behavior });
      return;
    }

    host.scrollTo({ left: this._isLTR() ? offset : -offset, behavior });
  }

  /**
   * The scroll offset that aligns `index` in the viewport according to
   * `options`, from the engine's current size data. As more items are
   * measured, the same input can give a different, more accurate result.
   *
   * For `nearest` on an item already in view, returns the current offset, so
   * no scroll occurs.
   */
  private _getAlignedScrollOffset(
    index: number,
    options?: ScrollIntoViewOptions,
  ): number {
    const requested = this._isVertical()
      ? (options?.block ?? "start")
      : (options?.inline ?? options?.block ?? "start");
    const current = this._currentAxisScroll();

    if (
      requested === "nearest" &&
      this._engine.isIndexInView(index, current, this._viewportSize())
    ) {
      return current;
    }

    const align: ScrollAlignment =
      requested === "center" || requested === "end" ? requested : "start";

    return this._engine.getAlignedScrollOffset(
      index,
      this._viewportSize(),
      align,
    );
  }

  /**
   * Applies a scroll offset to the active axis and waits for the scroll,
   * instant or smooth, to settle.
   *
   * `scrollend` does not fire when the requested offset does not move the
   * scroll position, so that case resolves immediately. The deadline covers
   * an event that never arrives, for example when the element is detached
   * mid-scroll.
   */
  private _scrollAndWaitForEnd(
    offset: number,
    behavior: ScrollBehavior,
  ): Promise<void> {
    if (
      !this._isBrowser ||
      Math.abs(this._currentAxisScroll() - offset) < SCROLL_OFFSET_EPSILON_PX
    ) {
      return Promise.resolve();
    }

    return this._withDeadline(SCROLL_END_TIMEOUT_MS, (abort) => {
      // `scrollend` reports exactly when a scroll has settled. Safari before
      // 18.2 does not have it, and the scroll-idle timer stands in there.
      const settled =
        "onscrollend" in this._hostRef.nativeElement
          ? this._waitForScrollEnd(abort)
          : this._waitForScrollIdle(abort);

      // Applied only after the listener is attached, so an instant scroll
      // cannot settle before something watches for it.
      this._applyScroll(offset, behavior);
      return settled;
    });
  }

  private _waitForScrollEnd(abort: AbortSignal): Promise<void> {
    return this._promiseOutsideZone((resolve) => {
      this._hostRef.nativeElement.addEventListener("scrollend", resolve, {
        once: true,
        signal: abort,
      });
    });
  }

  /**
   * Resolves when no `scroll` event arrives for `SCROLL_IDLE_MS`: the closest
   * replacement for `scrollend`. The first timer starts immediately, so a
   * scroll that does not move still settles.
   */
  private _waitForScrollIdle(abort: AbortSignal): Promise<void> {
    return this._promiseOutsideZone((resolve) => {
      let id = setTimeout(resolve, SCROLL_IDLE_MS);

      this._hostRef.nativeElement.addEventListener(
        "scroll",
        () => {
          clearTimeout(id);
          id = setTimeout(resolve, SCROLL_IDLE_MS);
        },
        { passive: true, signal: abort },
      );

      onAbort(abort, () => clearTimeout(id));
    });
  }

  //#endregion

  //#region Async helpers

  /** A promise whose subscription work stays out of the Angular zone. */
  private _promiseOutsideZone(
    subscribe: (resolve: () => void) => void,
  ): Promise<void> {
    return this._zone.runOutsideAngular(
      () => new Promise<void>((resolve) => subscribe(() => resolve())),
    );
  }

  /**
   * Resolves with `task` or with a deadline of `ms`, whichever comes first.
   * The signal then tears down the other, so no live timer or dangling
   * listener remains.
   */
  private _withDeadline(
    ms: number,
    task: (abort: AbortSignal) => Promise<void>,
  ): Promise<void> {
    const controller = new AbortController();

    return Promise.race([
      task(controller.signal),
      this._promiseOutsideZone((resolve) => {
        const id = setTimeout(resolve, ms);
        onAbort(controller.signal, () => clearTimeout(id));
      }),
    ]).finally(() => controller.abort());
  }

  /**
   * Resolves on the next animation frame, or after `LAYOUT_FRAME_TIMEOUT_MS`
   * when no frame arrives. A hidden tab or a detached element gets no frames
   * and has no layout to wait for, so resolving early there is safe.
   */
  private _nextFrame(): Promise<void> {
    if (!this._isBrowser) {
      return Promise.resolve();
    }

    return this._withDeadline(LAYOUT_FRAME_TIMEOUT_MS, (abort) =>
      this._promiseOutsideZone((resolve) => {
        const id = requestAnimationFrame(resolve);
        onAbort(abort, () => cancelAnimationFrame(id));
      }),
    );
  }

  /**
   * Waits out the frames in which the item measurements land. Each
   * measurement that changes a size bumps the engine's version and schedules
   * another render, so the layout has settled once the version holds still
   * across two consecutive frames.
   */
  private async _resolveLayoutComplete(): Promise<void> {
    try {
      let lastVersion = -1;

      for (let i = 0; i < MAX_LAYOUT_SETTLE_PASSES; i++) {
        await this._nextFrame();

        const version = untracked(this._engine.version);
        if (version === lastVersion) {
          break;
        }
        lastVersion = version;
      }
    } finally {
      // Cleared here, not after the loop, so a run that throws cannot leave
      // the getter with a permanently rejected promise.
      this._layoutCompletePromise = null;
    }
  }

  //#endregion

  //#region Measurement

  private _measureViewport(): void {
    const host = this._hostRef.nativeElement;
    const size = this._isVertical() ? host.clientHeight : host.clientWidth;

    if (size !== untracked(this._viewportSize)) {
      this._viewportSize.set(size);
    }
  }

  private _setupViewportResizeObserver(): void {
    this._viewportResizeObserver?.disconnect();

    this._zone.runOutsideAngular(() => {
      this._viewportResizeObserver = new ResizeObserver(() =>
        this._measureViewport(),
      );
      this._viewportResizeObserver.observe(this._hostRef.nativeElement);
    });
  }

  private _setupScrollListener(): void {
    const host = this._hostRef.nativeElement;

    if (this._onScroll) {
      host.removeEventListener("scroll", this._onScroll);
    }

    this._zone.runOutsideAngular(() => {
      this._onScroll = () => this._handleScroll();
      host.addEventListener("scroll", this._onScroll, { passive: true });
    });
  }

  /**
   * Records the new scroll offset and invalidates the rendered window only
   * when it actually moves. Without the guard, a scroll inside a single item
   * would schedule a change detection pass for an identical result.
   */
  private _handleScroll(): void {
    this._scrollPosition = this._currentAxisScroll();

    const next = this._engine.getVisibleRange(
      this._scrollPosition,
      untracked(this._viewportSize),
      untracked(this._normalizedOverScan),
    );

    if (!rangesEqual(next, untracked(this._visibleRange))) {
      this._scrollTick.update((v) => v + 1);
    }
  }

  private _handleItemResize(entries: ResizeObserverEntry[]): void {
    for (const entry of entries) {
      const index = itemIndex(entry.target);
      if (index < 0) {
        continue;
      }

      const measured = this._isVertical()
        ? (entry.borderBoxSize?.[0]?.blockSize ?? entry.contentRect.height)
        : (entry.borderBoxSize?.[0]?.inlineSize ?? entry.contentRect.width);

      if (measured > 0) {
        this._engine.measureItem(index, measured);
      }
    }
  }

  /**
   * Synchronizes the item observer with the rendered window, applying only
   * the difference. A newly observed element gets one initial measurement.
   *
   * An element whose `data-vs-index` changed is re-registered, because
   * `observe` on an already observed element is a no-op. `@for` tracks by
   * slot and reuses the wrapper elements, so after a scroll the same element
   * can host a different item at an identical size. The observer stays quiet
   * about that and the new index would keep its estimated size.
   */
  private _scheduleItemMeasurement(): void {
    const content = this._contentDivRef()?.nativeElement;
    if (!content) {
      return;
    }

    const observer = this._getItemResizeObserver();

    for (const element of [...this._observedItems]) {
      if (element.parentNode !== content) {
        observer.unobserve(element);
        this._observedItems.delete(element);
      }
    }

    for (const element of Array.from(content.children)) {
      const index = itemIndex(element);

      if (this._observedItems.has(element)) {
        if (this._observedItemIndexes.get(element) === index) {
          continue;
        }
        observer.unobserve(element);
      }

      observer.observe(element);
      this._observedItems.add(element);
      this._observedItemIndexes.set(element, index);
    }
  }

  private _getItemResizeObserver(): ResizeObserver {
    if (!this._itemResizeObserver) {
      this._itemResizeObserver = this._zone.runOutsideAngular(
        () => new ResizeObserver((entries) => this._handleItemResize(entries)),
      );
    }
    return this._itemResizeObserver;
  }

  //#endregion

  //#region Events

  /**
   * The number of leading items that kept their identity across a `data`
   * change: the index of the first item whose measured size no longer
   * matches its rendered content. An append (the `dataRequest` flow) retains
   * all items. A filter or a replacement retains only the unchanged prefix.
   */
  private _firstChangedIndex(previous: T[] | undefined, current: T[]): number {
    if (!previous) {
      return 0;
    }

    const shared = Math.min(previous.length, current.length);
    for (let i = 0; i < shared; i++) {
      if (previous[i] !== current[i]) {
        return i;
      }
    }
    return shared;
  }

  /**
   * Emits `stateChange`. Skipped when the window is empty or equal to the
   * last reported one, because measurement passes re-render without a window
   * change.
   */
  private _emitStateChange(): void {
    const { startIndex, endIndex } = untracked(this._visibleRange);
    if (endIndex < startIndex) {
      return;
    }

    const state: VirtualScrollState = {
      startIndex,
      endIndex,
      viewportSize: untracked(this._viewportSize),
      totalSize: untracked(this._engine.totalSize),
    };

    if (statesEqual(this._lastEmittedState, state)) {
      return;
    }

    this._lastEmittedState = { ...state };
    this.stateChange.emit(state);
  }

  private _checkDataRequest(): void {
    if (this._hasPendingDataRequest) {
      return;
    }

    const { endIndex } = untracked(this._visibleRange);
    const total = untracked(this._items).length;

    if (total === 0 || endIndex < total - DATA_REQUEST_THRESHOLD) {
      return;
    }

    // Each `data` change clears `_hasPendingDataRequest`, including one that
    // appends nothing. Without this second guard, a consumer whose source is
    // exhausted, and that reassigns `data` in response to a request, would
    // receive the same request on each reassignment.
    if (this._lastDataRequestIndex === total) {
      return;
    }

    this._hasPendingDataRequest = true;
    this._lastDataRequestIndex = total;

    this.dataRequest.emit({
      startIndex: total,
      count: Math.max(
        untracked(this._normalizedOverScan) * DATA_REQUEST_OVER_SCAN_FACTOR,
        DATA_REQUEST_MIN_COUNT,
      ),
    });
  }

  //#endregion

  private _teardown(): void {
    const host = this._hostRef.nativeElement;

    if (this._onScroll) {
      host.removeEventListener("scroll", this._onScroll);
      this._onScroll = null;
    }

    this._viewportResizeObserver?.disconnect();
    this._viewportResizeObserver = null;

    this._itemResizeObserver?.disconnect();
    this._itemResizeObserver = null;
    this._observedItems.clear();
  }
}
