import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { FormsModule } from "@angular/forms";
import { FilterModule } from '../../src/list/filter';

import {
    IgInput, CarouselModule , CheckboxModule, SwitchModule,
    IgRadioModule , TabBarModule , ListModule, ButtonModule
} from "../../src/main";

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
        CarouselModule,
        CheckboxModule,
        SwitchModule,
        IgRadioModule,
        TabBarModule,
        ListModule,
        ButtonModule,
        FilterModule,
        routing
    ],
    declarations: [
        IgInput,
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