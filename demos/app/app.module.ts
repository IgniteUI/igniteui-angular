import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { FormsModule } from "@angular/forms";

import {

    IgInput, CarouselModule , CheckboxModule, SwitchModule,
    IgRadioModule , TabBarModule , ListModule, ButtonModule, Label,
    AvatarModule, FilterModule, IgRippleModule, BadgeModule, IgProgressBarModule

} from "../../src/main";

import { AppComponent } from "./app.component";
import { InputSampleComponent } from "./inputsample.component";
import { CarouselSampleComponent } from "./carouselsample.component";
import { TabBarSampleComponent } from "./tabbarsample.component";
import { ListSampleComponent } from "./listsample.component";
import { ButtonsSampleComponent } from "./buttonssample.component";
import { AvatarSampleComponent } from "./avatarsample.component";
import { NavDrawerSampleModule } from "./navigation-drawer/sample.module";
import { NavbarSampleModule } from "./navbar/sample.module";
<<<<<<< HEAD
import { ProgressbarSampleComponent } from "./progressbarsample.component";

=======
import { ModalSampleModule } from "./modal/sample.module";
>>>>>>> fc0c81ad4e2055b196b72d20cbab499aea260ecd
import { routing } from "./app.routing";

@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        CarouselModule,
        CheckboxModule,
        SwitchModule,
        IgRadioModule,
        TabBarModule,
        ListModule,
        ButtonModule,
        AvatarModule,
        FilterModule,
        NavDrawerSampleModule,
        NavbarSampleModule,
        ModalSampleModule,
        IgRippleModule,
        routing,
<<<<<<< HEAD
        BadgeModule,
        IgProgressBarModule
=======
        BadgeModule,        
        IgInput
>>>>>>> fc0c81ad4e2055b196b72d20cbab499aea260ecd
    ],
    declarations: [
        AppComponent,
        InputSampleComponent,
        CarouselSampleComponent,
        TabBarSampleComponent,
        ListSampleComponent,
        Label,
        ButtonsSampleComponent,
        AvatarSampleComponent,
        ProgressbarSampleComponent
    ],
    bootstrap: [
        AppComponent
    ]
})
export class AppModule {}