import { NgModule } from "@angular/core";

import { IgxButtonModule, IgxRippleModule, IgxToastModule } from "../../../src/main";
import { IgxToastSampleComponent } from "./sample.component";

@NgModule({
    declarations: [
        IgxToastSampleComponent
    ],
    imports: [
        IgxToastModule,
        IgxButtonModule,
        IgxRippleModule
    ]
})
export class IgxToastSampleModule {}
