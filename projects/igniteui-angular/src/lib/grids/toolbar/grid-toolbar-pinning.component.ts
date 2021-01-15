import { Component, ElementRef, ViewChild } from '@angular/core';
import { IgxToggleDirective } from '../../directives/toggle/toggle.directive';
import { IgxColumnActionsComponent } from '../column-actions/column-actions.component';
import { IgxColumnPinningDirective } from '../column-actions/column-pinning.directive';
import { BaseToolbarColumnActions } from './grid-toolbar.base';

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
export class IgxGridToolbarPinningComponent extends BaseToolbarColumnActions {

    @ViewChild(IgxColumnPinningDirective, {read: IgxColumnActionsComponent})
    private set content(content: IgxColumnActionsComponent) {
        this.columnActionsUI = content;
    }
}
