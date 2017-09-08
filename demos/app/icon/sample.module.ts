import { NgModule } from "@angular/core";
import { IgxIconModule } from "../../../src/main";
import { PageHeaderModule } from "../pageHeading/pageHeading.module";
import { IconSampleComponent } from "./sample.component";

@NgModule({
    declarations: [IconSampleComponent],
    imports: [IgxIconModule, PageHeaderModule]
})
export class IconSampleModule {}
