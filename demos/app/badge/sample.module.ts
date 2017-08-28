import { NgModule } from "@angular/core";
import { IgxComponentsModule, IgxDirectivesModule } from "../../../src/main";
import { PageHeaderModule } from "../pageHeading/pageHeading.module";
import { BadgeSampleComponent } from "./sample.component";

@NgModule({
    declarations: [BadgeSampleComponent],
    imports: [IgxComponentsModule, IgxDirectivesModule, PageHeaderModule]
})
export class BadgeSampleModule { }
