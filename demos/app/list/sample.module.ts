import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { PageHeaderModule } from "../pageHeading/pageHeading.module";
import { ListSampleComponent } from "./sample.component";

import { IgxSwitchModule, IgxIconModule, IgxListModule, IgxAvatarModule , IgxDialogModule, IgxFilterModule   } from "../../lib/main";

@NgModule({
    declarations: [ListSampleComponent],
    imports: [
         CommonModule,
         FormsModule,
         CommonModule,
         FormsModule,
         PageHeaderModule,
         IgxSwitchModule, IgxIconModule, IgxListModule , IgxAvatarModule , IgxDialogModule, IgxFilterModule 
       ]
})
export class ListSampleModule {}
