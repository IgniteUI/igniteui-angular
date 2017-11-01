import { NgModule } from "@angular/core";
import { IgxButtonModule, IgxIconModule, IgxProgressBarModule } from "../../lib/main";
import { PageHeaderModule } from "../pageHeading/pageHeading.module";
import { ProgressbarSampleComponent } from "./sample.component";

@NgModule({
    declarations: [ProgressbarSampleComponent],
    imports: [IgxProgressBarModule, IgxButtonModule, IgxIconModule, PageHeaderModule]
})
export class ProgressBarSampleModule { }
