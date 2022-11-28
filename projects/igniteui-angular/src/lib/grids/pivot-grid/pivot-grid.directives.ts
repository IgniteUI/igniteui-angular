import { Directive, TemplateRef } from '@angular/core';
import { IgxPivotGridValueTemplateContext } from './pivot-grid.interface';
/**
 * @hidden
 */
@Directive({
    selector: '[igxPivotValueChip]'
})
export class IgxPivotValueChipTemplateDirective {
    constructor(public template: TemplateRef<IgxPivotGridValueTemplateContext>) { }
    public static ngTemplateContextGuard(_directive: IgxPivotValueChipTemplateDirective,
        context: unknown): context is IgxPivotGridValueTemplateContext { 
        return true;
    };
}
