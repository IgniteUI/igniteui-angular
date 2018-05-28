import { ElementRef } from "@angular/core";
export declare class IgxTextSelectionDirective {
    private element;
    private selectionState;
    selected: boolean;
    readonly nativeElement: any;
    onFocus(): void;
    constructor(element: ElementRef);
    trigger(): void;
}
export declare class IgxTextSelectionModule {
}
