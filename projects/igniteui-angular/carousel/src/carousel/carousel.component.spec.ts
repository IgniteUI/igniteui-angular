import { Component, ViewChild, TemplateRef, ChangeDetectionStrategy, ElementRef, provideZonelessChangeDetection, inject, ChangeDetectorRef } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {
    IgxCarouselComponent,
    ISlideEventArgs
} from './carousel.component';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxSlideComponent } from './slide.component';
import { IgxCarouselIndicatorDirective, IgxCarouselNextButtonDirective, IgxCarouselPrevButtonDirective } from './carousel.directives';
import { CarouselIndicatorsOrientation, CarouselAnimationType } from './enums';
import { CarouselAnimationDirection } from './carousel-base';
import { UIInteractions, wait } from 'igniteui-angular/test-utils/ui-interactions.spec';
import { CarouselResourceStringsEN, changei18n, PlatformUtil } from 'igniteui-angular/core';

describe('Carousel', () => {
    let fixture;
    let carousel: IgxCarouselComponent;
    let mockElement: any;
    let mockElementRef: ElementRef;

    beforeEach(waitForAsync(() => {
        mockElement = document.createElement("div");
        mockElementRef = new ElementRef(mockElement);
        TestBed.configureTestingModule({
            imports: [
                NoopAnimationsModule,
                CarouselTestComponent,
                CarouselTemplateSetInMarkupTestComponent,
                CarouselTemplateSetInTypescriptTestComponent,
                CarouselAnimationsComponent,
                CarouselDynamicSlidesComponent
            ],
            providers: [
                { provide: ElementRef, useValue: mockElementRef },
                IgxSlideComponent
            ]
        }).compileComponents();
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

        it('should notify when a slide is destroyed', () => {
            const slide = carousel.get(0);
            const destroyed = jasmine.createSpy('destroyed');
            slide.isDestroyed.subscribe(destroyed);

            fixture.destroy();

            expect(destroyed).toHaveBeenCalledOnceWith(true);
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
            const slide1 = carousel.get(carousel.current);
            carousel.remove(slide1);

            fixture.detectChanges();
            expect(carousel.slides.length).toEqual(3);
            expect(carousel.total).toEqual(3);

            const slide2 = carousel.get(carousel.current);
            carousel.remove(slide2);

            fixture.detectChanges();
            expect(carousel.slides.length).toEqual(2);
            expect(carousel.total).toEqual(2);

            carousel.add(slide1);
            carousel.add(slide2);

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

            carousel.select(1);
            fixture.detectChanges();
            expect(carousel.get(1)).toBe(carousel.get(carousel.current));

            // select a negative index -> active slide remains the same
            carousel.select(-1);
            fixture.detectChanges();
            expect(carousel.get(1)).toBe(carousel.get(carousel.current));

            // select a non-existent index -> active slide remains the same
            carousel.select(carousel.slides.length);
            fixture.detectChanges();
            expect(carousel.get(1)).toBe(carousel.get(carousel.current));
        });

        it('emit events', () => {
            spyOn(carousel.slideChanged, 'emit');
            carousel.next();
            fixture.detectChanges();
            let args: ISlideEventArgs = {
                carousel,
                slide: carousel.get(carousel.current)
            };
            expect(carousel.slideChanged.emit).toHaveBeenCalledWith(args);
            expect(carousel.slideChanged.emit).toHaveBeenCalledTimes(1);

            carousel.prev();
            args = {
                carousel,
                slide: carousel.get(carousel.current)
            };
            fixture.detectChanges();
            expect(carousel.slideChanged.emit).toHaveBeenCalledWith(args);
            expect(carousel.slideChanged.emit).toHaveBeenCalledTimes(2);

            carousel.select(carousel.get(2));
            args = {
                carousel,
                slide: carousel.get(2)
            };
            fixture.detectChanges();
            expect(carousel.slideChanged.emit).toHaveBeenCalledWith(args);
            expect(carousel.slideChanged.emit).toHaveBeenCalledTimes(3);

            spyOn(carousel.slideAdded, 'emit');
            const newSlide = TestBed.inject(IgxSlideComponent);
            carousel.add(newSlide);
            fixture.detectChanges();
            args = {
                carousel,
                slide: newSlide
            };
            expect(carousel.slideAdded.emit).toHaveBeenCalledWith(args);

            spyOn(carousel.slideRemoved, 'emit');
            args = {
                carousel,
                slide: carousel.get(carousel.current)
            };
            carousel.remove(carousel.get(carousel.current));
            fixture.detectChanges();
            expect(carousel.slideRemoved.emit).toHaveBeenCalledWith(args);

            carousel.play();
            spyOn(carousel.carouselPaused, 'emit');
            carousel.stop();
            fixture.detectChanges();
            expect(carousel.carouselPaused.emit).toHaveBeenCalledWith(carousel);

            spyOn(carousel.carouselPlaying, 'emit');
            carousel.play();
            fixture.detectChanges();
            expect(carousel.carouselPlaying.emit).toHaveBeenCalledWith(carousel);
        });

        it('click handlers', () => {
            const nextNav = HelperTestFunctions.getNextButton(fixture);
            const prevNav = HelperTestFunctions.getPreviousButton(fixture);

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
            spyOn(carousel.slideChanged, 'emit');
            carousel.pause = true;
            const indicators = HelperTestFunctions.getIndicatorsContainer(fixture);

            indicators.dispatchEvent(new KeyboardEvent('keyup', { key: 'Tab' }));
            fixture.detectChanges();
            expect(indicators.classList).toContain('igx-carousel-indicators--focused');

            UIInteractions.triggerKeyDownEvtUponElem('ArrowRight', indicators, true);
            fixture.detectChanges();
            HelperTestFunctions.verifyActiveSlide(carousel, 1);

            UIInteractions.triggerKeyDownEvtUponElem('ArrowRight', indicators, true);
            fixture.detectChanges();
            HelperTestFunctions.verifyActiveSlide(carousel, 2);

            UIInteractions.triggerKeyDownEvtUponElem('ArrowRight', indicators, true);
            fixture.detectChanges();
            HelperTestFunctions.verifyActiveSlide(carousel, 3);

            UIInteractions.triggerKeyDownEvtUponElem('ArrowRight', indicators, true);
            fixture.detectChanges();
            HelperTestFunctions.verifyActiveSlide(carousel, 0);

            UIInteractions.triggerKeyDownEvtUponElem('ArrowLeft', indicators, true);
            fixture.detectChanges();
            HelperTestFunctions.verifyActiveSlide(carousel, 3);

            UIInteractions.triggerKeyDownEvtUponElem('ArrowLeft', indicators, true);
            fixture.detectChanges();
            HelperTestFunctions.verifyActiveSlide(carousel, 2);

            UIInteractions.triggerKeyDownEvtUponElem('Home', indicators, true);
            fixture.detectChanges();
            HelperTestFunctions.verifyActiveSlide(carousel, 0);

            UIInteractions.triggerKeyDownEvtUponElem('End', indicators, true);
            fixture.detectChanges();
            HelperTestFunctions.verifyActiveSlide(carousel, 3);

            expect(carousel.slideChanged.emit).toHaveBeenCalledTimes(8);
        });

        it('changing slides with navigation buttons', () => {
            spyOn(carousel.slideChanged, 'emit');
            carousel.pause = true;

            const prevNav = HelperTestFunctions.getPreviousButton(fixture);
            const nextNav = HelperTestFunctions.getNextButton(fixture);

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

            expect(carousel.slideChanged.emit).toHaveBeenCalledTimes(6);
        });

        it('changing slides with indicators buttons', () => {
            spyOn(carousel.slideChanged, 'emit');
            carousel.pause = true;

            const indicators = HelperTestFunctions.getIndicators(fixture);
            expect(indicators.length).toBe(4);

            indicators[3].dispatchEvent(new Event('click'));
            fixture.detectChanges();

            HelperTestFunctions.verifyActiveSlide(carousel, 3);

            indicators[1].dispatchEvent(new Event('click'));
            fixture.detectChanges();

            HelperTestFunctions.verifyActiveSlide(carousel, 1);

            expect(carousel.slideChanged.emit).toHaveBeenCalledTimes(2);
        });

        it('navigation changes visibility of arrows', () => {
            expect(HelperTestFunctions.getNextButton(fixture) === null).toBe(false);
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

        it('maximumIndicatorsCount changes visibility of indicators', () => {
            expect(HelperTestFunctions.getIndicators(fixture).length).toBe(4);
            expect(HelperTestFunctions.getIndicatorsDots(fixture).length).toBe(4);
            expect(HelperTestFunctions.getIndicatorsLabel(fixture)).toBeNull();

            carousel.maximumIndicatorsCount = 3;
            fixture.detectChanges();
            expect(carousel.maximumIndicatorsCount).toBe(3);
            expect(HelperTestFunctions.getIndicators(fixture).length).toBe(0);
            expect(HelperTestFunctions.getIndicatorsDots(fixture).length).toBe(0);
            const label = HelperTestFunctions.getIndicatorsLabel(fixture);
            expect(label).toBeDefined();
            expect(label.innerHTML).toBe('1 of 4');

            carousel.maximumIndicatorsCount = 6;
            fixture.detectChanges();
            expect(carousel.maximumIndicatorsCount).toBe(6);
            expect(HelperTestFunctions.getIndicators(fixture).length).toBe(4);
            expect(HelperTestFunctions.getIndicatorsDots(fixture).length).toBe(4);
            expect(HelperTestFunctions.getIndicatorsLabel(fixture)).toBeNull();
        });

        it('`indicators` changes visibility of indicators', () => {
            expect(HelperTestFunctions.getIndicatorsContainer(fixture)).toBeDefined();

            carousel.indicators = false;
            fixture.detectChanges();
            expect(carousel.indicators).toBe(false);
            expect(HelperTestFunctions.getIndicatorsContainer(fixture)).toBeNull();

            carousel.indicators = true;
            fixture.detectChanges();
            expect(carousel.indicators).toBe(true);
            expect(HelperTestFunctions.getIndicatorsContainer(fixture)).toBeDefined();
        });

        it('indicatorsOrientation changes the position of indicators', () => {
            let indicatorsContainer = HelperTestFunctions.getIndicatorsContainer(fixture);
            expect(indicatorsContainer).toBeDefined();

            carousel.indicatorsOrientation = CarouselIndicatorsOrientation.start;
            fixture.detectChanges();

            indicatorsContainer = HelperTestFunctions.getIndicatorsContainer(fixture);
            expect(indicatorsContainer).toBeNull();
            indicatorsContainer = HelperTestFunctions.getIndicatorsContainer(fixture, CarouselIndicatorsOrientation.start);
            expect(indicatorsContainer).toBeDefined();

            carousel.indicatorsOrientation = CarouselIndicatorsOrientation.end;
            fixture.detectChanges();

            indicatorsContainer = HelperTestFunctions.getIndicatorsContainer(fixture, CarouselIndicatorsOrientation.start);
            expect(indicatorsContainer).toBeNull();
            indicatorsContainer = HelperTestFunctions.getIndicatorsContainer(fixture, CarouselIndicatorsOrientation.end);
            expect(indicatorsContainer).toBeDefined();
        });

        it('should map the deprecated `top`/`bottom` indicatorsOrientation values to `start`/`end`', () => {
            carousel.indicatorsOrientation = CarouselIndicatorsOrientation.top;
            fixture.detectChanges();

            expect(HelperTestFunctions.getIndicatorsContainer(fixture, CarouselIndicatorsOrientation.start)).not.toBeNull();
            expect(HelperTestFunctions.getIndicatorsContainer(fixture, CarouselIndicatorsOrientation.end)).toBeNull();

            carousel.indicatorsOrientation = CarouselIndicatorsOrientation.bottom;
            fixture.detectChanges();

            expect(HelperTestFunctions.getIndicatorsContainer(fixture, CarouselIndicatorsOrientation.end)).not.toBeNull();
            expect(HelperTestFunctions.getIndicatorsContainer(fixture, CarouselIndicatorsOrientation.start)).toBeNull();
        });

        it('should stop/play on mouse enter/leave ', () => {
            carousel.interval = 1000;
            carousel.play();
            fixture.detectChanges();

            spyOn(carousel.carouselPaused, 'emit');
            spyOn(carousel.carouselPlaying, 'emit');

            expect(carousel.isPlaying).toBeTruthy();

            UIInteractions.hoverElement(carousel.nativeElement, true);
            fixture.detectChanges();

            expect(carousel.isPlaying).toBeFalsy();
            expect(carousel.carouselPaused.emit).toHaveBeenCalledTimes(1);

            UIInteractions.unhoverElement(carousel.nativeElement, true);
            fixture.detectChanges();

            expect(carousel.isPlaying).toBeTruthy();
            expect(carousel.carouselPlaying.emit).toHaveBeenCalledTimes(1);
            expect(carousel.carouselPaused.emit).toHaveBeenCalledTimes(1);

            // When the carousel is stopped mouseleave does not start playing
            carousel.stop();
            fixture.detectChanges();

            expect(carousel.isPlaying).toBeFalsy();
            expect(carousel.carouselPlaying.emit).toHaveBeenCalledTimes(1);
            expect(carousel.carouselPaused.emit).toHaveBeenCalledTimes(2);

            UIInteractions.hoverElement(carousel.nativeElement, true);
            fixture.detectChanges();

            expect(carousel.isPlaying).toBeFalsy();

            UIInteractions.unhoverElement(carousel.nativeElement, true);
            fixture.detectChanges();
            expect(carousel.isPlaying).toBeFalsy();
            expect(carousel.carouselPlaying.emit).toHaveBeenCalledTimes(1);
        });


        it('should apply correctly aria attributes to carousel component', () => {
            const expectedRole = 'region';
            const expectedRoleDescription = 'carousel';
            const tabIndex = carousel.nativeElement.getAttribute('tabindex');

            expect(tabIndex).toBeNull();
            expect(carousel.nativeElement.getAttribute('role')).toEqual(expectedRole);
            expect(carousel.nativeElement.getAttribute('aria-roledescription')).toEqual(expectedRoleDescription);

            const indicators = carousel.nativeElement.querySelector(HelperTestFunctions.INDICATORS_END_CLASS);

            expect(indicators).toBeDefined();
            expect(indicators.getAttribute('role')).toEqual('tablist');

            const tabs = carousel.nativeElement.querySelectorAll('[role="tab"]');
            expect(tabs.length).toEqual(4);
        });

        it('should apply correctly aria attributes to slide components', () => {
            carousel.loop = false;
            carousel.select(carousel.get(1));
            fixture.detectChanges();

            const expectedRole = 'tabpanel';
            const slide = carousel.slides.find(s => s.active);
            const tabIndex = slide.nativeElement.getAttribute('tabindex');

            expect(+tabIndex).toBe(0);
            expect(slide.nativeElement.getAttribute('role')).toEqual(expectedRole);

            const tabs = carousel.nativeElement.querySelectorAll('[role="tab"]');
            const slides = carousel.nativeElement.querySelectorAll('[role="tabpanel"]');

            expect(slides.length).toEqual(tabs.length);
        });

        it('should change slide on Enter/Space keys', () => {
            const nextNav = HelperTestFunctions.getNextButton(fixture);
            const prevNav = HelperTestFunctions.getPreviousButton(fixture);

            spyOn(carousel, 'next');
            spyOn(carousel, 'prev');

            UIInteractions.triggerKeyDownEvtUponElem('Enter', nextNav, true);
            UIInteractions.triggerKeyDownEvtUponElem(' ', nextNav, true);
            fixture.detectChanges();
            expect(carousel.next).toHaveBeenCalledTimes(2);

            UIInteractions.triggerKeyDownEvtUponElem('Enter', prevNav, true);
            UIInteractions.triggerKeyDownEvtUponElem(' ', prevNav, true);
            fixture.detectChanges();
            expect(carousel.prev).toHaveBeenCalledTimes(2);
        });

        it('should set focused class on indicators container on keyboard tab focus', () => {
            const indicators = HelperTestFunctions.getIndicatorsContainer(fixture);

            expect(indicators.classList).not.toContain('igx-carousel-indicators--focused');

            indicators.dispatchEvent(new KeyboardEvent('keyup', { key: 'Tab' }));
            fixture.detectChanges();

            expect(indicators.classList).toContain('igx-carousel-indicators--focused');
        });

        it('should remove focused class from indicators container on focusout', () => {
            const indicators = HelperTestFunctions.getIndicatorsContainer(fixture);
            const indicator = HelperTestFunctions.getIndicators(fixture)[1] as HTMLElement;

            indicators.dispatchEvent(new KeyboardEvent('keyup', { key: 'Tab' }));
            fixture.detectChanges();
            expect(indicators.classList).toContain('igx-carousel-indicators--focused');

            // if element gaining focus is an indicator the focused class remains
            indicators.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: indicator }));
            fixture.detectChanges();
            expect(indicators.classList).toContain('igx-carousel-indicators--focused');

            // if element gaining focus is not an indicator the focused class is removed
            indicators.dispatchEvent(new FocusEvent('focusout', { bubbles: true }));
            fixture.detectChanges();
            expect(indicators.classList).not.toContain('igx-carousel-indicators--focused');
        });

        it('should remove focused class from indicators container on click', () => {
            const indicators = HelperTestFunctions.getIndicatorsContainer(fixture);

            indicators.dispatchEvent(new KeyboardEvent('keyup', { key: 'Tab' }));
            fixture.detectChanges();
            expect(indicators.classList).toContain('igx-carousel-indicators--focused');

            indicators.dispatchEvent(new MouseEvent('click', { bubbles: true }));
            fixture.detectChanges();
            expect(indicators.classList).not.toContain('igx-carousel-indicators--focused');
        });

        it('should keep focused class on indicators container on keyboard nav with supported keys', () => {
            const indicators = HelperTestFunctions.getIndicatorsContainer(fixture);

            indicators.dispatchEvent(new KeyboardEvent('keyup', { key: 'Tab' }));
            fixture.detectChanges();
            expect(indicators.classList).toContain('igx-carousel-indicators--focused');

            UIInteractions.triggerKeyDownEvtUponElem('ArrowRight', indicators, true);
            fixture.detectChanges();
            expect(carousel.current).toEqual(1);
            expect(indicators.classList).toContain('igx-carousel-indicators--focused');

            UIInteractions.triggerKeyDownEvtUponElem('ArrowLeft', indicators, true);
            fixture.detectChanges();
            expect(carousel.current).toEqual(0);
            expect(indicators.classList).toContain('igx-carousel-indicators--focused');

            UIInteractions.triggerKeyDownEvtUponElem('End', indicators, true);
            fixture.detectChanges();
            expect(carousel.current).toEqual(3);
            expect(indicators.classList).toContain('igx-carousel-indicators--focused');

            UIInteractions.triggerKeyDownEvtUponElem('Home', indicators, true);
            fixture.detectChanges();
            expect(carousel.current).toEqual(0);
            expect(indicators.classList).toContain('igx-carousel-indicators--focused');
        });
    });

    describe('Playback Tests: ', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(CarouselTestComponent);
            carousel = fixture.componentInstance.carousel;
            fixture.detectChanges();
        });

        it('should emit carouselPaused only when a playing carousel is stopped', () => {
            carousel.play();
            spyOn(carousel.carouselPaused, 'emit');

            carousel.stop();
            carousel.stop();
            UIInteractions.hoverElement(carousel.nativeElement, true);
            fixture.detectChanges();

            expect(carousel.isPlaying).toBeFalse();
            expect(carousel.carouselPaused.emit).toHaveBeenCalledTimes(1);
            // a stopped carousel is not resumed on mouse leave
            UIInteractions.unhoverElement(carousel.nativeElement, true);
            expect(carousel.isPlaying).toBeFalse();
        });

        it('should end the auto-play on the last slide of a non-looping carousel when `pause` is false', fakeAsync(() => {
            carousel.pause = false;
            carousel.loop = false;
            carousel.interval = 1000;
            carousel.play();
            spyOn(carousel.carouselPaused, 'emit');
            spyOn(carousel.slideChanged, 'emit');
            const inner = carousel.nativeElement.querySelector('.igx-carousel__inner');

            tick(3000);
            expect(carousel.current).toBe(3);
            expect(carousel.isPlaying).toBeTrue();

            tick(1000);
            fixture.detectChanges();
            expect(carousel.current).toBe(3);
            expect(carousel.isPlaying).toBeFalse();
            expect(carousel.carouselPaused.emit).toHaveBeenCalledTimes(1);
            expect(inner.getAttribute('aria-live')).toBe('polite');

            tick(2000);
            expect(carousel.slideChanged.emit).toHaveBeenCalledTimes(3);
            expect(carousel.carouselPaused.emit).toHaveBeenCalledTimes(1);

            // manual navigation at the boundary does not stop a carousel that does not pause
            carousel.play();
            carousel.next();
            expect(carousel.isPlaying).toBeTrue();
            tick(1000);
            expect(carousel.isPlaying).toBeFalse();
        }));

        it('should not schedule slide transitions while stopped', fakeAsync(() => {
            carousel.play();
            carousel.stop();
            spyOn(carousel.carouselPaused, 'emit');
            spyOn(carousel.slideChanged, 'emit');

            // manual navigation restarts the interval only for a playing carousel
            carousel.next();
            tick(carousel.interval * 3);

            expect(carousel.current).toBe(1);
            expect(carousel.slideChanged.emit).toHaveBeenCalledTimes(1);
            expect(carousel.carouselPaused.emit).not.toHaveBeenCalled();
        }));

        it('should change slides on each interval tick while playing', fakeAsync(() => {
            carousel.interval = 1000;
            carousel.play();
            spyOn(carousel.slideChanged, 'emit');

            tick(1000);
            expect(carousel.current).toBe(1);
            tick(2000);
            expect(carousel.current).toBe(3);
            expect(carousel.slideChanged.emit).toHaveBeenCalledTimes(3);

            // the carousel stops on the last slide when it does not loop
            carousel.loop = false;
            spyOn(carousel.carouselPaused, 'emit');
            tick(1000);
            expect(carousel.current).toBe(3);
            expect(carousel.isPlaying).toBeFalse();
            expect(carousel.carouselPaused.emit).toHaveBeenCalledTimes(1);
            tick(1000);
            expect(carousel.carouselPaused.emit).toHaveBeenCalledTimes(1);
        }));

        it('should not start playing when destroyed before the slides selection is initialized', async () => {
            spyOn(carousel.carouselPlaying, 'emit');
            fixture.destroy();
            await HelperTestFunctions.waitAnAnimationFrame();

            expect(carousel.isDestroyed).toBeTrue();
            expect(carousel.isPlaying).toBeFalse();
            expect(carousel.carouselPlaying.emit).not.toHaveBeenCalled();
            expect(carousel['lastInterval']).toBeFalsy();
        });

        it('should turn off aria-live only while the carousel is auto-rotating', () => {
            const inner = carousel.nativeElement.querySelector('.igx-carousel__inner');

            carousel.play();
            fixture.detectChanges();
            expect(inner.getAttribute('aria-live')).toBe('off');

            carousel.stop();
            fixture.detectChanges();
            expect(inner.getAttribute('aria-live')).toBe('polite');

            carousel.play();
            carousel.interval = 0;
            fixture.detectChanges();
            expect(inner.getAttribute('aria-live')).toBe('polite');
        });

        it('should set touch-action according to the carousel orientation', () => {
            expect(carousel.nativeElement.style.touchAction).toBe('pan-y');

            carousel.vertical = true;
            fixture.detectChanges();
            expect(carousel.nativeElement.style.touchAction).toBe('pan-x');

            carousel.gesturesSupport = false;
            fixture.detectChanges();
            expect(carousel.nativeElement.style.touchAction).toBe('auto');
        });

        it('should not subscribe twice to a slide that is removed and added back', () => {
            const slide = carousel.get(0);
            spyOn<any>(carousel, 'onSlideActivated').and.callThrough();

            carousel.remove(slide);
            carousel.add(slide);
            fixture.detectChanges();
            slide.active = true;

            expect(carousel['onSlideActivated']).toHaveBeenCalledTimes(1);
        });
    });

    describe('RTL Tests: ', () => {
        beforeEach(() => {
            document.body.dir = 'rtl';
            fixture = TestBed.createComponent(CarouselTestComponent);
            carousel = fixture.componentInstance.carousel;
            fixture.detectChanges();
        });
        afterEach(() => {
            document.body.dir = 'ltr';
        });

        it('should support keyboard navigation when the indicators container is focused', () => {
            const indicators = HelperTestFunctions.getIndicatorsContainer(fixture);

            indicators.dispatchEvent(new KeyboardEvent('keyup', { key: 'Tab' }));
            fixture.detectChanges();
            expect(indicators.classList).toContain('igx-carousel-indicators--focused');

            UIInteractions.triggerKeyDownEvtUponElem('ArrowRight', indicators, true);
            fixture.detectChanges();
            expect(carousel.current).toEqual(3);
            expect(indicators.classList).toContain('igx-carousel-indicators--focused');

            UIInteractions.triggerKeyDownEvtUponElem('ArrowLeft', indicators, true);
            fixture.detectChanges();
            expect(carousel.current).toEqual(0);
            expect(indicators.classList).toContain('igx-carousel-indicators--focused');

            UIInteractions.triggerKeyDownEvtUponElem('End', indicators, true);
            fixture.detectChanges();
            expect(carousel.current).toEqual(0);
            expect(indicators.classList).toContain('igx-carousel-indicators--focused');

            UIInteractions.triggerKeyDownEvtUponElem('Home', indicators, true);
            fixture.detectChanges();
            expect(carousel.current).toEqual(3);
            expect(indicators.classList).toContain('igx-carousel-indicators--focused');
        });
    });

    describe('Templates Tests: ', () => {
        it('verify that templates can be defined in the markup', () => {
            fixture = TestBed.createComponent(CarouselTemplateSetInMarkupTestComponent);
            carousel = fixture.componentInstance.carousel;
            fixture.detectChanges();

            expect(HelperTestFunctions.getIndicators(fixture).length).toBe(4);
            expect(HelperTestFunctions.getIndicatorsDots(fixture).length).toBe(0);
            for (let index = 0; index < 4; index++) {
                const indicator = HelperTestFunctions.getIndicators(fixture)[index] as HTMLElement;
                expect(indicator.innerText).toEqual(index.toString());
            }

            expect(HelperTestFunctions.getNextButtonArrow(fixture)).toBeNull();
            expect(HelperTestFunctions.getPreviousButtonArrow(fixture)).toBeNull();

            expect(HelperTestFunctions.getNextButton(fixture).innerText).toEqual('next');
            expect(HelperTestFunctions.getPreviousButton(fixture).innerText).toEqual('prev');
        });

        it('verify that templates can be changed', () => {
            fixture = TestBed.createComponent(CarouselTemplateSetInTypescriptTestComponent);
            carousel = fixture.componentInstance.carousel;
            fixture.detectChanges();

            carousel.select(carousel.get(1));
            fixture.detectChanges();

            expect(HelperTestFunctions.getIndicators(fixture).length).toBe(4);
            expect(HelperTestFunctions.getIndicatorsDots(fixture).length).toBe(4);
            expect(HelperTestFunctions.getNextButtonArrow(fixture)).toBeDefined();
            expect(HelperTestFunctions.getPreviousButtonArrow(fixture)).toBeDefined();

            carousel.indicatorTemplate = fixture.componentInstance.customIndicatorTemplate1;
            carousel.nextButtonTemplate = fixture.componentInstance.customNextTemplate;
            carousel.prevButtonTemplate = fixture.componentInstance.customPrevTemplate;
            fixture.detectChanges();

            expect(HelperTestFunctions.getIndicators(fixture).length).toBe(4);
            expect(HelperTestFunctions.getIndicatorsDots(fixture).length).toBe(0);
            for (let index = 0; index < 4; index++) {
                const indicator = HelperTestFunctions.getIndicators(fixture)[index] as HTMLElement;
                expect(indicator.innerText).toEqual(index.toString());
            }
            expect(HelperTestFunctions.getNextButtonArrow(fixture)).toBeNull();
            expect(HelperTestFunctions.getPreviousButtonArrow(fixture)).toBeNull();

            expect(HelperTestFunctions.getNextButton(fixture).innerText).toEqual('next');
            expect(HelperTestFunctions.getPreviousButton(fixture).innerText).toEqual('prev');

            carousel.indicatorTemplate = fixture.componentInstance.customIndicatorTemplate2;
            fixture.detectChanges();

            expect(HelperTestFunctions.getIndicators(fixture).length).toBe(4);
            expect(HelperTestFunctions.getIndicatorsDots(fixture).length).toBe(0);

            for (let index = 0; index < 4; index++) {
                const indicator = HelperTestFunctions.getIndicators(fixture)[index] as HTMLElement;
                if (index === 1) {
                    expect(indicator.innerText).toEqual('1: Active');
                } else {
                    expect(indicator.innerText).toEqual(index.toString());
                }
            }

            carousel.indicatorTemplate = null;
            carousel.nextButtonTemplate = null;
            carousel.prevButtonTemplate = null;
            fixture.detectChanges();

            expect(HelperTestFunctions.getIndicators(fixture).length).toBe(4);
            expect(HelperTestFunctions.getIndicatorsDots(fixture).length).toBe(4);
            expect(HelperTestFunctions.getNextButtonArrow(fixture)).toBeDefined();
            expect(HelperTestFunctions.getPreviousButtonArrow(fixture)).toBeDefined();
        });
    });

    describe('Animations Tests: ', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(CarouselAnimationsComponent);
            fixture.detectChanges();
            carousel = fixture.componentInstance.carousel;
        });

        it('Test slide animation', async () => {
            await wait();
            expect(carousel.get(0).active).toBeTruthy();
            expect(carousel.get(0).nativeElement.classList.contains(HelperTestFunctions.ACTIVE_SLIDE_CLASS)).toBeTruthy();
            expect(carousel.animationType).toBe(CarouselAnimationType.slide);
            carousel.next();
            fixture.detectChanges();
            await wait(200);

            expect(carousel.get(1).nativeElement.classList.contains(HelperTestFunctions.ACTIVE_SLIDE_CLASS)).toBeTruthy();
            expect(carousel.get(0).nativeElement.classList.contains(HelperTestFunctions.PREVIOUS_SLIDE_CLASS)).toBeTruthy();
            await wait(200);
            fixture.detectChanges();

            expect(carousel.get(1).nativeElement.classList.contains(HelperTestFunctions.ACTIVE_SLIDE_CLASS)).toBeTruthy();
            expect(carousel.get(0).nativeElement.classList.contains(HelperTestFunctions.PREVIOUS_SLIDE_CLASS)).toBeFalsy();
            carousel.prev();
            fixture.detectChanges();
            await wait(230);

            expect(carousel.get(0).nativeElement.classList.contains(HelperTestFunctions.ACTIVE_SLIDE_CLASS)).toBeTruthy();
            expect(carousel.get(1).nativeElement.classList.contains(HelperTestFunctions.PREVIOUS_SLIDE_CLASS)).toBeTruthy();
            await wait(200);
            fixture.detectChanges();

            expect(carousel.get(0).nativeElement.classList.contains(HelperTestFunctions.ACTIVE_SLIDE_CLASS)).toBeTruthy();
            expect(carousel.get(1).nativeElement.classList.contains(HelperTestFunctions.PREVIOUS_SLIDE_CLASS)).toBeFalsy();
        });

        it('Test fade animation', async () => {
            await wait();
            carousel.animationType = CarouselAnimationType.fade;
            fixture.detectChanges();

            expect(carousel.get(0).active).toBeTruthy();
            expect(carousel.get(0).nativeElement.classList.contains(HelperTestFunctions.ACTIVE_SLIDE_CLASS)).toBeTruthy();
            expect(carousel.animationType).toBe(CarouselAnimationType.fade);
            carousel.next();
            fixture.detectChanges();
            await wait(200);

            expect(carousel.get(1).nativeElement.classList.contains(HelperTestFunctions.ACTIVE_SLIDE_CLASS)).toBeTruthy();
            expect(carousel.get(0).nativeElement.classList.contains(HelperTestFunctions.PREVIOUS_SLIDE_CLASS)).toBeTruthy();
            await wait(200);
            fixture.detectChanges();

            expect(carousel.get(1).nativeElement.classList.contains(HelperTestFunctions.ACTIVE_SLIDE_CLASS)).toBeTruthy();
            expect(carousel.get(0).nativeElement.classList.contains(HelperTestFunctions.PREVIOUS_SLIDE_CLASS)).toBeFalsy();
        });

        it('should not throw an error when playing an animation and destroying the component - #15976', () => {
            expect(() => {
                carousel.next();
                carousel.ngOnDestroy();
                fixture.detectChanges();
            }).not.toThrow();

            expect(carousel['enterAnimationPlayer']).toBe(null);
            expect(carousel['leaveAnimationPlayer']).toBe(null);
        });

        it('should play the slide animations on the vertical axis when `vertical` is true', async () => {
            await wait();
            carousel.vertical = true;
            fixture.detectChanges();

            const builder = spyOn(carousel['animationService'], 'buildAnimation').and.callThrough();
            carousel.next();

            const [leave, enter] = builder.calls.allArgs().map(([metadata]) => metadata.options.params);
            expect(leave.fromPosition).toBe('translateY(0%)');
            expect(leave.toPosition).toBe('translateY(-100%)');
            expect(enter.fromPosition).toBe('translateY(100%)');
            expect(enter.toPosition).toBe('translateY(0%)');

            builder.calls.reset();
            await wait(400);
            carousel.prev();

            const [prevLeave, prevEnter] = builder.calls.allArgs().map(([metadata]) => metadata.options.params);
            expect(prevLeave.toPosition).toBe('translateY(100%)');
            expect(prevEnter.fromPosition).toBe('translateY(-100%)');
        });

        it('should speed up the animation on a fast swipe', async () => {
            await wait();
            const builder = spyOn(carousel['animationService'], 'buildAnimation').and.callThrough();

            HelperTestFunctions.simulatePan(fixture, carousel, -0.2, 2, 'horizontal');

            expect(carousel.current).toBe(1);
            // default duration (320ms) divided by velocity, scaled by the remaining distance
            const { duration } = builder.calls.mostRecent().args[0].options.params;
            expect(parseFloat(duration)).toBeCloseTo(0.8 * 320 / 2);

            await wait(400);
            expect(carousel['newDuration']).toBe(0);
            expect(carousel['animationPosition']).toBe(0);
        });

        it('should finish the running animations when a new pan starts', async () => {
            await wait();
            carousel.next();
            const enterPlayer = carousel['enterAnimationPlayer'];
            const leavePlayer = carousel['leaveAnimationPlayer'];
            spyOn(enterPlayer, 'finish').and.callThrough();
            spyOn(leavePlayer, 'finish').and.callThrough();

            expect(carousel.get(0).previous).toBeTrue();

            const width = carousel.get(carousel.current).nativeElement.offsetWidth;
            carousel.onPanLeft({ deltaX: -0.1 * width, deltaY: 0, velocity: 0.1, preventDefault: () => { } } as any);

            expect(enterPlayer.finish).toHaveBeenCalled();
            expect(leavePlayer.finish).toHaveBeenCalled();
            expect(carousel.get(0).previous).toBeFalse();
            expect(carousel.get(2).previous).toBeTrue();
        });

        it('should animate the current slide back in place when a short pan is released', async () => {
            await wait();
            const builder = spyOn(carousel['animationService'], 'buildAnimation').and.callThrough();

            HelperTestFunctions.simulatePan(fixture, carousel, 0.2, 0.1, 'horizontal');

            expect(carousel.current).toBe(0);
            const [leave, enter] = builder.calls.allArgs().map(([metadata, element]) => ({ params: metadata.options.params, element }));
            // the incoming slide leaves and the current one returns from where it was released
            expect(leave.element).toBe(carousel.get(3).nativeElement);
            expect(enter.element).toBe(carousel.get(0).nativeElement);
            expect(enter.params.fromPosition).toMatch(/^translateX\(.+%\)$/);
            expect(parseFloat(enter.params.fromPosition.replace('translateX(', ''))).toBeCloseTo(20);
            expect(parseFloat(enter.params.duration)).toBeCloseTo(0.2 * 320);
            expect(carousel.get(3).previous).toBeTrue();

            await wait(400);
            fixture.detectChanges();
            expect(carousel.get(3).previous).toBeFalse();
        });

        it('should use the swipe speed for the fade duration when a fast pan ends at its origin', async () => {
            await wait();
            carousel.animationType = CarouselAnimationType.fade;
            fixture.detectChanges();
            const builder = spyOn(carousel['animationService'], 'buildAnimation').and.callThrough();
            const width = carousel.get(carousel.current).nativeElement.offsetWidth;

            carousel.onPanRight({ deltaX: 0.1 * width, deltaY: 0, velocity: 2, preventDefault: () => { } } as any);
            carousel.onPanEnd({ deltaX: 0, deltaY: 0, velocity: 2, preventDefault: () => { } } as any);

            expect(carousel.current).toBe(3);
            const { duration, startOpacity } = builder.calls.mostRecent().args[0].options.params;
            expect(duration).toBe('160ms');
            expect(startOpacity).toBe('0');
        });

        it('should not build animations when `animationType` is none', async () => {
            await wait();
            carousel.animationType = CarouselAnimationType.none;
            const builder = spyOn(carousel['animationService'], 'buildAnimation').and.callThrough();

            carousel.next();
            carousel['playAnimations']();

            expect(carousel.current).toBe(1);
            expect(builder).not.toHaveBeenCalled();
            expect(carousel['enterAnimationPlayer']).toBeFalsy();
            expect(carousel['leaveAnimationPlayer']).toBeFalsy();
        });

        it('should play the fade animation when a pan on a `fade` carousel ends', async () => {
            await wait();
            carousel.animationType = CarouselAnimationType.fade;
            fixture.detectChanges();
            const builder = spyOn(carousel['animationService'], 'buildAnimation').and.callThrough();

            // a short pan restores the current slide
            HelperTestFunctions.simulatePan(fixture, carousel, -0.25, 0.1, 'horizontal');
            expect(carousel.current).toBe(0);
            expect(parseFloat(builder.calls.mostRecent().args[0].options.params.startOpacity)).toBeCloseTo(0.75);
            expect(carousel.get(0).nativeElement.style.opacity).toBe('');

            await wait(400);
            builder.calls.reset();

            // a long pan changes the slide
            HelperTestFunctions.simulatePan(fixture, carousel, -0.6, 0.1, 'horizontal');
            expect(carousel.current).toBe(1);
            expect(parseFloat(builder.calls.mostRecent().args[0].options.params.startOpacity)).toBeCloseTo(0.6);
        });
    });

    describe('Dynamic Slides: ', () => {
        let slides;
        beforeEach(() => {
            fixture = TestBed.createComponent(CarouselDynamicSlidesComponent);
            fixture.detectChanges();
            carousel = fixture.componentInstance.carousel;
            slides = fixture.componentInstance.slides;
        });

        it('should activate slide when change its property active', fakeAsync(() => {
            tick();
            // Verify 3th slide is active
            HelperTestFunctions.verifyActiveSlide(carousel, 2);

            // Change active slide
            slides[0].active = true;
            fixture.detectChanges();

            HelperTestFunctions.verifyActiveSlide(carousel, 0);
        }));

        it('should add slides to the carousel when collection is changed', fakeAsync(() => {
            tick();
            spyOn(carousel.slideAdded, 'emit');

            // add a slide
            slides.push({ text: 'Slide 5' });
            fixture.detectChanges();

            HelperTestFunctions.verifyActiveSlide(carousel, 2);
            expect(carousel.total).toEqual(5);

            // add an active slide
            slides.push({ text: 'Slide 6', active: true });
            fixture.detectChanges();
            tick(100);

            HelperTestFunctions.verifyActiveSlide(carousel, 5);
            expect(carousel.total).toEqual(6);

            expect(carousel.slideAdded.emit).toHaveBeenCalledTimes(2);
        }));

        it('should remove slides in the carousel', fakeAsync(() => {
            tick();
            spyOn(carousel.slideRemoved, 'emit');

            // remove a slide
            slides.pop();
            fixture.detectChanges();

            HelperTestFunctions.verifyActiveSlide(carousel, 2);
            expect(carousel.total).toEqual(3);

            // remove active slide
            slides.pop();
            fixture.detectChanges();
            tick(200);
            fixture.detectChanges();

            expect(carousel.total).toEqual(2);
            HelperTestFunctions.verifyActiveSlide(carousel, 1);

            expect(carousel.slideRemoved.emit).toHaveBeenCalledTimes(2);
        }));

        it('should keep the slides aria-labelledby in sync with the indicators when slides are added or removed', fakeAsync(() => {
            tick();
            fixture.detectChanges();
            HelperTestFunctions.verifySlidesLabelledByIndicators(fixture, carousel);

            slides.push({ text: 'Slide 5' });
            fixture.detectChanges();
            tick(16);
            fixture.detectChanges();
            HelperTestFunctions.verifySlidesLabelledByIndicators(fixture, carousel);

            slides.splice(0, 2);
            fixture.detectChanges();
            tick(16);
            fixture.detectChanges();
            HelperTestFunctions.verifySlidesLabelledByIndicators(fixture, carousel);
        }));

        it('should resolve the animation direction when a slide is activated directly', fakeAsync(() => {
            tick();
            HelperTestFunctions.verifyActiveSlide(carousel, 2);

            carousel.get(3).active = true;
            fixture.detectChanges();
            HelperTestFunctions.verifyActiveSlide(carousel, 3);
            expect(carousel.get(3).direction).toBe(CarouselAnimationDirection.NEXT);

            carousel.select(0);
            fixture.detectChanges();
            expect(carousel.get(0).direction).toBe(CarouselAnimationDirection.PREV);

            // a previously visited slide does not keep its stale direction
            carousel.get(3).active = true;
            fixture.detectChanges();
            HelperTestFunctions.verifyActiveSlide(carousel, 3);
            expect(carousel.get(3).direction).toBe(CarouselAnimationDirection.NEXT);

            carousel.get(1).active = true;
            fixture.detectChanges();
            HelperTestFunctions.verifyActiveSlide(carousel, 1);
            expect(carousel.get(1).direction).toBe(CarouselAnimationDirection.PREV);
        }));

        it('should keep the direction set on a slide after the carousel transitions away from it', fakeAsync(() => {
            tick();
            const slide = carousel.get(3);
            // e.g. set through the slide [direction] input
            slide.direction = CarouselAnimationDirection.PREV as CarouselAnimationDirection;

            slide.active = true;
            fixture.detectChanges();
            HelperTestFunctions.verifyActiveSlide(carousel, 3);
            expect(slide.direction).toBe(CarouselAnimationDirection.PREV);

            carousel.select(0);
            fixture.detectChanges();
            expect(slide.direction).toBe(CarouselAnimationDirection.PREV);

            // the carousel overrides the direction while the slide is current and restores it afterwards
            carousel.select(3, CarouselAnimationDirection.NEXT);
            fixture.detectChanges();
            expect(slide.direction).toBe(CarouselAnimationDirection.NEXT);
            carousel.next();
            fixture.detectChanges();
            expect(slide.direction).toBe(CarouselAnimationDirection.PREV);

            slide.active = true;
            fixture.detectChanges();
            HelperTestFunctions.verifyActiveSlide(carousel, 3);
            expect(slide.direction).toBe(CarouselAnimationDirection.PREV);
        }));

        it('should not resume playing when the slides change after the carousel was stopped', async () => {
            await HelperTestFunctions.waitAnAnimationFrame();
            expect(carousel.isPlaying).toBeTrue();

            carousel.stop();
            slides.push({ text: 'Slide 5' });
            fixture.detectChanges();
            await HelperTestFunctions.waitAnAnimationFrame();

            expect(carousel.total).toBe(5);
            expect(carousel.isPlaying).toBeFalse();
        });

        it('should end the pan and resume playing when all slides are removed during a pan', () => {
            carousel.interval = 1000;
            carousel.play();
            fixture.detectChanges();
            const width = carousel.get(carousel.current).nativeElement.offsetWidth;
            const pan = { deltaX: -0.3 * width, deltaY: 0, velocity: 0.1, preventDefault: () => { } } as any;

            carousel.onPanLeft(pan);
            expect(carousel.isPlaying).toBeFalse();

            fixture.componentInstance.removeAllSlides();
            fixture.detectChanges();
            carousel.onPanEnd(pan);

            expect(carousel.total).toBe(0);
            expect(carousel.isPlaying).toBeTrue();
            expect(carousel.stoppedByInteraction).toBeFalse();
            expect(carousel['incomingSlide']).toBeNull();
        });

        it('should discard the incoming slide when the current slide is removed during a pan', async () => {
            const width = carousel.get(carousel.current).nativeElement.offsetWidth;
            const pan = { deltaX: -0.3 * width, deltaY: 0, velocity: 0.1, preventDefault: () => { } } as any;
            carousel.onPanLeft(pan);
            const incoming = carousel.get(3);
            expect(carousel['incomingSlide']).toBe(incoming);

            // the slide after the removed current one, i.e. the incoming slide, becomes current
            slides.splice(2, 1);
            fixture.detectChanges();
            await HelperTestFunctions.waitAnAnimationFrame();
            fixture.detectChanges();

            expect(carousel['incomingSlide']).toBeNull();
            expect(carousel.get(carousel.current)).toBe(incoming);
            expect(incoming.previous).toBeFalse();
            expect(incoming.nativeElement.style.transform).toBe('');

            carousel.onPanEnd(pan);
            fixture.detectChanges();
            expect(carousel.get(carousel.current)).toBe(incoming);
            expect(carousel.slides.filter(slide => slide.previous).length).toBe(0);
        });

        it('should discard the incoming slide when it is removed during a pan', () => {
            const current = carousel.get(carousel.current).nativeElement;
            const pan = (deltaX: number) => ({ deltaX, deltaY: 0, velocity: 0.1, preventDefault: () => { } } as any);

            carousel.onPanLeft(pan(-0.3 * current.offsetWidth));
            expect(carousel['incomingSlide']).toBe(carousel.get(3));

            slides.pop();
            fixture.detectChanges();

            expect(carousel['incomingSlide']).toBeNull();
            expect(current.style.transform).toBe('');

            // the pan continues with the new incoming slide
            carousel.onPanLeft(pan(-0.6 * current.offsetWidth));
            carousel.onPanEnd(pan(-0.6 * current.offsetWidth));
            fixture.detectChanges();
            HelperTestFunctions.verifyActiveSlide(carousel, 0);
        });

        it('should ignore pan gestures when the carousel has no slides', fakeAsync(() => {
            fixture.componentInstance.removeAllSlides();
            fixture.detectChanges();
            tick(200);

            const pan = { deltaX: -50, deltaY: 0, velocity: 0.1, preventDefault: () => { } } as any;
            expect(() => {
                carousel.onPanLeft(pan);
                carousel.onPanEnd(pan);
            }).not.toThrow();
        }));

        it('should not render navigation buttons and indicators when carousel does not have slides', fakeAsync(() => {
            fixture.componentInstance.removeAllSlides();
            fixture.detectChanges();
            tick(200);

            expect(carousel.total).toEqual(0);
            expect(HelperTestFunctions.getIndicatorsContainer(fixture)).toBeNull();
            expect(HelperTestFunctions.getIndicatorsContainer(fixture, CarouselIndicatorsOrientation.start)).toBeNull();
            expect(HelperTestFunctions.getNextButton(fixture)).toBeNull();
            expect(HelperTestFunctions.getPreviousButton(fixture)).toBeNull();

            // add a slide
            fixture.componentInstance.addSlides();
            fixture.detectChanges();
            tick(200);

            expect(carousel.total).toEqual(2);
            expect(HelperTestFunctions.getIndicatorsContainer(fixture)).toBeDefined();
            expect(HelperTestFunctions.getIndicatorsContainer(fixture, CarouselIndicatorsOrientation.start)).toBeDefined();
            expect(HelperTestFunctions.getNextButton(fixture).hidden).toBeFalsy();
            expect(HelperTestFunctions.getPreviousButton(fixture).hidden).toBeFalsy();
        }));
    });

    describe('Gestures Tests: ', () => {
        beforeEach(() => {
            fixture = TestBed.createComponent(CarouselDynamicSlidesComponent);
            fixture.detectChanges();
            carousel = fixture.componentInstance.carousel;
        });

        it('should stop/play on tap ', () => {
            carousel.interval = 1000;
            carousel.play();
            fixture.detectChanges();

            spyOn(carousel.carouselPaused, 'emit');
            spyOn(carousel.carouselPlaying, 'emit');

            expect(carousel.isPlaying).toBeTruthy();

            HelperTestFunctions.simulateTap(fixture, carousel);
            fixture.detectChanges();

            expect(carousel.isPlaying).toBeFalsy();

            HelperTestFunctions.simulateTap(fixture, carousel);
            fixture.detectChanges();

            expect(carousel.isPlaying).toBeTruthy();

            // When the carousel is stopped tap does not start playing
            carousel.stop();
            fixture.detectChanges();

            expect(carousel.isPlaying).toBeFalsy();

            HelperTestFunctions.simulateTap(fixture, carousel);
            fixture.detectChanges();

            expect(carousel.isPlaying).toBeFalsy();

            HelperTestFunctions.simulateTap(fixture, carousel);
            fixture.detectChanges();

            expect(carousel.isPlaying).toBeFalsy();
        });

        it('should stop/play when tapping content nested inside a slide', () => {
            carousel.interval = 1000;
            carousel.play();
            fixture.detectChanges();

            expect(carousel.isPlaying).toBeTruthy();

            // Tapping an inner element (e.g. slide content) should resolve to the
            // enclosing slide and toggle the auto-play, not be ignored.
            const nestedContent = carousel.get(carousel.current).nativeElement.querySelector('h3');
            expect(nestedContent).toBeTruthy();

            HelperTestFunctions.simulateTap(fixture, carousel, nestedContent);
            fixture.detectChanges();

            expect(carousel.isPlaying).toBeFalsy();

            HelperTestFunctions.simulateTap(fixture, carousel, nestedContent);
            fixture.detectChanges();

            expect(carousel.isPlaying).toBeTruthy();
        });

        it('verify changing slides with pan left ', () => {
            expect(carousel.current).toEqual(2);

            HelperTestFunctions.simulatePan(fixture, carousel, -0.05, 0.1, 'horizontal');
            expect(carousel.current).toEqual(2);

            HelperTestFunctions.simulatePan(fixture, carousel, -0.7, 0.1, 'horizontal');
            expect(carousel.current).toEqual(3);

            HelperTestFunctions.simulatePan(fixture, carousel, -0.2, 2, 'horizontal');
            expect(carousel.current).toEqual(0);
        });

        it('verify changing slides with pan right ', () => {
            expect(carousel.current).toEqual(2);

            HelperTestFunctions.simulatePan(fixture, carousel, 0.1, 0.1, 'horizontal');
            expect(carousel.current).toEqual(2);

            HelperTestFunctions.simulatePan(fixture, carousel, 0.6, 0.1, 'horizontal');
            expect(carousel.current).toEqual(1);

            HelperTestFunctions.simulatePan(fixture, carousel, 0.05, 2, 'horizontal');
            expect(carousel.current).toEqual(0);
        });

        it('verify changing slides with pan up', () => {
            carousel.vertical = true;
            fixture.detectChanges();
            expect(carousel.current).toEqual(2);

            HelperTestFunctions.simulatePan(fixture, carousel, -0.05, 0.1, 'vertical');
            expect(carousel.current).toEqual(2);

            HelperTestFunctions.simulatePan(fixture, carousel, -0.7, 0.1, 'vertical');
            expect(carousel.current).toEqual(3);

            HelperTestFunctions.simulatePan(fixture, carousel, -0.2, 2, 'vertical');
            expect(carousel.current).toEqual(0);
        });

        it('verify changing slides with pan down', () => {
            carousel.vertical = true;
            fixture.detectChanges();
            expect(carousel.current).toEqual(2);

            HelperTestFunctions.simulatePan(fixture, carousel, 0.1, 0.1, 'vertical');
            expect(carousel.current).toEqual(2);

            HelperTestFunctions.simulatePan(fixture, carousel, 0.6, 0.1, 'vertical');
            expect(carousel.current).toEqual(1);

            HelperTestFunctions.simulatePan(fixture, carousel, 0.05, 2, 'vertical');
            expect(carousel.current).toEqual(0);
        });

        it('verify pan when loop is false', () => {
            carousel.loop = false;
            fixture.detectChanges();

            carousel.select(carousel.get(0));
            fixture.detectChanges();

            expect(carousel.current).toEqual(0);

            HelperTestFunctions.simulatePan(fixture, carousel, 0.9, 2, 'horizontal');

            expect(carousel.current).toEqual(0);

            carousel.select(carousel.get(3));
            fixture.detectChanges();

            expect(carousel.current).toEqual(3);

            HelperTestFunctions.simulatePan(fixture, carousel, -0.9, 2, 'horizontal');

            expect(carousel.current).toEqual(3);
        });

        it('verify pan when gesturesSupport is false', () => {
            carousel.gesturesSupport = false;
            fixture.detectChanges();

            expect(carousel.current).toEqual(2);

            HelperTestFunctions.simulatePan(fixture, carousel, 0.9, 2, 'horizontal');

            expect(carousel.current).toEqual(2);

            HelperTestFunctions.simulatePan(fixture, carousel, -0.6, 2, 'horizontal');

            expect(carousel.current).toEqual(2);
        });

        it('verify pan left/right when `vertical` is true', () => {
            carousel.vertical = true;
            fixture.detectChanges();
            expect(carousel.vertical).toBe(true);
            expect(carousel.current).toEqual(2);

            // pan left
            HelperTestFunctions.simulatePan(fixture, carousel, -0.7, 0.1, 'horizontal');
            expect(carousel.current).toEqual(2);

            HelperTestFunctions.simulatePan(fixture, carousel, -0.2, 2, 'horizontal');
            expect(carousel.current).toEqual(2);

            // pan right
            HelperTestFunctions.simulatePan(fixture, carousel, 0.6, 0.1, 'horizontal');
            expect(carousel.current).toEqual(2);

            HelperTestFunctions.simulatePan(fixture, carousel, 0.05, 2, 'horizontal');
            expect(carousel.current).toEqual(2);
        });

        it('verify pan up/down when `vertical` is false', () => {
            expect(carousel.vertical).toBe(false);
            expect(carousel.current).toEqual(2);

            // pan up
            HelperTestFunctions.simulatePan(fixture, carousel, -0.7, 0.1, 'vertical');
            expect(carousel.current).toEqual(2);

            HelperTestFunctions.simulatePan(fixture, carousel, -0.2, 2, 'vertical');
            expect(carousel.current).toEqual(2);

            // pan down
            HelperTestFunctions.simulatePan(fixture, carousel, 0.6, 0.1, 'vertical');
            expect(carousel.current).toEqual(2);

            HelperTestFunctions.simulatePan(fixture, carousel, 0.05, 2, 'vertical');
            expect(carousel.current).toEqual(2);
        });

        it('should change slides with horizontal touch pans', () => {
            const host = carousel.nativeElement;
            const width = carousel.get(carousel.current).nativeElement.offsetWidth;
            expect(carousel.current).toEqual(2);

            HelperTestFunctions.simulatePointerPan(host, -0.7 * width, 0);
            fixture.detectChanges();
            expect(carousel.current).toEqual(3);

            HelperTestFunctions.simulatePointerPan(host, 0.7 * width, 0);
            fixture.detectChanges();
            expect(carousel.current).toEqual(2);

            // vertical pans are ignored by a horizontal carousel
            HelperTestFunctions.simulatePointerPan(host, 0, -0.7 * width);
            fixture.detectChanges();
            expect(carousel.current).toEqual(2);
        });

        it('should change slides with vertical touch pans when `vertical` is true', () => {
            carousel.vertical = true;
            fixture.detectChanges();
            const host = carousel.nativeElement;
            const height = carousel.get(carousel.current).nativeElement.offsetHeight;
            expect(carousel.current).toEqual(2);

            HelperTestFunctions.simulatePointerPan(host, 0, -0.7 * height);
            fixture.detectChanges();
            expect(carousel.current).toEqual(3);

            HelperTestFunctions.simulatePointerPan(host, 0, 0.7 * height);
            fixture.detectChanges();
            expect(carousel.current).toEqual(2);
        });

        it('should leave cross-axis touch moves to the browser', () => {
            const host = carousel.nativeElement;
            const isTouchMovePrevented = (deltaX: number, deltaY: number) => {
                HelperTestFunctions.dispatchPointer(host, 'pointerdown', 100, 100);
                HelperTestFunctions.dispatchPointer(host, 'pointermove', 100 + deltaX, 100 + deltaY);
                const touchMove = new TouchEvent('touchmove', { cancelable: true, bubbles: true });
                host.dispatchEvent(touchMove);
                HelperTestFunctions.dispatchPointer(host, 'pointercancel', 100 + deltaX, 100 + deltaY);
                return touchMove.defaultPrevented;
            };

            expect(isTouchMovePrevented(-30, 0)).toBeTrue();
            expect(isTouchMovePrevented(0, -30)).toBeFalse();

            carousel.vertical = true;
            fixture.detectChanges();

            expect(isTouchMovePrevented(0, -30)).toBeTrue();
            expect(isTouchMovePrevented(-30, 0)).toBeFalse();
        });

        it('should restore the slides when `vertical` changes during a pan', () => {
            const current = carousel.get(carousel.current).nativeElement;
            HelperTestFunctions.dispatchPointer(carousel.nativeElement, 'pointerdown', 300, 100);
            HelperTestFunctions.dispatchPointer(carousel.nativeElement, 'pointermove', 250, 100);
            expect(current.style.transform).not.toBe('');

            carousel.vertical = true;
            fixture.detectChanges();

            expect(current.style.transform).toBe('');
            expect(carousel.slides.filter(slide => slide.previous).length).toBe(0);
        });

        it('should not resume playing when a cross-axis drag ends', () => {
            carousel.interval = 1000;
            carousel.play();
            fixture.detectChanges();
            const slide = carousel.get(carousel.current).nativeElement;

            HelperTestFunctions.simulatePointerPan(slide, 0, 0);
            expect(carousel.isPlaying).toBeFalse();

            // a vertical (page scrolling) drag on a horizontal carousel
            HelperTestFunctions.simulatePointerPan(slide, 0, -0.5 * slide.offsetHeight);
            expect(carousel.isPlaying).toBeFalse();
            expect(carousel.current).toEqual(2);
        });

        it('should not pan a carousel with a single slide', () => {
            const fix = TestBed.createComponent(CarouselDynamicSlidesComponent);
            fix.componentInstance.slides = [{ text: 'Slide 1', active: true }];
            fix.detectChanges();
            const instance = fix.componentInstance.carousel;
            const slide = instance.get(0);
            const width = slide.nativeElement.offsetWidth;
            spyOn(instance.slideChanged, 'emit');

            HelperTestFunctions.dispatchPointer(instance.nativeElement, 'pointerdown', 300, 100);
            HelperTestFunctions.dispatchPointer(instance.nativeElement, 'pointermove', 300 - 0.3 * width, 100);
            expect(slide.nativeElement.style.transform).toBe('');
            expect(slide.previous).toBeFalse();
            HelperTestFunctions.dispatchPointer(instance.nativeElement, 'pointerup', 300 - 0.3 * width, 100);

            HelperTestFunctions.simulatePointerPan(instance.nativeElement, 0.7 * width, 0);
            fix.detectChanges();

            expect(instance.current).toBe(0);
            expect(slide.nativeElement.style.transform).toBe('');
            expect(slide.previous).toBeFalse();
            expect(slide.nativeElement.classList).not.toContain(HelperTestFunctions.PREVIOUS_SLIDE_CLASS);
            expect(instance.slideChanged.emit).not.toHaveBeenCalled();
        });

        it('should treat touch moves below the tap threshold as a tap', () => {
            carousel.interval = 1000;
            carousel.play();
            fixture.detectChanges();
            const slide = carousel.get(carousel.current).nativeElement;

            HelperTestFunctions.dispatchPointer(slide, 'pointerdown', 300, 100);
            HelperTestFunctions.dispatchPointer(slide, 'pointermove', 298, 100);
            expect(slide.style.transform).toBe('');
            HelperTestFunctions.dispatchPointer(slide, 'pointerup', 298, 100);
            fixture.detectChanges();

            expect(carousel.isPlaying).toBeFalse();
            expect(carousel.slides.filter(s => s.previous).length).toBe(0);
            carousel.slides.forEach(s => expect(s.nativeElement.style.transform).toBe(''));
        });

        it('should end a pan that is released as a tap', () => {
            carousel.interval = 1000;
            carousel.play();
            fixture.detectChanges();
            const slide = carousel.get(carousel.current).nativeElement;

            HelperTestFunctions.dispatchPointer(slide, 'pointerdown', 300, 100);
            HelperTestFunctions.dispatchPointer(slide, 'pointermove', 290, 100);
            expect(slide.style.transform).not.toBe('');
            expect(carousel.isPlaying).toBeFalse();
            // moving back within the tap threshold before releasing
            HelperTestFunctions.dispatchPointer(slide, 'pointermove', 298, 100);
            HelperTestFunctions.dispatchPointer(slide, 'pointerup', 298, 100);
            fixture.detectChanges();

            expect(carousel.current).toEqual(2);
            expect(carousel.isPlaying).toBeTrue();
            expect(carousel.stoppedByInteraction).toBeFalse();
            expect(carousel.slides.filter(s => s.previous).length).toBe(0);
            carousel.slides.forEach(s => expect(s.nativeElement.style.transform).toBe(''));

            carousel.next();
            fixture.detectChanges();
            HelperTestFunctions.verifyActiveSlide(carousel, 3);
            expect(carousel.get(3).nativeElement.style.transform).toBe('');
        });

        it('should stop/play when tapping a slide with touch', () => {
            carousel.interval = 1000;
            carousel.play();
            fixture.detectChanges();

            const slide = carousel.get(carousel.current).nativeElement;
            HelperTestFunctions.simulatePointerPan(slide, 0, 0);
            expect(carousel.isPlaying).toBeFalse();

            HelperTestFunctions.simulatePointerPan(slide, 0, 0);
            expect(carousel.isPlaying).toBeTrue();
        });

        it('should not stop/play when tapping outside of a slide', () => {
            carousel.interval = 1000;
            carousel.play();
            fixture.detectChanges();

            HelperTestFunctions.simulateTap(fixture, carousel, HelperTestFunctions.getNextButton(fixture));
            expect(carousel.isPlaying).toBeTrue();
        });

        it('should pause while panning and resume playing when the pan ends', () => {
            carousel.interval = 1000;
            carousel.play();
            fixture.detectChanges();

            const width = carousel.get(carousel.current).nativeElement.offsetWidth;
            const event = { deltaX: -0.2 * width, deltaY: 0, velocity: 0.1, preventDefault: () => { } } as any;
            carousel.onPanLeft(event);

            expect(carousel.isPlaying).toBeFalse();
            expect(carousel.stoppedByInteraction).toBeTrue();

            carousel.onPanEnd(event);
            expect(carousel.isPlaying).toBeTrue();
            expect(carousel.stoppedByInteraction).toBeFalse();
        });

        it('should ignore pan moves beyond the slide size', () => {
            const current = carousel.get(carousel.current).nativeElement;
            carousel.onPanLeft({ deltaX: -1.2 * current.offsetWidth, deltaY: 0, velocity: 0.1, preventDefault: () => { } } as any);

            expect(current.style.transform).toBe('');
            expect(carousel.slides.filter(slide => slide.previous).length).toBe(0);
        });

        it('should switch the incoming slide when the pan changes its direction', () => {
            const width = carousel.get(carousel.current).nativeElement.offsetWidth;
            const pan = (deltaX: number) => ({ deltaX, deltaY: 0, velocity: 0.1, preventDefault: () => { } } as any);

            carousel.onPanLeft(pan(-0.2 * width));
            expect(carousel.get(3).previous).toBeTrue();
            expect(carousel.get(3).nativeElement.style.transform).not.toBe('');

            carousel.onPanRight(pan(0.2 * width));
            expect(carousel.get(3).previous).toBeFalse();
            expect(carousel.get(3).nativeElement.style.transform).toBe('');
            expect(carousel.get(1).previous).toBeTrue();
            expect(carousel.get(1).nativeElement.style.transform).not.toBe('');

            carousel.onPanEnd(pan(0.2 * width));
            fixture.detectChanges();
            expect(carousel.current).toEqual(2);
            expect(carousel.get(1).previous).toBeFalse();
        });

        it('should change the slide when the pan ends beyond the slide size', () => {
            const width = carousel.get(carousel.current).nativeElement.offsetWidth;
            const pan = (deltaX: number) => ({ deltaX, deltaY: 0, velocity: 0.1, preventDefault: () => { } } as any);

            carousel.onPanLeft(pan(-0.3 * width));
            carousel.onPanEnd(pan(-1.5 * width));
            fixture.detectChanges();

            expect(carousel.current).toEqual(3);
        });

        it('should fade the current slide while panning a `fade` carousel', () => {
            carousel.animationType = CarouselAnimationType.fade;
            fixture.detectChanges();
            const current = carousel.get(carousel.current).nativeElement;
            const width = current.offsetWidth;

            carousel.onPanLeft({ deltaX: -0.25 * width, deltaY: 0, velocity: 0.1, preventDefault: () => { } } as any);

            expect(parseFloat(current.style.opacity)).toBeCloseTo(0.75);
            expect(current.style.transform).toBe('');
            expect(carousel.get(3).nativeElement.style.transform).toBe('');
        });

        it('should register touch gestures only while `gesturesSupport` is enabled', () => {
            const fix = TestBed.createComponent(CarouselDynamicSlidesComponent);
            const instance = fix.componentInstance.carousel;
            instance.gesturesSupport = false;
            fix.detectChanges();

            expect(instance['_gestures']).toBeNull();
            expect(instance.nativeElement.style.touchAction).toBe('auto');

            const width = instance.get(instance.current).nativeElement.offsetWidth;
            HelperTestFunctions.simulatePointerPan(instance.nativeElement, -0.7 * width, 0);
            fix.detectChanges();
            expect(instance.current).toEqual(2);

            instance.gesturesSupport = true;
            fix.detectChanges();
            HelperTestFunctions.simulatePointerPan(instance.nativeElement, -0.7 * width, 0);
            fix.detectChanges();
            expect(instance.current).toEqual(3);

            instance.gesturesSupport = false;
            fix.detectChanges();
            expect(instance['_gestures']).toBeNull();
        });

        it('should restore the slides when a touch pan is cancelled', () => {
            carousel.interval = 1000;
            carousel.play();
            fixture.detectChanges();
            const width = carousel.get(carousel.current).nativeElement.offsetWidth;

            HelperTestFunctions.simulatePointerPan(carousel.nativeElement, -0.3 * width, 0, 'pointercancel');
            fixture.detectChanges();

            expect(carousel.current).toEqual(2);
            carousel.slides.forEach(slide => {
                expect(slide.nativeElement.style.transform).toBe('');
                expect(slide.previous).toBeFalse();
            });
            expect(carousel.isPlaying).toBeTrue();
        });

        it('should restore the slides when `gesturesSupport` is disabled during a pan', () => {
            carousel.interval = 1000;
            carousel.play();
            fixture.detectChanges();
            const current = carousel.get(carousel.current).nativeElement;

            carousel.onPanLeft({ deltaX: -0.3 * current.offsetWidth, deltaY: 0, velocity: 0.1, preventDefault: () => { } } as any);
            expect(current.style.transform).not.toBe('');
            expect(carousel.isPlaying).toBeFalse();

            carousel.gesturesSupport = false;
            fixture.detectChanges();

            expect(carousel['_gestures']).toBeNull();
            expect(carousel.current).toEqual(2);
            carousel.slides.forEach(slide => {
                expect(slide.nativeElement.style.transform).toBe('');
                expect(slide.previous).toBeFalse();
            });
            expect(carousel.isPlaying).toBeTrue();
        });

        it('should restore the incoming slide when a pan is reversed past the boundary of a non-looping carousel', () => {
            carousel.loop = false;
            carousel.select(0);
            fixture.detectChanges();
            const current = carousel.get(0).nativeElement;
            const incoming = carousel.get(1).nativeElement;
            const pan = (deltaX: number) => ({ deltaX, deltaY: 0, velocity: 0.1, preventDefault: () => { } } as any);

            carousel.onPanLeft(pan(-0.3 * current.offsetWidth));
            expect(carousel.get(1).previous).toBeTrue();
            expect(incoming.style.transform).not.toBe('');

            // reversing the same pan towards the (missing) previous slide
            carousel.onPanRight(pan(0.1 * current.offsetWidth));
            expect(carousel.get(1).previous).toBeFalse();
            expect(incoming.style.transform).toBe('');
            expect(current.style.transform).toBe('');

            carousel.onPanEnd(pan(0.1 * current.offsetWidth));
            fixture.detectChanges();
            expect(carousel.current).toEqual(0);
            expect(carousel.slides.filter(slide => slide.previous).length).toBe(0);
        });

        it('should not resume playing when a touch that did not pan is cancelled', () => {
            carousel.interval = 1000;
            carousel.play();
            UIInteractions.hoverElement(carousel.nativeElement, true);
            fixture.detectChanges();
            expect(carousel.isPlaying).toBeFalse();
            expect(carousel.stoppedByInteraction).toBeTrue();

            HelperTestFunctions.simulatePointerPan(carousel.get(carousel.current).nativeElement, 0, 0, 'pointercancel');

            expect(carousel.isPlaying).toBeFalse();
        });

        it('should not leave the incoming slide visible when a pan is reverted without animation', () => {
            HelperTestFunctions.simulatePan(fixture, carousel, -0.2, 0.1, 'horizontal');

            expect(carousel.current).toEqual(2);
            expect(carousel.get(3).previous).toBeFalse();
            expect(carousel.get(3).nativeElement.classList).not.toContain(HelperTestFunctions.PREVIOUS_SLIDE_CLASS);
        });

        it('should not animate the current slide when a pan ends without a matching pan', () => {
            carousel.vertical = true;
            fixture.detectChanges();
            const host = carousel.nativeElement;
            const { offsetWidth, offsetHeight } = carousel.get(carousel.current).nativeElement;

            HelperTestFunctions.simulatePointerPan(host, 0, -0.7 * offsetHeight);
            fixture.detectChanges();
            expect(carousel.current).toEqual(3);

            // a cross-axis drag only reaches the pan end handler
            HelperTestFunctions.simulatePointerPan(host, -0.3 * offsetWidth, 0);
            fixture.detectChanges();

            expect(carousel.current).toEqual(3);
            expect(carousel.slides.filter(slide => slide.previous).length).toBe(0);
        });
    });

    describe('Resource Strings', () => {
        let fix: ComponentFixture<CarouselTestComponent>;

        beforeEach(waitForAsync(() => {
            TestBed.configureTestingModule({
                imports: [NoopAnimationsModule, CarouselTestComponent]
            }).compileComponents();
        }));

        beforeEach(() => {
            fix = TestBed.createComponent(CarouselTestComponent);
            fix.detectChanges();
            carousel = fix.componentInstance.carousel;
        });

        it('should return full resource strings when partial resourceStrings are set', () => {
            carousel.resourceStrings = { igx_carousel_of: 'out of' };
            fix.detectChanges();

            expect(carousel.resourceStrings.igx_carousel_of).toBe('out of');
            expect(carousel.resourceStrings.igx_carousel_slide).toBe('slide');
            expect(carousel.resourceStrings.igx_carousel_previous_slide).toBe('previous slide');
            expect(carousel.resourceStrings.igx_carousel_next_slide).toBe('next slide');
        });

        it('should update non-overridden resource strings when global i18n changes', () => {
            carousel.resourceStrings = { igx_carousel_of: 'custom of' };
            fix.detectChanges();

            try {
                changei18n({ igx_carousel_slide: 'foto' });
                fix.detectChanges();

                expect(carousel.resourceStrings.igx_carousel_of).toBe('custom of');
                expect(carousel.resourceStrings.igx_carousel_slide).toBe('foto');
                expect(carousel.resourceStrings.igx_carousel_previous_slide).toBe('previous slide');
                expect(carousel.resourceStrings.igx_carousel_next_slide).toBe('next slide');
            } finally {
                changei18n(CarouselResourceStringsEN);
            }
        });

        it('should update the default resource strings when global i18n changes and no custom strings are set', () => {
            try {
                changei18n({ igx_carousel_of: 'от' });
                fix.detectChanges();

                expect(carousel.resourceStrings.igx_carousel_of).toBe('от');
                expect(carousel.resourceStrings.igx_carousel_slide).toBe('slide');
            } finally {
                changei18n(CarouselResourceStringsEN);
            }
        });
    });
});

