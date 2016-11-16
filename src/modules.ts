// Components

import { NgModule } from "@angular/core";

import { IgxAvatarModule } from "./avatar/avatar.component";
import { IgxBadgeModule } from "./badge/badge.component";
import { IgxCarouselModule } from "./carousel/carousel.component";
import { IgxCheckboxModule } from "./checkbox/checkbox.component";
import { IgxIconModule } from "./icon/icon.component";
import { IgxListModule } from "./list/list.component";
import { ModalModule } from "./modal/modal";
import { IgxNavbarModule } from "./navbar/navbar.component";
import { NavigationDrawerModule } from "./navigation-drawer/navigation-drawer.component";
import { IgxRadioModule} from "./radio/radio.component";
import { IgxSwitchModule} from "./switch/switch.component";
import { IgxTabBarModule } from "./tabbar/tab.component";

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
        IgxRadioModule,
        IgxSwitchModule,
        IgxTabBarModule
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
        IgxRadioModule,
        IgxSwitchModule,
        IgxTabBarModule
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