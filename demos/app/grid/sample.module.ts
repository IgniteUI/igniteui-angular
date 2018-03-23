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
    IgxToastModule,
    IgxExcelExporterService
} from "../../lib/main";
import { PageHeaderModule } from "../pageHeading/pageHeading.module";
import { GridSampleComponent } from "./sample.component";
import { IgxCsvExporterService } from "../../lib/main";

@NgModule({
    declarations: [
        GridSampleComponent
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
    ], providers: [
        IgxExcelExporterService,
        IgxCsvExporterService
    ]
})
export class GridSampleModule { }
