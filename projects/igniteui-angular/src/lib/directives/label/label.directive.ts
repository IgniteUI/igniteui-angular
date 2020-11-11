import { CommonModule } from '@angular/common';
import { Directive, HostBinding, Input, NgModule } from '@angular/core';

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
}

@NgModule({
    declarations: [IgxLabelDirective],
    exports: [IgxLabelDirective],
    imports: [CommonModule]
})
export class IgxLabelModule { }
