import { Component, ViewChild } from '@angular/core';
import { IgxColumnActionsComponent } from '../column-actions/column-actions.component';
import { IgxColumnPinningDirective } from '../column-actions/column-pinning.directive';
import { BaseToolbarColumnActionsDirective } from './grid-toolbar.base';
import { IgxToggleDirective } from '../../directives/toggle/toggle.directive';
import { IgxIconComponent } from '../../icon/icon.component';
import { IgxButtonDirective } from '../../directives/button/button.directive';
import { NgIf, AsyncPipe } from '@angular/common';

/* blazorElement */
/* wcElementTag: igc-grid-toolbar-pinning */
/* singleInstanceIdentifier */
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
    templateUrl: './grid-toolbar-pinning.component.html',
    imports: [NgIf, IgxButtonDirective, IgxIconComponent, IgxColumnActionsComponent, IgxColumnPinningDirective, IgxToggleDirective, AsyncPipe]
})
export class IgxGridToolbarPinningComponent extends BaseToolbarColumnActionsDirective {

    @ViewChild(IgxColumnPinningDirective, {read: IgxColumnActionsComponent})
    private set content(content: IgxColumnActionsComponent) {
        this.columnActionsUI = content;
    }
}
