import { Component, Directive, HostBinding, TemplateRef } from '@angular/core';
import { GridType } from '../common/grid.interface';


// eslint-disable-next-line @angular-eslint/directive-selector
@Directive({ selector: '[excelText],excel-text' })
export class IgxExcelTextDirective { }


// eslint-disable-next-line @angular-eslint/directive-selector
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
@Component({ selector: 'igx-grid-toolbar-title', template: '<ng-content></ng-content>' })
export class IgxGridToolbarTitleComponent {
    /**
     * Host `class.igx-grid-toolbar__title` binding.
     *
     * @hidden
     * @internal
     */
    @HostBinding('class.igx-grid-toolbar__title')
    public cssClass = 'igx-grid-toolbar__title';
}

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
@Component({ selector: 'igx-grid-toolbar-actions', template: '<ng-content></ng-content>' })
export class IgxGridToolbarActionsComponent {
    /**
     * Host `class.igx-grid-toolbar__actions` binding.
     *
     * @hidden
     * @internal
     */
    @HostBinding('class.igx-grid-toolbar__actions')
    public cssClass = 'igx-grid-toolbar__actions';
 }

export interface IgxGridToolbarTemplateContext {
    $implicit: GridType;
}

@Directive({ selector: '[igxGridToolbar]'})
export class IgxGridToolbarDirective {
    constructor(public template: TemplateRef<IgxGridToolbarTemplateContext>) {}

    public static ngTemplateContextGuard(_dir: IgxGridToolbarDirective,
        ctx: unknown): ctx is IgxGridToolbarTemplateContext {
        return true
    };
}
