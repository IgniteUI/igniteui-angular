import {
  Directive,
  EmbeddedViewRef,
  inject,
  input,
  OnChanges,
  TemplateRef,
  ViewContainerRef,
} from "@angular/core";

/** The context of a recycled view. A reused view gets a new `$implicit`. */
export interface IgxVsRecycleContext<T> {
  $implicit: T;
}

type RecycledView<T> = EmbeddedViewRef<IgxVsRecycleContext<T>>;

/**
 * Weights for choosing the views that stay in place. A recycled view needs a
 * new layout anyway, so kept views move only when fewer than half the recycled
 * ones.
 */
const KEPT_WEIGHT = 2;
const RECYCLED_WEIGHT = 1;

/**
 * Marks the entries of the increasing subsequence of `values` with the largest
 * total weight. The values are distinct integers in `[0, size)`, or negative
 * for the entries to skip. O(n log size).
 */
function heaviestIncreasingSubsequence(
  values: Int32Array,
  weights: Int32Array,
  size: number,
): Uint8Array {
  // Fenwick tree over values: each node holds the heaviest weight ending in
  // its range, and that entry.
  const heaviest = new Int32Array(size + 1);
  const endsAt = new Int32Array(size + 1);
  const previous = new Int32Array(values.length);
  const marked = new Uint8Array(values.length);
  let best = 0;
  let last = -1;

  for (let i = 0; i < values.length; i++) {
    if (values[i] < 0) {
      continue;
    }

    let total = 0;
    let before = -1;
    for (let node = values[i]; node > 0; node -= node & -node) {
      if (heaviest[node] > total) {
        total = heaviest[node];
        before = endsAt[node];
      }
    }

    total += weights[i];
    previous[i] = before;
    for (let node = values[i] + 1; node <= size; node += node & -node) {
      if (total > heaviest[node]) {
        heaviest[node] = total;
        endsAt[node] = i;
      }
    }

    if (total > best) {
      best = total;
      last = i;
    }
  }

  for (let i = last; i >= 0; i = previous[i]) {
    marked[i] = 1;
  }
  return marked;
}

/**
 * @hidden @internal
 *
 * Like `@for`, but hands the view of a leaving key to an entering key instead
 * of destroying and recreating it, which avoids DOM churn on each scroll step.
 * Reused views keep DOM state the template does not bind.
 *
 * ```
 * keys   0 1 2 3            2 3 4 5      a scroll by two items
 * views  A B C D    ->      C D A B      C, D kept; A, B recycled
 * ```
 *
 * Untaken views are destroyed, not pooled: content queries still report
 * components in detached views.
 */
@Directive({ selector: "[igxVsRecycle][igxVsRecycleOf]" })
export class IgxVsRecycleDirective<T> implements OnChanges {
  private readonly _container = inject(ViewContainerRef);
  private readonly _template =
    inject<TemplateRef<IgxVsRecycleContext<T>>>(TemplateRef);

  /** The items to render, in order. */
  public readonly igxVsRecycleOf = input.required<readonly T[]>();

  /** Returns the key of an item. */
  public readonly igxVsRecycleKey = input.required<(item: T) => unknown>();

  /** The rendered views and their keys, in DOM order. */
  private _views: RecycledView<T>[] = [];
  private _keys: unknown[] = [];

  public static ngTemplateContextGuard<T>(
    _directive: IgxVsRecycleDirective<T>,
    _context: unknown,
  ): _context is IgxVsRecycleContext<T> {
    return true;
  }

  public ngOnChanges(): void {
    const items = this.igxVsRecycleOf();
    const keys = items.map(this.igxVsRecycleKey());

    this._views = this._reconcile(items, keys);
    this._keys = keys;
  }

  /**
   * Gives each key a view, orders the views by key, and sets their items.
   *
   * 1. A staying key keeps its view.
   * 2. Other keys take the leftover views in DOM order, so a full replacement
   *    moves no DOM. Views are created when those run out; untaken ones are
   *    destroyed.
   * 3. The heaviest subsequence of reused views that keeps its order stays put
   *    (see `KEPT_WEIGHT`). The focused view outweighs all others, so it keeps
   *    focus. Each other view moves in front of its successor.
   */
  private _reconcile(
    items: readonly T[],
    keys: readonly unknown[],
  ): RecycledView<T>[] {
    const oldViews = this._views;
    const count = keys.length;
    const focused = this._focusedPosition();

    // The old DOM position (-1 for a new view) and the weight of the view at
    // each new position.
    const from = new Int32Array(count).fill(-1);
    const weights = new Int32Array(count);
    const claimed = new Uint8Array(oldViews.length);

    // The first old position of each key, so duplicate keys keep one view.
    const oldPositions = new Map<unknown, number>();
    for (let i = this._keys.length - 1; i >= 0; i--) {
      oldPositions.set(this._keys[i], i);
    }

    for (let i = 0; i < count; i++) {
      const position = oldPositions.get(keys[i]);
      if (position === undefined || claimed[position]) {
        continue;
      }

      claimed[position] = 1;
      from[i] = position;
      weights[i] = position === focused ? KEPT_WEIGHT * count : KEPT_WEIGHT;
    }

    let spare = 0;
    for (let i = 0; i < count && spare < oldViews.length; i++) {
      if (from[i] >= 0) {
        continue;
      }

      while (spare < oldViews.length && claimed[spare]) {
        spare++;
      }
      if (spare < oldViews.length) {
        claimed[spare] = 1;
        from[i] = spare;
        weights[i] = RECYCLED_WEIGHT;
      }
    }

    oldViews.forEach((view, position) => {
      if (!claimed[position]) {
        view.destroy();
      }
    });

    const stable = heaviestIncreasingSubsequence(from, weights, oldViews.length);
    const views: RecycledView<T>[] = new Array(count);
    let next: RecycledView<T> | undefined;

    // Walk backwards, so the successor of each view is already in place.
    for (let i = count - 1; i >= 0; i--) {
      let view = from[i] < 0 ? undefined : oldViews[from[i]];

      if (view) {
        if (!stable[i]) {
          this._moveBefore(view, next);
        }
        view.context.$implicit = items[i];
      } else {
        view = this._container.createEmbeddedView(
          this._template,
          { $implicit: items[i] },
          next ? this._container.indexOf(next) : undefined,
        );
      }

      views[i] = view;
      next = view;
    }
    return views;
  }

  /** Moves `view` in front of `next`, or to the end without one. */
  private _moveBefore(view: RecycledView<T>, next?: RecycledView<T>): void {
    const current = this._container.indexOf(view);
    const target = next
      ? this._container.indexOf(next)
      : this._container.length;

    if (current === target - 1) {
      return;
    }

    // `move` removes the view before it inserts it, which shifts the later
    // indices down by one.
    this._container.move(view, current < target ? target - 1 : target);
  }

  /** The position in `_views` of the view that holds the focus, or -1. */
  private _focusedPosition(): number {
    const parent = (this._container.element.nativeElement as Node).parentNode;
    if (!parent || this._views.length === 0) {
      return -1;
    }

    // The root, not the document: the list can render in a shadow root.
    const root = parent.getRootNode() as Partial<DocumentOrShadowRoot>;
    let node: Node | null = root.activeElement ?? null;

    while (node && node.parentNode !== parent) {
      node = node.parentNode;
    }
    if (!node) {
      return -1;
    }

    return this._views.findIndex((view) => view.rootNodes.includes(node));
  }
}
