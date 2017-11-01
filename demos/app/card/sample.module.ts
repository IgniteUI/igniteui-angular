import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";

import {
    IgxAvatarModule,
    IgxButton,
    IgxButtonModule,
    IgxCardModule,
    IgxIconModule,
    IgxList,
    IgxListModule,
    IgxRippleModule
} from "../../lib/main";

import { PageHeaderModule } from "../pageHeading/pageHeading.module";
import { IgxCardSampleComponent } from "./sample.component";

@NgModule({
    declarations: [
        IgxCardSampleComponent
    ],
    imports: [
        IgxAvatarModule,
        IgxButtonModule,
        IgxIconModule,
        IgxListModule,
        IgxCardModule,
        IgxRippleModule,
        CommonModule,
        PageHeaderModule
    ]
})
export class IgxCardSampleModule { }
