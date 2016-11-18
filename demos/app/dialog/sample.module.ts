import { NgModule } from "@angular/core";
import { IgxComponentsModule, IgxDirectivesModule } from "../../../src/main";
import { DialogSampleComponent } from "./sample.component";

@NgModule({
    imports: [
        IgxComponentsModule, 
        IgxDirectivesModule
    ],
    declarations: [
        DialogSampleComponent
    ]
})
export class DialogSampleModule {}