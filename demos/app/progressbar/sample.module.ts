import { NgModule } from "@angular/core";
import { IgxButtonModule, IgxProgressBarModule } from "../../../src/main";
import { ProgressbarSampleComponent } from "./sample.component";

@NgModule({
    declarations: [ProgressbarSampleComponent],
    imports: [IgxProgressBarModule, IgxButtonModule]
})
export class ProgressBarSampleModule {}
