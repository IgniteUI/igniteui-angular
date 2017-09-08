import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import {
    ButtonGroupAlignment,
    IgxButtonGroup,
    IgxButtonGroupModule
} from "../../../src/buttonGroup/buttonGroup.component";
import { IgxDirectivesModule } from "../../../src/main";
import { PageHeaderModule } from "../pageHeading/pageHeading.module";
import { ButtonGroupSampleComponent } from "./sample.component";

@NgModule({
    declarations: [ButtonGroupSampleComponent],
    imports: [IgxButtonGroupModule, IgxDirectivesModule, PageHeaderModule]
})
export class ButtonGroupSampleModule { }
