/** Template context for a single item of the virtual scroll. */
export class IgxVsItemContext<T> {
  constructor(
    /** The current item in the virtual scroll. */
    public $implicit: T,
    /** The index of the current item. */
    public index: number,
    /** The total number of items in the virtual scroll. */
    public count: number,
  ) {}

  /** Whether the current item is the first in the list. */
  public get first(): boolean {
    return this.index === 0;
  }

  /** Whether the current item is the last in the list. */
  public get last(): boolean {
    return this.index === this.count - 1;
  }

  /** Whether the current item is at an even index. */
  public get even(): boolean {
    return this.index % 2 === 0;
  }

  /** Whether the current item is at an odd index. */
  public get odd(): boolean {
    return !this.even;
  }
}

/**
 * How `scrollToIndex` positions the requested item in the viewport.
 * The subset of `ScrollLogicalPosition` that the engine supports.
 */
export type ScrollAlignment = "start" | "center" | "end";

/** The currently rendered (visible plus over-scanned) range of items. */
export interface VisibleRange {
  /** Index of the first rendered item, inclusive. */
  startIndex: number;
  /** Index of the last rendered item, inclusive. */
  endIndex: number;
}

/** Snapshot of the currently rendered virtual window. */
export interface VirtualScrollState extends VisibleRange {
  /** The size of the viewport in pixels. */
  viewportSize: number;
  /** The total size of the virtual scroll content in pixels. */
  totalSize: number;
}

/**
 * Request for more data, emitted when the rendered window nears the end of
 * the loaded items. Listen to it to implement infinite / remote scrolling.
 */
export interface VirtualScrollDataRequest {
  /** The first index that does not yet have data. */
  startIndex: number;
  /** Number of items being requested. */
  count: number;
}
