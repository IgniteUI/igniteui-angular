import { Component } from "@angular/core";
import { CarouselModule } from "../../src/carousel/carousel";

@Component({
    selector: "carousel-sample",
    template:`
<div id="phoneContainer" class="phone">
    <div id="mobileDiv" class="screen">
        <div style="width: 100%;">
            <span class="componentTitle">Carousel</span><br>
            <span class="componentDesc">Allows you to cycle thorugh photos or other content as in a slideshow.</span><br><br>
            <ig-carousel [interval]="interval" [pause]="pause" [loop]="loop">
                <ig-slide *ngFor="let slide of slides;" [active]="slide.active">
                    <img [src]="slide.image">
                </ig-slide>
            </ig-carousel>
        </div>
    </div>
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
            {image: "https://unsplash.it/g/1170/300"},
            {image: "https://unsplash.it/g/1171/300"},
            {image: "https://unsplash.it/g/1172/300"},
            {image: "https://unsplash.it/g/1173/300"}
        );
    }
}