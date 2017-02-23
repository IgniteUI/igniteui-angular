import { NgModule } from '@angular/core';

import { IgxRangeModule } from '../../../src/main';
import { IgxRangeSampleComponent } from './sample.component';
import {FormsModule} from "@angular/forms";

@NgModule({
    imports: [
        IgxRangeModule,
        FormsModule
    ],
    declarations: [
        IgxRangeSampleComponent,
    ]
})
export class IgxRangeSampleModule {}