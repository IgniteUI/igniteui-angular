import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { IgxComponentsModule, IgxDirectivesModule } from "../../../src/main";
import { PageHeaderModule } from "../pageHeading/pageHeading.module";
import { ListSampleComponent } from "./sample.component";

@NgModule({
    declarations: [ListSampleComponent],
    imports: [
        IgxComponentsModule,
         IgxDirectivesModule,
         CommonModule,
         FormsModule,
         CommonModule,
         FormsModule,
         PageHeaderModule
       ]
})
export class ListSampleModule {}
