import { Directive, TemplateRef, EventEmitter, QueryList, Optional, Inject } from '@angular/core';
import { DisplayDensityBase, IDisplayDensityOptions, DisplayDensityToken } from '../core/density';

export interface IListChild {
    index: number;
}

/** @hidden */
export abstract class IgxListBase extends DisplayDensityBase {
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

    constructor(@Optional() @Inject(DisplayDensityToken) protected _displayDensityOptions: IDisplayDensityOptions) {
        super(_displayDensityOptions);
    }
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
