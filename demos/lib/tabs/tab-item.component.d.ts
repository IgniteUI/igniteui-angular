import { ElementRef } from "@angular/core";
import { IgxTabsGroupComponent } from "./tabs-group.component";
import { IgxTabsComponent } from "./tabs.component";
export declare class IgxTabItemComponent {
    private _tabs;
    private _element;
    private _nativeTabItem;
    private _changesCount;
    relatedGroup: IgxTabsGroupComponent;
    role: string;
    tabindex: any;
    onClick(event: any): void;
    onResize(event: any): void;
    onKeydownArrowRight(event: KeyboardEvent): void;
    onKeydownArrowLeft(event: KeyboardEvent): void;
    onKeydownHome(event: KeyboardEvent): void;
    onKeydownEnd(event: KeyboardEvent): void;
    private _onKeyDown(isLeftArrow, index?);
    readonly changesCount: number;
    readonly nativeTabItem: any;
    readonly isDisabled: boolean;
    readonly isSelected: boolean;
    readonly index: number;
    constructor(_tabs: IgxTabsComponent, _element: ElementRef);
    select(focusDelay?: number): void;
}
