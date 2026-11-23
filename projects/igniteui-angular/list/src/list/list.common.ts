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
