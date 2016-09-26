import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { FormsModule } from "@angular/forms";

import {
    IgInputModule, CarouselModule , CheckboxModule,
    IgRadioModule , TabBarModule , ListModule
} from "../../src/main";

import { AppComponent } from "./app.component";
import { InputSampleComponent } from "./inputsample.component";
import { CarouselSampleComponent } from "./carouselsample.component";
import { TabBarSampleComponent } from "./tabbarsample.component";
import { ListSampleComponent } from "./listsample.component";


import { routing } from "./app.routing";


@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        IgInputModule,
        CarouselModule,
        CheckboxModule,
        IgRadioModule,
        TabBarModule,
        ListModule,
        routing
    ],
    declarations: [
        AppComponent,
        InputSampleComponent,
        CarouselSampleComponent,
        TabBarSampleComponent,
        ListSampleComponent
    ],
    bootstrap: [
        AppComponent
    ]
})
export class AppModule {}