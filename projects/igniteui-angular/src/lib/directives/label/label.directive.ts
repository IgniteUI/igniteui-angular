import { Directive, HostBinding } from '@angular/core';


/**
 * @hidden
 */
@Directive({
    selector: '[igxLabel]'
})
export class IgxLabelDirective {
    @HostBinding('class.igx-input-group__label')
    public defaultClass = true;
}
