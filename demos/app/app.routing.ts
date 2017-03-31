import { GridSampleComponent } from './grid/sample.component';
import { ModuleWithProviders } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { InputSampleComponent } from "./input/sample.component";
import { CarouselSampleComponent } from "./carousel/sample.component";
import { TabBarSampleComponent, CustomContentComponent } from "./tabbar/sample.component";
import { ListSampleComponent } from "./list/sample.component";
import { ButtonsSampleComponent } from "./button/sample.component";
import { ButtonGroupSampleComponent } from "./buttonGroup/sample.component";
import { AvatarSampleComponent } from "./avatar/sample.component";
import { NavbarSampleComponent } from "./navbar/sample.component";
import { DialogSampleComponent } from "./dialog/sample.component";
import { ProgressbarSampleComponent } from "./progressbar/progressbarsample.component";
import { IconSampleComponent } from "./icon/sample.component";
import { IgxSnackbarSampleComponent } from "./snackbar/sample.component";
import { IgxCardSampleComponent } from "./card/sample.component";
import {IgxToastSampleComponent} from "./toast/sample.component";
import {IgxRangeSampleComponent} from "./range/sample.component";
import {DataOperationsSampleComponent} from "./data-operations/sample.component";

const appRoutes: Routes = [
    {
        path: '',
        redirectTo: '/avatar',
        pathMatch: 'full'
    },
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
        path: "buttonGroup",
        component: ButtonGroupSampleComponent
    },
    {
        path: "list",
        component: ListSampleComponent
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
        path: "grid",
        component: GridSampleComponent
    },
    {
        path: "card",
        component: IgxCardSampleComponent
    },
    {
        path: "range",
        component: IgxRangeSampleComponent
    },
    {
        path: "data-operations",
        component: DataOperationsSampleComponent
    }
];

export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes);
