import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import {ButtonGroupAlignment, IgxButtonGroup, IgxButtonGroupModule} from "../../../src/buttonGroup/buttonGroup.component";
import { IgxDirectivesModule } from "../../../src/main";
import { ButtonGroupSampleComponent } from "./sample.component";

@NgModule({
    imports: [IgxButtonGroupModule, IgxDirectivesModule],
    declarations: [ButtonGroupSampleComponent]
})
export class ButtonGroupSampleModule {}
