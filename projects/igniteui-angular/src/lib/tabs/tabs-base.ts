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
}

/** @hidden */
export abstract class IgxTabHeaderBase {
}

/** @hidden */
export abstract class IgxTabPanelBase {
    public nativeElement: HTMLElement;
}

