/// <reference path="../../typings/globals/es6-shim/index.d.ts" />


import { it, iit, describe, expect, inject, async, beforeEachProviders } from '@angular/core/testing';
import { TestComponentBuilder, ComponentFixture } from '@angular/compiler/testing';
import {Component, ViewChild, ContentChildren, QueryList} from '@angular/core';
import * as Infragistics from '../../src/main';

declare var Simulator: any;


function dispatchEv(element: HTMLElement, eventType: string): void {
    let event = new Event(eventType);
    element.dispatchEvent(event);
}

export function main() {
    describe('Inragistics Angular2 Carousel', () => {

        let builder: TestComponentBuilder;


        beforeEach(inject([TestComponentBuilder], (tcb: TestComponentBuilder) => {
            builder = tcb;
        }));


        it("should initialize a carousel with two slides and then destroy it", (done: () => void) => {
            return builder.createAsync(CarouselTestComponent).then(fixture => {

                fixture.detectChanges();

                expect(fixture.componentInstance.viewChild).toBeDefined();
                expect(fixture.componentInstance.viewChild instanceof Infragistics.Carousel).toBe(true);
                expect(fixture.componentInstance.viewChild.slides[0] instanceof Infragistics.Slide).toBe(true);

                fixture.detectChanges();

                expect(fixture.componentInstance.viewChild.slides instanceof Array).toBe(true);
                expect(fixture.componentInstance.loop).toBe(true);
                expect(fixture.componentInstance.viewChild.pause).toBe(false);
                expect(fixture.componentInstance.viewChild.slides.length).toBe(2);
                expect(fixture.componentInstance.viewChild.interval).toBe(2500);

                fixture.componentInstance.viewChild.ngOnDestroy();
                fixture.detectChanges();
                expect(fixture.componentInstance.viewChild._destroyed).toBe(true);

                done();
            });
        });

        it("Carousel disabled looping", (done: () => void) => {
            return builder.createAsync(CarouselTestComponent).then(fixture => {
                fixture.detectChanges();

                let lastSlide = fixture.componentInstance.viewChild.get(1);
                let firstSlide = fixture.componentInstance.viewChild.get(0);

                fixture.componentInstance.viewChild.loop = false;
                fixture.detectChanges();
                fixture.componentInstance.viewChild.next();
                fixture.componentInstance.viewChild.next();
                fixture.detectChanges();
                expect(fixture.componentInstance.viewChild._current_slide.index).toBe(lastSlide.index);

                fixture.componentInstance.viewChild.prev();
                fixture.componentInstance.viewChild.prev();
                fixture.detectChanges();
                expect(fixture.componentInstance.viewChild._current_slide.index).toBe(firstSlide.index);

                done();
            });
        });

        it('Carousel getter/setter tests', (done: () => void) => {
            return builder.createAsync(CarouselTestComponent).then(fixture => {

                fixture.detectChanges();

                // Setters
                fixture.componentInstance.viewChild.loop = false;
                fixture.componentInstance.viewChild.pause = false;
                fixture.componentInstance.viewChild.interval = 666;
                fixture.componentInstance.viewChild.navigation = false;

                fixture.detectChanges();

                // Getters
                expect(fixture.componentInstance.viewChild.loop).toBe(false);
                expect(fixture.componentInstance.viewChild.pause).toBe(false);
                expect(fixture.componentInstance.viewChild.interval).toBe(666);
                expect(fixture.componentInstance.viewChild.navigation).toBe(false);

                done();
            });
        });

        it('Carousel add/remove slides tests', (done: () => void) => {
            return builder.createAsync(CarouselTestComponent).then(fixture => {

                fixture.detectChanges();

                let currentSlide = fixture.componentInstance.viewChild._current_slide;
                fixture.componentInstance.viewChild.remove(currentSlide);

                fixture.detectChanges();
                expect(fixture.componentInstance.viewChild.slides.length).toBe(1);

                currentSlide = fixture.componentInstance.viewChild._current_slide;
                fixture.componentInstance.viewChild.remove(currentSlide);

                fixture.detectChanges();
                expect(fixture.componentInstance.viewChild.slides.length).toBe(0);

                fixture.componentInstance.viewChild.add(currentSlide);
                fixture.componentInstance.viewChild.add(currentSlide);

                fixture.detectChanges();
                expect(fixture.componentInstance.viewChild.slides.length).toBe(2);

                done();
            });
        });

        it("Carousel public methods", (done: () => void) => {
            return builder.createAsync(CarouselTestComponent).then(fixture => {
                fixture.detectChanges();
                fixture.componentInstance.viewChild.pause = false;
                fixture.detectChanges();

                fixture.componentInstance.viewChild.stop();
                fixture.detectChanges();
                expect(fixture.componentInstance.viewChild._playing).toBe(false);

                fixture.componentInstance.viewChild.next();
                let currentSlide = fixture.componentInstance.viewChild._current_slide;
                fixture.detectChanges();
                expect(fixture.componentInstance.viewChild.get(1)).toBe(currentSlide);

                currentSlide = fixture.componentInstance.viewChild.get(0);
                fixture.componentInstance.viewChild.prev();
                fixture.detectChanges();
                expect(fixture.componentInstance.viewChild.get(0)).toBe(currentSlide);

                done();
            });
        });

        it("Carousel emit events", (done: () => void) => {
            return builder.createAsync(CarouselTestComponent).then(fixture => {
                fixture.detectChanges();

                let carousel = fixture.componentInstance.viewChild;
                let native = fixture.nativeElement;

                spyOn(carousel.slideChanged, 'emit');
                carousel.next();
                fixture.detectChanges();
                expect(carousel.slideChanged.emit).toHaveBeenCalledWith(carousel);

                spyOn(carousel.slideAdded, 'emit');
                carousel.add(carousel._current_slide);
                fixture.detectChanges();
                expect(carousel.slideAdded.emit).toHaveBeenCalledWith(carousel);

                spyOn(carousel.slideRemoved, 'emit');
                carousel.remove(carousel._current_slide);
                fixture.detectChanges();
                expect(carousel.slideRemoved.emit).toHaveBeenCalledWith(carousel);

                spyOn(carousel.carouselPaused, 'emit');
                carousel.stop();
                fixture.detectChanges();
                expect(carousel.carouselPaused.emit).toHaveBeenCalledWith(carousel);

                spyOn(carousel.carouselPlaying, 'emit');
                carousel.play();
                fixture.detectChanges();
                expect(carousel.carouselPlaying.emit).toHaveBeenCalledWith(carousel);

                done();

            });
        });

        it('Carousel click handlers', (done: () => void) => {
            return builder.createAsync(CarouselTestComponent).then(fixture => {
                fixture.detectChanges();

                let prevNav, nextNav,
                    carousel, carouselNative;

                carouselNative = fixture.componentInstance.viewChild.element_ref.nativeElement;
                carousel = fixture.componentInstance.viewChild;
                prevNav = carouselNative.querySelector('a.left');
                nextNav = carouselNative.querySelector('a.right');

                spyOn(carousel, 'prev');
                dispatchEv(prevNav, 'click');
                fixture.detectChanges();
                expect(carousel.prev).toHaveBeenCalled();

                spyOn(carousel, 'next');
                dispatchEv(nextNav, 'click');
                fixture.detectChanges();
                expect(carousel.next).toHaveBeenCalled();

                done();
            });
        });

        it('Carousel keyboard handlers', (done: () => void) => {
            return builder.createAsync(CarouselTestComponent).then(fixture => {
                fixture.detectChanges();

                let carousel, carouselNative;

                carouselNative = fixture.componentInstance.viewChild.element_ref.nativeElement;
                carousel = fixture.componentInstance.viewChild;

                carousel.pause = true;
                fixture.detectChanges();

                spyOn(carousel, 'prev');
                carouselNative.dispatchEvent(new KeyboardEvent('keydown', {key: "ArrowLeft"}));
                fixture.detectChanges();
                expect(carousel.prev).toHaveBeenCalled();

                spyOn(carousel, 'next');
                carouselNative.dispatchEvent(new KeyboardEvent('keydown', {key: "ArrowRight"}));
                fixture.detectChanges();
                expect(carousel.next).toHaveBeenCalled();

                done();
            });
        });
    });
}

@Component({
    selector: 'test-cmp',
    template: `<ig-carousel [loop]="loop" [pause]="pause" [interval]="interval">
                    <ig-slide></ig-slide>
                    <ig-slide></ig-slide>
                </ig-carousel>`,
    directives: [
        Infragistics.Carousel,
        Infragistics.Slide
    ]
})
class CarouselTestComponent {
    loop = true;
    pause = false;
    swipes_left = 0;
    swipes_right = 0;
    interval = 2500;
    taps = 0;

    @ViewChild(Infragistics.Carousel) public viewChild: Infragistics.Carousel;
}