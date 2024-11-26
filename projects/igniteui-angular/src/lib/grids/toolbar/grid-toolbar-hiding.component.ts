import { Component, ViewChild } from '@angular/core';
import { IgxColumnActionsComponent } from '../column-actions/column-actions.component';
import { IgxColumnHidingDirective } from '../column-actions/column-hiding.directive';
import { BaseToolbarColumnActionsDirective } from './grid-toolbar.base';
import { IgxToggleDirective } from '../../directives/toggle/toggle.directive';
import { IgxIconComponent } from '../../icon/icon.component';
import { IgxButtonDirective } from '../../directives/button/button.directive';
import { NgIf, AsyncPipe } from '@angular/common';


/* blazorElement */
/* wcElementTag: igc-grid-toolbar-hiding */
/* blazorIndirectRender */
/* jsonAPIManageItemInMarkup */
/* singleInstanceIdentifier */
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
    templateUrl: './grid-toolbar-hiding.component.html',
    imports: [NgIf, IgxButtonDirective, IgxIconComponent, IgxColumnActionsComponent, IgxColumnHidingDirective, IgxToggleDirective, AsyncPipe]
})
export class IgxGridToolbarHidingComponent extends BaseToolbarColumnActionsDirective {

    @ViewChild(IgxColumnHidingDirective, {read: IgxColumnActionsComponent})
    private set content(content: IgxColumnActionsComponent) {
        this.columnActionsUI = content;
    }
}
