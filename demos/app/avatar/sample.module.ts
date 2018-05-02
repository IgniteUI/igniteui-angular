import { NgModule } from "@angular/core";

import { PageHeaderModule } from "../pageHeading/pageHeading.module";
import { AvatarSampleComponent } from "./sample.component";
import { IgxAvatarModule } from "../../lib/main";
import { IgxDragDropModule } from "../../lib/directives/dragdrop/dragdrop.directive";

@NgModule({
    declarations: [AvatarSampleComponent],
    imports: [PageHeaderModule, IgxAvatarModule, IgxDragDropModule]
})
export class AvatarSampleModule { }