describe('Carousel Zoneless Tests:', () => {
    let mockElement: any;
    let mockElementRef: ElementRef;

    beforeEach(async () => {
        TestBed.resetTestingModule();
        mockElement = document.createElement("div");
        mockElementRef = new ElementRef(mockElement);
        await TestBed.configureTestingModule({
            imports: [
                NoopAnimationsModule,
                CarouselDynamicSlidesWithNoActiveComponent,
                CarouselTestComponent
            ],
            providers: [
                { provide: ElementRef, useValue: mockElementRef },
                IgxSlideComponent,
                provideZonelessChangeDetection()
            ]
        }).compileComponents();
    });

    it('should activate and show the correct slide when the entire collection is replaced', async () => {
        const fix = TestBed.createComponent(CarouselDynamicSlidesWithNoActiveComponent);
        await wait(16);
        await HelperTestFunctions.waitAnAnimationFrame();
        fix.detectChanges();
        await fix.whenStable();
        const car: IgxCarouselComponent = fix.componentInstance.carousel;
        HelperTestFunctions.verifyActiveSlide(car, 0);

        // Replace the entire slide collection;
        fix.componentInstance.changeSlides();
        await wait(16);
        await HelperTestFunctions.waitAnAnimationFrame();
        fix.detectChanges();
        await fix.whenStable();

        expect(car.total).toEqual(3);
        // the carousel should activate the first slide again
        HelperTestFunctions.verifyActiveSlide(car, 0);
    });

    it('should update aria-live when the playback is toggled by tapping a slide', async () => {
        const fix = TestBed.createComponent(CarouselTestComponent);
        await fix.whenStable();
        await HelperTestFunctions.waitAnAnimationFrame();
        await fix.whenStable();
        const car = fix.componentInstance.carousel;
        const inner = car.nativeElement.querySelector('.igx-carousel__inner');
        const slide = car.get(car.current).nativeElement;
        expect(car.isPlaying).toBeTrue();
        expect(inner.getAttribute('aria-live')).toBe('off');

        HelperTestFunctions.simulatePointerPan(slide, 0, 0);
        await fix.whenStable();
        expect(car.isPlaying).toBeFalse();
        expect(inner.getAttribute('aria-live')).toBe('polite');

        HelperTestFunctions.simulatePointerPan(slide, 0, 0);
        await fix.whenStable();
        expect(car.isPlaying).toBeTrue();
        expect(inner.getAttribute('aria-live')).toBe('off');
    });
});

