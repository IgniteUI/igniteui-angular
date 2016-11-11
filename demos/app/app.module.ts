// import { NgModule } from "@angular/core";
// import { BrowserModule } from "@angular/platform-browser";
// import { FormsModule } from "@angular/forms";

// import {
//     IgInput, CarouselModule , CheckboxModule, SwitchModule,
//     IgRadioModule , TabBarModule , ListModule, ButtonModule, Label,
//     AvatarModule, FilterModule, IgRippleModule, BadgeModule, IgProgressBarModule, IgxIconModule

// } from "../../src/main";

// import { IgxComponentsModule, IgxDirectivesModule } from "../../src/main";
// import { AppComponent } from "./app.component";
// import { InputSampleModule } from "./input/sample.module";
// import { CarouselSampleModule } from "./carousel/sample.module";
// import { TabBarSampleModule } from "./tabbar/sample.module";
// import { ListSampleModule } from "./list/sample.module";
// import { ButtonSampleModule } from "./button/sample.module";
// import { AvatarSampleModule } from "./avatar/sample.module";
// import { NavDrawerSampleModule } from "./navigation-drawer/sample.module";
// import { NavbarSampleModule } from "./navbar/sample.module";
// import { ProgressbarSampleComponent } from "./progressbarsample.component";
// import { ModalSampleModule } from "./modal/sample.module";
// import { IconSampleModule } from "./icon/sample.module";
// import { routing } from "./app.routing";

// @NgModule({
//     imports: [
//         BrowserModule,
//         FormsModule,
//         routing,
//         IgxComponentsModule,
//         IgxDirectivesModule,
//         InputSampleModule,
//         CarouselSampleModule,
//         TabBarSampleModule,
//         ListSampleModule,
//         ButtonSampleModule,
//         AvatarSampleModule,
//         NavDrawerSampleModule,
//         NavbarSampleModule,
//         ModalSampleModule,
//         IconSampleModule,
//         ProgressbarSampleComponent
//         IgRippleModule,
//         routing,
//         BadgeModule,
//         IgProgressBarModule,
//         BadgeModule,
//         IgInput,
//         BadgeModule,
//         IgInput,
//         IgxIconModule
//     ],
//     declarations: [
//         AppComponent,
//         // InputSampleComponent,
//         // CarouselSampleComponent,
//         // TabBarSampleComponent,
//         // ListSampleComponent,
//         // Label,
//         // ButtonsSampleComponent,
//         // AvatarSampleComponent,
//         // ProgressbarSampleComponent
//         // IconSampleModule
//     ],
//     // declarations: [
//     //     AppComponent,
//     // ],
//     bootstrap: [
//         AppComponent
//     ]
// })

// @NgModule({
//     imports: [
//         BrowserModule,
//         FormsModule,
//         routing,
//         IgxComponentsModule,
//         IgxDirectivesModule,
//         InputSampleModule,
//         CarouselSampleModule,
//         TabBarSampleModule,
//         ListSampleModule,
//         ButtonSampleModule,
//         AvatarSampleModule,
//         NavDrawerSampleModule,
//         NavbarSampleModule,
//         ModalSampleModule,
//         IconSampleModule
//     ],
//     declarations: [
//         AppComponent,
//     ],
//     bootstrap: [
//         AppComponent
//     ]
// })
// export class AppModule {}

import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { FormsModule } from "@angular/forms";

import { IgxComponentsModule, IgxDirectivesModule } from "../../src/main";

import { AppComponent } from "./app.component";
import { InputSampleModule } from "./input/sample.module";
import { CarouselSampleModule } from "./carousel/sample.module";
import { TabBarSampleModule } from "./tabbar/sample.module";
import { ListSampleModule } from "./list/sample.module";
import { ButtonSampleModule } from "./button/sample.module";
import { AvatarSampleModule } from "./avatar/sample.module";
import { NavDrawerSampleModule } from "./navigation-drawer/sample.module";
import { NavbarSampleModule } from "./navbar/sample.module";
import { ModalSampleModule } from "./modal/sample.module";
import { ProgressBarSampleModule } from "./progressbar/sample.module";
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
        ProgressBarSampleModule,
        ModalSampleModule,
        IconSampleModule,
    ],
    declarations: [
        AppComponent,
    ],
    bootstrap: [
        AppComponent
    ]
})
export class AppModule {}