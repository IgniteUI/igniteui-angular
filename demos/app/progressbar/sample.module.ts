import { NgModule } from "@angular/core";
import { IgxProgressBarModule, IgxButtonModule } from "../../../src/main";
import { ProgressbarSampleComponent } from "./progressbarsample.component";

@NgModule({
    imports: [IgxProgressBarModule, IgxButtonModule],
    declarations: [ProgressbarSampleComponent]
})
export class ProgressBarSampleModule {}