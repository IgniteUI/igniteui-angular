import { TemplateRef } from "@angular/core";
export interface IListChild {
    index: number;
}
export declare enum IgxListPanState {
    NONE = 0,
    LEFT = 1,
    RIGHT = 2,
}
export declare class IgxEmptyListTemplateDirective {
    template: TemplateRef<any>;
    constructor(template: TemplateRef<any>);
}
