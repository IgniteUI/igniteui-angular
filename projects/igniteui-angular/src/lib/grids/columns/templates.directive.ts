import { Directive, TemplateRef } from '@angular/core';
import { IgxCellTemplateContext, IgxColumnTemplateContext, IgxSummaryTemplateContext } from '../common/grid.interface';

@Directive({
    selector: '[igxFilterCellTemplate]',
    standalone: true
})
export class IgxFilterCellTemplateDirective {
    constructor(public template: TemplateRef<IgxColumnTemplateContext>) { }

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
    constructor(public template: TemplateRef<IgxCellTemplateContext>) { }

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
    constructor(public template: TemplateRef<IgxCellTemplateContext>) { }

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
    constructor(public template: TemplateRef<IgxColumnTemplateContext>) { }

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
    constructor(public template: TemplateRef<any>) { }
}

@Directive({
    selector: '[igxCellEditor]',
    standalone: true
})
export class IgxCellEditorTemplateDirective {
    constructor(public template: TemplateRef<IgxCellTemplateContext>) { }

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
    constructor(public template: TemplateRef<IgxColumnTemplateContext>) { }

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
    constructor(public template: TemplateRef<IgxSummaryTemplateContext>) { }

    public static ngTemplateContextGuard(_directive: IgxSummaryTemplateDirective,
        context: unknown): context is IgxSummaryTemplateContext {
        return true;
    }
}
