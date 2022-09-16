import { Directive, TemplateRef } from '@angular/core';
import { IgxCellTemplateContext, IgxColumnTemplateContext, IgxSummaryTemplateContext } from '../common/grid.interface';


@Directive({
    selector: '[igxFilterCellTemplate]'
})
export class IgxFilterCellTemplateDirective {
    constructor(public template: TemplateRef<any>) {}

    public static ngTemplateContextGuard(_directive: IgxFilterCellTemplateDirective,
        context: unknown): context is IgxColumnTemplateContext { 
        return true;
    };
}

@Directive({
    selector: '[igxCell]'
})
export class IgxCellTemplateDirective {

    constructor(public template: TemplateRef<any>) { }

    public static ngTemplateContextGuard(_directive: IgxCellTemplateDirective,
        context: unknown): context is IgxCellTemplateContext { 
        return true;
    };
}

@Directive({
    selector: '[igxCellValidationError]'
})
export class IgxCellValidationErrorDirective {
    constructor(public template: TemplateRef<any>) { }

    public static ngTemplateContextGuard(_directive: IgxCellValidationErrorDirective,
        context: unknown): context is IgxCellTemplateContext { 
        return true;
    };
}

@Directive({
    selector: '[igxHeader]'
})
export class IgxCellHeaderTemplateDirective {
    constructor(public template: TemplateRef<any>) { }

    public static ngTemplateContextGuard(_directive: IgxCellHeaderTemplateDirective,
        context: unknown): context is IgxColumnTemplateContext { 
        return true;
    };
}

/**
 * @hidden
 */
@Directive({
    selector: '[igxFooter]'
})
export class IgxCellFooterTemplateDirective {

    constructor(public template: TemplateRef<any>) { }
}

@Directive({
    selector: '[igxCellEditor]'
})
export class IgxCellEditorTemplateDirective {

    constructor(public template: TemplateRef<any>) { }

    public static ngTemplateContextGuard(_directive: IgxCellEditorTemplateDirective,
        context: unknown): context is IgxCellTemplateContext { 
        return true;
    };
}

@Directive({
    selector: '[igxCollapsibleIndicator]'
})
export class IgxCollapsibleIndicatorTemplateDirective {

    constructor(public template: TemplateRef<any>) { }

    public static ngTemplateContextGuard(_directive: IgxCollapsibleIndicatorTemplateDirective,
        context: unknown): context is IgxColumnTemplateContext { 
        return true;
    };
}

@Directive({
    selector: '[igxSummary]'
})
export class IgxSummaryTemplateDirective {

    constructor(public template: TemplateRef<any>) { }

    public static ngTemplateContextGuard(_directive: IgxSummaryTemplateDirective,
        context: unknown): context is IgxSummaryTemplateContext { 
        return true;
    };
}
