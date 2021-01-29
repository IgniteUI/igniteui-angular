
import { Directive, HostListener, Input } from '@angular/core';
import { IgxTabItemDirective } from './tab-item.directive';
import { IgxTabHeaderNewBase, IgxTabsBaseNew } from './tabs-base';

@Directive()
export abstract class IgxTabHeaderDirective implements IgxTabHeaderNewBase {
    @Input()
    public label: string;

    @Input()
    public icon: string;

    /** @hidden */
    constructor(private _tabs: IgxTabsBaseNew, public tab: IgxTabItemDirective) {
    }

    /** @hidden */
    @HostListener('click')
    public onClick() {
        this._tabs.selectTab(this.tab, true);
    }
}
