import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { PageHeaderModule } from "../pageHeading/pageHeading.module";
import { VirtualContainerV2SampleComponent } from "./sample.component";
import { VirtualContainerV2Module } from "../../lib/main";
import { CellComponent } from './cell.component';
import { RowComponent } from './row.component';

@NgModule({
    declarations: [
        VirtualContainerV2SampleComponent,
        CellComponent,
        RowComponent
    ],
    imports: [
        VirtualContainerV2Module,
        PageHeaderModule,
        CommonModule
    ],
    entryComponents: [
        CellComponent,
        RowComponent
    ]
})
export class VirtualContainerV2SampleModule { }
