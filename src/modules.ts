// Components

import { NgModule } from "@angular/core";

import { IgxAvatarModule } from "./avatar/avatar.component";
import { IgxBadgeModule } from "./badge/badge.component";
import { IgxCarouselModule } from "./carousel/carousel.component";
import { IgxCheckboxModule } from "./checkbox/checkbox.component";
import { IgxIconModule } from "./icon/icon.component";
import { IgxListModule } from "./list/list.component";
import { IgxDialogModule } from "./dialog/dialog.component";
import { IgxProgressBarModule } from "./progressbar/progressbar.component"
import { IgxNavbarModule } from "./navbar/navbar.component";
import { NavigationDrawerModule } from "./navigation-drawer/navigation-drawer.component";
import { IgxRadioModule} from "./radio/radio.component";
import { IgxSwitchModule} from "./switch/switch.component";
import { IgxTabBarModule } from "./tabbar/tabbar.component";
import { IgxCardModule } from "./card/card.component";
import { IgxSnackbarModule } from "./snackbar/snackbar.component";
import { IgxToastModule } from "./toast/toast.component";
import { IgxButtonGroupModule } from "./buttonGroup/buttonGroup.component";
import { IgxRangeModule } from "./range/range.component";

@NgModule({
    imports: [
        IgxAvatarModule,
        IgxBadgeModule,
        IgxCarouselModule,
        IgxCheckboxModule,
        IgxIconModule,
        IgxListModule,
        IgxDialogModule,
        IgxNavbarModule,
        NavigationDrawerModule,
        IgxProgressBarModule,
        IgxRadioModule,
        IgxSwitchModule,
        IgxTabBarModule,
        IgxCardModule,
        IgxSnackbarModule,
        IgxToastModule,
        IgxButtonGroupModule,
        IgxRangeModule,
    ],
    exports: [
        IgxAvatarModule,
        IgxBadgeModule,
        IgxCarouselModule,
        IgxCheckboxModule,
        IgxIconModule,
        IgxListModule,
        IgxDialogModule,
        IgxNavbarModule,
        NavigationDrawerModule,
        IgxProgressBarModule,
        IgxRadioModule,
        IgxSwitchModule,
        IgxTabBarModule,
        IgxSnackbarModule,
        IgxToastModule,
        IgxButtonGroupModule,
        IgxRangeModule
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