describe('Carousel Server Platform Tests:', () => {
    beforeEach(async () => {
        TestBed.resetTestingModule();
        await TestBed.configureTestingModule({
            imports: [NoopAnimationsModule, CarouselTestComponent],
            providers: [{
                provide: PlatformUtil,
                useFactory: () => Object.assign(new PlatformUtil(), { isBrowser: false })
            }]
        }).compileComponents();
    });

    it('should not register gestures, select slides or auto-play outside of the browser', async () => {
        spyOn(window, 'requestAnimationFrame').and.callThrough();
        const fix = TestBed.createComponent(CarouselTestComponent);
        fix.detectChanges();
        const carousel = fix.componentInstance.carousel;

        expect(carousel['_gestures']).toBeNull();
        expect(window.requestAnimationFrame).not.toHaveBeenCalled();
        await wait(16);
        expect(carousel.isPlaying).toBeFalse();

        carousel.play();
        expect(carousel.isPlaying).toBeTrue();
        expect(carousel['lastInterval']).toBeNull();
        fix.destroy();
    });
});

describe('Carousel Browser Animations Tests:', () => {
    let fixture: ComponentFixture<CarouselAnimationsComponent>;
    let carousel: IgxCarouselComponent;

    beforeEach(async () => {
        TestBed.resetTestingModule();
        await TestBed.configureTestingModule({
            imports: [BrowserAnimationsModule, CarouselAnimationsComponent]
        }).compileComponents();
        fixture = TestBed.createComponent(CarouselAnimationsComponent);
        fixture.detectChanges();
        carousel = fixture.componentInstance.carousel;
        await wait();
    });

    it('should reset the running animations when navigating while an animation is in progress', async () => {
        spyOn(carousel.leaveAnimationDone, 'emit').and.callThrough();
        spyOn(carousel.enterAnimationDone, 'emit').and.callThrough();

        carousel.next();
        const leavePlayer = carousel['leaveAnimationPlayer'];
        const enterPlayer = carousel['enterAnimationPlayer'];
        spyOn(leavePlayer, 'reset').and.callThrough();
        spyOn(enterPlayer, 'reset').and.callThrough();

        carousel.next();
        await HelperTestFunctions.waitAnAnimationFrame();
        fixture.detectChanges();

        // the in-progress animations are reset before the new ones are played
        expect(leavePlayer.reset).toHaveBeenCalled();
        expect(enterPlayer.reset).toHaveBeenCalled();
        expect(carousel.leaveAnimationDone.emit).toHaveBeenCalledTimes(1);
        expect(carousel.enterAnimationDone.emit).toHaveBeenCalledTimes(1);
        expect(carousel.current).toBe(2);
        expect(carousel.get(2).nativeElement.classList).toContain(HelperTestFunctions.ACTIVE_SLIDE_CLASS);
        expect(carousel.get(1).nativeElement.classList).toContain(HelperTestFunctions.PREVIOUS_SLIDE_CLASS);

        await wait(400);
        fixture.detectChanges();
        expect(carousel.leaveAnimationDone.emit).toHaveBeenCalledTimes(2);
        expect(carousel.enterAnimationDone.emit).toHaveBeenCalledTimes(2);
        expect(carousel.get(1).nativeElement.classList).not.toContain(HelperTestFunctions.PREVIOUS_SLIDE_CLASS);
    });
});


