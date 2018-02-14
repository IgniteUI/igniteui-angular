import { NgModule } from "@angular/core";

import { PageHeaderModule } from "../pageHeading/pageHeading.module";
import { BadgeSampleComponent } from "./sample.component";
import {  IgxBadgeModule,IgxAvatarModule } from "../../lib/main";


@NgModule({
    declarations: [BadgeSampleComponent],
    imports: [PageHeaderModule, IgxBadgeModule, IgxAvatarModule]
})
export class BadgeSampleModule { }
