import { NgModule } from '@angular/core';

import { IgxSnackbarModule } from '../../../src/main';
import { IgxSnackbarSampleComponent } from './sample.component';
import { IgxButtonModule } from '../../../src/button/button.directive';

@NgModule({
    imports: [
        IgxSnackbarModule,
        IgxButtonModule
    ],
    declarations: [
        IgxSnackbarSampleComponent,
    ]
})
export class IgxSnackbarSampleModule {}