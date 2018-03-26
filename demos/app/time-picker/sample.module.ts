import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";

import { IgxTimePickerModule } from "../../lib/main";
import { PageHeaderModule } from "../pageHeading/pageHeading.module";
import { IgxTimePickerSampleComponent } from "./sample.component";

@NgModule({
    declarations: [IgxTimePickerSampleComponent],
    imports: [IgxTimePickerModule, CommonModule, PageHeaderModule]
})
export class IgxTimePickerSampleModule { }
