import { NgModule } from "@angular/core";
import { IgProgressBarModule } from "../../../src/main";
import { ProgressbarSampleComponent } from "./progressbarsample.component";

@NgModule({
    imports: [IgProgressBarModule],
    declarations: [ProgressbarSampleComponent]
})
export class ProgressBarSampleModule {}