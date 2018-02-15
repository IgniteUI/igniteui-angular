import { NgModule } from "@angular/core";
import { IgxButtonModule, IgxDialogModule, IgxInputModule, IgxRippleModule } from "../../lib/main";
import { PageHeaderModule } from "../pageHeading/pageHeading.module";
import { DialogSampleComponent } from "./sample.component";

@NgModule({
    declarations: [
        DialogSampleComponent
    ],
    imports: [
        PageHeaderModule, IgxDialogModule, IgxButtonModule, IgxRippleModule, IgxInputModule
    ]
})
export class DialogSampleModule { }
