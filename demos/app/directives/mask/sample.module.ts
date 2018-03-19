import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { PageHeaderModule } from "../../pageHeading/pageHeading.module";
import {
    IgxInputModule,
    IgxLabelModule,
    IgxSnackbarModule,
    IgxMaskModule
} from "../../../lib/main";

import { MaskSampleComponent } from "./sample.component";

@NgModule({
    declarations: [MaskSampleComponent],
    imports: [
        FormsModule,
        CommonModule,
        IgxInputModule,
        IgxMaskModule,
        IgxSnackbarModule,
        IgxLabelModule,
        PageHeaderModule
    ]
})
export class MaskSampleModule { }
