import { Component, HostBinding } from '@angular/core';
import { IgxTabHeaderDirective } from '../tab-header.directive';
import { IgxTabHeaderBase } from '../tabs.base';

@Component({
    selector: 'igx-bottom-nav-header',
    templateUrl: 'bottom-nav-header.component.html',
    providers: [{ provide: IgxTabHeaderBase, useExisting: IgxBottomNavHeaderComponent }]
})
export class IgxBottomNavHeaderComponent extends IgxTabHeaderDirective {

    /** @hidden */
    @HostBinding('class.igx-bottom-nav__menu-item--selected')
    public get cssClassSelected(): boolean {
        return this.tab.selected;
    }

    /** @hidden */
    @HostBinding('class.igx-bottom-nav__menu-item--disabled')
    public get cssClassDisabled(): boolean {
        return this.tab.disabled;
    }

    /** @hidden */
    @HostBinding('class.igx-bottom-nav__menu-item')
    public get cssClass(): boolean {
        return (!this.tab.disabled && !this.tab.selected);
    }
}
