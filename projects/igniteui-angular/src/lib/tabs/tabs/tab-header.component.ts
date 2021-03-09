import { Component, HostBinding } from '@angular/core';
import { IgxTabHeaderDirective } from '../tab-header.directive';
import { IgxTabHeaderBase } from '../tabs.base';

@Component({
    selector: 'igx-tab-header',
    templateUrl: 'tab-header.component.html',
    providers: [{ provide: IgxTabHeaderBase, useExisting: IgxTabHeaderComponent }]
})
export class IgxTabHeaderComponent extends IgxTabHeaderDirective {
    /** @hidden */
    @HostBinding('class.igx-tabs__header-menu-item--selected')
    public get provideCssClassSelected(): boolean {
        return this.tab.selected;
    }

    /** @hidden */
    @HostBinding('class.igx-tabs__header-menu-item--disabled')
    public get provideCssClassDisabled(): boolean {
        return this.tab.disabled;
    }

    /** @hidden */
    @HostBinding('class.igx-tabs__header-menu-item')
    public get provideCssClass(): boolean {
        return (!this.tab.disabled && !this.tab.selected);
    }
}
