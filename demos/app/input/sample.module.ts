import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import {
    IgxAvatarModule,
    IgxCheckboxModule,
    IgxIconModule,
    IgxInputGroupModule,
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
        IgxInputGroupModule,
        IgxCheckboxModule,
        IgxSwitchModule,
        IgxAvatarModule
    ]
})
export class InputSampleModule { }
