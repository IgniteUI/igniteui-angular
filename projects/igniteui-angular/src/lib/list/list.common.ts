import { Directive, TemplateRef, EventEmitter, QueryList, Optional, Inject, ElementRef } from '@angular/core';
import { DisplayDensityBase, IDisplayDensityOptions, DisplayDensityToken } from '../core/density';

export interface IListChild {
    index: number;
}

/** @hidden */
@Directive({
    selector: '[igxListBase]',
    standalone: true
})
export class IgxListBaseDirective extends DisplayDensityBase {
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

    constructor(
        @Optional() @Inject(DisplayDensityToken)
        protected _displayDensityOptions: IDisplayDensityOptions,
        @Optional() protected el: ElementRef,
    ) {
        super(_displayDensityOptions, el);
    }
}

export enum IgxListPanState { NONE, LEFT, RIGHT }

@Directive({
    selector: '[igxEmptyList]',
    standalone: true
})
export class IgxEmptyListTemplateDirective {
    constructor(public template: TemplateRef<any>) { }
}

@Directive({
    selector: '[igxDataLoading]',
    standalone: true
})
export class IgxDataLoadingTemplateDirective {
    constructor(public template: TemplateRef<any>) { }
}

@Directive({
    selector: '[igxListItemLeftPanning]',
    standalone: true
})
export class IgxListItemLeftPanningTemplateDirective {
    constructor(public template: TemplateRef<any>) { }
}

@Directive({
    selector: '[igxListItemRightPanning]',
    standalone: true
})
export class IgxListItemRightPanningTemplateDirective {
    constructor(public template: TemplateRef<any>) { }
}
