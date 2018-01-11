import { NgModule } from "@angular/core";

import { PageHeaderModule } from "../pageHeading/pageHeading.module";
import { VirtualContainerV2SampleComponent } from "./sample.component";
import { VirtualContainerModule } from "../../lib/main";

@NgModule({
    declarations: [
        VirtualContainerV2SampleComponent
    ],
    imports: [
        VirtualContainerModule,
        PageHeaderModule
    ]
})
export class VirtualContainerV2SampleModule { }
