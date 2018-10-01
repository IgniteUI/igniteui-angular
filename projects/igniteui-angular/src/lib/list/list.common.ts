import { Directive, TemplateRef } from '@angular/core';

export interface IListChild {
    index: number;
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
