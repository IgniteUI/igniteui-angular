import { Directive, Inject } from '@angular/core';
import { IgxActionStripComponent } from '../action-strip.component';
import { IgxRowDirective } from '../../grids/public_api';
import { IgxIconService } from '../../icon/icon.service';

@Directive({
    selector: '[igxGridActionsBase]'
})
export class IgxGridActionsBaseDirective {
    constructor(@Inject(IgxActionStripComponent) protected strip: IgxActionStripComponent, protected iconService: IgxIconService) { }

    /**
     * Getter to be used in template
     * @hidden
     * @internal
     */
    get isRowContext(): boolean {
        return this.isRow(this.strip.context);
    }

    /**
     * Check if the param is a row from a grid
     * @hidden
     * @internal
     * @param context
     */
    protected isRow(context): context is IgxRowDirective<any> {
        return context && context instanceof IgxRowDirective;
    }
}
