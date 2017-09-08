import { NgModule } from "@angular/core";

import { CommonModule } from "@angular/common";
import { IgxAvatar, IgxAvatarModule } from "../../../src/avatar/avatar.component";
import { IgxButton, IgxButtonModule } from "../../../src/button/button.directive";
import { IgxIconModule } from "../../../src/icon/icon.component";
import { IgxList, IgxListModule } from "../../../src/list/list.component";
import { IgxCardModule } from "../../../src/main";
import { IgxRippleModule } from "../../../src/main";
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
