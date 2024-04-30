import { Directive, TemplateRef } from '@angular/core';
import { IgxPivotGridValueTemplateContext, IgxPivotRowDimensionHeaderTemplateContext } from './pivot-grid.interface';
/**
 * @hidden
 */
@Directive({
    selector: '[igxPivotValueChip]',
    standalone: true
})
export class IgxPivotValueChipTemplateDirective {
    constructor(public template: TemplateRef<IgxPivotGridValueTemplateContext>) { }
    public static ngTemplateContextGuard(_directive: IgxPivotValueChipTemplateDirective,
        context: unknown): context is IgxPivotGridValueTemplateContext {
        return true;
    }
}

/**
 * @hidden
 */
@Directive({
    selector: '[igxPivotRowDimensionHeader]',
    standalone: true
})
export class IgxPivotRowDimensionHeaderTemplateDirective {
    constructor(public template: TemplateRef<IgxPivotRowDimensionHeaderTemplateContext>) { }
    public static ngTemplateContextGuard(_directive: IgxPivotRowDimensionHeaderTemplateDirective,
        context: unknown): context is IgxPivotRowDimensionHeaderTemplateContext {
        return true;
    }
}
