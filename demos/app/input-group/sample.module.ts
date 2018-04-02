import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { IgxIconModule, IgxInputGroupModule, IgxMaskModule } from "../../lib/main";
import { PageHeaderModule } from "../pageHeading/pageHeading.module";
import { InputGroupSampleComponent } from "./input-group.component";

@NgModule({
    declarations: [InputGroupSampleComponent],
    imports: [
        FormsModule,
        CommonModule,
        PageHeaderModule,
        IgxInputGroupModule,
        IgxIconModule,
        IgxMaskModule
    ]
})
export class InputGroupSampleModule { }
