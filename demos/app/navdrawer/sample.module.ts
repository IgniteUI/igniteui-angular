import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { IgxDirectivesModule, IgxRadioModule, IgxSwitchModule, NavigationDrawerModule } from "../../../src/main";
import { NavdrawerSampleComponent } from "./sample.component";

@NgModule({
    declarations: [
        NavdrawerSampleComponent
    ],
    imports: [
        IgxDirectivesModule,
        IgxSwitchModule,
        NavigationDrawerModule,
        CommonModule,
        FormsModule,
        IgxRadioModule
    ]
})
export class NavdrawerSampleModule { }
