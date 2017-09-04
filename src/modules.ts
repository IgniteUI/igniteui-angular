// Components

import { NgModule } from "@angular/core";

import { IgxAvatarModule } from "./avatar/avatar.component";
import { IgxBadgeModule } from "./badge/badge.component";
import { IgxButtonGroupModule } from "./buttonGroup/buttonGroup.component";
import { IgxCalendarModule } from "./calendar/calendar.component";
import { IgxCardModule } from "./card/card.component";
import { IgxCarouselModule } from "./carousel/carousel.component";
import { IgxCheckboxModule } from "./checkbox/checkbox.component";
import { IgxDatePickerModule } from "./date-picker/date-picker.component";
import { IgxDialogModule } from "./dialog/dialog.component";
import { IgxGridModule } from "./grid/grid.component";
import { IgxIconModule } from "./icon/icon.component";
import { IgxListModule } from "./list/list.component";
import { IgxNavbarModule } from "./navbar/navbar.component";
import { NavigationDrawerModule } from "./navigation-drawer/navigation-drawer.component";
import { IgxProgressBarModule } from "./progressbar/progressbar.component";
import { IgxRadioModule} from "./radio/radio.component";
import { IgxScrollModule } from "./scroll/scroll.component";
import { IgxSliderModule } from "./slider/slider.component";
import { IgxSnackbarModule } from "./snackbar/snackbar.component";
import { IgxSwitchModule} from "./switch/switch.component";
import { IgxTabBarModule } from "./tabbar/tabbar.component";
import { IgxToastModule } from "./toast/toast.component";

@NgModule({
    exports: [
        IgxAvatarModule,
        IgxBadgeModule,
        IgxCardModule,
        IgxCalendarModule,
        IgxCarouselModule,
        IgxCheckboxModule,
        IgxGridModule,
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
        IgxSliderModule,
        IgxScrollModule,
        IgxDatePickerModule
    ],
    imports: [
        IgxAvatarModule,
        IgxBadgeModule,
        IgxCalendarModule,
        IgxCarouselModule,
        IgxCheckboxModule,
        IgxGridModule,
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
        IgxSliderModule,
        IgxScrollModule,
        IgxDatePickerModule
    ]
})
export class IgxComponentsModule {}

import { IgxButtonModule } from "./button/button.directive";
import { IgxDragDropModule } from "./directives/dragdrop.directive";
import { IgxFilterModule } from "./directives/filter.directive";
import { IgxRippleModule } from "./directives/ripple.directive";
import { IgxInput } from "./input/input.directive";
import { IgxLabelModule } from "./label/label.directive";
import { IgxLayout } from "./layout/layout.directive";

@NgModule({
    exports: [
        IgxButtonModule,
        IgxInput,
        IgxFilterModule,
        IgxRippleModule,
        IgxLabelModule,
        IgxLayout,
        IgxDragDropModule
    ],
    imports: [
        IgxButtonModule,
        IgxInput,
        IgxFilterModule,
        IgxRippleModule,
        IgxLabelModule,
        IgxLayout,
        IgxDragDropModule
    ]
})
export class IgxDirectivesModule {}
