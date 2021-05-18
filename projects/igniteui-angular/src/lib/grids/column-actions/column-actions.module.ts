import { NgModule } from '@angular/core';
import { IgxGridSharedModules } from '../common/shared.module';
import { IgxColumnHidingDirective } from './column-hiding.directive';
import { IgxColumnPinningDirective } from './column-pinning.directive';
import { IgxColumnActionsComponent } from './column-actions.component';
import { IgxGridPipesModule } from '../common/grid-pipes.module';
export * from './column-actions.component';
export * from './column-hiding.directive';
export * from './column-pinning.directive';

@NgModule({
    declarations: [
        IgxColumnHidingDirective,
        IgxColumnPinningDirective,
        IgxColumnActionsComponent,
    ],
    imports: [
        IgxGridSharedModules,
        IgxGridPipesModule
    ],
    exports: [
        IgxColumnHidingDirective,
        IgxColumnPinningDirective,
        IgxColumnActionsComponent
    ]
})
export class IgxColumnActionsModule { }
