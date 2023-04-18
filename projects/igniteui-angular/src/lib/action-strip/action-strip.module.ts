import { NgModule } from '@angular/core';
import { IgxActionStripComponent, IgxActionStripMenuItemDirective } from './action-strip.component';
import { IgxGridPinningActionsComponent } from './grid-actions/grid-pinning-actions.component';
import { IgxGridEditingActionsComponent } from './grid-actions/grid-editing-actions.component';
import { IgxGridActionsBaseDirective } from './grid-actions/grid-actions-base.directive';
import { IgxGridActionButtonComponent } from './grid-actions/grid-action-button.component';

/**
 * @hidden
 * IMPORTANT: The following is NgModule exported for backwards-compatibility before standalone components
 */
@NgModule({
    imports: [
        IgxActionStripComponent,
        IgxActionStripMenuItemDirective,
        IgxGridPinningActionsComponent,
        IgxGridEditingActionsComponent,
        IgxGridActionsBaseDirective,
        IgxGridActionButtonComponent
    ],
    exports: [
        IgxActionStripComponent,
        IgxActionStripMenuItemDirective,
        IgxGridPinningActionsComponent,
        IgxGridEditingActionsComponent,
        IgxGridActionsBaseDirective,
        IgxGridActionButtonComponent
    ],
})
export class IgxActionStripModule { }
