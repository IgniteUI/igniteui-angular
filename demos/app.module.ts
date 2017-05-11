import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { FormsModule } from "@angular/forms";
import { AppComponent } from "./app.component";
import { SwitchSampleComponent } from "./switch/switchsample.component";
import { RadioSampleComponent } from "./radio/radiosample.component";
import { LayoutSampleComponent } from "./layout/layoutsample.component";
import { FilterSampleComponent } from "./filter/filtersample.component";
import { RippleSampleComponent } from "./ripple/ripplesample.component";
import { InputsSampleComponent } from "./inputs/inputssample.component";
import { CarouselSampleComponent } from "./carousel/carouselsample.component";
import { TabBarSampleComponent } from "./tabbar/tabbarsample.component";
import { ListSampleComponent } from "./list/listsample.component";
import { ButtonsSampleComponent } from "./button/buttonssample.component";
import { AvatarSampleComponent } from "./avatar/avatarsample.component";
import { NavDrawerSampleModule } from "./navigation-drawer/sample.module";
import { NavbarSampleComponent } from "./navbar/navbarsample.component";
import { DialogSampleComponent } from "./dialog/dialogsample.component";
import { ProgressbarSampleComponent } from "./progressbar/progressbar.component";
import { routing } from "./app.routing";
import { IgxComponentsModule, IgxDirectivesModule } from "igniteui-js-blocks/main";


@NgModule({
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        FormsModule,
        IgxComponentsModule,
        IgxDirectivesModule,
        NavDrawerSampleModule,
        routing
    ],
    declarations: [
        AppComponent,
        SwitchSampleComponent,
        CarouselSampleComponent,
        TabBarSampleComponent,
        ListSampleComponent,
        InputsSampleComponent,
        LayoutSampleComponent,
        FilterSampleComponent,
        RippleSampleComponent,
        RadioSampleComponent,
        ButtonsSampleComponent,
        AvatarSampleComponent,
        NavbarSampleComponent,
        DialogSampleComponent,
        ProgressbarSampleComponent
    ],
    bootstrap: [
        AppComponent
    ]
})
export class AppModule {}
