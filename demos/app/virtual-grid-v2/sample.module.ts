import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { PageHeaderModule } from "../pageHeading/pageHeading.module";
import { VirtualGridV2SampleComponent } from "./sample.component";

import { IgxGridModule, IgxVirtualGridV2Module } from "../../lib/main";

@NgModule({
    declarations: [
        VirtualGridV2SampleComponent
    ],
    imports: [
        CommonModule,
        PageHeaderModule,
        IgxGridModule,
        IgxVirtualGridV2Module,
    ]
})
export class VirtualGridV2SampleModule { }
