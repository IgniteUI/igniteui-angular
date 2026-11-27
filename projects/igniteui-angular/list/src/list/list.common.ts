import { Directive, TemplateRef, EventEmitter, QueryList, ElementRef, InjectionToken, inject } from '@angular/core';
import type { IgxListItemComponent } from './list-item.component';

export interface IListChild {
    index: number;
}

/** @hidden */
@Directive({
    selector: '[igxListBase]',
    standalone: true
})
export class IgxListBaseDirective {
    protected el = inject(ElementRef, { optional: true });

    public itemClicked!: EventEmitter<any>;
    public allowLeftPanning!: boolean;
    public allowRightPanning!: boolean;
    public panEndTriggeringThreshold!: number;
    public leftPan!: EventEmitter<any>;
    public rightPan!: EventEmitter<any>;
    public startPan!: EventEmitter<any>;
    public endPan!: EventEmitter<any>;
    public resetPan!: EventEmitter<any>;
    public panStateChange!: EventEmitter<any>;
    public children!: QueryList<any>;
    public listItemLeftPanningTemplate!: IgxListItemLeftPanningTemplateDirective;
    public listItemRightPanningTemplate!: IgxListItemRightPanningTemplateDirective;
}

/**
 * @hidden
 * @internal
 * What a list tells its items about its navigation, the counterpart of `ListContext` in `igc-list`.
 * Here the list computes the state and the item writes it on its host. Reactive: an item reads it in an effect.
 */
export interface IgxListNavigationContext {
    /** Whether the list is a grid, with one cell per row. */
    isGrid(): boolean;
    /** Whether the list is a listbox or a grid. */
    isNavigable(): boolean;
    /** The role of the items that are not headers, or `null` without navigation. */
    itemRole(): string | null;
    /** Adds an item to the list. Called by the item, which finds its list through DI. */
    registerItem(item: IgxListItemComponent): void;
    /** Removes an item from the list. Called by the item when it is destroyed. */
    unregisterItem(item: IgxListItemComponent): void;
    /** The navigation attributes of `item`, or `null` without navigation. */
    navigationStateOf(item: IgxListItemComponent): IgxListItemNavigationState | null;
}

/** @hidden @internal The navigation of the closest list, which only the list provides. */
export const IGX_LIST_NAVIGATION = new InjectionToken<IgxListNavigationContext>('IgxListNavigationContext');

/** @hidden @internal A list without navigation, for an item outside of an `igx-list`. */
export const NO_LIST_NAVIGATION: IgxListNavigationContext = {
    isGrid: () => false,
    isNavigable: () => false,
    itemRole: () => null,
    registerItem: () => undefined,
    unregisterItem: () => undefined,
    navigationStateOf: () => null
};

/**
 * @hidden
 * @internal
 * The navigation state of an item of a listbox or a grid, which the item writes as attributes.
 */
export interface IgxListItemNavigationState {
    /** Whether the item is the tab stop of the list. */
    tabStop: boolean;
    /** The selected state to expose, or `null` to expose none, as for the unselected rows of a grid without `aria-multiselectable`. */
    selected: boolean | null;
    /** The `id` of the header that describes the item, or `null`. */
    describedBy: string | null;
}

/** @hidden The class of the title of an item, from `igxListLineTitle`. */
export const LIST_ITEM_TITLE = 'igx-list__item-line-title';

/** @hidden The class of the subtitle of an item, from `igxListLineSubTitle`. */
export const LIST_ITEM_SUBTITLE = 'igx-list__item-line-subtitle';

/**
 * @hidden
 * Returns the elements with `className` that belong to `item`, not to an item of a nested list.
 *
 * @param item - The host of a list item.
 * @param className - The class to look for, such as {@link LIST_ITEM_TITLE}.
 * @returns The matching elements, in document order.
 *
 * @example
 * ```typescript
 * const [title] = ownLines(item.element, LIST_ITEM_TITLE);
 * ```
 */
export function ownLines(item: HTMLElement, className: string): HTMLElement[] {
    return Array.from(item.querySelectorAll<HTMLElement>(`.${className}`))
        .filter(line => line.closest('igx-list-item') === item);
}

