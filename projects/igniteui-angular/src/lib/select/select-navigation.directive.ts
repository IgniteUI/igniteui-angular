import { IgxDropDownItemNavigationDirective } from '../drop-down/drop-down-navigation.directive';
import { Directive, Input, Inject, Optional, Self } from '@angular/core';
import { IgxSelectComponent } from './select.component';

@Directive({
    selector: '[igxSelectItemNavigation]'
})
export class IgxSelectItemNavigationDirective extends IgxDropDownItemNavigationDirective {
    @Input('igxSelectItemNavigation')
    public target: IgxSelectComponent;

    constructor() { super(null); }

    handleKeyDown(event: KeyboardEvent) {
        if (!event || event.shiftKey) {
            return;
        }
        const key = event.key.toLowerCase();

        if (event.altKey) {
            switch (key) {
                case 'arrowdown':
                    this.target.toggle();
                    break;
                case 'arrowup':
                    this.target.toggle();
                    break;
                default:
                    break;
            }
        }

        if (this.target.collapsed) {
            switch (key) {
                case 'enter':
                    this.target.open();
                    return;
                case 'space':
                case 'spacebar':
                case ' ':
                    this.target.open();
                    return;
                default:
                    break;
            }
        }

        if (!this.target.collapsed && key === 'tab') {
            this.target.close();
        }
        super.handleKeyDown(event);
    }
}
