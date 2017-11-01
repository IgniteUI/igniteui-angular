import { Component } from "@angular/core";
import { IgxCarouselModule } from "../../lib/main";

@Component({
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
            {image: "images/carousel/slide1@x2.jpg"},
            {image: "images/carousel/slide2@x2.jpg"},
            {image: "images/carousel/slide3@x2.jpg"},
            {image: "images/carousel/slide4@x2.jpg"}
        );
    }
}
