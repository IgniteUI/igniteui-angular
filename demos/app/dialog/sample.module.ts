import { NgModule } from "@angular/core";

import { DialogModule } from "../../../src/main";
import { ButtonModule } from "../../../src/main";
import { IgRippleModule } from "../../../src/main";
import { IgInput } from "../../../src/main";
import { DialogSampleComponent } from "./sample.component";

@NgModule({
    imports: [
        DialogModule,
        ButtonModule,
        IgRippleModule,
        IgInput  
    ],
    declarations: [
        DialogSampleComponent
    ]
})
export class DialogSampleModule {}