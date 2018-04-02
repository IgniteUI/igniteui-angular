import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import {
    IgxInputGroupModule,
    IgxMaskModule,
    IgxSnackbarModule
} from "../../../lib/main";
import { PageHeaderModule } from "../../pageHeading/pageHeading.module";

import { MaskSampleComponent } from "./sample.component";

@NgModule({
    declarations: [MaskSampleComponent],
    imports: [
        FormsModule,
        CommonModule,
        IgxInputGroupModule,
        IgxMaskModule,
        IgxSnackbarModule,
        PageHeaderModule
    ]
})
export class MaskSampleModule { }
