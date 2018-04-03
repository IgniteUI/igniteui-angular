import { NgModule } from "@angular/core";
import { IgxIconModule } from "../../lib/main";
import { PageHeaderModule } from "../pageHeading/pageHeading.module";
import { IconSampleComponent } from "./sample.component";

@NgModule({
    declarations: [IconSampleComponent],
    imports: [IgxIconModule, PageHeaderModule]

})
export class IconSampleModule { }
