import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { IgxGridModule } from "../../lib/grid";
import { IgxCheckboxModule } from "../../lib/main";
import { GridSelectionComponent } from "./sample.component";

@NgModule({
    declarations: [
        GridSelectionComponent
    ],
    imports: [
        CommonModule,
        IgxGridModule,
        IgxCheckboxModule
    ]
})
export class GridSelectionModule { }
