import {
  async,
  TestBed,
} from '@angular/core/testing';
import {Component, ViewChild} from '@angular/core';
import {By} from '@angular/platform-browser';
import { HammerGesturesManager } from '../core/touch';
import {IgxCarousel, IgxSlide, IgxCarouselModule} from './carousel.component';


function dispatchEv(element: HTMLElement, eventType: string) {
    let event = new Event(eventType);
    element.dispatchEvent(event);
}


describe("Carousel", function() {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [IgxCarouselModule],
            declarations: [CarouselTestComponent]
        })
        .compileComponents();
    }));

    it('should initialize a carousel with two slides and then destroy it', () => {
        let fixture = TestBed.createComponent(CarouselTestComponent);
        fixture.detectChanges();

        let instance = fixture.componentInstance;


        fixture.detectChanges();
        expect(instance.carousel).toBeDefined();
        expect(instance.carousel instanceof IgxCarousel).toBe(true);
        expect(instance.carousel.slides[0] instanceof IgxSlide).toBe(true);


        expect(instance.carousel.slides instanceof Array).toBe(true);
        expect(instance.carousel.loop).toBe(true);
        expect(instance.carousel.pause).toBe(true);
        expect(instance.carousel.slides.length).toEqual(2);
        expect(instance.carousel.interval).toEqual(2500)

        instance.carousel.ngOnDestroy();
        fixture.detectChanges();
        expect(instance.carousel.isDestroyed).toBe(true);

    });

    it("Carousel disabled looping", () => {
        let fixture = TestBed.createComponent(CarouselTestComponent);
        fixture.detectChanges();

        let instance = fixture.componentInstance;

        fixture.detectChanges();

        let lastSlide = instance.carousel.get(1);
        let firstSlide = instance.carousel.get(0);

        instance.carousel.loop = false;
        fixture.detectChanges();
        instance.carousel.next();
        instance.carousel.next();
        fixture.detectChanges();
        expect(instance.carousel.current).toBe(lastSlide.index);

        instance.carousel.prev();
        instance.carousel.prev();
        fixture.detectChanges();
        expect(instance.carousel.current).toBe(firstSlide.index);

    });

    it('Carousel getter/setter tests', () => {
        let fixture = TestBed.createComponent(CarouselTestComponent);
        fixture.detectChanges();

        let instance = fixture.componentInstance;

        fixture.detectChanges();

        instance.carousel.loop = false;
        instance.carousel.pause = false;
        instance.carousel.interval = 500;
        instance.carousel.navigation = false;

        fixture.detectChanges();

        expect(instance.carousel.loop).toBe(false);
        expect(instance.carousel.pause).toBe(false);
        expect(instance.carousel.interval).toEqual(500);
        expect(instance.carousel.navigation).toBe(false);
    });

    it('Carousel add/remove slides tests', () => {
        let fixture = TestBed.createComponent(CarouselTestComponent);
        fixture.detectChanges();

        let instance = fixture.componentInstance;

        fixture.detectChanges();

        let currentSlide = instance.carousel.get(instance.carousel.current);
        instance.carousel.remove(currentSlide);

        fixture.detectChanges();
        expect(instance.carousel.slides.length).toEqual(1);

        currentSlide = instance.carousel.get(instance.carousel.current);
        instance.carousel.remove(currentSlide);

        fixture.detectChanges();
        expect(instance.carousel.slides.length).toEqual(0);

        instance.carousel.add(currentSlide);
        instance.carousel.add(currentSlide);

        fixture.detectChanges();
        expect(instance.carousel.slides.length).toEqual(2);
    });

    it("Carousel public methods", () => {
        let fixture = TestBed.createComponent(CarouselTestComponent);
        fixture.detectChanges();

        let instance = fixture.componentInstance;

        fixture.detectChanges();


        instance.carousel.stop();

        fixture.detectChanges();
        expect(instance.carousel.isPlaying).toBe(false);

        instance.carousel.next();
        let currentSlide = instance.carousel.get(instance.carousel.current);

        fixture.detectChanges();
        expect(instance.carousel.get(1)).toBe(currentSlide);

        currentSlide = instance.carousel.get(0);
        instance.carousel.prev();

        fixture.detectChanges();
        expect(instance.carousel.get(0)).toBe(currentSlide);
    });

    it("Carousel emit events", () => {
        let fixture = TestBed.createComponent(CarouselTestComponent);
        fixture.detectChanges();

        let carousel = fixture.componentInstance.carousel;

        spyOn(carousel.onSlideChanged, 'emit');
        carousel.next();
        fixture.detectChanges();
        expect(carousel.onSlideChanged.emit).toHaveBeenCalledWith(carousel);

        spyOn(carousel.onSlideAdded, 'emit');
        carousel.add(carousel.get(carousel.current));
        fixture.detectChanges();
        expect(carousel.onSlideAdded.emit).toHaveBeenCalledWith(carousel);

        spyOn(carousel.onSlideRemoved, 'emit');
        carousel.remove(carousel.get(carousel.current));
        fixture.detectChanges();
        expect(carousel.onSlideRemoved.emit).toHaveBeenCalledWith(carousel);

        spyOn(carousel.onCarouselPaused, 'emit');
        carousel.stop();
        fixture.detectChanges();
        expect(carousel.onCarouselPaused.emit).toHaveBeenCalledWith(carousel);

        spyOn(carousel.onCarouselPlaying, 'emit');
        carousel.play();
        fixture.detectChanges();
        expect(carousel.onCarouselPlaying.emit).toHaveBeenCalledWith(carousel);
    });

    it('Carousel click handlers', () => {
        let fixture = TestBed.createComponent(CarouselTestComponent);
        fixture.detectChanges();

        let prevNav, nextNav,
            carousel, carouselNative;

        carouselNative = fixture.componentInstance.carousel.element_ref.nativeElement;
        carousel = fixture.componentInstance.carousel;

        prevNav = carouselNative.querySelector('a.igx-carousel__arrow--prev');
        nextNav = carouselNative.querySelector('a.igx-carousel__arrow--next');

        spyOn(carousel, 'prev');
        dispatchEv(prevNav, 'click');
        fixture.detectChanges();
        expect(carousel.prev).toHaveBeenCalled();

        spyOn(carousel, 'next');
        dispatchEv(nextNav, 'click');
        fixture.detectChanges();
        expect(carousel.next).toHaveBeenCalled();
    });

    it('Carousel keyboard handlers', () => {
        let fixture = TestBed.createComponent(CarouselTestComponent);
        fixture.detectChanges();

        let carousel, carouselNative;

        carouselNative = fixture.componentInstance.carousel.element_ref.nativeElement;
        carousel = fixture.componentInstance.carousel;

        carousel.pause = true;
        fixture.detectChanges();

        spyOn(carousel, 'prev');
        carouselNative.dispatchEvent(new KeyboardEvent('keydown', {key: 'ArrowLeft'}));
        fixture.detectChanges();
        expect(carousel.prev).toHaveBeenCalled();

        spyOn(carousel, 'next');
        carouselNative.dispatchEvent(new KeyboardEvent('keydown', {key: "ArrowRight"}));
        fixture.detectChanges();
        expect(carousel.next).toHaveBeenCalled();
    });
});

@Component({
    template: `
        <igx-carousel #carousel [loop]="loop" [pause]="pause" [interval]="interval">
            <igx-slide></igx-slide>
            <igx-slide></igx-slide>
        </igx-carousel>
    `
})
class CarouselTestComponent {

    @ViewChild('carousel') carousel: IgxCarousel;

    loop = true;
    pause = true;
    interval = 2500;
}