import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import {
    ButtonGroupAlignment,
    IgxButtonGroup,
    IgxButtonGroupModule,
    IgxDirectivesModule
} from "../../lib/main";
import { PageHeaderModule } from "../pageHeading/pageHeading.module";
import { ButtonGroupSampleComponent } from "./sample.component";

@NgModule({
    declarations: [ButtonGroupSampleComponent],
    imports: [IgxButtonGroupModule, IgxDirectivesModule, PageHeaderModule]
})
export class ButtonGroupSampleModule { }
