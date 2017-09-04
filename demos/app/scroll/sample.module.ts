import { NgModule } from "@angular/core";

import { CommonModule } from "@angular/common";
import {FormsModule} from "@angular/forms";
import { IgxScrollModule } from "../../../src/main";
import { IgxScrollSampleComponent } from "./sample.component";
import {IgxListModule} from "../../../src/list/list.component";

@NgModule({
    declarations: [
        IgxScrollSampleComponent
    ],
    imports: [
        IgxScrollModule,
        IgxListModule,
        CommonModule,
        FormsModule
    ]
})
export class IgxScrollSampleModule {}
