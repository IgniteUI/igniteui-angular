import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { PageHeaderModule } from "../pageHeading/pageHeading.module";
import { ListPerformanceSampleComponent } from "./sample.component";

import {
    IgxAvatarModule,
    IgxDialogModule,
    IgxFilterModule,
    IgxForOfModule,
    IgxIconModule,
    IgxInputGroupModule,
    IgxListModule,
    IgxSwitchModule
} from "../../lib/main";

@NgModule({
    declarations: [ListPerformanceSampleComponent],
    imports: [
        CommonModule,
        FormsModule,
        CommonModule,
        FormsModule,
        PageHeaderModule,
        IgxSwitchModule,
        IgxIconModule,
        IgxListModule,
        IgxAvatarModule,
        IgxDialogModule,
        IgxFilterModule,
        IgxForOfModule,
        IgxInputGroupModule
    ]
})
export class ListPerformanceSampleModule { }
