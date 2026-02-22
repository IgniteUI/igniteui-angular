import { Directive, TemplateRef } from '@angular/core';

/**
 * Directive to provide a custom separator template for the breadcrumb.
 *
 * @example
 * ```html
 * <igx-breadcrumb>
 *   <ng-template igxBreadcrumbSeparator>
 *     <igx-icon>arrow_forward</igx-icon>
 *   </ng-template>
 *   <!-- items -->
 * </igx-breadcrumb>
 * ```
 */
@Directive({
    selector: '[igxBreadcrumbSeparator]',
    standalone: true
})
export class IgxBreadcrumbSeparatorDirective {
    constructor(public template: TemplateRef<unknown>) {}
}

/**
 * Directive to provide a custom item template for the breadcrumb.
 *
 * @example
 * ```html
 * <igx-breadcrumb>
 *   <ng-template igxBreadcrumbItemTemplate let-item>
 *     <span class="custom-item">{{ item.label }}</span>
 *   </ng-template>
 *   <!-- items -->
 * </igx-breadcrumb>
 * ```
 */
@Directive({
    selector: '[igxBreadcrumbItemTemplate]',
    standalone: true
})
export class IgxBreadcrumbItemTemplateDirective {
    constructor(public template: TemplateRef<unknown>) {}
}
