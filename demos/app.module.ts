import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { FormsModule } from "@angular/forms";

import {

    IgInput, CarouselModule , CheckboxModule, SwitchModule,
    IgRadioModule , TabBarModule , ListModule, ButtonModule, Label,
    AvatarModule, FilterModule, IgRippleModule

} from "../src/main";

import { AppComponent } from "./app.component";
import { SwitchSampleComponent } from "./inputs/switchsample.component";
import { RadioSampleComponent } from "./inputs/radiosample.component";
import { CarouselSampleComponent } from "./carousel/carouselsample.component";
import { TabBarSampleComponent } from "./tabbar/tabbarsample.component";
import { ListSampleComponent } from "./list/listsample.component";
import { ButtonsSampleComponent } from "./button/buttonssample.component";
import { AvatarSampleComponent } from "./avatar/avatarsample.component";
import { NavDrawerSampleModule } from "./navigation-drawer/sample.module";

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
        IgRippleModule,
        routing
    ],
    declarations: [
        IgInput,
        AppComponent,
        SwitchSampleComponent,
        RadioSampleComponent,
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