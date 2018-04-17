import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { IgxButtonModule, IgxGridModule, IgxCheckboxModule, IgxRippleModule } from "../../lib/main";
import { PageHeaderModule } from "../pageHeading/pageHeading.module";
import { GridColumnResizingSampleComponent } from "./sample.component";

@NgModule({
    declarations: [
        GridColumnResizingSampleComponent
    ],
    imports: [
        FormsModule,
        CommonModule,
        IgxGridModule,
        PageHeaderModule,
        IgxCheckboxModule,
        IgxRippleModule,
        IgxButtonModule
    ]
})
export class GridColumnResizingSampleModule { }
