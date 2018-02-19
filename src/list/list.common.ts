import { Directive, TemplateRef } from "@angular/core";

export interface IListChild {
    index: number;
}

export enum IgxListPanState { NONE, LEFT, RIGHT }

@Directive({
    selector: "[igxEmptyList]"
})
export class IgxEmptyListTemplateDirective {
    constructor(public template: TemplateRef<any>) { }
}
