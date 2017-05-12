import { NgModule } from "@angular/core";

import { IgxButtonModule } from "../../../src/button/button.directive";
import { IgxSnackbarModule } from "../../../src/main";
import { IgxSnackbarSampleComponent } from "./sample.component";

@NgModule({
    declarations: [
        IgxSnackbarSampleComponent
    ],
    imports: [
        IgxSnackbarModule,
        IgxButtonModule
    ]
})
export class IgxSnackbarSampleModule {}
