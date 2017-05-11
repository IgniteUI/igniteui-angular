import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { IgxComponentsModule, IgxDirectivesModule } from "../../../src/main";
import { ListSampleComponent } from "./sample.component";

@NgModule({
    imports: [IgxComponentsModule, IgxDirectivesModule, CommonModule, FormsModule, CommonModule, FormsModule],
    declarations: [ListSampleComponent]
})
export class ListSampleModule {}