import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";

import { IgxDatePickerModule } from "../../../src/main";
import { IgxDatePickerSampleComponent } from "./sample.component";

@NgModule({
    declarations: [IgxDatePickerSampleComponent],
    imports: [ IgxDatePickerModule, CommonModule ]
})
export class IgxDatePickerSampleModule {}
