import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";

import { IgxDropDownModule, IgxForOfModule, IgxToggleModule } from "../../lib/main";
import { PageHeaderModule } from "../pageHeading/pageHeading.module";
import { DropDownSampleComponent } from "./sample.component";

@NgModule({
    declarations: [DropDownSampleComponent],
    imports: [CommonModule, PageHeaderModule, IgxForOfModule, IgxToggleModule, IgxDropDownModule]
})
export class DropDownSampleModule { }
