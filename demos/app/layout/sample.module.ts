import { NgModule } from "@angular/core";
import { IgxLayoutModule } from "../../lib/main";
import { PageHeaderModule } from "../pageHeading/pageHeading.module";
import { LayoutSampleComponent } from "./sample.component";

@NgModule({
    declarations: [LayoutSampleComponent],
    imports: [PageHeaderModule, IgxLayoutModule]
})
export class LayoutSampleModule { }
