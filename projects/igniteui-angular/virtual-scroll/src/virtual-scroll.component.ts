import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  DOCUMENT,
  effect,
  ElementRef,
  EmbeddedViewRef,
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
  ViewContainerRef,
} from "@angular/core";
import { IgxVirtualItemDirective } from "./virtual-scroll-item.directive";
import {
  IgxVsItemContext,
  VirtualScrollDataRequest,
  VirtualScrollState,
} from "./types";
import { VirtualScrollEngine } from "./scroll-engine";
import { isPlatformBrowser } from "@angular/common";

const REMOTE_SCROLLING_THRESHOLD = 5;

@Component({
  selector: "igx-virtual-scroll",
  templateUrl: "./virtual-scroll.component.html",
  styleUrls: ["./virtual-scroll.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "igx-virtual-scroll",
    role: "list",
    "[class.igx-virtual-scroll--vertical]": "_isVertical()",
    "[class.igx-virtual-scroll--horizontal]": "!_isVertical()",
  },
})
export class IgxVirtualScrollComponent<T> implements OnDestroy {
  //#region Dependency Injections
  private readonly _hostRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly _zone = inject(NgZone);
  private readonly _document = inject(DOCUMENT);
  private readonly _platformId = inject(PLATFORM_ID);

  //#endregion

  private _viewportResizeObserver: ResizeObserver | null = null;
  private _itemResizeObserver: ResizeObserver | null = null;
  private _onScroll: ((e: Event) => void) | null = null;

  /** Views currently inserted into the VCR, ordered by rendered item index. */
  private readonly _activeItems: EmbeddedViewRef<IgxVsItemContext<T>>[] = [];

  /** Detached views available for reuse. */
  private readonly _pooledItems: EmbeddedViewRef<IgxVsItemContext<T>>[] = [];

  private readonly _scrollPosition = signal(0);
  private readonly _viewportSize = signal(0);

  private readonly _visibleRange = computed(() =>
    this._engine.getVisibleRange(
      this._scrollPosition(),
      this._viewportSize(),
      this.overScan(),
      this.data().length,
    ),
  );

  protected readonly _engine = new VirtualScrollEngine();
  protected readonly _isVertical = computed(
    () => this.orientation() === "vertical",
  );
  protected readonly _spaceSize = computed(() => this._engine.domSize());
  protected readonly _contentTransform = computed(() => {
    const position = this._engine.getContentPosition(
      this._visibleRange().startIndex,
    );
    return this._isVertical()
      ? `translateY(${position}px)`
      : `translateX(${position}px)`;
  });

  //#region View and Content Children

  private readonly _itemDirective = contentChild(IgxVirtualItemDirective);

  private readonly _itemsViewContainer = viewChild<unknown, ViewContainerRef>(
    "itemsAnchor",
    { read: ViewContainerRef },
  );

  private readonly _contentDivRef =
    viewChild<ElementRef<HTMLElement>>("contentDiv");

  protected readonly _resolvedTemplate = computed(() => {
    return this.itemTemplate() ?? this._itemDirective()?.template ?? null;
  });

  //#endregion

  /** The array of items to virtualize. */
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
  public readonly overScan = input<number>(2);

  /**
   * Estimated item size in pixels used before an item is measured in the DOM.
   * The engine replaces this with the actual measured size after the first render of each item.
   * Default is 50 pixels.
   * Setting this to a value close to the actual average item size can improve initial rendering performance.
   */
  public readonly estimatedItemSize = input<number>(50);

  /**
   * Item template provided programmatically (takes precedence over content template if both are provided).
   *
   * This template will be used to render each item in the virtual scroll.
   * The context for the template will include the item data and its index.
   * If not provided, the component will look for an `ng-template` with the `igxVirtualItem` directive in its content.
   */
  public readonly itemTemplate = input<TemplateRef<IgxVsItemContext<T>> | null>(
    null,
  );

  /**
   * Emitted after each render pass with a snapshot of the current virtual window.
   */
  public readonly stateChange = output<VirtualScrollState>();

  /**
   * Emitted when the scroll position approaches the end of the available data.
   * Listen to this event to append more items (infinite / remote scrolling).
   */
  public readonly dataRequest = output<VirtualScrollDataRequest>();

  constructor() {
    // Sync engine item count with data changes.
    effect(() => {
      const count = this.data().length;
      const estimated = this.estimatedItemSize();
      untracked(() => this._engine.resize(count, estimated));
    });

    // Browser setup: runs after first render and whenever orientation changes.
    effect(() => {
      const vertical = this._isVertical();
      void vertical; // Ensure vertical is tracked before accessing the engine.
      untracked(() => {
        if (!isPlatformBrowser(this._platformId)) return;

        this._engine.initMaxBrowserSize(this._document);
        this._measureViewport();
        this._setupScrollListener();
        this._setupViewportResizeObserver();
      });
    });

    // Re-render whenever the visible range, data, or template changes.
    effect(() => {
      const range = this._visibleRange();
      const data = this.data();
      const template = this._resolvedTemplate();
      const vcr = this._itemsViewContainer();
      if (!template || !vcr || range.endIndex < range.startIndex) return;

      untracked(() =>
        this._renderRange(range.startIndex, range.endIndex, data, template),
      );
    });

    // Remote scroll: fire dataRequest when approaching the end.
    effect(() => {
      const range = this._visibleRange();
      const total = this.data().length;

      if (total > 0 && range.endIndex >= total - REMOTE_SCROLLING_THRESHOLD) {
        this.dataRequest.emit({
          startIndex: total,
          count: Math.max(this.overScan() * 4, 20),
        });
      }
    });
  }

