import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

import { IgxComponentsModule, IgxDirectivesModule, IgxNavigationModule } from "../../src/main";

import { AppComponent } from "./app.component";
import { routing } from "./app.routing";
import { AvatarSampleModule } from "./avatar/sample.module";
import { BadgeSampleModule } from "./badge/sample.module";
import { ButtonSampleModule } from "./button/sample.module";
import { ButtonGroupSampleModule } from "./buttonGroup/sample.module";
import { IgxCalendarSampleModule } from "./calendar/sample.module";
import { IgxCardSampleModule } from "./card/sample.module";
import { CarouselSampleModule } from "./carousel/sample.module";
import { DataOperationsSampleModule } from "./data-operations/sample.module";
import { IgxDatePickerSampleModule } from "./date-picker/sample.module";
import { DialogSampleModule } from "./dialog/sample.module";
import { GridSampleModule } from "./grid/sample.module";
import { IconSampleModule } from "./icon/sample.module";
import { InputSampleModule } from "./input/sample.module";
import { LayoutSampleModule } from "./layout/sample.module";
import { ListSampleModule } from "./list/sample.module";
import { NavbarSampleModule } from "./navbar/sample.module";
import { NavdrawerSampleModule } from "./navdrawer/sample.module";
import { ProgressBarSampleModule } from "./progressbar/sample.module";
import { RippleSampleModule } from "./ripple/sample.module";
import { IgxScrollSampleModule } from "./scroll/sample.module";
import { IgxSliderSampleModule } from "./slider/sample.module";
import { IgxSnackbarSampleModule } from "./snackbar/sample.module";
import { IgxColorsSampleModule } from "./styleguide/colors/sample.module";
import { IgxShadowsSampleModule } from "./styleguide/shadows/sample.module";
import { IgxTypographySampleModule } from "./styleguide/typography/sample.module";
import { TabBarSampleModule } from "./tabbar/sample.module";
import { IgxToastSampleModule } from "./toast/sample.module";

@NgModule({
    bootstrap: [AppComponent],
    declarations: [AppComponent],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        FormsModule,
        routing,
        IgxComponentsModule,
        IgxDirectivesModule,
        IgxNavigationModule,
        InputSampleModule,
        CarouselSampleModule,
        TabBarSampleModule,
        ListSampleModule,
        ButtonSampleModule,
        ButtonGroupSampleModule,
        AvatarSampleModule,
        NavdrawerSampleModule,
        NavbarSampleModule,
        ProgressBarSampleModule,
        IgxSnackbarSampleModule,
        IgxToastSampleModule,
        DialogSampleModule,
        IconSampleModule,
        GridSampleModule,
        IgxCardSampleModule,
        IgxSliderSampleModule,
        IgxScrollSampleModule,
        DataOperationsSampleModule,
        BadgeSampleModule,
        RippleSampleModule,
        IgxTypographySampleModule,
        IgxColorsSampleModule,
        IgxShadowsSampleModule,
        IgxCalendarSampleModule,
        IgxDatePickerSampleModule,
        LayoutSampleModule
    ]
})
export class AppModule { }
