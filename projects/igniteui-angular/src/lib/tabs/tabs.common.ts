import { ElementRef, QueryList, EventEmitter } from '@angular/core';

/** @hidden */
export abstract class IgxTabsBase {
    public selectedIndicator: ElementRef<any>;
    public tabs: QueryList<IgxTabItemBase>;
    public groups: QueryList<IgxTabsGroupBase>;
    public offset: number;
    public selectedIndex: number;
    public viewPort: ElementRef;
    public contentsContainer: ElementRef;
    public tabsContainer: ElementRef;
    public itemsContainer: ElementRef;
    public headerContainer: ElementRef;
    public tabItemSelected: EventEmitter<any>; // TODO: Define event arg interface!
    public hasContentTabs: boolean;
    public abstract scrollElement(element: any, scrollRight: boolean);
    public abstract performSelectionChange(newTab: IgxTabItemBase);
    public abstract transformContentAnimation(tab: IgxTabItemBase, duration: number);
    public abstract transformIndicatorAnimation(element: HTMLElement, duration?: number);
}

/** @hidden */
export abstract class IgxTabItemBase {
    public abstract readonly nativeTabItem: ElementRef;
    public get index() {
        return 0;
    }
    public select(): void {}
    public abstract setSelectedInternal(newValue: boolean);
}

/** @hidden */
export abstract class IgxTabsGroupBase {
    public abstract select(): void;
    public abstract setSelectedInternal(newValue: boolean);
}
