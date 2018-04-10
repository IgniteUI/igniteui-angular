import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import {
    IgxButtonModule,
    IgxCardModule,
    IgxCheckboxModule,
    IgxGridModule,
    IgxInputGroupModule,
    IgxRippleModule,
    IgxSnackbarModule,
    IgxSwitchModule,
    IgxToastModule
} from "../../lib/main";
import { PageHeaderModule } from "../pageHeading/pageHeading.module";
import { GridSampleComponent } from "./sample.component";
import { IgxCsvExporterService, IgxExcelExporterService } from "../../lib/services/index";

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
        IgxInputGroupModule
    ], providers: [
        IgxExcelExporterService,
        IgxCsvExporterService
    ]
})
export class GridSampleModule { }
