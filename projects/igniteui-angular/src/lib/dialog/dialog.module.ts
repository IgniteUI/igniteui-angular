import { NgModule } from '@angular/core';
import { IgxDialogComponent } from './dialog.component';
import { IgxDialogActionsDirective, IgxDialogTitleDirective } from './dialog.directives';

/**
 * @hidden
 * IMPORTANT: The following is NgModule exported for backwards-compatibility before standalone components
 */
@NgModule({
    imports: [IgxDialogComponent, IgxDialogTitleDirective, IgxDialogActionsDirective],
    exports: [IgxDialogComponent, IgxDialogTitleDirective, IgxDialogActionsDirective]
})
export class IgxDialogModule { }
