import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import {
    IgxButtonModule,
    IgxCardModule,
    IgxCheckboxModule,
    IgxGridModule,
    IgxInputModule,
    IgxRippleModule,
    IgxSnackbarModule,
    IgxSwitchModule,
    IgxToastModule
} from "../../lib/main";
import { PageHeaderModule } from "../pageHeading/pageHeading.module";
import { GridSummaryComponent } from "./sample.component";

@NgModule({
    declarations: [
        GridSummaryComponent
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
        IgxButtonModule,
        IgxRippleModule,
        IgxInputModule
    ]
})
export class GridSummarySampleModule {}
