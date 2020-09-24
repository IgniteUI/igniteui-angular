import { Directive, TemplateRef } from '@angular/core';
import { IgxHierarchicalGridComponent } from '../hierarchical-grid/hierarchical-grid.component';


// tslint:disable-next-line: directive-selector
@Directive({ selector: '[excelText],excel-text' })
export class IgxExcelTextDirective { }


// tslint:disable-next-line: directive-selector
@Directive({ selector: '[csvText],csv-text' })
export class IgxCSVTextDirective { }

/**
 * Provides a way to template the title portion of the toolbar in the grid.
 *
 * @igxModule IgxGridToolbarModule
 * @igxParent IgxGridToolbarComponent
 *
 * @example
 * ```html
 * <igx-grid-toolbar-title>My custom title</igx-grid-toolbar-title>
 * ```
 */
@Directive({ selector: '[igxGridToolbarTitle],igx-grid-toolbar-title' })
export class IgxGridToolbarTitleDirective { }

/**
 * Provides a way to template the action portion of the toolbar in the grid.
 *
 * @igxModule IgxGridToolbarModule
 * @igxParent IgxGridToolbarComponent
 *
 * @example
 * ```html
 * <igx-grid-toolbar-actions>
 *  <some-toolbar-action-here />
 * </igx-grid-toolbar-actions>
 * ```
 */
@Directive({ selector: '[igxGridToolbarActions],igx-grid-toolbar-actions' })
export class IgxGridToolbarActionsDirective { }

export interface IgxGridToolbarTemplateContext {
    $implicit: IgxHierarchicalGridComponent;
}

@Directive({ selector: '[igxGridToolbar]'})
export class IgxGridToolbarDirective {
    constructor(public template: TemplateRef<IgxGridToolbarTemplateContext>) {}
}
