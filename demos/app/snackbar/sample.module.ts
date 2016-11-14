import { NgModule } from '@angular/core';

import { IgxXSnackbarModule } from '../../../src/main';
import { IgxSnackbarSampleComponent } from './sample.component';
import { ButtonModule } from '../../../src/button/button';

@NgModule({
    imports: [
        IgxXSnackbarModule,
        ButtonModule
    ],
    declarations: [
        IgxSnackbarSampleComponent,
    ]
})
export class IgxSnackbarSampleModule {}