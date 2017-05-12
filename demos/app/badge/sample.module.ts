import { NgModule } from "@angular/core";
import { IgxComponentsModule, IgxDirectivesModule } from "../../../src/main";
import { BadgeSampleComponent } from "./sample.component";

@NgModule({
    imports: [IgxComponentsModule, IgxDirectivesModule],
    declarations: [BadgeSampleComponent]
})
export class BadgeSampleModule {}
