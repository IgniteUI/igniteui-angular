import { NgModule } from "@angular/core";

import {FormsModule} from "@angular/forms";
import { IgxRangeModule } from "../../../src/main";
import { IgxRangeSampleComponent } from "./sample.component";

@NgModule({
    imports: [
        IgxRangeModule,
        FormsModule
    ],
    declarations: [
        IgxRangeSampleComponent
    ]
})
export class IgxRangeSampleModule {}
