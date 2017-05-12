import { NgModule } from "@angular/core";
import { IgxComponentsModule, IgxDirectivesModule } from "../../../src/main";
import { DialogSampleComponent } from "./sample.component";

@NgModule({
    declarations: [
        DialogSampleComponent
    ],
    imports: [
        IgxComponentsModule,
        IgxDirectivesModule
    ]
})
export class DialogSampleModule {}
