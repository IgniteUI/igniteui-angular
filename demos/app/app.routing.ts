import { ModuleWithProviders } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { InputSampleComponent } from "./input/sample.component";
import { CarouselSampleComponent } from "./carousel/sample.component";
import { TabBarSampleComponent } from "./tabbar/sample.component";
import { ListSampleComponent } from "./list/sample.component";
import { ButtonsSampleComponent } from "./button/sample.component";
import { AvatarSampleComponent } from "./avatar/sample.component";
import { NavbarSampleComponent } from "./navbar/sample.component";
import { ProgressbarSampleComponent } from "./progressbar/progressbarsample.component";
import { ModalSampleComponent } from "./modal/sample.component";
import { IconSampleComponent } from "./icon/sample.component";
import { IgxSnackbarSampleComponent } from "./snackbar/sample.component";

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
        redirectTo: '/carousel',
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
<<<<<<< HEAD
        path: "progressbar",
        component: ProgressbarSampleComponent
=======
        path: "snackbar",
        component: IgxSnackbarSampleComponent
>>>>>>> 35ae2fc00575475f9f660c8096787fc5fc35911b
    },
    {
        path: "modal",
        component: ModalSampleComponent
    },
    {
        path: "icon",
        component: IconSampleComponent
    }
];

export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes);