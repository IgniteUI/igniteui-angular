import { Directive, TemplateRef, EventEmitter, QueryList, ElementRef, inject } from '@angular/core';

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
     */
    public get isListbox(): boolean {
        return false;
    }

    /**
     * @hidden
     * @internal
     * Adds an item to the list. Called by the item, which finds its list through DI.
     *
     * @param _item The item to add.
     */
    public registerItem(_item: unknown): void {
        // The list keeps its items.
    }

    /**
     * @hidden
     * @internal
     * Removes an item from the list. Called by the item when it is destroyed.
     *
     * @param _item The item to remove.
     */
    public unregisterItem(_item: unknown): void {
        // The list keeps its items.
    }

    /**
     * @hidden
     * @internal
     * Whether `item` is the tab stop of the list.
     *
     * @param _item The item to check.
     */
    public isTabStop(_item: unknown): boolean {
        return false;
    }

    /**
     * @hidden
     * @internal
     * The header above `item`.
     *
     * @param _item The item whose header to find.
     */
    public headerOf(_item: unknown): unknown {
        return null;
    }
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
