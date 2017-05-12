import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { IgxComponentsModule } from "../../../src/main";
import { CarouselSampleComponent } from "./sample.component";

@NgModule({
    declarations: [CarouselSampleComponent],
    imports: [IgxComponentsModule, CommonModule]
})
export class CarouselSampleModule {}
