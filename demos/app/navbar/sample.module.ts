import { NgModule } from "@angular/core";

import { NavbarModule } from "../../../src/main";
import { NavbarSampleComponent } from './sample.component';

@NgModule({
    imports: [
        NavbarModule,
    ],
    declarations: [
        NavbarSampleComponent,
    ]
})
export class NavbarSampleModule {}