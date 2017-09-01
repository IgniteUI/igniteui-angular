import { NgModule } from "@angular/core";

import { FormsModule } from "@angular/forms";
import { IgxSliderModule } from "../../../src/main";
import { PageHeaderModule } from "../pageHeading/pageHeading.module";
import { IgxSliderSampleComponent } from "./sample.component";

@NgModule({
    declarations: [
        IgxSliderSampleComponent
    ],
    imports: [
        IgxSliderModule,
        FormsModule,
        PageHeaderModule
    ]
})
export class IgxSliderSampleModule { }
