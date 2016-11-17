import { NgModule } from "@angular/core";

import { DialogModule } from "../../../src/main";
import { IgxButtonModule } from "../../../src/main";
import { IgxRippleModule } from "../../../src/main";
import { IgxInput } from "../../../src/main";
import { DialogSampleComponent } from "./sample.component";

@NgModule({
    imports: [
        DialogModule,
        IgxButtonModule,
        IgxRippleModule,
        IgxInput
    ],
    declarations: [
        DialogSampleComponent
    ]
})
export class DialogSampleModule {}