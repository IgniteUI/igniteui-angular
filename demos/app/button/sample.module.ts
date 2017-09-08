import { NgModule } from "@angular/core";
import { IgxIconModule } from "../../../src/icon/icon.component";
import { IgxDirectivesModule } from "../../../src/main";
import { PageHeaderModule } from "../pageHeading/pageHeading.module";
import { ButtonsSampleComponent } from "./sample.component";

@NgModule({
    declarations: [ButtonsSampleComponent],
    imports: [IgxDirectivesModule, IgxIconModule, PageHeaderModule]
})
export class ButtonSampleModule { }
