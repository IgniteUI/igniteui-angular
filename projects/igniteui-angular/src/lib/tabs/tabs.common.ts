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
    hasContentTabs: boolean;
    scrollElement(element: any, scrollRight: boolean) {}
    performSelectionChange(newTab: IgxTabItemBase) {}
    transformContentAnimation(tab: IgxTabItemBase, duration: number) {}
    transformIndicatorAnimation(element: HTMLElement, duration?: number) {}
}

/** @hidden */
export abstract class IgxTabItemBase {
    nativeTabItem: ElementRef;
    get index(): number { return 0; }
    select(): void {}
    setSelectedInternal(newValue: boolean) {}
}

/** @hidden */
export abstract class IgxTabsGroupBase {
    select(): void {}
    setSelectedInternal(newValue: boolean) {}
}
