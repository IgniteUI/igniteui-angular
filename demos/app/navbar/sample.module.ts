import { NgModule } from "@angular/core";

import { IgxNavbarModule } from "../../../src/main";
import { IgxIconModule } from "../../../src/main";
import { NavbarSampleComponent } from "./sample.component";

@NgModule({
    imports: [
        IgxNavbarModule,
        IgxIconModule
    ],
    declarations: [
        NavbarSampleComponent
    ]
})
export class NavbarSampleModule {}