/**
 * @hidden
 * Returns the node that a key or focus event was dispatched on, also inside a shadow root.
 *
 * @param event - The event, during its dispatch.
 * @returns The original target, or `undefined` when it is not a node.
 *
 * @example
 * ```typescript
 * const target = eventNode(event);
 * const row = target && this.rowOf(target);
 * ```
 */
export function eventNode(event: Event): Node | undefined {
    const target = event.composedPath()[0];
    return target instanceof Node ? target : undefined;
}

/**
 * @hidden
 * Sets an attribute, or removes it with `null`, only when its value changes.
 *
 * @param element - The element to write to.
 * @param name - The attribute name.
 * @param value - The value, or `null` to remove the attribute.
 *
 * @example
 * ```typescript
 * syncAttribute(item, 'aria-selected', selected ? 'true' : null);
 * ```
 */
export function syncAttribute(element: Element, name: string, value: string | null) {
    if (element.getAttribute(name) === value) {
        return;
    }
    if (value === null) {
        element.removeAttribute(name);
    } else {
        element.setAttribute(name, value);
    }
}

/** The attribute values that the list wrote, so it can tell them apart from those of the app. */
const CLAIMED = new WeakMap<Element, Map<string, string>>();

let NEXT_ID = 0;

/**
 * @hidden
 * Writes an attribute that the app may own, like `claimTabIndex` in `igc-list`.
 *
 * @remarks
 * A value that the app set or bound wins and stays. `null` removes only the value the list wrote.
 *
 * @param element - The element to write to.
 * @param name - The attribute name.
 * @param value - The value, or `null` to remove the value the list wrote.
 *
 * @example
 * ```typescript
 * claimAttribute(item, 'aria-describedby', header?.id ?? null);
 * ```
 */
export function claimAttribute(element: Element, name: string, value: string | null) {
    const claims = CLAIMED.get(element) ?? new Map<string, string>();
    const current = element.getAttribute(name);
    if (current !== null && current !== claims.get(name)) {
        return;
    }
    if (value === null) {
        claims.delete(name);
    } else {
        claims.set(name, value);
        CLAIMED.set(element, claims);
    }
    syncAttribute(element, name, value);
}

/**
 * @hidden
 * Whether the attribute has the value that the list wrote, not one of the app.
 *
 * @param element - The element to check.
 * @param name - The attribute name.
 * @returns `true` when the list wrote the current value.
 *
 * @example
 * ```typescript
 * host.classList.toggle('igx-list--focusable', ownsAttribute(host, 'tabindex'));
 * ```
 */
export function ownsAttribute(element: Element, name: string): boolean {
    const value = element.getAttribute(name);
    return value !== null && value === CLAIMED.get(element)?.get(name);
}

/**
 * @hidden
 * Returns the `id` of `element`, and generates one when it has none.
 *
 * @remarks
 * `claimAttribute(element, 'id', null)` removes a generated `id` and keeps one of the app.
 *
 * @param element - The element that needs an `id`.
 * @param prefix - The start of a generated `id`.
 * @returns The `id`.
 *
 * @example
 * ```typescript
 * const describedBy = claimId(header, 'igx-list-header');
 * ```
 */
export function claimId(element: Element, prefix: string): string {
    if (!element.id) {
        claimAttribute(element, 'id', `${prefix}-${NEXT_ID++}`);
    }
    return element.id;
}

export enum IgxListPanState { NONE, LEFT, RIGHT }

@Directive({
    selector: '[igxEmptyList]',
    standalone: true
})
export class IgxEmptyListTemplateDirective {
    public template = inject<TemplateRef<any>>(TemplateRef);
}

@Directive({
    selector: '[igxDataLoading]',
    standalone: true
})
export class IgxDataLoadingTemplateDirective {
    public template = inject<TemplateRef<any>>(TemplateRef);
}

@Directive({
    selector: '[igxListItemLeftPanning]',
    standalone: true
})
export class IgxListItemLeftPanningTemplateDirective {
    public template = inject<TemplateRef<any>>(TemplateRef);
}

@Directive({
    selector: '[igxListItemRightPanning]',
    standalone: true
})
export class IgxListItemRightPanningTemplateDirective {
    public template = inject<TemplateRef<any>>(TemplateRef);
}
