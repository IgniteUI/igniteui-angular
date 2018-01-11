import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { IgxGridModule } from "../../lib/main";
import { PageHeaderModule } from "../pageHeading/pageHeading.module";
import { VirtualGridSampleComponent } from "./sample.component";

@NgModule({    
    declarations: [VirtualGridSampleComponent],
    imports: [PageHeaderModule, CommonModule, IgxGridModule ]
})
export class VirtualGridSampleModule {  }
