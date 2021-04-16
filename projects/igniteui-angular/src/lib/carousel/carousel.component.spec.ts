import { Component, ViewChild, TemplateRef } from '@angular/core';
import { TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {
    IgxCarouselComponent,
    IgxCarouselModule,
    ISlideEventArgs,
    CarouselIndicatorsOrientation
} from './carousel.component';
import { UIInteractions, wait } from '../test-utils/ui-interactions.spec';
import { configureTestSuite } from '../test-utils/configure-suite';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxSlideComponent } from './slide.component';
import { CarouselAnimationType } from './carousel-base';

describe('Carousel', () => {
    configureTestSuite();
    let fixture;
    let carousel: IgxCarouselComponent;

    beforeAll(waitForAsync(() => {
        TestBed.configureTestingModule({
            declarations: [
                CarouselTestComponent,
                CarouselTemplateSetInMarkupTestComponent,
                CarouselTemplateSetInTypescriptTestComponent,
                CarouselAnimationsComponent,
                CarouselDynamicSlidesComponent
            ],
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

            expect(carousel.onSlideChanged.emit).toHaveBeenCalledTimes(6);
        });

        it('changing slides with indicators buttons', () => {
            spyOn(carousel.onSlideChanged, 'emit');
            carousel.pause = true;

            const indicators = HelperTestFunctions.getIndicators(fixture);
            expect(indicators.length).toBe(4);

            indicators[3].dispatchEvent(new Event('click'));
            fixture.detectChanges();

            HelperTestFunctions.verifyActiveSlide(carousel, 3);

            indicators[1].dispatchEvent(new Event('click'));
            fixture.detectChanges();

            HelperTestFunctions.verifyActiveSlide(carousel, 1);

            expect(carousel.onSlideChanged.emit).toHaveBeenCalledTimes(2);
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

        it('indicatorsOrientation changes the position of indicators', () => {
            let indicatorsContainer = HelperTestFunctions.getIndicatorsContainer(fixture);
            expect(indicatorsContainer).toBeDefined();

            carousel.indicatorsOrientation = CarouselIndicatorsOrientation.top;
            fixture.detectChanges();

            indicatorsContainer = HelperTestFunctions.getIndicatorsContainer(fixture);
            expect(indicatorsContainer).toBeNull();
            indicatorsContainer = HelperTestFunctions.getIndicatorsContainer(fixture, CarouselIndicatorsOrientation.top);
            expect(indicatorsContainer).toBeDefined();

            carousel.indicatorsOrientation = CarouselIndicatorsOrientation.bottom;
            fixture.detectChanges();

            indicatorsContainer = HelperTestFunctions.getIndicatorsContainer(fixture, CarouselIndicatorsOrientation.top);
            expect(indicatorsContainer).toBeNull();
            indicatorsContainer = HelperTestFunctions.getIndicatorsContainer(fixture, CarouselIndicatorsOrientation.bottom);
            expect(indicatorsContainer).toBeDefined();
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

        it('should stop/play on mouse enter/leave ', () => {
            carousel.interval = 1000;
            carousel.play();
            fixture.detectChanges();

            spyOn(carousel.onCarouselPaused, 'emit');
            spyOn(carousel.onCarouselPlaying, 'emit');

            expect(carousel.isPlaying).toBeTruthy();

            UIInteractions.hoverElement(carousel.nativeElement, true);
            fixture.detectChanges();

            expect(carousel.isPlaying).toBeFalsy();
            expect(carousel.onCarouselPaused.emit).toHaveBeenCalledTimes(1);

            UIInteractions.unhoverElement(carousel.nativeElement, true);
            fixture.detectChanges();

            expect(carousel.isPlaying).toBeTruthy();
            expect(carousel.onCarouselPlaying.emit).toHaveBeenCalledTimes(1);
            expect(carousel.onCarouselPaused.emit).toHaveBeenCalledTimes(1);

            // When the carousel is stopped mouseleave does not start playing
            carousel.stop();
            fixture.detectChanges();

            expect(carousel.isPlaying).toBeFalsy();
            expect(carousel.onCarouselPlaying.emit).toHaveBeenCalledTimes(1);
            expect(carousel.onCarouselPaused.emit).toHaveBeenCalledTimes(2);

            UIInteractions.hoverElement(carousel.nativeElement, true);
            fixture.detectChanges();

            expect(carousel.isPlaying).toBeFalsy();

            UIInteractions.unhoverElement(carousel.nativeElement, true);
            fixture.detectChanges();
            expect(carousel.isPlaying).toBeFalsy();
            expect(carousel.onCarouselPlaying.emit).toHaveBeenCalledTimes(1);
        });


        it('should apply correctly aria attributes to carousel component', () => {
            const expectedRole = 'region';
            const expectedRoleDescription = 'carousel';
            const tabIndex = carousel.nativeElement.getAttribute('tabindex');

            expect(tabIndex).toBeNull();
            expect(carousel.nativeElement.getAttribute('role')).toEqual(expectedRole);
            expect(carousel.nativeElement.getAttribute('aria-roledescription')).toEqual(expectedRoleDescription);

            const indicators = carousel.nativeElement.querySelector(HelperTestFunctions.INDICATORS_BOTTOM_CLASS);

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
            spyOn(carousel.onSlideAdded, 'emit');

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

            expect(carousel.onSlideAdded.emit).toHaveBeenCalledTimes(2);
        }));

        it('should remove slides in the carousel', fakeAsync(() => {
            tick();
            spyOn(carousel.onSlideRemoved, 'emit');

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

            expect(carousel.onSlideRemoved.emit).toHaveBeenCalledTimes(2);
        }));

        it('should not render navigation buttons and indicators when carousel does not have slides', fakeAsync(() => {
            fixture.componentInstance.removeAllSlides();
            fixture.detectChanges();
            tick(200);

            expect(carousel.total).toEqual(0);
            expect(HelperTestFunctions.getIndicatorsContainer(fixture)).toBeNull();
            expect(HelperTestFunctions.getIndicatorsContainer(fixture, CarouselIndicatorsOrientation.top)).toBeNull();
            expect(HelperTestFunctions.getNextButton(fixture)).toBeNull();
            expect(HelperTestFunctions.getPreviousButton(fixture)).toBeNull();

            // add a slide
            fixture.componentInstance.addSlides();
            fixture.detectChanges();
            tick(200);

            expect(carousel.total).toEqual(2);
            expect(HelperTestFunctions.getIndicatorsContainer(fixture)).toBeDefined();
            expect(HelperTestFunctions.getIndicatorsContainer(fixture, CarouselIndicatorsOrientation.top)).toBeDefined();
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

            spyOn(carousel.onCarouselPaused, 'emit');
            spyOn(carousel.onCarouselPlaying, 'emit');

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

        it('verify changing slides with pan left ', () => {
            expect(carousel.current).toEqual(2);

            HelperTestFunctions.simulatePan(fixture, carousel, -0.05, 0.1);

            expect(carousel.current).toEqual(2);

            HelperTestFunctions.simulatePan(fixture, carousel, -0.7, 0.1);

            expect(carousel.current).toEqual(3);

            HelperTestFunctions.simulatePan(fixture, carousel, -0.2, 2);

            expect(carousel.current).toEqual(0);
        });

        it('verify changing slides with pan right ', () => {
            expect(carousel.current).toEqual(2);

            HelperTestFunctions.simulatePan(fixture, carousel, 0.1, 0.1);

            expect(carousel.current).toEqual(2);

            HelperTestFunctions.simulatePan(fixture, carousel, 0.6, 0.1);

            expect(carousel.current).toEqual(1);

            HelperTestFunctions.simulatePan(fixture, carousel, 0.05, 2);

            expect(carousel.current).toEqual(0);
        });

        it('verify pan when loop is false', () => {
            carousel.loop = false;
            fixture.detectChanges();

            carousel.select(carousel.get(0));
            fixture.detectChanges();

            expect(carousel.current).toEqual(0);

            HelperTestFunctions.simulatePan(fixture, carousel, 0.9, 2);

            expect(carousel.current).toEqual(0);

            carousel.select(carousel.get(3));
            fixture.detectChanges();

            expect(carousel.current).toEqual(3);

            HelperTestFunctions.simulatePan(fixture, carousel, -0.9, 2);

            expect(carousel.current).toEqual(3);
        });

        it('verify pan when gesturesSupport is false', () => {
            carousel.gesturesSupport = false;
            fixture.detectChanges();

            expect(carousel.current).toEqual(2);

            HelperTestFunctions.simulatePan(fixture, carousel, 0.9, 2);

            expect(carousel.current).toEqual(2);

            HelperTestFunctions.simulatePan(fixture, carousel, -0.6, 2);

            expect(carousel.current).toEqual(2);
        });
    });
});

class HelperTestFunctions {
    public static NEXT_BUTTON_CLASS = '.igx-carousel__arrow--next';
    public static PRIV_BUTTON_CLASS = '.igx-carousel__arrow--prev';
    public static BUTTON_ARROW_CLASS = '.igx-nav-arrow';
    public static ACTIVE_SLIDE_CLASS = 'igx-slide--current';
    public static PREVIOUS_SLIDE_CLASS = 'igx-slide--previous';
    public static INDICATORS_TOP_CLASS = '.igx-carousel-indicators--top';
    public static INDICATORS_BOTTOM_CLASS = '.igx-carousel-indicators--bottom';
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

    public static getIndicatorsContainer(fixture, position = CarouselIndicatorsOrientation.bottom): HTMLElement {
        const carouselNative = fixture.nativeElement;
        if (position === CarouselIndicatorsOrientation.bottom) {
            return carouselNative.querySelector(HelperTestFunctions.INDICATORS_BOTTOM_CLASS);
        } else {
            return carouselNative.querySelector(HelperTestFunctions.INDICATORS_TOP_CLASS);
        }
    }

    public static getIndicatorsLabel(fixture, position = CarouselIndicatorsOrientation.bottom) {
        const indContainer = HelperTestFunctions.getIndicatorsContainer(fixture, position);
        return indContainer.querySelector(HelperTestFunctions.INDICATORS_LABEL_CLASS);
    }

    public static getIndicators(fixture, position = CarouselIndicatorsOrientation.bottom) {
        const indContainer = HelperTestFunctions.getIndicatorsContainer(fixture, position);
        return indContainer.querySelectorAll(HelperTestFunctions.INDICATOR_CLASS);
    }

    public static getIndicatorsDots(fixture, position = CarouselIndicatorsOrientation.bottom) {
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

    public static simulateTap(fixture, carousel) {
        const activeSlide = carousel.get(carousel.current).nativeElement;
        const carouselElement = fixture.debugElement.query(By.css('igx-carousel'));
        carouselElement.triggerEventHandler('tap', {target: activeSlide});
        // Simulator.gestures.press(activeSlide, { duration: 180 });
    }

    public static simulatePan(fixture, carousel, deltaXOffset, velocity) {
        const activeSlide = carousel.get(carousel.current).nativeElement;
        const carouselElement = fixture.debugElement.query(By.css('igx-carousel'));
        const deltaX = activeSlide.offsetWidth * deltaXOffset;
        const event = deltaXOffset < 0 ? 'panleft' : 'panright';
        const panOptions = {
            deltaX,
            deltaY: 0,
            duration: 100,
            velocity,
            preventDefault: ( () => {  })
        };

        carouselElement.triggerEventHandler(event, panOptions);
        fixture.detectChanges();
        carouselElement.triggerEventHandler('panend', panOptions);
        fixture.detectChanges();
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

@Component({
    template: `
        <igx-carousel #carousel>
            <igx-slide [active]="true"><h3>Slide1</h3></igx-slide>
            <igx-slide><h3>Slide2</h3></igx-slide>
            <igx-slide><h3>Slide3</h3></igx-slide>
            <igx-slide><h3>Slide4</h3></igx-slide>
        </igx-carousel>
    `
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
    `
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
            <span *ngIf="!slide.active"> {{slide.index}}  </span>
            <span *ngIf="slide.active"> {{slide.index}}: Active  </span>
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
    `
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
            <igx-slide *ngFor="let slide of slides;" [active]="slide.active">
               <igx-slide><h3>{{slide.text}}</h3></igx-slide>
            </igx-slide>
        </igx-carousel>
    `
})
class CarouselDynamicSlidesComponent {
    @ViewChild('carousel', { static: true }) public carousel: IgxCarouselComponent;

    public loop = true;
    public slides = [];

    constructor() {
        this.addNewSlide();
    }

    public addNewSlide() {
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
