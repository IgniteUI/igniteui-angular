import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { IgxComponentsModule } from "../../../src/main";
import { CarouselSampleComponent } from "./sample.component";

@NgModule({
    imports: [IgxComponentsModule, CommonModule],
    declarations: [CarouselSampleComponent]
})
export class CarouselSampleModule {}
