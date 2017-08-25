import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { IgxComponentsModule, IgxDirectivesModule } from "../../../src/main";
import { PageHeaderModule } from "../pageHeading/pageHeading.module";
import { InputSampleComponent } from "./sample.component";

@NgModule({
    declarations: [InputSampleComponent],
    imports: [IgxComponentsModule, IgxDirectivesModule, FormsModule, CommonModule, PageHeaderModule]
})
export class InputSampleModule { }
