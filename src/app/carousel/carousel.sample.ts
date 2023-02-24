import { Component, ViewChild } from '@angular/core';
import { IgxCarouselComponent, CarouselIndicatorsOrientation } from 'igniteui-angular';
import { IgxCarouselIndicatorDirective } from '../../../projects/igniteui-angular/src/lib/carousel/carousel.directives';
import { IgxSlideComponent } from '../../../projects/igniteui-angular/src/lib/carousel/slide.component';
import { IgxCarouselComponent as IgxCarouselComponent_1 } from '../../../projects/igniteui-angular/src/lib/carousel/carousel.component';
import { IgxDropDownItemComponent } from '../../../projects/igniteui-angular/src/lib/drop-down/drop-down-item.component';
import { NgFor, NgIf } from '@angular/common';
import { IgxDropDownComponent } from '../../../projects/igniteui-angular/src/lib/drop-down/drop-down.component';
import { IgxDropDownItemNavigationDirective } from '../../../projects/igniteui-angular/src/lib/drop-down/drop-down-navigation.directive';
import { IgxToggleActionDirective } from '../../../projects/igniteui-angular/src/lib/directives/toggle/toggle.directive';
import { IgxButtonDirective } from '../../../projects/igniteui-angular/src/lib/directives/button/button.directive';
import { FormsModule } from '@angular/forms';
import { IgxSwitchComponent } from '../../../projects/igniteui-angular/src/lib/switch/switch.component';

@Component({
    selector: 'app-carousel-sample',
    styleUrls: ['carousel.sample.scss'],
    templateUrl: 'carousel.sample.html',
    standalone: true,
    imports: [IgxSwitchComponent, FormsModule, IgxButtonDirective, IgxToggleActionDirective, IgxDropDownItemNavigationDirective, IgxDropDownComponent, NgFor, IgxDropDownItemComponent, IgxCarouselComponent_1, IgxSlideComponent, IgxCarouselIndicatorDirective, NgIf]
})
export class CarouselSampleComponent {
    @ViewChild('car', { static: true })
    private car: IgxCarouselComponent;

    public animationModes = ['none', 'slide', 'fade'];
    public slides = [];
    public interval = 3000;
    public pause = true;
    public loop = true;

    constructor() {
        this.addNewSlide();
    }

    public addNewSlide() {
        this.slides.push(
            {image: 'assets/images/carousel/slide1@x2.jpg', active: true},
            {image: 'assets/images/carousel/slide2@x2.jpg', active: false},
            {image: 'assets/images/carousel/slide3@x2.jpg', active: false}
        );
    }

    public changeSlides() {
        this.slides.push({image: 'assets/images/carousel/slide4@x2.jpg'});
    }

    public changeSlidesRemove() {
        this.slides = this.slides.slice(1);
    }

    public changeOrientation() {
        if (this.car.indicatorsOrientation === CarouselIndicatorsOrientation.top) {
            this.car.indicatorsOrientation = CarouselIndicatorsOrientation.bottom;
        } else {
            this.car.indicatorsOrientation = CarouselIndicatorsOrientation.top;
        }
    }

    public onAnimationSelection(event) {
        this.car.animationType = event.newSelection.element.nativeElement.textContent.trim();
    }

    public pauseCar() {
        this.car.stop();
    }

    public play() {
        this.car.play();
    }
}
