import { NgModule } from "@angular/core";

import { PageHeaderModule } from "../pageHeading/pageHeading.module";
import { AvatarSampleComponent } from "./sample.component";
import { IgxAvatarModule } from "../../lib/main";

@NgModule({
    declarations: [AvatarSampleComponent],
    imports: [PageHeaderModule, IgxAvatarModule]
})
export class AvatarSampleModule { }
