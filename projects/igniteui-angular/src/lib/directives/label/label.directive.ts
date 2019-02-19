import { Directive, HostBinding, Input } from '@angular/core';

let NEXT_ID = 0;

/**
 * @hidden
 */
@Directive({
    selector: '[igxLabel]'
})
export class IgxLabelDirective {
    @HostBinding('class.igx-input-group__label')
    public defaultClass = true;

/**
 * @hidden
 */
    @HostBinding('attr.id')
    @Input()
    public id = `igx-label-${NEXT_ID++}`;
}
