import { NgModule } from "@angular/core";
import { IgxButtonModule, IgxIconModule, IgxProgressBarModule } from "../../../src/main";
import { ProgressbarSampleComponent } from "./sample.component";

@NgModule({
    declarations: [ProgressbarSampleComponent],
    imports: [IgxProgressBarModule, IgxButtonModule, IgxIconModule]
})
export class ProgressBarSampleModule { }
