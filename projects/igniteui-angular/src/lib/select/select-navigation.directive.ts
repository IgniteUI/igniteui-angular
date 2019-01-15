import { IgxDropDownItemNavigationDirective } from '../drop-down/drop-down-navigation.directive';
import { Directive, Input, Inject, Optional, Self } from '@angular/core';
import { IgxDropDownBase } from '../drop-down';
import { IGX_DROPDOWN_BASE } from '../drop-down/drop-down.common';

@Directive({
    selector: '[igxSelectItemNavigation]'
})
export class IgxSelectItemNavigationDirective extends IgxDropDownItemNavigationDirective {

    protected _target: IgxDropDownBase = null;

    constructor(@Self() @Optional() @Inject(IGX_DROPDOWN_BASE) public dropdown: IgxDropDownBase) {
        super(dropdown);
    }

    get target(): IgxDropDownBase {
        return this._target;
    }

    @Input('igxSelectItemNavigation')
    set target(target: IgxDropDownBase) {
        this._target = target ? target : this.dropdown;
    }

    handleKeyDown(event: KeyboardEvent) {
        if (!event || event.altKey || event.shiftKey) {
            return;
        }
        super.handleKeyDown(event);
    }
}
