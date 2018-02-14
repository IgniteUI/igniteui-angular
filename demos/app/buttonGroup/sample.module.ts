import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import {
    ButtonGroupAlignment,
    IgxButtonGroupComponent,
    IgxButtonGroupModule
} from "../../lib/main";
import { PageHeaderModule } from "../pageHeading/pageHeading.module";
import { ButtonGroupSampleComponent } from "./sample.component";

@NgModule({
    declarations: [ButtonGroupSampleComponent],
    imports: [IgxButtonGroupModule, PageHeaderModule]
})
export class ButtonGroupSampleModule { }
