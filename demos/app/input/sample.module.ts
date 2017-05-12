import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { IgxComponentsModule, IgxDirectivesModule } from "../../../src/main";
import { InputSampleComponent } from "./sample.component";

@NgModule({
    declarations: [InputSampleComponent],
    imports: [IgxComponentsModule, IgxDirectivesModule, FormsModule, CommonModule]
})
export class InputSampleModule {}
