import { Component } from "@angular/core";
import { IgxCarouselModule } from "../../../src/carousel/carousel.component";

@Component({
    selector: "carousel-sample",
    moduleId: module.id,
    templateUrl: './sample.component.html'
})
export class CarouselSampleComponent {
    slides: Array<any> = [];
    interval = 3000;
    pause = true;
    loop = true;

    constructor() {
            this.addNewSlide();
    }

    addNewSlide() {
        this.slides.push(
            {image: "http://lorempixel.com/1170/400/nature/1/"},
            {image: "http://lorempixel.com/1170/400/nature/2/"},
            {image: "http://lorempixel.com/1170/400/nature/3/"},
            {image: "http://lorempixel.com/1170/400/nature/5/"}
        );
    }
}