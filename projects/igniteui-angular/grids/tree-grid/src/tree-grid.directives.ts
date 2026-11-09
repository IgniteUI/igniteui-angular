import { Directive, TemplateRef, inject } from '@angular/core';

/**
 * Marks an `ng-template` as the row loading indicator of an `igx-tree-grid` that loads its child rows on demand.
 * The template is displayed in place of the expand indicator while the children of a row are being loaded.
 *
 * @example
 * ```html
 * <igx-tree-grid [data]="data" primaryKey="ID" foreignKey="ParentID" [loadChildrenOnDemand]="loadChildren">
 *     <ng-template igxRowLoadingIndicator>
 *         <igx-icon>loop</igx-icon>
 *     </ng-template>
 * </igx-tree-grid>
 * ```
 */
@Directive({
    selector: '[igxRowLoadingIndicator]',
    standalone: true
})
export class IgxRowLoadingIndicatorTemplateDirective {
    /**
     * The template reference of the row loading indicator.
     *
     * @returns The `TemplateRef` of the `ng-template` the directive is applied to.
     * @example
     * ```typescript
     * @ViewChild(IgxRowLoadingIndicatorTemplateDirective) public loadingIndicator: IgxRowLoadingIndicatorTemplateDirective;
     * const template = this.loadingIndicator.template;
     * ```
     */
    public template = inject<TemplateRef<any>>(TemplateRef);
}
