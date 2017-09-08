import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { IgxComponentsModule } from "../../../src/main";
import { PageHeaderModule } from "../pageHeading/pageHeading.module";
import { CarouselSampleComponent } from "./sample.component";

@NgModule({
    declarations: [CarouselSampleComponent],
    imports: [IgxComponentsModule, CommonModule, PageHeaderModule]
})
export class CarouselSampleModule { }
