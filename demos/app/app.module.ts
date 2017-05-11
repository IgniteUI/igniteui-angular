import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

import { IgxComponentsModule, IgxDirectivesModule } from "../../src/main";

import { AppComponent } from "./app.component";
import { routing } from "./app.routing";
import { AvatarSampleModule } from "./avatar/sample.module";
import { ButtonSampleModule } from "./button/sample.module";
import { ButtonGroupSampleModule } from "./buttonGroup/sample.module";
import { IgxCardSampleModule } from "./card/sample.module";
import { CarouselSampleModule } from "./carousel/sample.module";
import { DataOperationsSampleModule } from "./data-operations/sample.module";
import { DialogSampleModule } from "./dialog/sample.module";
import { GridSampleModule } from "./grid/sample.module";
import { IconSampleModule } from "./icon/sample.module";
import { InputSampleModule } from "./input/sample.module";
import { ListSampleModule } from "./list/sample.module";
import { NavbarSampleModule } from "./navbar/sample.module";
import { NavDrawerSampleModule } from "./navigation-drawer/sample.module";
import { ProgressBarSampleModule } from "./progressbar/sample.module";
import {IgxRangeSampleModule} from "./range/sample.module";
import { IgxSnackbarSampleModule } from "./snackbar/sample.module";
import { TabBarSampleModule } from "./tabbar/sample.module";
import {IgxToastSampleModule} from "./toast/sample.module";

@NgModule({
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        FormsModule,
        routing,
        IgxComponentsModule,
        IgxDirectivesModule,
        InputSampleModule,
        CarouselSampleModule,
        TabBarSampleModule,
        ListSampleModule,
        ButtonSampleModule,
        ButtonGroupSampleModule,
        AvatarSampleModule,
        NavDrawerSampleModule,
        NavbarSampleModule,
        ProgressBarSampleModule,
        IgxSnackbarSampleModule,
        IgxToastSampleModule,
        DialogSampleModule,
        IconSampleModule,
        GridSampleModule,
        IgxCardSampleModule,
        IgxRangeSampleModule,
        DataOperationsSampleModule
    ],
    declarations: [
        AppComponent
    ],
    bootstrap: [
        AppComponent
    ]
})
export class AppModule {}
