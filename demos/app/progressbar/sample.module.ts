import { NgModule } from "@angular/core";
import { IgxButtonModule, IgxProgressBarModule } from "../../../src/main";
import { ProgressbarSampleComponent } from "./sample.component";

@NgModule({
    imports: [IgxProgressBarModule, IgxButtonModule],
    declarations: [ProgressbarSampleComponent]
})
export class ProgressBarSampleModule {}
