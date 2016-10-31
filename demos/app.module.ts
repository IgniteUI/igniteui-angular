import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { FormsModule } from "@angular/forms";

import {

    IgInput, CarouselModule , CheckboxModule, SwitchModule,
    IgRadioModule , TabBarModule , ListModule, ButtonModule, Label,
    AvatarModule, FilterModule, IgRippleModule, BadgeModule

} from "../src/main";

import { AppComponent } from "./app.component";
import { SwitchSampleComponent } from "./inputs/switchsample.component";
import { CarouselSampleComponent } from "./carousel/carouselsample.component";
import { TabBarSampleComponent } from "./tabbar/tabbarsample.component";
import { ListSampleComponent } from "./list/listsample.component";
import { ButtonsSampleComponent } from "./button/buttonssample.component";
import { AvatarSampleComponent } from "./avatar/avatarsample.component";
import { NavDrawerSampleModule } from "./navigation-drawer/sample.module";
//import { NavbarSampleModule } from "./app/navbar/sample.module";

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
        //NavbarSampleModule,
        IgRippleModule,
        routing,
        BadgeModule
    ],
    declarations: [
        IgInput,
        AppComponent,
        SwitchSampleComponent,
        CarouselSampleComponent,
        TabBarSampleComponent,
        ListSampleComponent,
        Label,
        ButtonsSampleComponent,
        AvatarSampleComponent
    ],
    bootstrap: [
        AppComponent
    ]
})
export class AppModule {}