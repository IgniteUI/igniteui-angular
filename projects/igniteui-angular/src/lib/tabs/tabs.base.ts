import { QueryList, TemplateRef } from '@angular/core';

/** @hidden */
export abstract class IgxTabsBase {
    public items: QueryList<IgxTabItemBase>;
    public selectedIndex: number;
    public abstract selectTab(tab: IgxTabItemBase, selected: boolean);
}

/** @hidden */
export abstract class IgxTabItemBase {
    public disabled: boolean;
    public selected: boolean;
    public headerTemplate: TemplateRef<any>;
    public panelTemplate: TemplateRef<any>;
    public headerComponent: IgxTabHeaderBase;
    public panelComponent: IgxTabPanelBase;
}

/** @hidden */
export abstract class IgxTabHeaderBase {
    public nativeElement: HTMLElement;
}

/** @hidden */
export abstract class IgxTabPanelBase {
    public nativeElement: HTMLElement;
}

