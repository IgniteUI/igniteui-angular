import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import {
    IgxButtonModule,
    IgxCardModule,
    IgxCheckboxModule,
    IgxGridModule,
    IgxRippleModule,
    IgxSnackbarModule,
    IgxSwitchModule,
    IgxToastModule
} from "../../lib/main";
import { PageHeaderModule } from "../pageHeading/pageHeading.module";
import { GridVirtualizationSampleComponent } from "./sample.component";

@NgModule({
    declarations: [
        GridVirtualizationSampleComponent
    ],
    imports: [
        FormsModule,
        CommonModule,
        IgxGridModule,
        PageHeaderModule,
        IgxCardModule,
        IgxSnackbarModule,
        IgxSwitchModule,
        IgxToastModule,
        IgxCheckboxModule,
        IgxRippleModule,
        IgxButtonModule
    ]
})
export class GridVirtualizationSampleModule { }
