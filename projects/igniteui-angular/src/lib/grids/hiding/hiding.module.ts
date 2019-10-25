import { NgModule } from '@angular/core';
import { IgxGridSharedModules } from '../common/shared.module';
import { IgxColumnHidingItemDirective } from './column-hiding-item.directive';
import { IgxColumnHidingComponent } from './column-hiding.component';


@NgModule({
    declarations: [
        IgxColumnHidingComponent,
        IgxColumnHidingItemDirective
    ],
    imports: [
        IgxGridSharedModules
    ],
    exports: [
        IgxColumnHidingComponent
    ],
})
export class IgxColumnHidingModule {}
