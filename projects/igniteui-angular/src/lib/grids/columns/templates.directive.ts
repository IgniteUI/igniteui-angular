import { Directive, TemplateRef, inject } from '@angular/core';
import { IgxCellTemplateContext, IgxColumnTemplateContext, IgxSummaryTemplateContext } from '../common/grid.interface';

@Directive({
    selector: '[igxFilterCellTemplate]',
    standalone: true
})
export class IgxFilterCellTemplateDirective {
    template = inject<TemplateRef<IgxColumnTemplateContext>>(TemplateRef);


    public static ngTemplateContextGuard(_directive: IgxFilterCellTemplateDirective,
        context: unknown): context is IgxColumnTemplateContext {
        return true;
    }
}

@Directive({
    selector: '[igxCell]',
    standalone: true
})
export class IgxCellTemplateDirective {
    template = inject<TemplateRef<IgxCellTemplateContext>>(TemplateRef);


    public static ngTemplateContextGuard(_directive: IgxCellTemplateDirective,
        context: unknown): context is IgxCellTemplateContext {
        return true;
    }
}

@Directive({
    selector: '[igxCellValidationError]',
    standalone: true
})
export class IgxCellValidationErrorDirective {
    template = inject<TemplateRef<IgxCellTemplateContext>>(TemplateRef);


    public static ngTemplateContextGuard(_directive: IgxCellValidationErrorDirective,
        context: unknown): context is IgxCellTemplateContext {
        return true;
    }
}

@Directive({
    selector: '[igxHeader]',
    standalone: true
})
export class IgxCellHeaderTemplateDirective {
    template = inject<TemplateRef<IgxColumnTemplateContext>>(TemplateRef);


    public static ngTemplateContextGuard(_directive: IgxCellHeaderTemplateDirective,
        context: unknown): context is IgxColumnTemplateContext {
        return true;
    }
}

/**
 * @hidden
 */
@Directive({
    selector: '[igxFooter]',
    standalone: true
})
export class IgxCellFooterTemplateDirective {
    template = inject<TemplateRef<any>>(TemplateRef);
}

@Directive({
    selector: '[igxCellEditor]',
    standalone: true
})
export class IgxCellEditorTemplateDirective {
    template = inject<TemplateRef<IgxCellTemplateContext>>(TemplateRef);


    public static ngTemplateContextGuard(_directive: IgxCellEditorTemplateDirective,
        context: unknown): context is IgxCellTemplateContext {
        return true;
    }
}

@Directive({
    selector: '[igxCollapsibleIndicator]',
    standalone: true
})
export class IgxCollapsibleIndicatorTemplateDirective {
    template = inject<TemplateRef<IgxColumnTemplateContext>>(TemplateRef);


    public static ngTemplateContextGuard(_directive: IgxCollapsibleIndicatorTemplateDirective,
        context: unknown): context is IgxColumnTemplateContext {
        return true;
    }
}

@Directive({
    selector: '[igxSummary]',
    standalone: true
})
export class IgxSummaryTemplateDirective {
    template = inject<TemplateRef<IgxSummaryTemplateContext>>(TemplateRef);


    public static ngTemplateContextGuard(_directive: IgxSummaryTemplateDirective,
        context: unknown): context is IgxSummaryTemplateContext {
        return true;
    }
}
