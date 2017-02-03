import { NgModule } from "@angular/core";

import { IgxToastModule } from "../../../src/main";
import { IgxToastSampleComponent } from './sample.component';

@NgModule({
    imports: [
        IgxToastModule
    ],
    declarations: [
        IgxToastSampleComponent,
    ]
})
export class IgxToastSampleModule {}