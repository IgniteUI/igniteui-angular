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
     * The items that bind `selected`.
     */
    public readonly selectionItems = new Set<{ isHeader: boolean }>();

    /**
     * @hidden
     * @internal
     * Whether an item that is not a header binds `selected`.
     * Such a list follows the ARIA listbox pattern.
     */
    public get selectable(): boolean {
        for (const item of this.selectionItems) {
            if (!item.isHeader) {
                return true;
            }
        }
        return false;
    }

    /**
     * @hidden
     * @internal
     * Sets or removes (with `null`) an attribute of the list or one of its items, when it changes.
     */
    public syncAttribute(element: Element, name: string, value: string | null) {
        if (element.getAttribute(name) === value) {
            return;
        }
        if (value === null) {
            element.removeAttribute(name);
        } else {
            element.setAttribute(name, value);
        }
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
