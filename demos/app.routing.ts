import { ModuleWithProviders } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { AppComponent } from "./app.component";
import { SwitchSampleComponent } from "./inputs/switchsample.component";
import { CarouselSampleComponent } from "./carousel/carouselsample.component";
import { TabBarSampleComponent } from "./tabbar/tabbarsample.component";
import { ListSampleComponent } from "./list/listsample.component";
import { ButtonsSampleComponent } from "./button/buttonssample.component";
import { AvatarSampleComponent } from "./avatar/avatarsample.component";
//import { NavbarSampleComponent } from "./app/navbar/sample.component";

const appRoutes: Routes = [
    {
        path: "inputs",
        component: SwitchSampleComponent
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
        redirectTo: '/list',
        pathMatch: 'full'
    },
    {
        path: "avatar",
        component: AvatarSampleComponent
    },
    //{
    //    path: "navbar",
    //    component: NavbarSampleComponent
    //}
];

export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes);