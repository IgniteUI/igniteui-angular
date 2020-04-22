import { Directive, Inject } from '@angular/core';
import { IgxActionStripComponent } from '../action-strip.component';

@Directive({
    selector: '[igxGridActionsBase]'
})
export class IgxGridActionsBaseDirective {
    constructor(@Inject(IgxActionStripComponent) protected strip: IgxActionStripComponent) { }

    get isRowContext() {
        const context = this.strip.context;
        return context && context.grid &&
            context.element.nativeElement.nodeName.toLowerCase().indexOf('grid-row') !== -1;
    }
}
