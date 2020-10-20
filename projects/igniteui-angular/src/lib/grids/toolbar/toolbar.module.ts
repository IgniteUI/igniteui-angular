import { NgModule } from '@angular/core';
import { IgxGridToolbarComponent } from './grid-toolbar.component';
import { IgxGridToolbarCustomContentDirective } from './toolbar.directive';
import { IgxGridSharedModules } from '../common/shared.module';
import { IgxColumnActionsModule } from '../column-actions/column-actions.module';


@NgModule({
    declarations: [
        IgxGridToolbarComponent,
        IgxGridToolbarCustomContentDirective
    ],
    imports: [
        IgxGridSharedModules,
        IgxColumnActionsModule
    ],
    exports: [
        IgxGridToolbarComponent,
        IgxGridToolbarCustomContentDirective
    ]
})
export class IgxGridToolbarModule {}
