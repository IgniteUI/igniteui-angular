import { ModuleWithProviders } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { InputSampleComponent } from "./input/sample.component";
import { CarouselSampleComponent } from "./carousel/sample.component";
import { TabBarSampleComponent } from "./tabbar/sample.component";
import { ListSampleComponent } from "./list/sample.component";
import { ButtonsSampleComponent } from "./button/sample.component";
import { AvatarSampleComponent } from "./avatar/sample.component";
import { NavbarSampleComponent } from "./navbar/sample.component";
import { DialogSampleComponent } from "./dialog/sample.component";
import { ProgressbarSampleComponent } from "./progressbar/progressbarsample.component";
import { IconSampleComponent } from "./icon/sample.component";
import { IgxSnackbarSampleComponent } from "./snackbar/sample.component";
import { IgxCardSampleComponent } from "./card/sample.component";
import {IgxToastSampleComponent} from "./toast/sample.component";

const appRoutes: Routes = [
    {
        path: "inputs",
        component: InputSampleComponent
    },
    {
        path: "carousel",
        component: CarouselSampleComponent
    },
    {
        path: "tabbar",
        component: TabBarSampleComponent
    },
    {
        path: "buttons",
        component: ButtonsSampleComponent
    },
    {
        path: "list",
        component: ListSampleComponent
    },
    {
        path: '',
        redirectTo: '/card',
        pathMatch: 'full'
    },
    {
        path: "avatar",
        component: AvatarSampleComponent
    },
    {
        path: "navbar",
        component: NavbarSampleComponent
    },
    {
        path: "progressbar",
        component: ProgressbarSampleComponent
    },
    {
        path: "snackbar",
        component: IgxSnackbarSampleComponent
    },
    {
        path: "toast",
        component: IgxToastSampleComponent
    },
    {
        path: "dialog",
        component: DialogSampleComponent
    },
    {
        path: "icon",
        component: IconSampleComponent
    },
    {
        path: "card",
        component: IgxCardSampleComponent
    }
];

export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes);
