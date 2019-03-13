import { Directive, Input } from '@angular/core';
import { IgxDropDownItemNavigationDirective } from './drop-down-navigation.directive';
import { IgxDropDownBase } from './drop-down.base';

@Directive({
    selector: '[igxVirtualNavigation]'
})
export class IgxVirtualNavigationDirective extends IgxDropDownItemNavigationDirective {
    get target(): IgxDropDownBase {
        return this._target;
    }

    @Input('igxVirtualNavigation')
    set target(target: IgxDropDownBase) {
        this._target = target ? target : this.dropdown;
    }

    /**
     * Navigates to previous item
     */
    onArrowDownKeyDown() {
        this.target.navigateNext_virtual();
    }

    /**
     * Navigates to previous item
     */
    onArrowUpKeyDown() {
        this.target.navigatePrev_virtual();
    }

    /**
     * Navigates to target's last item
     */
    onEndKeyDown() {
        this.target.navigateLast_virtual();
    }

    /**
     * Navigates to target's first item
     */
    onHomeKeyDown() {
        this.target.navigateFirst_virtual();
    }
}
