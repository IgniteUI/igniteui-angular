import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { PageHeaderModule } from "../pageHeading/pageHeading.module";
import { CarouselSampleComponent } from "./sample.component";
import { IgxCarouselModule } from "../../lib/main";

@NgModule({
    declarations: [CarouselSampleComponent],
    imports: [CommonModule, PageHeaderModule, IgxCarouselModule]
})
export class CarouselSampleModule { }
