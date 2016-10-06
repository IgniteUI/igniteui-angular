import { Component } from "@angular/core";
import { CarouselModule } from "../../src/carousel/carousel";

@Component({
    selector: "carousel-sample",
    template:`
        <h3>Carousel</h3>
        <div style="width: 600px;">
            <ig-carousel [interval]="interval" [pause]="pause" [loop]="loop">
                <ig-slide *ngFor="let slide of slides;" [active]="slide.active">
                    <img [src]="slide.image">
                </ig-slide>
            </ig-carousel>
        </div>
    `
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
            {image: "https://unsplash.it/600"},
            {image: "https://unsplash.it/601"},
            {image: "https://unsplash.it/602"},
            {image: "https://unsplash.it/603"}
        );
    }
}