import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { PageHeaderModule } from "../pageHeading/pageHeading.module";
import { InputSampleComponent } from "./sample.component";
import { IgxRadioModule, IgxIconModule, IgxCheckboxModule, IgxLabelModule, IgxSwitchModule, IgxAvatarModule } from "../../lib/main";

@NgModule({
    declarations: [InputSampleComponent],
    imports: [FormsModule, CommonModule, PageHeaderModule,IgxRadioModule, IgxIconModule, IgxCheckboxModule, IgxLabelModule, IgxSwitchModule, IgxAvatarModule ]
})
export class InputSampleModule { }
