
import { Directive, HostListener } from '@angular/core';
import { IgxTabItemDirective } from './tab-item.directive';
import { IgxTabHeaderBase, IgxTabsBase } from './tabs.base';

@Directive()
export abstract class IgxTabHeaderDirective implements IgxTabHeaderBase {

    /** @hidden */
    constructor(private _tabs: IgxTabsBase, public tab: IgxTabItemDirective) {
    }

    /** @hidden */
    @HostListener('click')
    public onClick() {
        this._tabs.selectTab(this.tab, true);
    }
}