  public ngOnDestroy(): void {
    this._teardown();
  }

  /** Programmatically scrolls to the specified item index. */
  public scrollToIndex(index: number): void {
    const host = this._hostRef.nativeElement;
    const offset = this._engine.getScrollOffsetForIndex(index);

    if (this._isVertical()) {
      host.scrollTop = offset;
    } else {
      host.scrollLeft = offset;
    }
  }

  private _renderRange(
    startIndex: number,
    endIndex: number,
    data: T[],
    template: TemplateRef<IgxVsItemContext<T>>,
  ): void {
    const count = data.length;
    const newCount = Math.max(0, endIndex - startIndex + 1);
    const vcr = this._itemsViewContainer();
    if (!vcr) return;

    // Grow: pull from pool or create new views until we have enough.
    while (this._activeItems.length < newCount) {
      let view = this._pooledItems.pop() ?? null;
      if (view) {
        vcr.insert(view);
      } else {
        view = vcr.createEmbeddedView(
          template,
          new IgxVsItemContext<T>(data[startIndex], startIndex, count),
        );
      }
      this._activeItems.push(view);
    }

    // Shrink: detach from VCR and return to pool.
    while (this._activeItems.length > newCount) {
      const view = this._activeItems.pop()!;
      const index = vcr.indexOf(view);
      if (index > -1) {
        vcr.detach(index);
      }
      this._pooledItems.push(view);
    }

    // Update contexts in place - zero DOM allocations on steady-state scroll.
    for (let i = 0; i < newCount; i++) {
      const itemIndex = startIndex + i;
      const view = this._activeItems[i];
      const context = view.context;
      context.$implicit = data[itemIndex];
      context.index = itemIndex;
      context.count = count;
      view.markForCheck();
    }

    // Measure rendered items after the browser paints.
    this._scheduleItemMeasurement(startIndex, newCount);

    this.stateChange.emit({
      startIndex,
      endIndex,
      viewportSize: this._viewportSize(),
      totalSize: this._engine.totalSize(),
    });
  }

  private _scheduleItemMeasurement(startIndex: number, count: number): void {
    if (!isPlatformBrowser(this._platformId)) return;

    this._itemResizeObserver?.disconnect();
    this._itemResizeObserver = new ResizeObserver((entries) => {
      let anyChanged = false;
      for (const entry of entries) {
        const el = entry.target as HTMLElement;
        const index = parseInt(el.dataset["vsIndex"] ?? "-1", 10);
        if (index < 0) continue;

        const measured = this._isVertical()
          ? (entry.borderBoxSize?.[0]?.blockSize ?? entry.contentRect.height)
          : (entry.borderBoxSize?.[0]?.inlineSize ?? entry.contentRect.width);

        if (measured > 0) {
          this._engine.measureItem(index, measured);
          anyChanged = true;
        }
      }
    });

    const content = this._contentDivRef()?.nativeElement;
    if (!content) return;

    const itemRoots = Array.from(content.children) as HTMLElement[];
    for (let i = 0; i < Math.min(count, itemRoots.length); i++) {
      const el = itemRoots[i];
      el.dataset["vsIndex"] = (startIndex + i).toString();
      this._itemResizeObserver.observe(el);
    }
  }

  private _measureViewport(): void {
    const host = this._hostRef.nativeElement;
    const size = this._isVertical() ? host.clientHeight : host.clientWidth;
    if (size !== this._viewportSize()) {
      this._viewportSize.set(size);
    }
  }

  private _setupViewportResizeObserver(): void {
    if (!isPlatformBrowser(this._platformId)) return;

    this._viewportResizeObserver?.disconnect();
    this._viewportResizeObserver = new ResizeObserver(() => {
      const host = this._hostRef.nativeElement;
      const newSize = this._isVertical() ? host.clientHeight : host.clientWidth;
      if (newSize !== this._viewportSize()) {
        this._viewportSize.set(newSize);
      }
    });

    this._viewportResizeObserver.observe(this._hostRef.nativeElement);
  }

  private _setupScrollListener(): void {
    if (!isPlatformBrowser(this._platformId)) return;

    const host = this._hostRef.nativeElement;
    if (this._onScroll) {
      host.removeEventListener("scroll", this._onScroll);
    }

    this._zone.runOutsideAngular(() => {
      this._onScroll = (e: Event) => {
        const target = e.target as HTMLElement;
        const scrollPos = this._isVertical()
          ? target.scrollTop
          : target.scrollLeft;
        this._zone.run(() => this._scrollPosition.set(scrollPos));
      };
      host.addEventListener("scroll", this._onScroll!, { passive: true });
    });
  }

  private _teardown(): void {
    const host = this._hostRef.nativeElement;
    if (this._onScroll) {
      host.removeEventListener("scroll", this._onScroll);
      this._onScroll = null;
    }
    this._viewportResizeObserver?.disconnect();
    this._itemResizeObserver?.disconnect();
    for (const view of [...this._activeItems, ...this._pooledItems]) {
      view.destroy();
    }
    this._activeItems.length = 0;
    this._pooledItems.length = 0;
  }
}
