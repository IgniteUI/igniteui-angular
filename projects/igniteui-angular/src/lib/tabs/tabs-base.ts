import { QueryList, TemplateRef } from '@angular/core';

/** @hidden */
export abstract class IgxTabsBaseNew {
    public items: QueryList<IgxTabItemNewBase>;
    public selectedIndex: number;
    public abstract selectTab(tab: IgxTabItemNewBase, selected: boolean);
}

/** @hidden */
export abstract class IgxTabItemNewBase {
    public disabled: boolean;
    public selected: boolean;
    public headerTemplate: TemplateRef<any>;
    public panelTemplate: TemplateRef<any>;
}

/** @hidden */
export abstract class IgxTabHeaderNewBase {
    public label: string;
    public icon: string;
}

/** @hidden */
export abstract class IgxTabPanelNewBase {
    public nativeElement: HTMLElement;
}

