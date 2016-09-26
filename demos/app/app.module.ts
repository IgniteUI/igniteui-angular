import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { FormsModule } from "@angular/forms";

import { IgInputModule } from "../../src/input/input";
import { CarouselModule } from "../../src/carousel/carousel";
import { CheckboxModule } from "../../src/checkbox/checkbox";
import { SwitchModule } from "../../src/switch/switch";
import { IgRadioModule } from "../../src/radio/radio";
import { TabBarModule } from "../../src/tabbar/tab";
import { ListModule } from "../../src/list/list";
import { ButtonModule } from "../../src/button/button";

import { AppComponent } from "./app.component";
import { InputSampleComponent } from "./inputsample.component";
import { CarouselSampleComponent } from "./carouselsample.component";
import { TabBarSampleComponent } from "./tabbarsample.component";
import { ListSampleComponent } from "./listsample.component";
import { ButtonsSampleComponent } from "./buttonssample.component";

import { routing } from "./app.routing";


@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        IgInputModule,
        CarouselModule,
        CheckboxModule,
        SwitchModule,
        IgRadioModule,
        TabBarModule,
        ListModule,
        ButtonModule,
        routing
    ],
    declarations: [
        AppComponent,
        InputSampleComponent,
        CarouselSampleComponent,
        TabBarSampleComponent,
        ListSampleComponent,
        ButtonsSampleComponent
    ],
    bootstrap: [
        AppComponent
    ]
})
export class AppModule {}