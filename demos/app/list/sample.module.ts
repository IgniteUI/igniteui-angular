import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { PageHeaderModule } from "../pageHeading/pageHeading.module";
import { ListSampleComponent } from "./sample.component";

import {
    IgxAvatarModule,
    IgxDialogModule,
    IgxFilterModule,
    IgxIconModule,
    IgxInputGroupModule,
    IgxListModule,
    IgxSwitchModule
} from "../../lib/main";

@NgModule({
    declarations: [ListSampleComponent],
    imports: [
        CommonModule,
        FormsModule,
        PageHeaderModule,
        IgxSwitchModule,
        IgxIconModule,
        IgxListModule,
        IgxAvatarModule,
        IgxDialogModule,
        IgxFilterModule,
        IgxInputGroupModule
    ]
})
export class ListSampleModule { }
