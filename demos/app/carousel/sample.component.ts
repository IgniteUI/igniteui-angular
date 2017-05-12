import { Component } from "@angular/core";
import { IgxCarouselModule } from "../../../src/carousel/carousel.component";

@Component({
    moduleId: module.id,
    selector: "carousel-sample",
    styleUrls: ["sample.component.css", "../app.samples.css"],
    templateUrl: "./sample.component.html"
})
export class CarouselSampleComponent {
    public slides: any[] = [];
    public interval = 3000;
    public pause = true;
    public loop = true;

    constructor() {
            this.addNewSlide();
    }

    public addNewSlide() {
        this.slides.push(
            {image: "../demos/app/carousel/images/slide1@x2.jpg"},
            {image: "../demos/app/carousel/images/slide2@x2.jpg"},
            {image: "../demos/app/carousel/images/slide3@x2.jpg"},
            {image: "../demos/app/carousel/images/slide4@x2.jpg"}
        );
    }
}
