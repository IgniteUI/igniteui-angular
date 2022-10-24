import { Component, ViewChild } from '@angular/core';
import { IgxColumnActionsComponent } from '../column-actions/column-actions.component';
import { IgxColumnHidingDirective } from '../column-actions/column-hiding.directive';
import { BaseToolbarColumnActionsDirective } from './grid-toolbar.base';


/* blazorElement */
/* wcElementTag: igc-grid-toolbar-hiding */
/* blazorIndirectRender */
/* jsonAPIManageItemInMarkup */
/**
 * Provides a pre-configured column hiding component for the grid.
 *
 *
 * @igxModule IgxGridToolbarModule
 * @igxParent IgxGridToolbarComponent
 *
 * @example
 * ```html
 *  <igx-grid-toolbar-hiding></igx-grid-toolbar-hiding>
 * ```
 */
@Component({
    selector: 'igx-grid-toolbar-hiding',
    templateUrl: './grid-toolbar-hiding.component.html'
})
export class IgxGridToolbarHidingComponent extends BaseToolbarColumnActionsDirective {

    @ViewChild(IgxColumnHidingDirective, {read: IgxColumnActionsComponent})
    private set content(content: IgxColumnActionsComponent) {
        this.columnActionsUI = content;
    }
}
