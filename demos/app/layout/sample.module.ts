import { NgModule } from "@angular/core";
import { PageHeaderModule } from "../pageHeading/pageHeading.module";
import { LayoutSampleComponent } from "./sample.component";

@NgModule({
    declarations: [LayoutSampleComponent],
    imports: [ PageHeaderModule]
})
export class LayoutSampleModule { }
