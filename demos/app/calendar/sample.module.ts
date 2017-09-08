import { NgModule } from "@angular/core";

import { IgxCalendarModule, IgxCardModule } from "../../../src/main";
import { PageHeaderModule } from "../pageHeading/pageHeading.module";
import { IgxCalendarSampleComponent } from "./sample.component";

@NgModule({
    declarations: [IgxCalendarSampleComponent],
    imports: [IgxCalendarModule, IgxCardModule, PageHeaderModule]
})
export class IgxCalendarSampleModule { }
