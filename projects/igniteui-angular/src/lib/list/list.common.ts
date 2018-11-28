import { Directive, TemplateRef, EventEmitter, QueryList } from '@angular/core';

export interface IListChild {
    index: number;
}

/** @hidden */
export abstract class IgxListBase {
    onItemClicked: EventEmitter<any>;
    allowLeftPanning: boolean;
    allowRightPanning: boolean;
    panEndTriggeringThreshold: number;
    onLeftPan: EventEmitter<any>;
    onRightPan: EventEmitter<any>;
    onPanStateChange: EventEmitter<any>;
    children: QueryList<any>;
    listItemLeftPanningTemplate: IgxListItemLeftPanningTemplateDirective;
    listItemRightPanningTemplate: IgxListItemRightPanningTemplateDirective;
}

export enum IgxListPanState { NONE, LEFT, RIGHT }

@Directive({
    selector: '[igxEmptyList]'
})
export class IgxEmptyListTemplateDirective {
    constructor(public template: TemplateRef<any>) { }
}

@Directive({
    selector: '[igxDataLoading]'
})
export class IgxDataLoadingTemplateDirective {
    constructor(public template: TemplateRef<any>) { }
}

@Directive({
    selector: '[igxListItemLeftPanning]'
})
export class IgxListItemLeftPanningTemplateDirective {
    constructor(public template: TemplateRef<any>) { }
}

@Directive({
    selector: '[igxListItemRightPanning]'
})
export class IgxListItemRightPanningTemplateDirective {
    constructor(public template: TemplateRef<any>) { }
}
