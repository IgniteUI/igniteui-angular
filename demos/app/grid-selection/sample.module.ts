import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { IgxGridModule } from "../../lib/grid";
import { IgxCheckboxModule, IgxSwitchModule } from "../../lib/main";
import { GridSelectionComponent } from "./sample.component";

@NgModule({
    declarations: [
        GridSelectionComponent
    ],
    imports: [
        CommonModule,
        IgxGridModule,
        IgxCheckboxModule,
        IgxSwitchModule,
        FormsModule
    ]
})
export class GridSelectionModule { }
