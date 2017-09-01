import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { IgxGridModule } from "../../../src/grid/grid.component";
import { IgxComponentsModule, IgxDirectivesModule } from "../../../src/main";
import { PageHeaderModule } from "../pageHeading/pageHeading.module";
import { GridSampleComponent } from "./sample.component";

@NgModule({
    declarations: [
        GridSampleComponent
    ],
    imports: [
        FormsModule,
        CommonModule,
        IgxComponentsModule,
        IgxDirectivesModule,
        IgxGridModule,
        PageHeaderModule
    ]
})
export class GridSampleModule { }
