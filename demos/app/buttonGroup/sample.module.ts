import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ButtonGroupSampleComponent } from "./sample.component";
import { IgxDirectivesModule } from "../../../src/main";
import {IgxButtonGroup, IgxButtonGroupModule, ButtonGroupAlignment} from "../../../src/buttonGroup/buttonGroup.component";

@NgModule({
    imports: [IgxButtonGroupModule, IgxDirectivesModule],
    declarations: [ButtonGroupSampleComponent],
})
export class ButtonGroupSampleModule {}