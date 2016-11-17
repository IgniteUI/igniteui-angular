import { NgModule } from "@angular/core";

import { IgxNavbarModule } from "../../../src/main";
import { NavbarSampleComponent } from './sample.component';

@NgModule({
    imports: [
        IgxNavbarModule,
    ],
    declarations: [
        NavbarSampleComponent,
    ]
})
export class NavbarSampleModule {}