import { AfterContentInit, AfterViewInit, ElementRef, EventEmitter, QueryList, TemplateRef } from "@angular/core";
export interface ISelectTabEventArgs {
    tab: IgxTabComponent;
    panel: IgxTabPanelComponent;
}
export declare class IgxTabTemplateDirective {
    template: TemplateRef<any>;
    constructor(template: TemplateRef<any>);
}
export declare class IgxBottomNavComponent implements AfterViewInit {
    private _element;
    tabs: QueryList<IgxTabComponent>;
    panels: QueryList<IgxTabPanelComponent>;
    id: string;
    onTabSelected: EventEmitter<ISelectTabEventArgs>;
    onTabDeselected: EventEmitter<ISelectTabEventArgs>;
    selectedIndex: number;
    readonly itemStyle: string;
    private _itemStyle;
    readonly selectedTab: IgxTabComponent;
    constructor(_element: ElementRef);
    ngAfterViewInit(): void;
    _selectedPanelHandler(args: any): void;
    private _deselectPanel(panel);
}
export declare class IgxTabPanelComponent implements AfterContentInit {
    private _tabBar;
    private _itemStyle;
    isSelected: boolean;
    label: string;
    icon: string;
    isDisabled: boolean;
    role: string;
    readonly styleClass: boolean;
    readonly selected: boolean;
    readonly labelledBy: string;
    readonly id: string;
    readonly itemStyle: string;
    readonly relatedTab: IgxTabComponent;
    readonly index: number;
    customTabTemplate: TemplateRef<any>;
    private _tabTemplate;
    protected tabTemplate: IgxTabTemplateDirective;
    constructor(_tabBar: IgxBottomNavComponent);
    ngAfterContentInit(): void;
    select(): void;
}
export declare class IgxTabComponent {
    private _tabBar;
    private _element;
    role: string;
    relatedPanel: IgxTabPanelComponent;
    private _changesCount;
    readonly changesCount: number;
    readonly isDisabled: boolean;
    readonly isSelected: boolean;
    readonly index: number;
    constructor(_tabBar: IgxBottomNavComponent, _element: ElementRef);
    select(): void;
}
export declare class IgxBottomNavModule {
}
