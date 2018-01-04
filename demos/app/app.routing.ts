import { ModuleWithProviders } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { VirtualContainerSampleComponent } from "./virtual-container/sample.component";
import { AvatarSampleComponent } from "./avatar/sample.component";
import { BadgeSampleComponent } from "./badge/sample.component";
import { ButtonsSampleComponent } from "./button/sample.component";
import { ButtonGroupSampleComponent } from "./buttonGroup/sample.component";
import { IgxCalendarSampleComponent } from "./calendar/sample.component";
import { IgxCardSampleComponent } from "./card/sample.component";
import { CarouselSampleComponent } from "./carousel/sample.component";
import { IgxDatePickerSampleComponent } from "./date-picker/sample.component";
import { DialogSampleComponent } from "./dialog/sample.component";
import { GridSampleComponent } from "./grid/sample.component";
import { IconSampleComponent } from "./icon/sample.component";
import { InputSampleComponent } from "./input/sample.component";
import { LayoutSampleComponent } from "./layout/sample.component";
import { ListSampleComponent } from "./list/sample.component";
import { NavbarSampleComponent } from "./navbar/sample.component";
import { NavdrawerSampleComponent } from "./navdrawer/sample.component";
import { ProgressbarSampleComponent } from "./progressbar/sample.component";
import { RippleSampleComponent } from "./ripple/sample.component";
import { IgxScrollSampleComponent } from "./scroll/sample.component";
import { IgxSliderSampleComponent } from "./slider/sample.component";
import { IgxSnackbarSampleComponent } from "./snackbar/sample.component";
import { IgxColorsSampleComponent } from "./styleguide/colors/sample.component";
import { IgxShadowsSampleComponent } from "./styleguide/shadows/sample.component";
import { IgxTypographySampleComponent } from "./styleguide/typography/sample.component";
import {
    CustomContentComponent,
    TabBarSampleComponent
} from "./tabbar/sample.component";
import { IgxToastSampleComponent } from "./toast/sample.component";

const appRoutes: Routes = [
    {
        path: "",
        pathMatch: "full",
        redirectTo: "/scroll"
    },
    {
        component: InputSampleComponent,
        path: "inputs"
    },
    {
        component: CarouselSampleComponent,
        path: "carousel"
    },
    {
        component: TabBarSampleComponent,
        path: "tabbar"
    },
    {
        component: ButtonsSampleComponent,
        path: "buttons"
    },
    {
        component: ButtonGroupSampleComponent,
        path: "buttonGroup"
    },
    {
        component: ListSampleComponent,
        path: "list"
    },
    {
        component: AvatarSampleComponent,
        path: "avatar"
    },
    {
        component: NavbarSampleComponent,
        path: "navbar"
    },
    {
        component: NavdrawerSampleComponent,
        path: "navdrawer"
    },
    {
        component: ProgressbarSampleComponent,
        path: "progressbar"
    },
    {
        component: IgxSnackbarSampleComponent,
        path: "snackbar"
    },
    {
        component: IgxToastSampleComponent,
        path: "toast"
    },
    {
        component: DialogSampleComponent,
        path: "dialog"
    },
    {
        component: IconSampleComponent,
        path: "icon"
    },
    {
        component: GridSampleComponent,
        path: "grid"
    },
    {
        component: IgxCardSampleComponent,
        path: "card"
    },
    {
        component: IgxSliderSampleComponent,
        path: "slider"
    },
    {
        component: IgxScrollSampleComponent,
        path: "scroll"
    },
    {
        component: BadgeSampleComponent,
        path: "badge"
    },
    {
        component: RippleSampleComponent,
        path: "ripple"
    },
    {
        component: IgxColorsSampleComponent,
        path: "colors"
    },
    {
        component: IgxTypographySampleComponent,
        path: "typography"
    },
    {
        component: IgxShadowsSampleComponent,
        path: "shadows"
    },
    {
        component: IgxCalendarSampleComponent,
        path: "calendar"
    },
    {
        component: IgxDatePickerSampleComponent,
        path: "datePicker"
    },
    {
        component: LayoutSampleComponent,
        path: "layout"
    },
    {
        component: VirtualContainerSampleComponent ,
        path: "virtual-container"
    }
];

export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes);
