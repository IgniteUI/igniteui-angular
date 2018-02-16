import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { IgxButtonModule, IgxGridModule, IgxCardModule, IgxSnackbarModule, IgxSwitchModule, IgxToastModule, IgxCheckboxModule, IgxRippleModule } from "../../lib/main";
import { PageHeaderModule } from "../pageHeading/pageHeading.module";
import { GridColumnPinningSampleComponent } from "./sample.component";

@NgModule({
    declarations: [
        GridColumnPinningSampleComponent
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
export class GridColumnPinningSampleModule { }
