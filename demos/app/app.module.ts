import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { FormsModule } from "@angular/forms";

import {

    IgInput, CarouselModule , CheckboxModule, SwitchModule,
    IgRadioModule , TabBarModule , ListModule, ButtonModule, Label,
<<<<<<< HEAD
    AvatarModule, FilterModule, IgRippleModule, BadgeModule, IgProgressBarModule
=======
    AvatarModule, FilterModule, IgRippleModule, BadgeModule, IgxIconModule
>>>>>>> f7fadc6096d923eabbdfa81963c1180b7970efbb

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
import { ProgressbarSampleComponent } from "./progressbarsample.component";
import { ModalSampleModule } from "./modal/sample.module";
import { IconSampleModule } from "./icon/sample.module";
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
        IconSampleModule,
        IgRippleModule,
        routing,
        BadgeModule,
        IgProgressBarModule
        BadgeModule,
        IgInput
        BadgeModule,
        IgInput,
        IgxIconModule
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