import { Component } from "@angular/core";
import { CarouselModule } from "../../src/carousel/carousel";

@Component({
    selector: "carousel-sample",
    templateUrl: 'demos/carousel/carouselsample.component.html'
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
            {image: "http://lorempixel.com/1170/300/sports/1"},
            {image: "http://lorempixel.com/1170/300/sports/2"},
            {image: "http://lorempixel.com/1170/300/sports/3"},
            {image: "http://lorempixel.com/1170/300/sports/5"}
        );
    }
}