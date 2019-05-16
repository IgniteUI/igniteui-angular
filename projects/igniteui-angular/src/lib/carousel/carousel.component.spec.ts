import {Component, ViewChild} from '@angular/core';
import {
  async,
  TestBed,
  ComponentFixture
} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {IgxCarouselComponent, IgxCarouselModule, IgxSlideComponent, ISlideEventArgs} from './carousel.component';
import { UIInteractions } from '../test-utils/ui-interactions.spec';

import { configureTestSuite } from '../test-utils/configure-suite';

describe('Carousel', () => {
    configureTestSuite();
    let fixture: ComponentFixture<CarouselTestComponent>;
    let carousel: IgxCarouselComponent;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [CarouselTestComponent],
            imports: [IgxCarouselModule]
        })
        .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(CarouselTestComponent);
        carousel = fixture.componentInstance.carousel;
        fixture.detectChanges();
      });

    it('should initialize a carousel with id property', () => {
        const domCarousel = fixture.debugElement.query(By.css('igx-carousel')).nativeElement;

        expect(carousel.id).toContain('igx-carousel-');
        expect(domCarousel.id).toContain('igx-carousel-');

        carousel.id = 'cusrtomCarousel';
        fixture.detectChanges();

        expect(carousel.id).toBe('cusrtomCarousel');
        expect(domCarousel.id).toBe('cusrtomCarousel');
    });

    it('should initialize a carousel with four slides and then destroy it', () => {
        const domCarousel = fixture.debugElement.query(By.css('igx-carousel')).nativeElement;

        fixture.detectChanges();
        expect(carousel).toBeDefined();
        expect(carousel.id).toContain('igx-carousel-');
        expect(domCarousel.id).toContain('igx-carousel-');
        expect(carousel instanceof IgxCarouselComponent).toBe(true);
        expect(carousel.slides[0] instanceof IgxSlideComponent).toBe(true);

        expect(carousel.slides instanceof Array).toBe(true);
        expect(carousel.loop).toBe(true);
        expect(carousel.pause).toBe(true);
        expect(carousel.slides.length).toEqual(4);
        expect(carousel.interval).toEqual(2500);

        carousel.ngOnDestroy();
        fixture.detectChanges();
        expect(carousel.isDestroyed).toBe(true);
    });

    it('Carousel disabled looping', () => {
        const lastSlide = carousel.get(3);
        const firstSlide = carousel.get(0);

        carousel.loop = false;
        fixture.detectChanges();
        carousel.next();
        carousel.next();
        carousel.next();
        fixture.detectChanges();
        expect(carousel.current).toBe(lastSlide.index);

        carousel.next();
        fixture.detectChanges();
        expect(carousel.current).toBe(lastSlide.index);

        carousel.prev();
        carousel.prev();
        carousel.prev();
        fixture.detectChanges();
        expect(carousel.current).toBe(firstSlide.index);

        carousel.prev();
        fixture.detectChanges();
        expect(carousel.current).toBe(firstSlide.index);
    });

    it('Carousel getter/setter tests', () => {
        carousel.loop = false;
        carousel.pause = false;
        carousel.interval = 500;
        carousel.navigation = false;

        fixture.detectChanges();

        expect(carousel.loop).toBe(false);
        expect(carousel.pause).toBe(false);
        expect(carousel.interval).toEqual(500);
        expect(carousel.navigation).toBe(false);
    });

    it('Carousel add/remove slides tests', () => {
        let currentSlide = carousel.get(carousel.current);
        carousel.remove(currentSlide);

        fixture.detectChanges();
        expect(carousel.slides.length).toEqual(3);
        expect(carousel.total).toEqual(3);

        currentSlide = carousel.get(carousel.current);
        carousel.remove(currentSlide);

        fixture.detectChanges();
        expect(carousel.slides.length).toEqual(2);
        expect(carousel.total).toEqual(2);

        carousel.add(currentSlide);
        carousel.add(currentSlide);

        fixture.detectChanges();
        expect(carousel.slides.length).toEqual(4);
        expect(carousel.total).toEqual(4);
    });

    it('Carousel checking if a slide is not active when it gets removed', () => {
        const currentSlide = carousel.get(carousel.current);
        carousel.remove(currentSlide);

        fixture.detectChanges();
        expect(currentSlide.active).toBe(false);
    });

    it('Carousel public methods', () => {
        carousel.stop();

        fixture.detectChanges();
        expect(carousel.isPlaying).toBe(false);

        carousel.next();
        let currentSlide = carousel.get(carousel.current);

        fixture.detectChanges();
        expect(carousel.get(1)).toBe(currentSlide);

        currentSlide = carousel.get(0);
        carousel.prev();

        fixture.detectChanges();
        expect(carousel.get(0)).toBe(currentSlide);
    });

    it('Carousel emit events', () => {
        spyOn(carousel.onSlideChanged, 'emit');
        carousel.next();
        fixture.detectChanges();
        let args: ISlideEventArgs = {
            carousel,
            slide: carousel.get(carousel.current)
        };
        expect(carousel.onSlideChanged.emit).toHaveBeenCalledWith(args);
        expect(carousel.onSlideChanged.emit).toHaveBeenCalledTimes(1);

        carousel.prev();
        args = {
            carousel,
            slide: carousel.get(carousel.current)
        };
        fixture.detectChanges();
        expect(carousel.onSlideChanged.emit).toHaveBeenCalledWith(args);
        expect(carousel.onSlideChanged.emit).toHaveBeenCalledTimes(2);

        carousel.select(carousel.get(2));
        args = {
            carousel,
            slide: carousel.get(2)
        };
        fixture.detectChanges();
        expect(carousel.onSlideChanged.emit).toHaveBeenCalledWith(args);
        expect(carousel.onSlideChanged.emit).toHaveBeenCalledTimes(3);

        spyOn(carousel.onSlideAdded, 'emit');
        carousel.add(carousel.get(carousel.current));
        fixture.detectChanges();
        args = {
            carousel,
            slide: carousel.get(carousel.current)
        };
        expect(carousel.onSlideAdded.emit).toHaveBeenCalledWith(args);

        spyOn(carousel.onSlideRemoved, 'emit');
        args = {
            carousel,
            slide: carousel.get(carousel.current)
        };
        carousel.remove(carousel.get(carousel.current));
        fixture.detectChanges();
        expect(carousel.onSlideRemoved.emit).toHaveBeenCalledWith(args);

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
        let prevNav;
        let nextNav;
        let carouselNative;

        carouselNative = fixture.debugElement;

        prevNav = carouselNative.query(By.css('a.igx-carousel__arrow--prev')).nativeElement;
        nextNav = carouselNative.query(By.css('a.igx-carousel__arrow--next')).nativeElement;

        spyOn(carousel, 'prev');
        prevNav.dispatchEvent(new Event('click'));
        fixture.detectChanges();
        expect(carousel.prev).toHaveBeenCalled();

        spyOn(carousel, 'next');
        nextNav.dispatchEvent(new Event('click'));
        fixture.detectChanges();
        expect(carousel.next).toHaveBeenCalled();
    });

    it('Carousel UI navigation test', () => {
        let carouselNative;

        carouselNative = fixture.debugElement.query(By.css('.igx-carousel'));

        expect(carousel.current).toEqual(0);
        carousel.pause = true;

        carousel.nativeElement.focus();
        UIInteractions.triggerKeyDownEvtUponElem('ArrowRight', carousel.nativeElement, true);
        fixture.detectChanges();
        expect(carousel.current).toEqual(1);
        expect(carousel.get(1).active).toBeTruthy();

        UIInteractions.triggerKeyDownEvtUponElem('ArrowRight', carousel.nativeElement, true);
        fixture.detectChanges();
        expect(carousel.current).toEqual(2);
        expect(carousel.get(1).active).toBe(false);
        expect(carousel.get(2).active).toBe(true);

        UIInteractions.triggerKeyDownEvtUponElem('ArrowRight', carousel.nativeElement, true);
        fixture.detectChanges();
        expect(carousel.current).toEqual(3);

        UIInteractions.triggerKeyDownEvtUponElem('ArrowRight', carousel.nativeElement, true);
        fixture.detectChanges();
        expect(carousel.current).toEqual(0);

        UIInteractions.triggerKeyDownEvtUponElem('ArrowLeft', carousel.nativeElement, true);
        fixture.detectChanges();
        expect(carousel.current).toEqual(3);

        UIInteractions.triggerKeyDownEvtUponElem('ArrowLeft', carousel.nativeElement, true);
        fixture.detectChanges();
        expect(carousel.current).toEqual(2);
    });

    it('Carousel navigation changes visibility of arrows', () => {
        let carouselNative;

        carouselNative = fixture.debugElement.query(By.css('.igx-carousel'));

        // carousel.navigation = true;
        fixture.detectChanges();
        expect(carouselNative.query(By.css('.igx-carousel__arrow--prev')) === null).toBe(false);
        expect(carouselNative.query(By.css('.igx-carousel__arrow--next')) === null).toBe(false);

        carousel.navigation = false;
        fixture.detectChanges();
        expect(carouselNative.query(By.css('.igx-carousel__arrow--prev')) === null).toBe(true);
        expect(carouselNative.query(By.css('.igx-carousel__arrow--next')) === null).toBe(true);

        carousel.navigation = true;
        fixture.detectChanges();
        expect(carouselNative.query(By.css('.igx-carousel__arrow--prev')) === null).toBe(false);
        expect(carouselNative.query(By.css('.igx-carousel__arrow--next')) === null).toBe(false);
    });
});

@Component({
    template: `
        <igx-carousel #carousel [loop]="loop" [pause]="pause" [interval]="interval">
            <igx-slide><h3>Slide1</h3></igx-slide>
            <igx-slide><h3>Slide2</h3></igx-slide>
            <igx-slide><h3>Slide3</h3></igx-slide>
            <igx-slide><h3>Slide4</h3></igx-slide>
        </igx-carousel>
    `
})
class CarouselTestComponent {

    @ViewChild('carousel', { static: true }) public carousel: IgxCarouselComponent;

    public loop = true;
    public pause = true;
    public interval = 2500;
}
