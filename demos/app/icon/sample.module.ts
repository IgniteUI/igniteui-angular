import { NgModule } from "@angular/core";
import { IgxIconService } from "../../lib/icon/icon.service";
import { IgxIconModule } from "../../lib/main";
import { PageHeaderModule } from "../pageHeading/pageHeading.module";
import { IconSampleComponent } from "./sample.component";

@NgModule({
    declarations: [IconSampleComponent],
    imports: [IgxIconModule, PageHeaderModule],
    providers: [IgxIconService]
})
export class IconSampleModule { }
