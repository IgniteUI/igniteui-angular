import { ElementRef, QueryList } from "@angular/core";
import { IgxHintDirective } from "../directives/hint/hint.directive";
import { IgxInputDirective } from "../directives/input/input.directive";
export declare class IgxInputGroupComponent {
    element: ElementRef;
    private _type;
    id: string;
    defaultClass: boolean;
    hasPlaceholder: boolean;
    isRequired: boolean;
    isFocused: boolean;
    isFilled: boolean;
    isBox: boolean;
    isBorder: boolean;
    isSearch: boolean;
    isDisabled: boolean;
    readonly validClass: boolean;
    readonly invalidClass: boolean;
    hasWarning: boolean;
    protected hints: QueryList<IgxHintDirective>;
    protected input: IgxInputDirective;
    onClick(event: any): void;
    type: string;
    constructor(element: ElementRef);
    readonly hasHints: boolean;
    readonly hasBorder: boolean;
    readonly isTypeLine: boolean;
    readonly isTypeBox: boolean;
    readonly isTypeBorder: boolean;
    readonly isTypeSearch: boolean;
}
export declare class IgxInputGroupModule {
}
