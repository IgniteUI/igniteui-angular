import { Component, ViewChild } from '@angular/core';
import { IgxColumnActionsComponent } from '../column-actions/column-actions.component';
import { IgxColumnPinningDirective } from '../column-actions/column-pinning.directive';
import { BaseToolbarColumnActionsDirective } from './grid-toolbar.base';

/* blazorElement */
/* wcElementTag: igc-grid-toolbar-pinning */
/* blazorIndirectRender */
/* jsonAPIManageItemInMarkup */
/**
 * Provides a pre-configured column pinning component for the grid.
 *
 *
 * @igxModule IgxGridToolbarModule
 * @igxParent IgxGridToolbarComponent
 *
 * @example
 * ```html
 *  <igx-grid-toolbar-pinning></igx-grid-toolbar-pinning>
 * ```
 */
@Component({
    selector: 'igx-grid-toolbar-pinning',
    templateUrl: './grid-toolbar-pinning.component.html'
})
export class IgxGridToolbarPinningComponent extends BaseToolbarColumnActionsDirective {

    @ViewChild(IgxColumnPinningDirective, {read: IgxColumnActionsComponent})
    private set content(content: IgxColumnActionsComponent) {
        this.columnActionsUI = content;
    }
}
