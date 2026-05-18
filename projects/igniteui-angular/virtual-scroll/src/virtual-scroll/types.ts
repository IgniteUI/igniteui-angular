/**
 * Context for the item template in the virtual scroll component.
 * Provides the item data, its index, and utility properties for template rendering.
 */
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
 * Snapshot of the currently rendered virtual window.
 */
export interface VirtualScrollState {
  /** The index of the first item currently rendered in the viewport. */
  startIndex: number;
  /** The index of the last item currently rendered in the viewport (inclusive). */
  endIndex: number;
  /** The size of the viewport in pixels. */
  viewportSize: number;
  /** The total size of the virtual scroll content in pixels. */
  totalSize: number;
}

/**
 * Request for more data to be loaded in the virtual scroll, typically emitted when the user scrolls near the end of the currently loaded items.
 * The consumer of the virtual scroll component can listen to this event and load more data as needed.
 */
export interface VirtualScrollDataRequest {
  /**
   * The first index that does not yet have data.
   * Append at least `(endIndex - startIndex + 1)` more items starting here.
   */
  startIndex: number;
  /** Number of items being requested. */
  count: number;
}
