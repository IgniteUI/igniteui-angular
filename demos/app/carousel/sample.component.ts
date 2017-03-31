import { Component } from "@angular/core";
import { IgxCarouselModule } from "../../../src/carousel/carousel.component";

@Component({
    selector: "carousel-sample",
    moduleId: module.id,
    templateUrl: './sample.component.html',
    styleUrls: ['sample.component.css','../app.samples.css']
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
            {image: "../demos/app/carousel/images/slide1@x2.jpg"},
            {image: "../demos/app/carousel/images/slide2@x2.jpg"},
            {image: "../demos/app/carousel/images/slide3@x2.jpg"},
            {image: "../demos/app/carousel/images/slide4@x2.jpg"}
        );
    }
}