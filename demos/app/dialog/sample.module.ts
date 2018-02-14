import { NgModule } from "@angular/core";
import { PageHeaderModule } from "../pageHeading/pageHeading.module";
import { DialogSampleComponent } from "./sample.component";
import { IgxDialogModule   } from "../../lib/main";

@NgModule({
    declarations: [
        DialogSampleComponent
    ],
    imports: [
        PageHeaderModule, IgxDialogModule
    ]
})
export class DialogSampleModule { }
