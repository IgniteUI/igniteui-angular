import { Component, ViewChild } from '@angular/core';
import { read } from 'fs';
import { IgxToggleDirective } from '../../directives/toggle/toggle.directive';
import { IgxColumnActionsComponent } from '../column-actions/column-actions.component';
import { IgxColumnHidingDirective } from '../column-actions/column-hiding.directive';
import { BaseToolbarColumnActions, BaseToolbarDirective } from './grid-toolbar.base';


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
export class IgxGridToolbarHidingComponent extends BaseToolbarColumnActions {

    @ViewChild(IgxColumnHidingDirective, {read: IgxColumnActionsComponent})
    private set content(content: IgxColumnActionsComponent) {
        this.columnActionsUI = content;
    }
}
