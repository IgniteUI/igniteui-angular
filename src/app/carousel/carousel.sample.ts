import { Component, ViewChild } from '@angular/core';
import { IgxCarouselComponent, CarouselIndicatorsOrientation } from 'igniteui-angular';

@Component({
    selector: 'app-carousel-sample',
    templateUrl: 'carousel.sample.html'
})
export class CarouselSampleComponent {
    @ViewChild('car', { static: true }) car: IgxCarouselComponent;

    slides = [];
    interval = 3000;
    pause = true;
    loop = true;

    constructor() {
        this.addNewSlide();
    }

    addNewSlide() {
        this.slides.push(
            {image: 'assets/images/carousel/slide1@x2.jpg'},
            {image: 'assets/images/carousel/slide2@x2.jpg'},
            {image: 'assets/images/carousel/slide3@x2.jpg', active: true}
        );
    }

    public changeSlides() {
        this.slides.push({image: 'assets/images/carousel/slide4@x2.jpg', active: true});
    }

    public changeSlidesRemove() {
        this.slides = this.slides.slice(1);
    }

    changeOrientation() {
        if (this.car.indicatorsOrientation === CarouselIndicatorsOrientation.top) {
            this.car.indicatorsOrientation = CarouselIndicatorsOrientation.bottom;
        } else {
            this.car.indicatorsOrientation = CarouselIndicatorsOrientation.top;
        }
    }
}
