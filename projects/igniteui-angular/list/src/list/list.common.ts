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

    public itemClicked: EventEmitter<any>;
    public allowLeftPanning: boolean;
    public allowRightPanning: boolean;
    public panEndTriggeringThreshold: number;
    public leftPan: EventEmitter<any>;
    public rightPan: EventEmitter<any>;
    public startPan: EventEmitter<any>;
    public endPan: EventEmitter<any>;
    public resetPan: EventEmitter<any>;
    public panStateChange: EventEmitter<any>;
    public children: QueryList<any>;
    public listItemLeftPanningTemplate: IgxListItemLeftPanningTemplateDirective;
    public listItemRightPanningTemplate: IgxListItemRightPanningTemplateDirective;
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