class HelperTestFunctions {
    public static NEXT_BUTTON_CLASS = '.igx-carousel__arrow--next';
    public static PRIV_BUTTON_CLASS = '.igx-carousel__arrow--prev';
    public static BUTTON_ARROW_CLASS = '.igx-nav-arrow';
    public static ACTIVE_SLIDE_CLASS = 'igx-slide--current';
    public static PREVIOUS_SLIDE_CLASS = 'igx-slide--previous';
    public static INDICATORS_START_CLASS = '.igx-carousel-indicators--start';
    public static INDICATORS_END_CLASS = '.igx-carousel-indicators--end';
    public static INDICATORS_LABEL_CLASS = '.igx-carousel__label';
    public static INDICATOR_CLASS = '.igx-carousel-indicators__indicator';
    public static INDICATOR_DOT_CLASS = '.igx-nav-dot';
    public static INDICATOR_ACTIVE_DOT_CLASS = '.igx-nav-dot--active';

    public static getNextButton(fixture): HTMLElement {
        return fixture.nativeElement.querySelector(HelperTestFunctions.NEXT_BUTTON_CLASS);
    }

    public static getPreviousButton(fixture): HTMLElement {
        return fixture.nativeElement.querySelector(HelperTestFunctions.PRIV_BUTTON_CLASS);
    }

