import { ModuleWithProviders } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { AppComponent } from "./app.component";
import { SwitchSampleComponent } from "./inputs/switchsample.component";
import { RadioSampleComponent } from "./inputs/radiosample.component";
import { CarouselSampleComponent } from "./carousel/carouselsample.component";
import { TabBarSampleComponent } from "./tabbar/tabbarsample.component";
import { ListSampleComponent } from "./list/listsample.component";
import { ButtonsSampleComponent } from "./button/buttonssample.component";
import { AvatarSampleComponent } from "./avatar/avatarsample.component";

const appRoutes: Routes = [
    {
        path: "switch",
        component: SwitchSampleComponent
    },
    {
        path: "radio",
        component: RadioSampleComponent
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
        redirectTo: 'switch',
        pathMatch: 'full'
    },
    {
        path: "avatar",
        component: AvatarSampleComponent
    }
];

export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes);