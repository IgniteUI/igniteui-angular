import { ElementRef, QueryList, EventEmitter } from '@angular/core';

/** @hidden */
export abstract class IgxTabsBaseOld {
    public selectedIndicator: ElementRef<any>;
    public tabs: QueryList<IgxTabItemBaseOld>;
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
    public abstract performSelectionChange(newTab: IgxTabItemBaseOld);
    public abstract transformContentAnimation(tab: IgxTabItemBaseOld, duration: number);
    public abstract transformIndicatorAnimation(element: HTMLElement, duration?: number);
}

/** @hidden */
export abstract class IgxTabItemBaseOld {
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
