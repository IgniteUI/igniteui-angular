import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";

import { IgxCalendarModule, IgxCardModule } from "../../../src/main";
import { IgxCalendarSampleComponent } from "./sample.component";

@NgModule({
    declarations: [IgxCalendarSampleComponent],
    imports: [IgxCalendarModule, IgxCardModule, CommonModule]
})
export class IgxCalendarSampleModule { }
