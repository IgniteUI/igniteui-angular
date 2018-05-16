import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { IgxColumnHidingModule } from "../../lib/grid/column-hiding.component";
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
import { IgxCsvExporterService, IgxExcelExporterService } from "../../lib/services/index";
import { PageHeaderModule } from "../pageHeading/pageHeading.module";
import { GridSampleComponent } from "./sample.component";

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
        IgxInputGroupModule,
        IgxColumnHidingModule
    ],
    providers: [
        IgxExcelExporterService,
        IgxCsvExporterService
    ]
})
export class GridSampleModule { }
