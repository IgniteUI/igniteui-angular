import { Directive, HostBinding, Input, ElementRef } from '@angular/core';

let NEXT_ID = 0;

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

    constructor(public elementRef: ElementRef) { }
}
