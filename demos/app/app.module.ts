import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { FormsModule } from "@angular/forms";

<<<<<<< HEAD
import {

    IgInput, CarouselModule , CheckboxModule, SwitchModule,
    IgRadioModule , TabBarModule , ListModule, ButtonModule, Label,
<<<<<<< HEAD
    AvatarModule, FilterModule, IgRippleModule, BadgeModule, IgProgressBarModule
=======
    AvatarModule, FilterModule, IgRippleModule, BadgeModule, IgxIconModule
>>>>>>> f7fadc6096d923eabbdfa81963c1180b7970efbb

} from "../../src/main";
=======
import { IgxComponentsModule, IgxDirectivesModule } from "../../src/main";
>>>>>>> f5d31f3de95c0e3f230fdb0cb55074c3dd063752

import { AppComponent } from "./app.component";
import { InputSampleModule } from "./input/sample.module";
import { CarouselSampleModule } from "./carousel/sample.module";
import { TabBarSampleModule } from "./tabbar/sample.module";
import { ListSampleModule } from "./list/sample.module";
import { ButtonSampleModule } from "./button/sample.module";
import { AvatarSampleModule } from "./avatar/sample.module";
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
        routing,
        IgxComponentsModule,
        IgxDirectivesModule,
        InputSampleModule,
        CarouselSampleModule,
        TabBarSampleModule,
        ListSampleModule,
        ButtonSampleModule,
        AvatarSampleModule,
        NavDrawerSampleModule,
        NavbarSampleModule,
        ModalSampleModule,
<<<<<<< HEAD
        IconSampleModule,
        IgRippleModule,
        routing,
        BadgeModule,
        IgProgressBarModule,
        BadgeModule,
        IgInput,
        BadgeModule,
        IgInput,
        // IgxIconModule
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
=======
        IconSampleModule
    ],
    declarations: [
        AppComponent,
>>>>>>> f5d31f3de95c0e3f230fdb0cb55074c3dd063752
    ],
    bootstrap: [
        AppComponent
    ]
})
export class AppModule {}