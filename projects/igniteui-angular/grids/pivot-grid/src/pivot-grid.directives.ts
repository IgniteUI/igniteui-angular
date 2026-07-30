import { Directive, TemplateRef, inject } from '@angular/core';
import { IgxColumnTemplateContext, IgxPivotGridValueTemplateContext } from 'igniteui-angular/grids/core';
/**
 * @hidden
 */
@Directive({
    selector: '[igxPivotValueChip]',
    standalone: true
})
export class IgxPivotValueChipTemplateDirective {
    public template = inject<TemplateRef<IgxPivotGridValueTemplateContext>>(TemplateRef);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public static ngTemplateContextGuard(_directive: IgxPivotValueChipTemplateDirective, context: unknown): context is IgxPivotGridValueTemplateContext {
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
    public template = inject<TemplateRef<IgxColumnTemplateContext>>(TemplateRef);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public static ngTemplateContextGuard(_directive: IgxPivotRowDimensionHeaderTemplateDirective, context: unknown): context is IgxColumnTemplateContext {
        return true;
    }
}
