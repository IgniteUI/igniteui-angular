import { Component, ViewChild } from '@angular/core';
import {
    async,
    TestBed,
    ComponentFixture,
    fakeAsync,
    tick
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { IgxCarouselComponent, IgxCarouselModule,  ISlideEventArgs } from './carousel.component';
import { UIInteractions } from '../test-utils/ui-interactions.spec';
import { configureTestSuite } from '../test-utils/configure-suite';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxSlideComponent } from './slide.component';

describe('Carousel', () => {
    configureTestSuite();
    let fixture: ComponentFixture<CarouselTestComponent>;
    let carousel: IgxCarouselComponent;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [CarouselTestComponent],
            imports: [IgxCarouselModule, NoopAnimationsModule]
        })
            .compileComponents();
    }));

    describe('Base Tests: ', () => {
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
            expect(carousel).toBeDefined();
            expect(carousel.id).toContain('igx-carousel-');
            expect(domCarousel.id).toContain('igx-carousel-');
            expect(carousel instanceof IgxCarouselComponent).toBe(true);
            expect(carousel.slides.first instanceof IgxSlideComponent).toBe(true);

            expect(carousel.loop).toBe(true);
            expect(carousel.pause).toBe(true);
            expect(carousel.slides.length).toEqual(4);
            expect(carousel.interval).toEqual(2500);

            carousel.ngOnDestroy();
            fixture.detectChanges();
            expect(carousel.isDestroyed).toBe(true);
        });

        it('disabled looping', () => {
            carousel.loop = false;
            fixture.detectChanges();
            carousel.next();
            carousel.next();
            carousel.next();
            fixture.detectChanges();
            HelperTestFunctions.verifyActiveSlide(carousel, 3);

            carousel.next();
            fixture.detectChanges();
            HelperTestFunctions.verifyActiveSlide(carousel, 3);

            carousel.prev();
            carousel.prev();
            carousel.prev();
            fixture.detectChanges();
            HelperTestFunctions.verifyActiveSlide(carousel, 0);

            carousel.prev();
            fixture.detectChanges();
            HelperTestFunctions.verifyActiveSlide(carousel, 0);
        });

        it('getter/setter tests', () => {
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

        it('add/remove slides tests', () => {
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

        it('checking if a slide is not active when it gets removed', () => {
            const currentSlide = carousel.get(carousel.current);
            carousel.remove(currentSlide);

            fixture.detectChanges();
            expect(currentSlide.active).toBe(false);
        });

        it('public methods', () => {
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

        it('emit events', () => {
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

        it('click handlers', () => {
            const nextNav = HelperTestFunctions.getNextButton(fixture).nativeElement;
            const prevNav = HelperTestFunctions.getPreviousButton(fixture).nativeElement;

            spyOn(carousel, 'prev');
            prevNav.dispatchEvent(new Event('click'));
            fixture.detectChanges();
            expect(carousel.prev).toHaveBeenCalled();

            spyOn(carousel, 'next');
            nextNav.dispatchEvent(new Event('click'));
            fixture.detectChanges();
            expect(carousel.next).toHaveBeenCalled();
        });

        it('keyboard navigation test', () => {
            spyOn(carousel.onSlideChanged, 'emit');
            carousel.pause = true;

            UIInteractions.triggerKeyDownEvtUponElem('ArrowRight', carousel.nativeElement, true);
            fixture.detectChanges();
            HelperTestFunctions.verifyActiveSlide(carousel, 1);

            UIInteractions.triggerKeyDownEvtUponElem('ArrowRight', carousel.nativeElement, true);
            fixture.detectChanges();
            HelperTestFunctions.verifyActiveSlide(carousel, 2);

            UIInteractions.triggerKeyDownEvtUponElem('ArrowRight', carousel.nativeElement, true);
            fixture.detectChanges();
            HelperTestFunctions.verifyActiveSlide(carousel, 3);

            UIInteractions.triggerKeyDownEvtUponElem('ArrowRight', carousel.nativeElement, true);
            fixture.detectChanges();
            HelperTestFunctions.verifyActiveSlide(carousel, 0);

            UIInteractions.triggerKeyDownEvtUponElem('ArrowLeft', carousel.nativeElement, true);
            fixture.detectChanges();
            HelperTestFunctions.verifyActiveSlide(carousel, 3);

            UIInteractions.triggerKeyDownEvtUponElem('ArrowLeft', carousel.nativeElement, true);
            fixture.detectChanges();
            HelperTestFunctions.verifyActiveSlide(carousel, 2);

            UIInteractions.triggerKeyDownEvtUponElem('Home', carousel.nativeElement, true);
            fixture.detectChanges();
            HelperTestFunctions.verifyActiveSlide(carousel, 0);

            UIInteractions.triggerKeyDownEvtUponElem('End', carousel.nativeElement, true);
            fixture.detectChanges();
            HelperTestFunctions.verifyActiveSlide(carousel, 3);

            expect(carousel.onSlideChanged.emit).toHaveBeenCalledTimes(8);
        });

        it('changing slides with navigation buttons', () => {
            spyOn(carousel.onSlideChanged, 'emit');
            carousel.pause = true;

            const prevNav = HelperTestFunctions.getPreviousButton(fixture).nativeElement;
            const nextNav = HelperTestFunctions.getNextButton(fixture).nativeElement;

            nextNav.dispatchEvent(new Event('click'));
            fixture.detectChanges();

            HelperTestFunctions.verifyActiveSlide(carousel, 1);

            nextNav.dispatchEvent(new Event('click'));
            fixture.detectChanges();

            HelperTestFunctions.verifyActiveSlide(carousel, 2);

            nextNav.dispatchEvent(new Event('click'));
            fixture.detectChanges();

            HelperTestFunctions.verifyActiveSlide(carousel, 3);

            nextNav.dispatchEvent(new Event('click'));
            fixture.detectChanges();

            HelperTestFunctions.verifyActiveSlide(carousel, 0);

            prevNav.dispatchEvent(new Event('click'));
            fixture.detectChanges();

            HelperTestFunctions.verifyActiveSlide(carousel, 3);

            prevNav.dispatchEvent(new Event('click'));
            fixture.detectChanges();

            HelperTestFunctions.verifyActiveSlide(carousel, 2);

            expect(carousel.onSlideChanged.emit).toHaveBeenCalledTimes(6);
        });

        it('navigation changes visibility of arrows', () => {
            expect( HelperTestFunctions.getNextButton(fixture) === null).toBe(false);
            expect(HelperTestFunctions.getPreviousButton(fixture) === null).toBe(false);

            carousel.navigation = false;
            fixture.detectChanges();
            expect(HelperTestFunctions.getNextButton(fixture) === null).toBe(true);
            expect(HelperTestFunctions.getPreviousButton(fixture) === null).toBe(true);

            carousel.navigation = true;
            fixture.detectChanges();
            expect(HelperTestFunctions.getNextButton(fixture) === null).toBe(false);
            expect(HelperTestFunctions.getPreviousButton(fixture) === null).toBe(false);
        });

        it('keyboardSupport changes support for keyboard navigation', () => {
            carousel.keyboardSupport = false;
            carousel.select(carousel.get(1));
            fixture.detectChanges();

            spyOn(carousel.onSlideChanged, 'emit');

            UIInteractions.triggerKeyDownEvtUponElem('ArrowRight', carousel.nativeElement, true);
            fixture.detectChanges();
            HelperTestFunctions.verifyActiveSlide(carousel, 1);

            UIInteractions.triggerKeyDownEvtUponElem('ArrowLeft', carousel.nativeElement, true);
            fixture.detectChanges();
            HelperTestFunctions.verifyActiveSlide(carousel, 1);

            UIInteractions.triggerKeyDownEvtUponElem('End', carousel.nativeElement, true);
            fixture.detectChanges();
            HelperTestFunctions.verifyActiveSlide(carousel, 1);

            UIInteractions.triggerKeyDownEvtUponElem('Home', carousel.nativeElement, true);
            fixture.detectChanges();
            HelperTestFunctions.verifyActiveSlide(carousel, 1);

            expect(carousel.onSlideChanged.emit).toHaveBeenCalledTimes(0);
            carousel.keyboardSupport = true;
            fixture.detectChanges();

            UIInteractions.triggerKeyDownEvtUponElem('ArrowRight', carousel.nativeElement, true);
            fixture.detectChanges();
            HelperTestFunctions.verifyActiveSlide(carousel, 2);
            expect(carousel.onSlideChanged.emit).toHaveBeenCalledTimes(1);
        });
    });
});

class HelperTestFunctions {
    public static  NEXT_BUTTON_CLASS = '.igx-carousel__arrow--next';
    public static  PRIV_BUTTON_CLASS = '.igx-carousel__arrow--prev';
    public static  ACTIVE_SLIDE_CLASS = 'igx-slide--current';
    public static  INDICATORS_TOP_CLASS = '.igx-carousel-indicators--top';
    public static  INDICATORS_BOTTOM_CLASS = '.igx-carousel-indicators--bottom';

    public static getNextButton(fixture) {
        const carouselNative = fixture.debugElement;
        return carouselNative.query(By.css(HelperTestFunctions.NEXT_BUTTON_CLASS));
    }

    public static getPreviousButton(fixture) {
        const carouselNative = fixture.debugElement;
        return carouselNative.query(By.css(HelperTestFunctions.PRIV_BUTTON_CLASS));
    }

    public static getIndicatorsContainer(fixture) {
        const carouselNative = fixture.debugElement;
        return carouselNative.query(By.css(HelperTestFunctions.PRIV_BUTTON_CLASS)).nativeElement;
    }

    public static verifyActiveSlide(carousel, index: number) {
        const activeSlide = carousel.get(index);
        expect(carousel.current).toEqual(index);
        expect(activeSlide.active).toBeTruthy();
        expect(activeSlide.nativeElement.classList.contains(HelperTestFunctions.ACTIVE_SLIDE_CLASS)).toBeTruthy();
        expect(carousel.slides.find((slide) => slide.active && slide.index !== index)).toBeUndefined();
    }


}
@Component({
    template: `
        <igx-carousel #carousel [loop]="loop" [pause]="pause" [interval]="interval" [animationType]="'none'">
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
