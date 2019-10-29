import { NgModule } from '@angular/core';
import { IgxColumnPinningItemDirective } from './pinning.directive';
import { IgxColumnPinningComponent } from './column-pinning.component';
import { IgxGridSharedModules } from '../common/shared.module';


@NgModule({
    declarations: [
        IgxColumnPinningItemDirective,
        IgxColumnPinningComponent
    ],
    imports: [
        IgxGridSharedModules
    ],
    exports: [
        IgxColumnPinningComponent
    ]
})
export class IgxColumnPinningModule {}
