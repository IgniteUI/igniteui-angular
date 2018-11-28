import { ElementRef, QueryList, EventEmitter } from '@angular/core';

/** @hidden */
export abstract class IgxTabsBase {
    selectedIndicator: ElementRef<any>;
    tabs: QueryList<IgxTabItemBase>;
    groups: QueryList<IgxTabsGroupBase>;
    offset: number;
    selectedIndex: number;
    viewPort: ElementRef;
    contentsContainer: ElementRef;
    tabsContainer: ElementRef;
    itemsContainer: ElementRef;
    headerContainer: ElementRef;
    onTabItemSelected: EventEmitter<{}>; // TODO: Define event arg interface!
    scrollElement(element: any, scrollRight: boolean) {}
}

/** @hidden */
export interface IgxTabItemBase {
    nativeTabItem: ElementRef;
    select(focusDelay?: number);
}

/** @hidden */
export interface IgxTabsGroupBase {
    select(focusDelay?: number);
}
