import { NgModule } from "@angular/core";

import { IgxButtonModule, IgxSnackbarModule } from "../../lib/main";
import { PageHeaderModule } from "../pageHeading/pageHeading.module";
import { IgxSnackbarSampleComponent } from "./sample.component";

@NgModule({
    declarations: [
        IgxSnackbarSampleComponent
    ],
    imports: [
        IgxSnackbarModule,
        IgxButtonModule,
        PageHeaderModule
    ]
})
export class IgxSnackbarSampleModule { }
