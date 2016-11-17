// Components

import { NgModule } from "@angular/core";

import { IgxAvatarModule } from "./avatar/avatar.component";
import { IgxBadgeModule } from "./badge/badge.component";
import { IgxCarouselModule } from "./carousel/carousel.component";
import { IgxCheckboxModule } from "./checkbox/checkbox.component";
import { IgxIconModule } from "./icon/icon.component";
import { IgxListModule } from "./list/list.component";
import { ModalModule } from "./modal/modal";
<<<<<<< HEAD
import { NavbarModule } from "./navbar/navbar";
import { NavigationDrawerModule } from "./navigation-drawer/navigation-drawer";
import { IgRadioModule} from "./radio/radio";
import { SwitchModule} from "./switch/switch";
import { TabBarModule } from "./tabbar/tab";
import { IgxProgressBarModule } from "./progressbar/progressbar.component"
=======
import { IgxNavbarModule } from "./navbar/navbar.component";
import { NavigationDrawerModule } from "./navigation-drawer/navigation-drawer.component";
import { IgxRadioModule} from "./radio/radio.component";
import { IgxSwitchModule} from "./switch/switch.component";
import { IgxTabBarModule } from "./tabbar/tab.component";
>>>>>>> 35ae2fc00575475f9f660c8096787fc5fc35911b

@NgModule({
    imports: [
        IgxAvatarModule,
        IgxBadgeModule,
        IgxCarouselModule,
        IgxCheckboxModule,
        IgxIconModule,
        IgxListModule,
        ModalModule,
        IgxNavbarModule,
        NavigationDrawerModule,
<<<<<<< HEAD
        IgRadioModule,
        SwitchModule,
        TabBarModule,
        IgxProgressBarModule
=======
        IgxRadioModule,
        IgxSwitchModule,
        IgxTabBarModule
>>>>>>> 35ae2fc00575475f9f660c8096787fc5fc35911b
    ],
    exports: [
        IgxAvatarModule,
        IgxBadgeModule,
        IgxCarouselModule,
        IgxCheckboxModule,
        IgxIconModule,
        IgxListModule,
        ModalModule,
        IgxNavbarModule,
        NavigationDrawerModule,
<<<<<<< HEAD
        IgRadioModule,
        SwitchModule,
        TabBarModule,
        IgxProgressBarModule
=======
        IgxRadioModule,
        IgxSwitchModule,
        IgxTabBarModule
>>>>>>> 35ae2fc00575475f9f660c8096787fc5fc35911b
    ]
})
export class IgxComponentsModule {}


import { IgxButtonModule } from "./button/button.directive";
import { IgxInput } from "./input/input.directive";
import { IgxFilterModule } from "./directives/filter.directive";
import { IgxRippleModule } from "./directives/ripple.directive";
import { IgxLabelModule } from "./label/label.directive";
import { IgxLayout } from "./layout/layout.directive";

@NgModule({
    imports: [
        IgxButtonModule,
        IgxInput,
        IgxFilterModule,
        IgxRippleModule,
        IgxLabelModule,
        IgxLayout
    ],
    exports: [
        IgxButtonModule,
        IgxInput,
        IgxFilterModule,
        IgxRippleModule,
        IgxLabelModule,
        IgxLayout
    ]
})
export class IgxDirectivesModule {}