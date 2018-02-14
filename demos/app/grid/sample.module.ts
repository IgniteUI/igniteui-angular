import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { IgxGridModule, IgxCardModule, IgxSnackbarModule, IgxSwitchModule, IgxToastModule, IgxCheckboxModule } from "../../lib/main";
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
        IgxToastModule ,
        IgxCheckboxModule
    ]
})
export class GridSampleModule { }
