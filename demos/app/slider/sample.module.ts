import { NgModule } from "@angular/core";

import {FormsModule} from "@angular/forms";
import { IgxSliderModule } from "../../../src/main";
import { IgxSliderSampleComponent } from "./sample.component";

@NgModule({
    declarations: [
        IgxSliderSampleComponent
    ],
    imports: [
        IgxSliderModule,
        FormsModule
    ]
})
export class IgxSliderSampleModule {}
