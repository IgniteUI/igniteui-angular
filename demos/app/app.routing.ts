import { ModuleWithProviders } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { AppComponent } from "./app.component";
import { InputSampleComponent } from "./inputsample.component";
import { CarouselSampleComponent } from "./carouselsample.component";
import { TabBarSampleComponent } from "./tabbarsample.component";
import { ListSampleComponent } from "./listsample.component";
import { ButtonsSampleComponent } from "./buttonssample.component";
import { AvatarSampleComponent } from "./avatarsample.component";
import { NavbarSampleComponent } from "./navbar/sample.component";
<<<<<<< HEAD
import { ProgressbarSampleComponent } from "./progressbarsample.component";
=======
import { ModalSampleComponent } from "./modal/sample.component";
>>>>>>> fc0c81ad4e2055b196b72d20cbab499aea260ecd

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
        redirectTo: '/inputs',
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
        path: "modal",
        component: ModalSampleComponent
>>>>>>> fc0c81ad4e2055b196b72d20cbab499aea260ecd
    }
];

export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes);