import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { FormsModule } from "@angular/forms";

import {

    IgInput, CarouselModule , CheckboxModule, SwitchModule, IgLayout,
    IgRadioModule, TabBarModule, ListModule, ButtonModule, Label,
    AvatarModule, FilterModule, IgRippleModule, BadgeModule

} from "zero-blocks/main";

import { AppComponent } from "./app.component";
import { SwitchSampleComponent } from "./switch/switchsample.component";
import { RadioSampleComponent } from "./radio/radiosample.component";
import { LayoutSampleComponent } from "./layout/layoutsample.component";
import { FilterSampleComponent } from "./filter/filtersample.component";
import { RippleSampleComponent } from "./ripple/ripplesample.component";
import { InputsSampleComponent } from "./inputs/inputssample.component";
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
        IgLayout,
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
        InputsSampleComponent,
        LayoutSampleComponent,
        FilterSampleComponent,
        RippleSampleComponent,
        RadioSampleComponent,
        Label,
        ButtonsSampleComponent,
        AvatarSampleComponent
    ],
    bootstrap: [
        AppComponent
    ]
})
export class AppModule {}