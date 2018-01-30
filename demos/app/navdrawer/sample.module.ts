import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { IgxDirectivesModule, IgxRadioModule, IgxSwitchModule, IgxNavigationDrawerModule } from "../../lib/main";
import { PageHeaderModule } from "../pageHeading/pageHeading.module";
import { NavdrawerSampleComponent } from "./sample.component";

@NgModule({
    declarations: [
        NavdrawerSampleComponent
    ],
    imports: [
        IgxDirectivesModule,
        IgxSwitchModule,
        IgxNavigationDrawerModule,
        CommonModule,
        FormsModule,
        IgxRadioModule,
        PageHeaderModule
    ]
})
export class NavdrawerSampleModule { }