    public static getNextButtonArrow(fixture): HTMLElement {
        const next = HelperTestFunctions.getNextButton(fixture);
        return next.querySelector(HelperTestFunctions.BUTTON_ARROW_CLASS);
    }

    public static getPreviousButtonArrow(fixture): HTMLElement {
        const prev = HelperTestFunctions.getPreviousButton(fixture);
        return prev.querySelector(HelperTestFunctions.BUTTON_ARROW_CLASS);
    }

    public static getIndicatorsContainer(fixture, position: CarouselIndicatorsOrientation = CarouselIndicatorsOrientation.end): HTMLElement {
        const carouselNative = fixture.nativeElement;
        if (position === CarouselIndicatorsOrientation.end) {
            return carouselNative.querySelector(HelperTestFunctions.INDICATORS_END_CLASS);
        } else {
            return carouselNative.querySelector(HelperTestFunctions.INDICATORS_START_CLASS);
        }
    }

    public static getIndicatorsLabel(fixture, position: CarouselIndicatorsOrientation = CarouselIndicatorsOrientation.end) {
        const indContainer = HelperTestFunctions.getIndicatorsContainer(fixture, position);
        return indContainer.querySelector(HelperTestFunctions.INDICATORS_LABEL_CLASS);
    }

    public static getIndicators(fixture, position: CarouselIndicatorsOrientation = CarouselIndicatorsOrientation.end) {
        const indContainer = HelperTestFunctions.getIndicatorsContainer(fixture, position);
        return indContainer.querySelectorAll(HelperTestFunctions.INDICATOR_CLASS);
    }

