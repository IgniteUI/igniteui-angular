import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";

import { IgxCalendarModule } from "../../../src/main";
import { IgxCalendarSampleComponent } from "./sample.component";

@NgModule({
    declarations: [IgxCalendarSampleComponent],
    imports: [IgxCalendarModule, CommonModule]
})
export class IgxCalendarSampleModule {}
