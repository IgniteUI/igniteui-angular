import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";

import { IgxDatePickerModule } from "../../lib/main";
import { PageHeaderModule } from "../pageHeading/pageHeading.module";
import { IgxDatePickerSampleComponent } from "./sample.component";

@NgModule({
    declarations: [IgxDatePickerSampleComponent],
    imports: [IgxDatePickerModule, CommonModule, PageHeaderModule]
})
export class IgxDatePickerSampleModule { }