    public static getIndicatorsDots(fixture, position: CarouselIndicatorsOrientation = CarouselIndicatorsOrientation.end) {
        const indContainer = HelperTestFunctions.getIndicatorsContainer(fixture, position);
        return indContainer.querySelectorAll(HelperTestFunctions.INDICATOR_DOT_CLASS);
    }

    public static verifyActiveSlide(carousel, index: number) {
        const activeSlide = carousel.get(index);
        expect(carousel.current).toEqual(index);
        expect(activeSlide.active).toBeTruthy();
        expect(activeSlide.nativeElement.classList.contains(HelperTestFunctions.ACTIVE_SLIDE_CLASS)).toBeTruthy();
        expect(carousel.slides.find((slide) => slide.active && slide.index !== index)).toBeUndefined();
    }

    public static verifySlidesLabelledByIndicators(fixture, carousel: IgxCarouselComponent) {
        const indicatorIds = Array.from(HelperTestFunctions.getIndicators(fixture)).map((indicator: Element) => indicator.id);
        const labelledBy = carousel.slides.map(slide => slide.nativeElement.getAttribute('aria-labelledby'));
        expect(labelledBy).toEqual(indicatorIds);
    }

    public static simulateTap(_fixture, carousel, target?) {
        const activeSlide = carousel.get(carousel.current).nativeElement;
        carousel.onTap({ target: target ?? activeSlide });
    }

