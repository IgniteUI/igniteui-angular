import { NgModule } from "@angular/core";

import { IgxButtonModule, IgxRippleModule, IgxToastModule } from "../../lib/main";
import { PageHeaderModule } from "../pageHeading/pageHeading.module";
import { IgxToastSampleComponent } from "./sample.component";

@NgModule({
    declarations: [
        IgxToastSampleComponent
    ],
    imports: [
        IgxToastModule,
        IgxButtonModule,
        IgxRippleModule,
        PageHeaderModule
    ]
})
export class IgxToastSampleModule { }
