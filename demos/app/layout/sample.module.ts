import { NgModule } from "@angular/core";
import { IgxDirectivesModule } from "../../../src/main";
import { PageHeaderModule } from "../pageHeading/pageHeading.module";
import { LayoutSampleComponent } from "./sample.component";

@NgModule({
    declarations: [LayoutSampleComponent],
    imports: [IgxDirectivesModule, PageHeaderModule]
})
export class LayoutSampleModule { }