    public static simulatePan(fixture, carousel, deltaOffset, velocity, dir: 'horizontal' | 'vertical') {
        const activeSlide = carousel.get(carousel.current).nativeElement;
        const deltaX = dir === 'horizontal' ? activeSlide.offsetWidth * deltaOffset : 0;
        const deltaY = dir === 'horizontal' ? 0 : activeSlide.offsetHeight * deltaOffset;
        const panOptions = {
            deltaX,
            deltaY,
            velocity,
            preventDefault: () => { }
        };

        if (dir === 'horizontal') {
            if (deltaOffset < 0) {
                carousel.onPanLeft(panOptions);
            } else {
                carousel.onPanRight(panOptions);
            }
        } else {
            if (deltaOffset < 0) {
                carousel.onPanUp(panOptions);
            } else {
                carousel.onPanDown(panOptions);
            }
        }
        fixture.detectChanges();
        carousel.onPanEnd(panOptions);
        fixture.detectChanges();
    }

    public static dispatchPointer(target: HTMLElement, type: string, clientX: number, clientY: number) {
        target.dispatchEvent(new PointerEvent(type, {
            pointerType: 'touch', pointerId: 1, isPrimary: true, clientX, clientY, bubbles: true, cancelable: true
        }));
    }

    /** Dispatches a touch pointer sequence (down -> move -> up) on the target; zero deltas produce a tap. */
    public static simulatePointerPan(target: HTMLElement, deltaX: number, deltaY: number, end: 'pointerup' | 'pointercancel' = 'pointerup') {
        const rect = target.getBoundingClientRect();
        const startX = rect.left + rect.width / 2;
        const startY = rect.top + rect.height / 2;
        const dispatch = (type: string, x: number, y: number) => target.dispatchEvent(new PointerEvent(type, {
            pointerType: 'touch', pointerId: 1, isPrimary: true, clientX: x, clientY: y, bubbles: true, cancelable: true
        }));

        dispatch('pointerdown', startX, startY);
        if (deltaX || deltaY) {
            dispatch('pointermove', startX + deltaX / 2, startY + deltaY / 2);
            dispatch('pointermove', startX + deltaX, startY + deltaY);
        }
        dispatch(end, startX + deltaX, startY + deltaY);
    }

