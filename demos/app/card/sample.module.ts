import { NgModule } from "@angular/core";

import {CommonModule} from "@angular/common";
import {IgxAvatar, IgxAvatarModule} from "../../../src/avatar/avatar.component";
import {IgxButton, IgxButtonModule} from "../../../src/button/button.directive";
import {IgxList, IgxListModule} from "../../../src/list/list.component";
import { IgxCardModule } from "../../../src/main";
import { IgxRippleModule } from "../../../src/main";
import { IgxCardSampleComponent } from "./sample.component";

@NgModule({
    declarations: [
        IgxCardSampleComponent
    ],
    imports: [
        IgxAvatarModule,
        IgxButtonModule,
        IgxListModule,
        IgxCardModule,
        IgxRippleModule,
        CommonModule
    ]
})
export class IgxCardSampleModule {}
