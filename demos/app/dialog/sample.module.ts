import { NgModule } from "@angular/core";
import { IgxComponentsModule, IgxDirectivesModule } from "../../../src/main";
import { PageHeaderModule } from "../pageHeading/pageHeading.module";
import { DialogSampleComponent } from "./sample.component";

@NgModule({
    declarations: [
        DialogSampleComponent
    ],
    imports: [
        IgxComponentsModule,
        IgxDirectivesModule,
        PageHeaderModule
    ]
})
export class DialogSampleModule { }
