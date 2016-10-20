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
        redirectTo: '/navigation-drawer',
        pathMatch: 'full'
    },
    {
        path: "avatar",
        component: AvatarSampleComponent
    },
    {
        path: "navbar",
        component: NavbarSampleComponent
    }
];

export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes);