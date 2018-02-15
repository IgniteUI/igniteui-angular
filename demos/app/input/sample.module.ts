import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import {
    IgxAvatarModule,
    IgxCheckboxModule,
    IgxIconModule,
    IgxInputModule,
    IgxLabelModule,
    IgxRadioModule,
    IgxSwitchModule
} from "../../lib/main";
import { PageHeaderModule } from "../pageHeading/pageHeading.module";
import { InputSampleComponent } from "./sample.component";

@NgModule({
    declarations: [InputSampleComponent],
    imports: [
        FormsModule,
        CommonModule,
        PageHeaderModule,
        IgxRadioModule,
        IgxIconModule,
        IgxInputModule,
        IgxCheckboxModule,
        IgxLabelModule,
        IgxSwitchModule,
        IgxAvatarModule
    ]
})
export class InputSampleModule { }
