import { NgModule } from "@angular/core";

import { IgxNavbarModule } from "../../../src/main";
import { IgxIconModule } from "../../../src/main";
import { NavbarSampleComponent } from "./sample.component";

@NgModule({
    declarations: [
        NavbarSampleComponent
    ],
    imports: [
        IgxNavbarModule,
        IgxIconModule
    ]
})
export class NavbarSampleModule {}
