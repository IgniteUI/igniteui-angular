import { NgModule } from "@angular/core";
import { IgxDirectivesModule } from "../../../src/main";
import { PageHeaderModule } from "../pageHeading/pageHeading.module";
import { RippleSampleComponent } from "./sample.component";

@NgModule({
    declarations: [RippleSampleComponent],
    imports: [IgxDirectivesModule, PageHeaderModule]
})
export class RippleSampleModule { }
