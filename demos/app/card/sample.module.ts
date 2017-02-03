import { NgModule } from "@angular/core";

import { IgxCardModule } from "../../../src/main";
import { IgxCardSampleComponent } from './sample.component';
import {IgxAvatar, IgxAvatarModule} from "../../../src/avatar/avatar.component";
import {IgxButton, IgxButtonModule} from "../../../src/button/button.directive";
import { IgxRippleModule } from "../../../src/main";
import {IgxList, IgxListModule} from "../../../src/list/list.component";
import {CommonModule} from "@angular/common";

@NgModule({
    imports: [
        IgxAvatarModule,
        IgxButtonModule,
        IgxListModule,
        IgxCardModule,
        IgxRippleModule,
        CommonModule
    ],
    declarations: [
        IgxCardSampleComponent,
    ]
})
export class IgxCardSampleModule {}