import { GridSampleModule } from './grid/sample.module';
import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { FormsModule } from "@angular/forms";


import { IgxComponentsModule, IgxDirectivesModule } from "../../src/main";

import { AppComponent } from "./app.component";
import { InputSampleModule } from "./input/sample.module";
import { CarouselSampleModule } from "./carousel/sample.module";
import { TabBarSampleModule } from "./tabbar/sample.module";
import { ListSampleModule } from "./list/sample.module";
import { ButtonSampleModule } from "./button/sample.module";
import { AvatarSampleModule } from "./avatar/sample.module";
import { NavDrawerSampleModule } from "./navigation-drawer/sample.module";
import { NavbarSampleModule } from "./navbar/sample.module";
import { DialogSampleModule } from "./dialog/sample.module";
import { ProgressBarSampleModule } from "./progressbar/sample.module";
import { IconSampleModule } from "./icon/sample.module";
import { IgxSnackbarSampleModule } from "./snackbar/sample.module";
import { routing } from "./app.routing";

@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        routing,
        IgxComponentsModule,
        IgxDirectivesModule,
        InputSampleModule,
        CarouselSampleModule,
        TabBarSampleModule,
        ListSampleModule,
        ButtonSampleModule,
        AvatarSampleModule,
        NavDrawerSampleModule,
        NavbarSampleModule,
        ProgressBarSampleModule,
        IgxSnackbarSampleModule,
        DialogSampleModule,
        IconSampleModule,
        GridSampleModule
    ],
    declarations: [
        AppComponent,
    ],
    bootstrap: [
        AppComponent
    ]
})
export class AppModule {}