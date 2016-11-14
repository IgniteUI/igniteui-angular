import { NgModule } from '@angular/core';

import { IgxSnackbarModule } from '../../../src/main';
import { IgxSnackbarSampleComponent } from './sample.component';
import { ButtonModule } from '../../../src/button/button';

@NgModule({
    imports: [
        IgxSnackbarModule,
        ButtonModule
    ],
    declarations: [
        IgxSnackbarSampleComponent,
    ]
})
export class IgxSnackbarSampleModule {}