
import { Directive, HostListener } from '@angular/core';
import { IgxTabItemDirective } from './tab-item.directive';
import { IgxTabHeaderNewBase, IgxTabsBaseNew } from './tabs-base';

@Directive()
export abstract class IgxTabHeaderDirective implements IgxTabHeaderNewBase {

    /** @hidden */
    constructor(private _tabs: IgxTabsBaseNew, public tab: IgxTabItemDirective) {
    }

    /** @hidden */
    @HostListener('click')
    public onClick() {
        this._tabs.selectTab(this.tab, true);
    }
}
