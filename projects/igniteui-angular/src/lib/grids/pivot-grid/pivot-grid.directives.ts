import { Directive, TemplateRef, inject } from '@angular/core';
import { IgxPivotGridValueTemplateContext } from './pivot-grid.interface';
import { IgxColumnTemplateContext } from '../common/grid.interface';
/**
 * @hidden
 */
@Directive({
    selector: '[igxPivotValueChip]',
    standalone: true
})
export class IgxPivotValueChipTemplateDirective {
    template = inject<TemplateRef<IgxPivotGridValueTemplateContext>>(TemplateRef);

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
    template = inject<TemplateRef<IgxColumnTemplateContext>>(TemplateRef);

    public static ngTemplateContextGuard(_directive: IgxPivotRowDimensionHeaderTemplateDirective,
        context: unknown): context is IgxColumnTemplateContext {
        return true;
    }
}
