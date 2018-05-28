import { AfterContentInit, TemplateRef } from "@angular/core";
import { IgxTabItemComponent } from "./tab-item.component";
import { IgxTabsComponent } from "./tabs.component";
import { IgxTabItemTemplateDirective } from "./tabs.directives";
export declare class IgxTabsGroupComponent implements AfterContentInit {
    private _tabs;
    private _itemStyle;
    isSelected: boolean;
    label: string;
    icon: string;
    isDisabled: boolean;
    role: string;
    readonly styleClass: boolean;
    readonly labelledBy: string;
    readonly id: string;
    readonly itemStyle: string;
    readonly relatedTab: IgxTabItemComponent;
    readonly index: number;
    customTabTemplate: TemplateRef<any>;
    private _tabTemplate;
    protected tabTemplate: IgxTabItemTemplateDirective;
    constructor(_tabs: IgxTabsComponent);
    ngAfterContentInit(): void;
    select(focusDelay?: number, onInit?: boolean): void;
    private _handleSelection();
}
