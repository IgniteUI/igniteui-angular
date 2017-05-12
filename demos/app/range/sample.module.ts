import { NgModule } from "@angular/core";

import {FormsModule} from "@angular/forms";
import { IgxRangeModule } from "../../../src/main";
import { IgxRangeSampleComponent } from "./sample.component";

@NgModule({
    declarations: [
        IgxRangeSampleComponent
    ],
    imports: [
        IgxRangeModule,
        FormsModule
    ]
})
export class IgxRangeSampleModule {}
