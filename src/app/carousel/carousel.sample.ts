import { Component } from '@angular/core';

@Component({
    selector: 'app-carousel-sample',
    templateUrl: 'carousel.sample.html'
})
export class CarouselSampleComponent {

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
            {image: 'assets/images/carousel/slide3@x2.jpg'},
            {image: 'assets/images/carousel/slide4@x2.jpg'}
        );
    }
}
