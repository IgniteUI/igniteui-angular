import { NgModule } from "@angular/core";

import { IgxNavbarModule } from "../../../src/main";
import { IgxIconModule } from "../../../src/main";
import { PageHeaderModule } from "../pageHeading/pageHeading.module";
import { NavbarSampleComponent } from "./sample.component";

@NgModule({
    declarations: [
        NavbarSampleComponent
    ],
    imports: [
        IgxNavbarModule,
        IgxIconModule,
        PageHeaderModule
    ]
})
export class NavbarSampleModule { }
