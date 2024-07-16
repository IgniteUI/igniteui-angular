import { IgxActionStripComponent, IgxActionStripMenuItemDirective } from './action-strip.component';
import { IgxGridActionButtonComponent } from './grid-actions/grid-action-button.component';
import { IgxGridActionsBaseDirective } from './grid-actions/grid-actions-base.directive';
import { IgxGridEditingActionsComponent } from './grid-actions/grid-editing-actions.component';
import { IgxGridPinningActionsComponent } from './grid-actions/grid-pinning-actions.component';

export { IgxGridActionsBaseDirective } from './grid-actions/grid-actions-base.directive';
export { IgxGridEditingActionsComponent } from './grid-actions/grid-editing-actions.component';
export { IgxGridPinningActionsComponent } from './grid-actions/grid-pinning-actions.component';
export { IgxActionStripComponent, IgxActionStripMenuItemDirective } from './action-strip.component';
export { IgxGridActionButtonComponent } from './grid-actions/grid-action-button.component';

/* Action-strip outside of grid directives collection for ease-of-use import in standalone components scenario */
export const IGX_ACTION_STRIP_DIRECTIVES = [
    IgxActionStripComponent,
    IgxActionStripMenuItemDirective
] as const;

/* Action-strip in grid directives collection for ease-of-use import in standalone components scenario */
export const IGX_GRID_ACTION_STRIP_DIRECTIVES = [
    IgxActionStripComponent,
    IgxActionStripMenuItemDirective,
    IgxGridPinningActionsComponent,
    IgxGridEditingActionsComponent,
    IgxGridActionsBaseDirective,
    IgxGridActionButtonComponent
] as const;
