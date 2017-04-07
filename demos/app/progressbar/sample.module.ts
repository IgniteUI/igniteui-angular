import { NgModule } from "@angular/core";
import { IgxProgressBarModule, IgxButtonModule } from "../../../src/main";
import { ProgressbarSampleComponent } from "./sample.component";

@NgModule({
    imports: [IgxProgressBarModule, IgxButtonModule],
    declarations: [ProgressbarSampleComponent]
})
export class ProgressBarSampleModule {}