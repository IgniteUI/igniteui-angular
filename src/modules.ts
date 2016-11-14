// Components

import { NgModule } from "@angular/core";

import { AvatarModule } from "./avatar/avatar";
import { BadgeModule } from "./badge/badge";
import { CarouselModule } from "./carousel/carousel";
import { CheckboxModule } from "./checkbox/checkbox";
import { IgxIconModule } from "./icon/icon";
import { ListModule } from "./list/list";
import { ModalModule } from "./modal/modal";
import { NavbarModule } from "./navbar/navbar";
import { NavigationDrawerModule } from "./navigation-drawer/navigation-drawer";
import { IgRadioModule} from "./radio/radio";
import { SwitchModule} from "./switch/switch";
import { TabBarModule } from "./tabbar/tab";

@NgModule({
    imports: [
        AvatarModule,
        BadgeModule,
        CarouselModule,
        CheckboxModule,
        IgxIconModule,
        ListModule,
        ModalModule,
        NavbarModule,
        NavigationDrawerModule,
        IgRadioModule,
        SwitchModule,
        TabBarModule
    ],
    exports: [
        AvatarModule,
        BadgeModule,
        CarouselModule,
        CheckboxModule,
        IgxIconModule,
        ListModule,
        ModalModule,
        NavbarModule,
        NavigationDrawerModule,
        IgRadioModule,
        SwitchModule,
        TabBarModule
    ]
})
export class IgxComponentsModule {}


import { ButtonModule } from "./button/button";
import { IgInput } from "./input/input";
import { FilterModule } from "./directives/filter";
import { IgRippleModule } from "./directives/ripple";
import { LabelModule } from "./label/label";
import { IgLayout } from "./layout/layout";

@NgModule({
    imports: [
        ButtonModule,
        IgInput,
        FilterModule,
        IgRippleModule,
        LabelModule,
        IgLayout
    ],
    exports: [
        ButtonModule,
        IgInput,
        FilterModule,
        IgRippleModule,
        LabelModule,
        IgLayout
    ]
})
export class IgxDirectivesModule {}