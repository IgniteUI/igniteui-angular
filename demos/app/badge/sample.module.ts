import { NgModule } from "@angular/core";
import { IgxComponentsModule, IgxDirectivesModule } from "../../../src/main";
import { BadgeSampleComponent } from "./sample.component";

@NgModule({
    declarations: [BadgeSampleComponent],
    imports: [IgxComponentsModule, IgxDirectivesModule]
})
export class BadgeSampleModule {}
