import { NgModule } from "@angular/core";

import { ModalModule } from "../../../src/main";
import { ButtonModule } from "../../../src/main";
import { IgRippleModule } from "../../../src/main";
import { IgInput } from "../../../src/main";
import { ModalSampleComponent } from "./sample.component";

@NgModule({
    imports: [
        ModalModule,
        ButtonModule,
        IgRippleModule,
        IgInput  
    ],
    declarations: [
        ModalSampleComponent
    ]
})
export class ModalSampleModule {}