import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { PageHeaderModule } from "../pageHeading/pageHeading.module";
import { VirtualForSampleComponent } from "./sample.component";

import { IgxVirtForModule } from "../../lib/main";

@NgModule({
    declarations: [VirtualForSampleComponent],
    imports: [
         CommonModule,
         FormsModule,
         CommonModule,
         IgxVirtForModule
       ]
})
export class VirtualForSampleModule {}