    public static waitAnAnimationFrame(): Promise<void> {
        return new Promise<void>(resolve => {
            requestAnimationFrame(() => {
                resolve();
            });
        });
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
    `,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxCarouselComponent, IgxSlideComponent]
})
class CarouselTestComponent {
    @ViewChild('carousel', { static: true }) public carousel: IgxCarouselComponent;

    public loop = true;
    public pause = true;
    public interval = 2500;
}

@Component({
    template: `
        <igx-carousel #carousel>
            <igx-slide [active]="true"><h3>Slide1</h3></igx-slide>
            <igx-slide><h3>Slide2</h3></igx-slide>
            <igx-slide><h3>Slide3</h3></igx-slide>
            <igx-slide><h3>Slide4</h3></igx-slide>
        </igx-carousel>
    `,
    imports: [IgxCarouselComponent, IgxSlideComponent],
    changeDetection: ChangeDetectionStrategy.OnPush
})
class CarouselAnimationsComponent {
    @ViewChild('carousel', { static: true }) public carousel: IgxCarouselComponent;
}


@Component({
    template: `
        <igx-carousel #carousel [animationType]="'none'">
            <igx-slide><h3>Slide1</h3></igx-slide>
            <igx-slide><h3>Slide2</h3></igx-slide>
            <igx-slide><h3>Slide3</h3></igx-slide>
            <igx-slide><h3>Slide4</h3></igx-slide>

            <ng-template igxCarouselIndicator let-slide>
                <span> {{slide.index}} </span>
            </ng-template>

            <ng-template igxCarouselNextButton>
                <span>next</span>
            </ng-template>

            <ng-template igxCarouselPrevButton>
                <span>prev</span>
            </ng-template>
        </igx-carousel>
    `,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxCarouselComponent, IgxSlideComponent, IgxCarouselIndicatorDirective, IgxCarouselNextButtonDirective, IgxCarouselPrevButtonDirective]
})
class CarouselTemplateSetInMarkupTestComponent {
    @ViewChild('carousel', { static: true }) public carousel: IgxCarouselComponent;
}

@Component({
    template: `
        <ng-template #customIndicatorTemplate1 let-slide>
            <span> {{slide.index}} </span>
        </ng-template>

        <ng-template #customIndicatorTemplate2 let-slide>
            @if (!slide.active) {
                <span> {{slide.index}}  </span>
            }
            @if (slide.active) {
                <span> {{slide.index}}: Active  </span>
            }
        </ng-template>

        <ng-template #customNextTemplate>
            <span>next</span>
        </ng-template>

        <ng-template #customPrevTemplate>
            <span>prev</span>
        </ng-template>

        <igx-carousel #carousel [animationType]="'none'">
            <igx-slide><h3>Slide1</h3></igx-slide>
            <igx-slide><h3>Slide2</h3></igx-slide>
            <igx-slide><h3>Slide3</h3></igx-slide>
            <igx-slide><h3>Slide4</h3></igx-slide>
        </igx-carousel>
    `,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxCarouselComponent, IgxSlideComponent]
})
class CarouselTemplateSetInTypescriptTestComponent {
    @ViewChild('carousel', { static: true }) public carousel: IgxCarouselComponent;
    @ViewChild('customIndicatorTemplate1', { read: TemplateRef, static: false })
    public customIndicatorTemplate1;
    @ViewChild('customIndicatorTemplate2', { read: TemplateRef, static: false })
    public customIndicatorTemplate2;
    @ViewChild('customNextTemplate', { read: TemplateRef, static: false })
    public customNextTemplate;
    @ViewChild('customPrevTemplate', { read: TemplateRef, static: false })
    public customPrevTemplate;
}

@Component({
    template: `
        <igx-carousel #carousel [loop]="loop" [animationType]="'none'">
            @for (slide of slides; track slide.text) {
                <igx-slide [active]="slide.active">
                    <igx-slide><h3>{{slide.text}}</h3></igx-slide>
                </igx-slide>
            }
        </igx-carousel>
    `,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxCarouselComponent, IgxSlideComponent]
})
class CarouselDynamicSlidesComponent {
    @ViewChild('carousel', { static: true }) public carousel: IgxCarouselComponent;

    public loop = true;
    public slides = [];

    constructor() {
        this.slides.push(
            { text: 'Slide 1', active: false },
            { text: 'Slide 2', active: false },
            { text: 'Slide 3', active: true },
            { text: 'Slide 4', active: false }
        );
    }

    public removeAllSlides() {
        this.slides = [];
    }

    public addSlides() {
        this.slides.push(
            { text: 'Slide 1' },
            { text: 'Slide 2' }
        );
    }
}

@Component({
    template: `
        <igx-carousel #carousel [loop]="loop" [animationType]="'none'">
            @for (slide of slides; track slide) {
                <igx-slide>
                    <h3>{{slide.text}}</h3>
                </igx-slide>
            }
        </igx-carousel>
    `,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxCarouselComponent, IgxSlideComponent]
})
class CarouselDynamicSlidesWithNoActiveComponent {
    @ViewChild('carousel', { static: true }) public carousel: IgxCarouselComponent;

    public loop = true;
    public slides = [];
    private cdr = inject(ChangeDetectorRef);

    constructor() {
        this.slides.push(
            { text: 'Slide 1' },
            { text: 'Slide 2' },
            { text: 'Slide 3' },
            { text: 'Slide 4' }
        );
    }

    public changeSlides() {
        this.slides = [
            { text: 'New Slide 1' },
            { text: 'New Slide 2' },
            { text: 'New Slide 3' }
        ];
        this.cdr.markForCheck();
    }
}
