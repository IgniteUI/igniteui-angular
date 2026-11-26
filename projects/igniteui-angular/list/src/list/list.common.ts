import { Directive, TemplateRef, EventEmitter, QueryList, ElementRef, inject } from '@angular/core';
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

    /**
     * @hidden
     * @internal
     * Whether the list follows the ARIA listbox pattern.
     *
     * @returns `true` for a listbox.
     */
    public get isListbox(): boolean {
        return false;
    }

    /**
     * @hidden
     * @internal
     * Whether the list follows the ARIA layout grid pattern, one cell per row.
     *
     * @returns `true` for a grid.
     */
    public get isGrid(): boolean {
        return false;
    }

    /**
     * @hidden
     * @internal
     * Whether the list has keyboard navigation: a listbox or a grid.
     *
     * @returns `true` for a listbox or a grid.
     */
    public get isNavigable(): boolean {
        return this.isListbox || this.isGrid;
    }

    /**
     * @hidden
     * @internal
     * The role of the items that are not headers: `option` in a listbox, `row` in a grid.
     *
     * @returns The role, or `null` without navigation.
     */
    public get itemRole(): string | null {
        return null;
    }

    /**
     * @hidden
     * @internal
     * Adds an item to the list. Called by the item, which finds its list through DI.
     *
     * @param _item The item to add.
     */
    public registerItem(_item: IgxListItemComponent): void {
        // The list keeps its items.
    }

    /**
     * @hidden
     * @internal
     * Removes an item from the list. Called by the item when it is destroyed.
     *
     * @param _item The item to remove.
     */
    public unregisterItem(_item: IgxListItemComponent): void {
        // The list keeps its items.
    }

    /**
     * @hidden
     * @internal
     * The navigation attributes of `item`, which the item writes on its own host.
     *
     * @param _item The item.
     * @returns The attributes, or `null` without navigation.
     */
    public navigationStateOf(_item: IgxListItemComponent): IgxListItemNavigationState | null {
        return null;
    }
}

/**
 * @hidden
 * @internal
 * The navigation attributes of an item of a listbox or a grid. Reactive: an item reads them in an effect.
 */
export interface IgxListItemNavigationState {
    /** The `tabindex`: `0` for the tab stop, `-1` for the other options, `null` for a header. */
    tabIndex: string | null;
    /** The `aria-selected` value, or `null`. */
    selected: string | null;
    /** The `id` of the header that describes the item, or `null`. */
    describedBy: string | null;
}

/**
 * @hidden
 * Sets an attribute, or removes it with `null`, only when its value changes.
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
