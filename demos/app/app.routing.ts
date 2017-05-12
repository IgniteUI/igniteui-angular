import { ModuleWithProviders } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { GridSampleComponent } from "./grid/sample.component";

import { AvatarSampleComponent } from "./avatar/sample.component";
import { ButtonsSampleComponent } from "./button/sample.component";
import { ButtonGroupSampleComponent } from "./buttonGroup/sample.component";
import { IgxCardSampleComponent } from "./card/sample.component";
import { CarouselSampleComponent } from "./carousel/sample.component";
import {DataOperationsSampleComponent} from "./data-operations/sample.component";
import { DialogSampleComponent } from "./dialog/sample.component";
import { IconSampleComponent } from "./icon/sample.component";
import { InputSampleComponent } from "./input/sample.component";
import { ListSampleComponent } from "./list/sample.component";
import { NavbarSampleComponent } from "./navbar/sample.component";
import { ProgressbarSampleComponent } from "./progressbar/sample.component";
import {IgxRangeSampleComponent} from "./range/sample.component";
import { IgxSnackbarSampleComponent } from "./snackbar/sample.component";
import { CustomContentComponent, TabBarSampleComponent } from "./tabbar/sample.component";
import {IgxToastSampleComponent} from "./toast/sample.component";

const appRoutes: Routes = [
    {
        path: "",
        pathMatch: "full",
        redirectTo: "/avatar"
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
        component: IgxRangeSampleComponent,
        path: "range"
    },
    {
        component: DataOperationsSampleComponent,
        path: "data-operations"
    }
];

export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes);
