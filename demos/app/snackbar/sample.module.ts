import { NgModule } from "@angular/core";

import { IgxButtonModule } from "../../../src/button/button.directive";
import { IgxSnackbarModule } from "../../../src/main";
import { IgxSnackbarSampleComponent } from "./sample.component";

@NgModule({
    imports: [
        IgxSnackbarModule,
        IgxButtonModule
    ],
    declarations: [
        IgxSnackbarSampleComponent
    ]
})
export class IgxSnackbarSampleModule {}
