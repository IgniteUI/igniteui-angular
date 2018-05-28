import { AfterViewInit, ElementRef, EventEmitter, QueryList } from "@angular/core";
import { IgxTabItemComponent } from "./tab-item.component";
import { IgxTabsGroupComponent } from "./tabs-group.component";
export declare enum TabsType {
    FIXED = "fixed",
    CONTENTFIT = "contentfit",
}
export declare class IgxTabsComponent implements AfterViewInit {
    private _element;
    tabs: QueryList<IgxTabItemComponent>;
    groups: QueryList<IgxTabsGroupComponent>;
    tabsType: string | TabsType;
    onTabItemSelected: EventEmitter<{}>;
    onTabItemDeselected: EventEmitter<{}>;
    tabsContainer: ElementRef;
    headerContainer: ElementRef;
    itemsContainer: ElementRef;
    contentsContainer: ElementRef;
    selectedIndicator: ElementRef;
    viewPort: ElementRef;
    readonly class: any;
    selectedIndex: number;
    calculatedWidth: number;
    visibleItemsWidth: number;
    offset: number;
    scrollLeft(event: any): void;
    scrollRight(event: any): void;
    private _scroll(scrollRight);
    scrollElement(element: any, scrollRight: boolean): void;
    readonly selectedTabItem: IgxTabItemComponent;
    constructor(_element: ElementRef);
    ngAfterViewInit(): void;
    _selectedGroupHandler(args: any): void;
    private _deselectGroup(group);
}
export declare class IgxTabsModule {
}
