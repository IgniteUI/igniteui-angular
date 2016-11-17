import { NgModule } from "@angular/core";

import { ModalModule } from "../../../src/main";
import { IgxButtonModule } from "../../../src/main";
import { IgxRippleModule } from "../../../src/main";
import { IgxInput } from "../../../src/main";
import { ModalSampleComponent } from "./sample.component";

@NgModule({
    imports: [
        ModalModule,
        IgxButtonModule,
        IgxRippleModule,
        IgxInput
    ],
    declarations: [
        ModalSampleComponent
    ]
})
export class ModalSampleModule {}