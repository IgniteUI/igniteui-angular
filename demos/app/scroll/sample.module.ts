import { NgModule } from "@angular/core";

import { CommonModule } from "@angular/common";
import {FormsModule} from "@angular/forms";
import { IgxScrollModule } from "../../../src/main";
import { IgxScrollSampleComponent } from "./sample.component";

@NgModule({
    declarations: [
        IgxScrollSampleComponent
    ],
    imports: [
        IgxScrollModule,
        CommonModule,
        FormsModule
    ]
})
export class IgxScrollSampleModule {}
