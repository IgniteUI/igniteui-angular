import { AfterViewInit, ChangeDetectorRef, ElementRef, EventEmitter, QueryList, Renderer2 } from "@angular/core";
export declare enum ButtonGroupAlignment {
    horizontal = 0,
    vertical = 1,
}
export declare class IgxButtonGroupComponent implements AfterViewInit {
    private _el;
    private _renderer;
    buttons: QueryList<IgxButtonGroupComponent>;
    id: string;
    itemContentCssClass: string;
    multiSelection: boolean;
    values: any;
    disabled: boolean;
    selectedIndexes: number[];
    alignment: ButtonGroupAlignment;
    onSelect: EventEmitter<IButtonGroupEventArgs>;
    onUnselect: EventEmitter<IButtonGroupEventArgs>;
    readonly isVertical: boolean;
    private _isVertical;
    private _itemContentCssClass;
    constructor(_el: ElementRef, _renderer: Renderer2, cdr: ChangeDetectorRef);
    readonly selectedButtons: IgxButtonGroupComponent[];
    selectButton(index: number): void;
    deselectButton(index: number): void;
    ngAfterViewInit(): void;
    _clickHandler(event: any, i: any): void;
}
export interface IButtonGroupEventArgs {
    button: IgxButtonGroupComponent;
    index: number;
}
export declare class IgxButtonGroupModule {
}
