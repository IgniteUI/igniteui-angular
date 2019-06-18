import { Component, ViewChild} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { async, TestBed, ComponentFixture, fakeAsync, tick, flush } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { IgxSliderComponent, IgxSliderModule, IRangeSliderValue, SliderType } from './slider.component';
import { UIInteractions, wait } from '../test-utils/ui-interactions.spec';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { configureTestSuite } from '../test-utils/configure-suite';

declare var Simulator: any;
const SLIDER_CLASS = '.igx-slider';
const THUMB_TO_CLASS = '.igx-slider__thumb-to';
const THUMB_FROM_CLASS = '.igx-slider__thumb-from';

describe('IgxSlider', () => {
    configureTestSuite();
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                SliderInitializeTestComponent,
                SliderMinMaxComponent,
                SliderTestComponent,
                SliderWithLabelsComponent,
                RangeSliderWithLabelsComponent,
                RangeSliderWithCustomTemplateComponent
            ],
            imports: [
                IgxSliderModule, NoopAnimationsModule, FormsModule
            ]
        }).compileComponents();
    }));

    describe('Base tests', () => {
        let fixture: ComponentFixture<SliderInitializeTestComponent>;
        let slider: IgxSliderComponent;

        beforeEach(() => {
            fixture = TestBed.createComponent(SliderInitializeTestComponent);
            slider = fixture.componentInstance.slider;
            fixture.detectChanges();
        });

        it('should have lower bound equal to min value when lower bound is not set', () => {
            const domSlider = fixture.debugElement.query(By.css(SLIDER_CLASS)).nativeElement;

            expect(slider.id).toContain('igx-slider-');
            expect(domSlider.id).toContain('igx-slider-');
            expect(slider.lowerBound).toBe(slider.minValue);
        });

        it('should have upper bound equal to max value when upper bound is not set', () => {
            expect(slider.upperBound).toBe(slider.maxValue);
        });

        it(`should have upper value equal to lower bound when
            lower value is not set and slider type is SLIDER`, () => {
                slider.type = SliderType.SLIDER;
                fixture.detectChanges();

                expect(slider.value).toBe(slider.lowerBound);
            });

        it('should change minValue', () => {
            const expectedMinValue = 3;
            slider.minValue = expectedMinValue;

            fixture.detectChanges();
            expect(slider.minValue).toBe(expectedMinValue);
        });

        it('should change maxValue', () => {
            const expectedMaxValue = 15;
            slider.maxValue = expectedMaxValue;

            fixture.detectChanges();
            expect(slider.maxValue).toBe(expectedMaxValue);
        });

        it('should reduce minValue when greater than maxValue', () => {
            slider.maxValue = 6;
            slider.minValue = 10;

            const expectedMinValue = slider.maxValue - 1;
            fixture.detectChanges();

            expect(slider.minValue).toBe(expectedMinValue);
            expect(slider.minValue).toBeLessThan(slider.maxValue);
        });

        it('should increase minValue when greater than maxValue', () => {
            slider.minValue = 3;
            slider.maxValue = -5;

            const expectedMaxValue = slider.minValue + 1;
            fixture.detectChanges();

            expect(slider.maxValue).toBe(expectedMaxValue);
            expect(slider.maxValue).toBeGreaterThan(slider.minValue);
        });

        it('should change lowerBound', () => {
            const expectedLowerBound = 3;
            slider.lowerBound = expectedLowerBound;
            slider.upperBound = 20;

            fixture.detectChanges();

            expect(slider.lowerBound).toBe(expectedLowerBound);
        });

        it('should change upperBound', () => {
            const expectedUpperBound = 40;
            slider.upperBound = expectedUpperBound;
            slider.lowerBound = 2;

            fixture.detectChanges();

            expect(slider.upperBound).toBe(expectedUpperBound);
        });

        it('should set lowerBound to be same as minValue if exceeds upperBound', () => {
            slider.upperBound = 20;
            slider.lowerBound = 40;

            fixture.detectChanges();

            expect(slider.lowerBound).toBe(slider.minValue);
            expect(slider.lowerBound).toBeLessThan(slider.upperBound);
        });

        it('should set upperBound to be same as maxValue if exceeds lowerBound', () => {
            slider.lowerBound = 40;
            slider.upperBound = 20;

            fixture.detectChanges();

            expect(slider.upperBound).toBe(slider.maxValue);
            expect(slider.upperBound).toBeGreaterThan(slider.lowerBound);
        });

        it('should set upperBound to be same as maxValue if exceeds lowerBound', () => {
            slider.lowerBound = 40;
            slider.upperBound = 20;
            fixture.detectChanges();
            expect(slider.upperBound).toBe(slider.maxValue);
            expect(slider.upperBound).toBeGreaterThan(slider.lowerBound);
        });


        it('should not set upper value outside bounds slider when slider is SLIDER', () => {
            slider.lowerBound = 10;
            slider.upperBound = 40;
            fixture.detectChanges();

            slider.value = 20;
            fixture.detectChanges();
            expect(fixture.componentInstance.slider.value).toBe(20);

            slider.value = 45;
            fixture.detectChanges();
            expect(fixture.componentInstance.slider.value).toBe(40);
        });

        it('should not set upper value to outside bounds slider when slider is RANGE', () => {
            slider.lowerBound = 10;
            slider.upperBound = 40;
            slider.type = SliderType.RANGE;

            fixture.detectChanges();

            slider.value = {
                lower: 20,
                upper: 30
            };

            fixture.detectChanges();
            expect(slider.value.lower).toBe(20);
            expect(slider.value.upper).toBe(30);

            slider.value = {
                lower: 20,
                upper: 50
            };

            fixture.detectChanges();
            expect(slider.value.lower).toBe(20);
            expect(slider.value.upper).toBe(40);
        });

        it('should not set value upper when is less than lower value when slider is RANGE', () => {
            slider.lowerBound = 10;
            slider.upperBound = 40;
            slider.type = SliderType.RANGE;

            fixture.detectChanges();

            slider.value = {
                lower: 20,
                upper: 30
            };

            fixture.detectChanges();
            expect(slider.value.lower).toBe(20);
            expect(slider.value.upper).toBe(30);

            slider.value = {
                lower: 20,
                upper: 15
            };
            fixture.detectChanges();
            expect(slider.value.lower).toBe(20);
            expect(slider.value.upper).toBe(30);
        });

        it('should not set lower value outside bounds slider when slider is RANGE', () => {
            slider.lowerBound = 10;
            slider.upperBound = 40;
            slider.type = SliderType.RANGE;

            fixture.detectChanges();

            slider.value = {
                lower: 20,
                upper: 30
            };

            fixture.detectChanges();
            expect(slider.value.lower).toBe(20);
            expect(slider.value.upper).toBe(30);

            slider.value = {
                lower: 5,
                upper: 30
            };
            fixture.detectChanges();
            expect(slider.value.lower).toBe(10);
            expect(slider.value.upper).toBe(30);
        });

        it('should not set value lower when is more than upper value when slider is RANGE', () => {
            slider.lowerBound = 10;
            slider.upperBound = 40;
            slider.type = SliderType.RANGE;

            fixture.detectChanges();

            slider.value = {
                lower: 20,
                upper: 30
            };

            fixture.detectChanges();
            expect(slider.value.lower).toBe(20);
            expect(slider.value.upper).toBe(30);

            slider.value = {
                lower: 35,
                upper: 30
            };

            fixture.detectChanges();
            expect(slider.value.lower).toBe(20);
            expect(slider.value.upper).toBe(30);
        });

        it('should set upperBound to be same as maxValue if exceeds lowerBound', () => {
            slider.lowerBound = 40;
            slider.upperBound = 20;

            fixture.detectChanges();
            expect(slider.upperBound).toBe(slider.maxValue);
            expect(slider.upperBound).toBeGreaterThan(slider.lowerBound);
        });

        it('should set slider width', () => {
            expect(slider.upperBound).toBe(slider.maxValue);
            expect(slider.upperBound).toBeGreaterThan(slider.lowerBound);
        });


        it('should change value from 60 to 61 when right arrow is pressed and slider is SLIDER', () => {
            slider.value = 60;
            fixture.detectChanges();

            const fromThumb = fixture.nativeElement.querySelector(THUMB_TO_CLASS);
            fromThumb.focus();
            UIInteractions.triggerKeyDownEvtUponElem('ArrowRight', fromThumb, true);

            fixture.detectChanges();
            expect(Math.round(slider.value as number)).toBe(61);
        });

        it('should change value from 60 to 59 when left arrow is pressed and slider is SLIDER', () => {
            slider.value = 60;
            fixture.detectChanges();

            const toThumb = fixture.nativeElement.querySelector(THUMB_TO_CLASS);
            toThumb.focus();
            UIInteractions.triggerKeyDownEvtUponElem('ArrowLeft', toThumb, true);

            fixture.detectChanges();
            expect(Math.round(slider.value as number)).toBe(59);
        });
    });

    describe('Slider: with set min and max value', () => {
        let fixture: ComponentFixture<SliderMinMaxComponent>;
        let sliderInstance: IgxSliderComponent;

        beforeEach(() => {
            fixture = TestBed.createComponent(SliderMinMaxComponent);
            sliderInstance = fixture.componentInstance.slider;
            fixture.detectChanges();
        });

        it('Value should remain to the max one if it exceeds.', () => {
            let expectedVal = 150;
            let expectedMax = 300;

            expect(sliderInstance.value).toEqual(expectedVal);
            expect(sliderInstance.maxValue).toEqual(expectedMax);

            expectedVal = 250;
            expectedMax = 200;
            sliderInstance.maxValue = expectedMax;
            sliderInstance.value = expectedVal;
            fixture.detectChanges();

            expect(sliderInstance.value).not.toEqual(expectedVal);
            expect(sliderInstance.value).toEqual(expectedMax);
            expect(sliderInstance.maxValue).toEqual(expectedMax);
        });

        it('continuous(smooth) sliding should be allowed', (done) => {
            sliderInstance.continuous = true;
            fixture.detectChanges();

            expect(sliderInstance.continuous).toBe(true);
            expect(sliderInstance.value).toBe(150);
            const sliderEl = fixture.debugElement.query(By.css(SLIDER_CLASS)).nativeElement;
            sliderEl.dispatchEvent( new Event('pointerdown'));
            fixture.detectChanges();
            expect(sliderEl).toBeDefined();
            return panRight(sliderEl, sliderEl.offsetHeight, sliderEl.offsetWidth, 200)
            .then(() => {
                fixture.detectChanges();
                const activeTumb = fixture.debugElement.query(By.css('.igx-slider__thumb-to--active'));
                expect(sliderInstance.value).toBeGreaterThan(0);
                expect(activeTumb).toBeNull();
                done();
            });
        });

        it('should not move thumb slider and value should remain the same when slider is disabled', (done) => {
            sliderInstance.disabled = true;
            fixture.detectChanges();

            const sliderEl = fixture.debugElement.query(By.css(SLIDER_CLASS)).nativeElement;
            sliderEl.dispatchEvent( new Event('pointerdown'));
            fixture.detectChanges();
            expect(sliderEl).toBeDefined();
            return panRight(sliderEl, sliderEl.offsetHeight, sliderEl.offsetWidth, 200)
            .then(() => {
                fixture.detectChanges();
                const activeTumb = fixture.debugElement.query(By.css('.igx-slider__thumb-to--active'));
                expect(activeTumb).toBeDefined();
                expect(sliderInstance.value).toBe(sliderInstance.minValue);
                done();
            });
         });
    });

    describe('RANGE slider Base tests', () => {
        let fixture: ComponentFixture<SliderInitializeTestComponent>;
        let slider: IgxSliderComponent;

        beforeEach(() => {
            fixture = TestBed.createComponent(SliderInitializeTestComponent);
            slider = fixture.componentInstance.slider;
            slider.type = SliderType.RANGE;
            fixture.detectChanges();
        });

        it(`should have lower value equal to lower bound when
            lower value is not set and slider type is RANGE`, () => {

                expect((slider.value as IRangeSliderValue).lower).toBe(slider.lowerBound);
            });

        it(`should have upper value equal to upper bound when
            lower value is not set and slider type is RANGE`, () => {

                expect((slider.value as IRangeSliderValue).upper).toBe(slider.upperBound);
            });

        it('continuous(smooth) sliding should be allowed', (done) => {
            pending('Investigate deeper why sliding is not performed');
            const fromThumb = fixture.debugElement.query(By.css(THUMB_FROM_CLASS)).nativeElement;
            slider.continuous = true;
            fixture.detectChanges();

            expect(slider.continuous).toBe(true);

            const sliderEl = fixture.debugElement.query(By.css(SLIDER_CLASS)).nativeElement;
            sliderEl.dispatchEvent( new Event('pointerdown'));
            fixture.detectChanges();
            fromThumb.dispatchEvent(new Event('focus'));
            fixture.detectChanges();

            expect(sliderEl).toBeDefined();
            return panRight(sliderEl, sliderEl.offsetHeight, sliderEl.offsetWidth, 200)
            .then(() => {
                fixture.detectChanges();
                const activetoThumb = fixture.debugElement.query(By.css('.igx-slider__thumb-to--active'));
                const activefromThumb = fixture.debugElement.query(By.css('.igx-slider__thumb-from--active'));
                expect(slider.value).toEqual({ lower: 60, upper: 100 });
                expect(activetoThumb).toBeNull();
                expect(activefromThumb).toBeNull();
                done();
            });
        });

        it('should switch from lower to upper thumb when the lower value is equal to the upper one', () => {
            slider.value = {
                lower: 60,
                upper: 60
            };

            fixture.detectChanges();

            const fromThumb = fixture.nativeElement.querySelector(THUMB_FROM_CLASS);
            fromThumb.dispatchEvent(new Event('focus'));
            fixture.detectChanges();

            UIInteractions.triggerKeyDownEvtUponElem('ArrowRight', fromThumb, true);
            fixture.detectChanges();

            expect((slider.value as IRangeSliderValue).lower).toBe(60);
            expect((slider.value as IRangeSliderValue).upper).toBe(60);
            expect(document.activeElement).toBe(fixture.nativeElement.querySelector(THUMB_TO_CLASS));
        });

        it('should switch from upper to lower thumb when the upper value is equal to the lower one', () => {
            slider.value = {
                lower: 60,
                upper: 60
            };
            fixture.detectChanges();

            const toThumb = fixture.nativeElement.querySelector(THUMB_TO_CLASS);
            toThumb.dispatchEvent(new Event('focus'));
            fixture.detectChanges();

            UIInteractions.triggerKeyDownEvtUponElem('ArrowLeft', toThumb, true);;
            fixture.detectChanges();

            expect((slider.value as IRangeSliderValue).lower).toBe(60);
            expect((slider.value as IRangeSliderValue).upper).toBe(60);
            expect(document.activeElement).toBe(fixture.nativeElement.querySelector(THUMB_FROM_CLASS));
        });

        it('should not change value if different key from arrows is pressed and slider is RANGE', () => {
            slider.value = {
                lower: 50,
                upper: 60
            };
            fixture.detectChanges();

            const toThumb = fixture.nativeElement.querySelector(THUMB_TO_CLASS);
            toThumb.focus();
            UIInteractions.triggerKeyDownEvtUponElem('A', toThumb, true);
            fixture.detectChanges();

            expect((slider.value as IRangeSliderValue).lower).toBe(50);
            expect((slider.value as IRangeSliderValue).upper).toBe(60);
            expect(document.activeElement).toBe(fixture.nativeElement.querySelector(THUMB_TO_CLASS));
        });

        it('should increment lower value when lower thumb is focused ' +
            'if right arrow is pressed and slider is RANGE', () => {
                slider.value = {
                    lower: 50,
                    upper: 60
                };
                fixture.detectChanges();

                const fromThumb = fixture.nativeElement.querySelector(THUMB_FROM_CLASS);

                fromThumb.dispatchEvent(new Event('focus'));
                fixture.detectChanges();

                UIInteractions.triggerKeyDownEvtUponElem('ArrowRight', fromThumb, true);
                fixture.detectChanges();

                expect((slider.value as IRangeSliderValue).lower).toBe(51);
                expect((slider.value as IRangeSliderValue).upper).toBe(60);
            });

        it('should increment upper value when upper thumb is focused' +
            'if right arrow is pressed and slider is RANGE', () => {
                slider.value = {
                    lower: 50,
                    upper: 60
                };
                fixture.detectChanges();

                const toThumb = fixture.nativeElement.querySelector(THUMB_TO_CLASS);
                toThumb.dispatchEvent(new Event('focus'));
                fixture.detectChanges();

                UIInteractions.triggerKeyDownEvtUponElem('ArrowRight', toThumb, true);
                fixture.detectChanges();
                expect((slider.value as IRangeSliderValue).lower).toBe(50);
                expect((slider.value as IRangeSliderValue).upper).toBe(61);
            });

        it('should not increment upper value when slider is disabled', () => {
            slider.disabled = true;
            slider.value = {
                lower: 50,
                upper: 60
            };
            fixture.detectChanges();

            const toThumb = fixture.nativeElement.querySelector(THUMB_TO_CLASS);
            toThumb.dispatchEvent(new Event('focus'));
            fixture.detectChanges();

            UIInteractions.triggerKeyDownEvtUponElem('ArrowRight', toThumb, true);
            fixture.detectChanges();
            expect((slider.value as IRangeSliderValue).lower).toBe(50);
            expect((slider.value as IRangeSliderValue).upper).toBe(60);
        });

    });

    describe('Slider - List View', () => {
        let fixture: ComponentFixture<SliderWithLabelsComponent>;
        let slider: IgxSliderComponent;

        beforeEach(() => {
            fixture = TestBed.createComponent(SliderWithLabelsComponent);
            slider = fixture.componentInstance.slider;
            fixture.detectChanges();
        });

        it('labels should show/hide on pointer up/down', async() => {
            const sliderEl = fixture.debugElement.query(By.css(SLIDER_CLASS)).nativeElement;
            sliderEl.dispatchEvent( new Event('pointerdown'));
            await wait(50);
            fixture.detectChanges();

            expect(sliderEl).toBeDefined();
            let activeTumb = fixture.debugElement.query(By.css('.igx-slider__thumb-to--active'));
            expect(activeTumb).not.toBeNull();

            sliderEl.dispatchEvent( new Event('pointerup'));
            await wait(slider.thumbLabelVisibilityDuration + 10);
            fixture.detectChanges();

            activeTumb = fixture.debugElement.query(By.css('.igx-slider__thumb-to--active'));
            expect(activeTumb).toBeNull();
        });

        it('should be able to change thumbLabelVisibilityDuration', async() => {
            const sliderEl = fixture.debugElement.query(By.css(SLIDER_CLASS)).nativeElement;
            slider.thumbLabelVisibilityDuration = 1000;
            sliderEl.dispatchEvent( new Event('pointerdown'));
            await wait(50);
            fixture.detectChanges();

            expect(sliderEl).toBeDefined();
            let activeTumb = fixture.debugElement.query(By.css('.igx-slider__thumb-to--active'));
            expect(activeTumb).not.toBeNull();

            sliderEl.dispatchEvent( new Event('pointerup'));
            await wait(750);
            fixture.detectChanges();

            activeTumb = fixture.debugElement.query(By.css('.igx-slider__thumb-to--active'));
            expect(activeTumb).not.toBeNull();

            await wait(300);
            fixture.detectChanges();
            activeTumb = fixture.debugElement.query(By.css('.igx-slider__thumb-to--active'));
            expect(activeTumb).toBeNull();
        });

        it('rendering of the slider should corresponds to the set labels', () => {
            const thumb = fixture.debugElement.query(By.css(THUMB_TO_CLASS));

            expect(slider).toBeDefined();
            expect(thumb).toBeDefined();
            expect(slider.upperLabel).toEqual('Winter');
            expect(slider.lowerLabel).toEqual('Winter');

            UIInteractions.triggerKeyDownEvtUponElem('ArrowRight', thumb.nativeElement, true);
            fixture.detectChanges();

            expect(slider.upperLabel).toEqual('Spring');
            UIInteractions.triggerKeyDownEvtUponElem('ArrowRight', thumb.nativeElement, true);
            fixture.detectChanges();

            expect(slider.upperLabel).toEqual('Summer');

            UIInteractions.triggerKeyDownEvtUponElem('ArrowRight', thumb.nativeElement, true);
            fixture.detectChanges();

            expect(slider.upperLabel).toEqual('Autumn');

            UIInteractions.triggerKeyDownEvtUponElem('ArrowRight', thumb.nativeElement, true);
            fixture.detectChanges();

            expect(slider.upperLabel).toEqual('Autumn');
        });

        it('when labels are enabled should not be able to set min/max and step', () => {
            slider.step = 5;
            fixture.detectChanges();

            expect(slider.step).toBe(1);

            slider.minValue = 3;
            fixture.detectChanges();

            expect(slider.minValue).toBe(0);

            slider.maxValue = 90;
            expect(slider.maxValue).toBe(3);
        });

        it('tick marks(steps) should be shown equally spread based on labels length', () => {
            const ticks = fixture.nativeElement.querySelector('.igx-slider__track-ticks');
            const sliderWidth = parseInt(fixture.nativeElement.querySelector('igx-slider').clientWidth, 10);

            expect(slider.type).toBe(SliderType.SLIDER);
            expect(ticks).toBeDefined();
            expect(slider.stepDistance).toEqual(sliderWidth / 3);
        });

        it('Upper bounds should be applied correctly', () => {
            const thumb = fixture.debugElement.query(By.css(THUMB_TO_CLASS));
            expect(slider.value).toBe(0);

            slider.lowerBound = 1;
            slider.upperBound = 2;
            fixture.detectChanges();

            expect(slider.upperBound).toBe(2);
            expect(slider.lowerBound).toBe(1);

            UIInteractions.triggerKeyDownEvtUponElem('ArrowRight', thumb.nativeElement, true);
            fixture.detectChanges();

            expect(slider.upperLabel).toEqual('Summer');
            UIInteractions.triggerKeyDownEvtUponElem('ArrowRight', thumb.nativeElement, true);
            fixture.detectChanges();

            expect(slider.upperLabel).toEqual('Summer');

            UIInteractions.triggerKeyDownEvtUponElem('ArrowLeft', thumb.nativeElement, true);
            fixture.detectChanges();

            expect(slider.upperLabel).toEqual('Spring');
            UIInteractions.triggerKeyDownEvtUponElem('ArrowLeft', thumb.nativeElement, true);
            fixture.detectChanges();

            expect(slider.upperLabel).toEqual('Spring');
        });

        it('when you try to set invalid value for lower/upper bound should not reset', () => {
            slider.lowerBound = 1;
            slider.upperBound = 2;
            fixture.detectChanges();

            slider.upperBound = 4;
            fixture.detectChanges();
            expect(slider.upperBound).toBe(2);
            slider.lowerBound = -1;
            fixture.detectChanges();
            expect(slider.lowerBound).toBe(1);

            slider.lowerBound = 3;
            fixture.detectChanges();
            expect(slider.upperBound).toBe(2);
            expect(slider.lowerBound).toBe(1);

            slider.upperBound = 0;
            fixture.detectChanges();
            expect(slider.upperBound).toBe(2);
            expect(slider.lowerBound).toBe(1);
        });

        it('Label view should not be enabled if labels array is set uncorrectly', () => {
            expect(slider.labelsViewEnabled).toBe(true);

            slider.labels = ['Winter'];
            fixture.detectChanges();

            expect(slider.labelsViewEnabled).toBe(false);

            slider.labels = [];
            fixture.detectChanges();

            expect(slider.labelsViewEnabled).toBe(false);

            slider.labels = ['Winter', 'Summer'];
            fixture.detectChanges();

            expect(slider.labelsViewEnabled).toBe(true);

            slider.labels = undefined;
            fixture.detectChanges();

            expect(slider.labelsViewEnabled).toBe(false);

            slider.labels = null;
            fixture.detectChanges();

            expect(slider.labelsViewEnabled).toBe(false);
        });

        it('should be able to track the value changes per every slide action through an event emitter', () => {
            const thumb = fixture.debugElement.query(By.css(THUMB_TO_CLASS));

            expect(slider).toBeDefined();
            expect(slider.upperLabel).toEqual('Winter');
            const valueChangeSpy = spyOn<any>(slider.onValueChange, 'emit').and.callThrough();

            UIInteractions.triggerKeyDownEvtUponElem('ArrowLeft', thumb.nativeElement, true);
            fixture.detectChanges();
            expect(valueChangeSpy).toHaveBeenCalledTimes(0);

            UIInteractions.triggerKeyDownEvtUponElem('ArrowRight', thumb.nativeElement, true);
            fixture.detectChanges();
            expect(valueChangeSpy).toHaveBeenCalledTimes(1);
            expect(valueChangeSpy).toHaveBeenCalledWith({oldValue: 0, value: 1});

            UIInteractions.triggerKeyDownEvtUponElem('ArrowRight', thumb.nativeElement, true);
            fixture.detectChanges();
            expect(valueChangeSpy).toHaveBeenCalledTimes(2);
            expect(valueChangeSpy).toHaveBeenCalledWith({oldValue: 1, value: 2});

            UIInteractions.triggerKeyDownEvtUponElem('ArrowRight', thumb.nativeElement, true);
            fixture.detectChanges();
            expect(valueChangeSpy).toHaveBeenCalledTimes(3);
            expect(valueChangeSpy).toHaveBeenCalledWith({oldValue: 2, value: 3});

            UIInteractions.triggerKeyDownEvtUponElem('ArrowRight', thumb.nativeElement, true);
            fixture.detectChanges();
            expect(valueChangeSpy).toHaveBeenCalledTimes(3);

            UIInteractions.triggerKeyDownEvtUponElem('ArrowLeft', thumb.nativeElement, true);
            fixture.detectChanges();
            expect(valueChangeSpy).toHaveBeenCalledTimes(4);
            expect(valueChangeSpy).toHaveBeenCalledWith({oldValue: 3, value: 2});
        });

        it('Dynamically change the type of the slider SLIDER, RANGE, LABEL', () => {
            expect(slider.type).toBe(SliderType.SLIDER);
            expect(slider.labelsViewEnabled).toBe(true);

            slider.labels = [];
            fixture.detectChanges();

            expect(slider.type).toBe(SliderType.SLIDER);
            expect(slider.labelsViewEnabled).toBe(false);

            let fromThumb = fixture.nativeElement.querySelector(THUMB_FROM_CLASS);
            let toThumb = fixture.nativeElement.querySelector(THUMB_TO_CLASS);

            expect(slider.type).toBe(SliderType.SLIDER);
            expect(toThumb).toBeDefined();
            expect(fromThumb).toBeFalsy();
            expect(slider.upperBound).toBe(slider.maxValue);
            expect(slider.lowerBound).toBe(slider.minValue);

            slider.type = SliderType.RANGE;
            fixture.detectChanges();

            fromThumb = fixture.nativeElement.querySelector(THUMB_FROM_CLASS);
            toThumb = fixture.nativeElement.querySelector(THUMB_TO_CLASS);

            expect(toThumb).toBeDefined();
            expect(fromThumb).toBeDefined();
            expect(slider.upperBound).toBe(100);
            expect(slider.lowerBound).toBe(0);
        });

        it('aria properties should be successfully applied', () => {
            const sliderElement = fixture.nativeElement.querySelector('igx-slider');
            const sliderRole = fixture.nativeElement.querySelector('igx-slider[role="slider"]');

            expect(sliderElement).toBeDefined();
            expect(sliderRole).toBeDefined();

            const minValue = parseInt(sliderElement.getAttribute('aria-valuemin'), 10);
            const maxValue = parseInt(sliderElement.getAttribute('aria-valuemax'), 10);
            const readOnly = sliderElement.getAttribute('aria-readonly');

            expect(minValue).toBe(slider.minValue);
            expect(maxValue).toBe(slider.maxValue);
            expect(readOnly).toBe('false');
        });
    });

    describe('Slider  type: Range - List View', () => {
        let fixture: ComponentFixture<RangeSliderWithLabelsComponent>;
        let slider: IgxSliderComponent;

        beforeEach(() => {
            fixture = TestBed.createComponent(RangeSliderWithLabelsComponent);
            slider = fixture.componentInstance.slider;
            fixture.detectChanges();
        });

        it('labels should show/hide on pointer up/down', async() => {
            const sliderEl = fixture.debugElement.query(By.css(SLIDER_CLASS)).nativeElement;
            sliderEl.dispatchEvent( new Event('pointerdown'));
            await wait(50);
            fixture.detectChanges();

            expect(sliderEl).toBeDefined();
            let activeTumb = fixture.debugElement.query(By.css('.igx-slider__thumb-from--active'));
            expect(activeTumb).not.toBeNull();

            sliderEl.dispatchEvent( new Event('pointerup'));
            await wait(slider.thumbLabelVisibilityDuration + 10);
            fixture.detectChanges();

            activeTumb = fixture.debugElement.query(By.css('.igx-slider__thumb-from--active'));
            expect(activeTumb).toBeNull();
        });

        it('should be able to change thumbLabelVisibilityDuration', async() => {
            const sliderEl = fixture.debugElement.query(By.css(SLIDER_CLASS)).nativeElement;
            slider.thumbLabelVisibilityDuration = 1000;
            sliderEl.dispatchEvent( new Event('pointerdown'));
            await wait(50);
            fixture.detectChanges();

            expect(sliderEl).toBeDefined();
            let activeTumb = fixture.debugElement.query(By.css('.igx-slider__thumb-from--active'));
            expect(activeTumb).not.toBeNull();

            sliderEl.dispatchEvent( new Event('pointerup'));
            await wait(750);
            fixture.detectChanges();

            activeTumb = fixture.debugElement.query(By.css('.igx-slider__thumb-from--active'));
            expect(activeTumb).not.toBeNull();

            await wait(300);
            fixture.detectChanges();
            activeTumb = fixture.debugElement.query(By.css('.igx-slider__thumb-from--active'));
            expect(activeTumb).toBeNull();
        });

        it('rendering of the slider should corresponds to the set labels', () => {
            const fromThumb = fixture.debugElement.query(By.css(THUMB_FROM_CLASS));
            const toThumb = fixture.debugElement.query(By.css(THUMB_TO_CLASS));

            expect(slider).toBeDefined();
            expect(fromThumb).toBeDefined();
            expect(slider.upperLabel).toEqual('Sunday');
            expect(slider.lowerLabel).toEqual('Monday');

            UIInteractions.triggerKeyDownEvtUponElem('ArrowRight', fromThumb.nativeElement, true);
            fixture.detectChanges();
            expect(fixture.componentInstance.label).toEqual({lower: 1, upper: 6});
            expect(slider.lowerLabel).toEqual('Tuesday');

            UIInteractions.triggerKeyDownEvtUponElem('ArrowRight', fromThumb.nativeElement, true);
            fixture.detectChanges();
            expect(fixture.componentInstance.label).toEqual({lower: 2, upper: 6});
            expect(slider.lowerLabel).toEqual('Wednesday');

            UIInteractions.triggerKeyDownEvtUponElem('ArrowRight', fromThumb.nativeElement, true);
            fixture.detectChanges();
            expect(fixture.componentInstance.label).toEqual({lower: 3, upper: 6});
            expect(slider.lowerLabel).toEqual('Thursday');

            UIInteractions.triggerKeyDownEvtUponElem('ArrowRight', fromThumb.nativeElement, true);
            fixture.detectChanges();
            expect(fixture.componentInstance.label).toEqual({lower: 4, upper: 6});
            expect(slider.lowerLabel).toEqual('Friday');

            UIInteractions.triggerKeyDownEvtUponElem('ArrowLeft', toThumb.nativeElement, true);
            fixture.detectChanges();
            expect(fixture.componentInstance.label).toEqual({lower: 4, upper: 5});
            expect(slider.upperLabel).toEqual('Saturday');

            UIInteractions.triggerKeyDownEvtUponElem('ArrowLeft', toThumb.nativeElement, true);
            fixture.detectChanges();
            expect(fixture.componentInstance.label).toEqual({lower: 4, upper: 4});
            expect(slider.upperLabel).toEqual('Friday');
        });

        it('when labels are enabled should not be able to set min/max and step', () => {
            expect(slider.type).toBe(SliderType.RANGE);
            expect(slider.labelsViewEnabled).toBe(true);
            slider.step = 5;
            fixture.detectChanges();

            expect(slider.step).toBe(1);

            slider.minValue = 3;
            fixture.detectChanges();

            expect(slider.minValue).toBe(0);

            slider.maxValue = 90;
            expect(slider.maxValue).toBe(6);
        });

        it('tick marks(steps) should be shown equally spread based on labels length', () => {
            const ticks = fixture.nativeElement.querySelector('.igx-slider__track-ticks');
            const sliderWidth = parseInt(fixture.nativeElement.querySelector('igx-slider').clientWidth, 10);

            expect(slider.type).toBe(SliderType.RANGE);
            expect(tick).toBeDefined();
            expect(slider.stepDistance).toEqual(sliderWidth / 6);
        });

        it('upper bounds should be applied correctly', () => {
            const toThumb = fixture.debugElement.query(By.css(THUMB_TO_CLASS));
            const fromThumb = fixture.debugElement.query(By.css(THUMB_FROM_CLASS));
            expect(slider.value).toEqual({lower: 0, upper: 6});

            slider.lowerBound = 1;
            slider.upperBound = 4;
            fixture.detectChanges();

            expect(slider.upperBound).toBe(4);
            expect(slider.lowerBound).toBe(1);

            slider.value = {lower: -1, upper: 3};
            fixture.detectChanges();

            expect(slider.value).toEqual({lower: 1, upper: 3});

            slider.value = {lower: 1, upper: 10};
            fixture.detectChanges();

            expect(slider.value).toEqual({lower: 1, upper: 4});
            UIInteractions.triggerKeyDownEvtUponElem('ArrowRight', toThumb.nativeElement, true);
            fixture.detectChanges();

            expect(slider.upperLabel).toEqual('Friday');
            UIInteractions.triggerKeyDownEvtUponElem('ArrowRight', fromThumb.nativeElement, true);
            fixture.detectChanges();

            expect(slider.lowerLabel).toEqual('Wednesday');

            UIInteractions.triggerKeyDownEvtUponElem('ArrowLeft', fromThumb.nativeElement, true);
            fixture.detectChanges();

            expect(slider.lowerLabel).toEqual('Tuesday');
            UIInteractions.triggerKeyDownEvtUponElem('ArrowLeft', fromThumb.nativeElement, true);
            fixture.detectChanges();

            expect(slider.lowerLabel).toEqual('Tuesday');
        });

        it ('when you try to set invalid value for upper/lower value they should not reset', () => {
            slider.lowerBound = 1;
            slider.upperBound = 4;
            fixture.detectChanges();

            slider.upperBound = 7;
            fixture.detectChanges();
            expect(slider.upperBound).toBe(4);
            slider.lowerBound = -1;
            fixture.detectChanges();
            expect(slider.lowerBound).toBe(1);

            slider.lowerBound = 9;
            fixture.detectChanges();
            expect(slider.upperBound).toBe(4);
            expect(slider.lowerBound).toBe(1);

            slider.upperBound = 0;
            fixture.detectChanges();
            expect(slider.upperBound).toBe(4);
            expect(slider.lowerBound).toBe(1);
        });

        it('label view should not be enabled if labels array is set uncorrectly', async() => {
            expect(slider.labelsViewEnabled).toBe(true);

            slider.labels = ['Winter'];
            fixture.detectChanges();

            expect(slider.labelsViewEnabled).toBe(false);

            slider.labels = [];
            fixture.detectChanges();

            expect(slider.labelsViewEnabled).toBe(false);

            slider.labels = ['Winter', 'Summer'];
            fixture.detectChanges();

            expect(slider.labelsViewEnabled).toBe(true);

            slider.labels = undefined;
            fixture.detectChanges();

            expect(slider.labelsViewEnabled).toBe(false);

            slider.labels = null;
            fixture.detectChanges();

            expect(slider.labelsViewEnabled).toBe(false);
        });

        it('should be able to track the value changes per every slide action through an event emitter', () => {
            const fromThumb = fixture.debugElement.query(By.css(THUMB_FROM_CLASS));
            const toThumb = fixture.debugElement.query(By.css(THUMB_TO_CLASS));

            expect(slider).toBeDefined();
            expect(fromThumb).toBeDefined();
            expect(slider.upperLabel).toEqual('Sunday');
            expect(slider.lowerLabel).toEqual('Monday');
            const valueChangeSpy = spyOn<any>(slider.onValueChange, 'emit').and.callThrough();

            UIInteractions.triggerKeyDownEvtUponElem('ArrowRight', fromThumb.nativeElement, true);
            fixture.detectChanges();
            expect(valueChangeSpy).toHaveBeenCalledTimes(1);
            expect(valueChangeSpy).toHaveBeenCalledWith({oldValue: {lower: 0, upper: 6}, value: {lower: 1, upper: 6}});

            UIInteractions.triggerKeyDownEvtUponElem('ArrowRight', fromThumb.nativeElement, true);
            fixture.detectChanges();
            expect(valueChangeSpy).toHaveBeenCalledTimes(2);
            expect(valueChangeSpy).toHaveBeenCalledWith({oldValue: {lower: 1, upper: 6}, value: {lower: 2, upper: 6}});

            UIInteractions.triggerKeyDownEvtUponElem('ArrowRight', toThumb.nativeElement, true);
            fixture.detectChanges();
            expect(valueChangeSpy).toHaveBeenCalledTimes(2);

            UIInteractions.triggerKeyDownEvtUponElem('ArrowLeft', toThumb.nativeElement, true);
            fixture.detectChanges();
            expect(valueChangeSpy).toHaveBeenCalledTimes(3);
            expect(valueChangeSpy).toHaveBeenCalledWith({oldValue: {lower: 2, upper: 6}, value: {lower: 2, upper: 5}});
        });

        it('dynamically change the type of the slider SLIDER, RANGE, LABEL', () => {
            expect(slider.type).toBe(SliderType.RANGE);
            expect(slider.labelsViewEnabled).toBe(true);

            slider.labels = [];
            fixture.detectChanges();

            expect(slider.type).toBe(SliderType.RANGE);
            expect(slider.labelsViewEnabled).toBe(false);

            let fromThumb = fixture.nativeElement.querySelector(THUMB_FROM_CLASS);
            let toThumb = fixture.nativeElement.querySelector(THUMB_TO_CLASS);

            expect(toThumb).toBeDefined();
            expect(fromThumb).toBeDefined();
            expect(slider.upperBound).toBe(slider.maxValue);
            expect(slider.lowerBound).toBe(slider.minValue);

            slider.type = SliderType.SLIDER;
            fixture.detectChanges();

            fromThumb = fixture.nativeElement.querySelector(THUMB_FROM_CLASS);
            toThumb = fixture.nativeElement.querySelector(THUMB_TO_CLASS);
            expect(slider.type).toBe(SliderType.SLIDER);
            expect(toThumb).toBeDefined();
            expect(fromThumb).toBeFalsy();
            expect(slider.upperBound).toBe(slider.maxValue);
            expect(slider.lowerBound).toBe(slider.minValue);
        });

        it('aria properties should be successfully applied', () => {
            const sliderElement = fixture.nativeElement.querySelector('igx-slider');
            const sliderRole = fixture.nativeElement.querySelector('igx-slider[role="slider"]');

            expect(sliderElement).toBeDefined();
            expect(sliderRole).toBeDefined();

            const minValue = parseInt(sliderElement.getAttribute('aria-valuemin'), 10);
            const maxValue = parseInt(sliderElement.getAttribute('aria-valuemax'), 10);
            const readOnly = sliderElement.getAttribute('aria-readonly');

            expect(minValue).toBe(slider.minValue);
            expect(maxValue).toBe(slider.maxValue);
            expect(readOnly).toBe('false');
        });
    });

    describe('General Tests', () => {
        it('custom templates for the lower/upper thumb labels should be allowed', () => {
            const fixture = TestBed.createComponent(RangeSliderWithCustomTemplateComponent);
            const slider = fixture.componentInstance.slider;
            fixture.detectChanges();

            const fromThumb = fixture.debugElement.query(By.css(THUMB_FROM_CLASS));
            const toThumb = fixture.debugElement.query(By.css(THUMB_TO_CLASS));

            expect(toThumb).toBeDefined();
            expect(fromThumb).toBeDefined();

            let customTemplates = fixture.nativeElement.querySelectorAll('span.custom');

            expect(customTemplates).toBeDefined();
            expect(customTemplates.length).toBe(2);

            slider.type = SliderType.SLIDER;
            fixture.detectChanges();
            customTemplates = fixture.nativeElement.querySelectorAll('span.custom');

            expect(customTemplates.length).toBe(1);

        });
        it('should draw tick marks', () => {
            const fixture = TestBed.createComponent(SliderInitializeTestComponent);
            const ticks = fixture.nativeElement.querySelector('.igx-slider__track-ticks');

            // Slider steps <= 1. No marks should be drawn;
            expect(ticks.style.background).toBeFalsy();

            // Slider steps > 1. Should draw tick marks;
            fixture.componentInstance.slider.step = 10;
            fixture.detectChanges();

            expect(ticks.style.background).toBeTruthy();
        });

        it(`When setting min and max value for range slider,
            max value should be applied firstly, due correct appliement of the min value.`, () => {
                const fix = TestBed.createComponent(SliderMinMaxComponent);
                fix.detectChanges();

                const slider = fix.componentInstance.slider;
                slider.type = SliderType.RANGE;

                fix.detectChanges();

                expect(slider.minValue).toEqual(fix.componentInstance.minValue);
                expect(slider.maxValue).toEqual(fix.componentInstance.maxValue);
            });

        it('should track min/maxValue if lower/upperBound are undefined (issue #920)', () => {
            const fixture = TestBed.createComponent(SliderTestComponent);
            fixture.detectChanges();

            const slider = fixture.componentInstance.slider;

            expect(slider.minValue).toBe(0);
            expect(slider.maxValue).toBe(10);
            expect(slider.lowerBound).toBe(0);
            expect(slider.upperBound).toBe(10);

            fixture.componentInstance.changeMinValue(5);
            fixture.detectChanges();
            fixture.componentInstance.changeMaxValue(8);
            fixture.detectChanges();

            expect(slider.minValue).toBe(5);
            expect(slider.maxValue).toBe(8);
            expect(slider.lowerBound).toBe(5);
            expect(slider.upperBound).toBe(8);
        });

        it('should track min/maxValue and invalidate the value if lower/upperBound are undefined (issue #920)', () => {
            const fixture = TestBed.createComponent(SliderTestComponent);
            fixture.detectChanges();

            const slider = fixture.componentInstance.slider;

            fixture.componentInstance.slider.value = 5;
            fixture.detectChanges();

            fixture.componentInstance.changeMinValue(6);
            fixture.detectChanges();

            expect(slider.value).toBe(6);
            expect(slider.minValue).toBe(6);
            expect(slider.maxValue).toBe(10);
            expect(slider.lowerBound).toBe(6);
            expect(slider.upperBound).toBe(10);

            fixture.componentInstance.slider.value = 9;
            fixture.detectChanges();
            expect(slider.value).toBe(9);

            fixture.componentInstance.changeMaxValue(8);
            fixture.detectChanges();

            expect(slider.value).toBe(8);
            expect(slider.minValue).toBe(6);
            expect(slider.maxValue).toBe(8);
            expect(slider.lowerBound).toBe(6);
            expect(slider.upperBound).toBe(8);
        });

        it('should stop tracking min/maxValue if lower/upperBound is set from outside (issue #920)', () => {
            const fixture = TestBed.createComponent(SliderTestComponent);
            fixture.detectChanges();

            const slider = fixture.componentInstance.slider;

            slider.lowerBound = 3;
            slider.upperBound = 8;
            fixture.detectChanges();

            fixture.componentInstance.changeMinValue(2);
            fixture.detectChanges();
            fixture.componentInstance.changeMaxValue(9);
            fixture.detectChanges();

            expect(slider.minValue).toBe(2);
            expect(slider.maxValue).toBe(9);
            expect(slider.lowerBound).toBe(3);
            expect(slider.upperBound).toBe(8);
        });

        it('should track min/maxValue if lower/upperBound are undefined - range slider (issue #920)', () => {
            const fixture = TestBed.createComponent(SliderTestComponent);
            fixture.detectChanges();

            const slider = fixture.componentInstance.slider;
            fixture.componentInstance.type = SliderType.RANGE;
            fixture.detectChanges();

            expect(slider.minValue).toBe(0);
            expect(slider.maxValue).toBe(10);
            expect(slider.lowerBound).toBe(0);
            expect(slider.upperBound).toBe(10);

            fixture.componentInstance.changeMinValue(5);
            fixture.detectChanges();
            fixture.componentInstance.changeMaxValue(8);
            fixture.detectChanges();

            expect(slider.minValue).toBe(5);
            expect(slider.maxValue).toBe(8);
            expect(slider.lowerBound).toBe(5);
            expect(slider.upperBound).toBe(8);
        });

        it('should track min/maxValue and invalidate the value if lower/upperBound are undefined - range slider (issue #920)', () => {
            const fixture = TestBed.createComponent(SliderTestComponent);
            fixture.detectChanges();

            const slider = fixture.componentInstance.slider;
            fixture.componentInstance.type = SliderType.RANGE;
            fixture.detectChanges();

            fixture.componentInstance.slider.value = {
                lower: 2,
                upper: 9
            };

            fixture.componentInstance.changeMinValue(5);
            fixture.componentInstance.changeMaxValue(7);
            fixture.detectChanges();

            expect(slider.minValue).toBe(5);
            expect(slider.maxValue).toBe(7);
            expect(slider.lowerBound).toBe(5);
            expect(slider.upperBound).toBe(7);
            expect((slider.value as IRangeSliderValue).lower).toBe(5);
            expect((slider.value as IRangeSliderValue).upper).toBe(7);
        });

        it('Lower and upper bounds should not exceed min and max values', () => {
            const fix = TestBed.createComponent(SliderTestComponent);
            fix.detectChanges();

            const componentInst = fix.componentInstance;
            const slider = componentInst.slider;
            const expectedMinVal = 0;
            const expectedMaxVal = 10;

            expect(slider.minValue).toEqual(expectedMinVal);
            expect(slider.maxValue).toEqual(expectedMaxVal);

            const expectedLowerBound = -1;
            const expectedUpperBound = 11;
            slider.lowerBound = expectedLowerBound;
            slider.upperBound = expectedUpperBound;

            expect(slider.lowerBound).toEqual(expectedMinVal);
            expect(slider.upperBound).toEqual(expectedMaxVal);
        });
    });

    describe('EditorProvider', () => {
        it('Should return correct edit element (single)', () => {
            const fixture = TestBed.createComponent(SliderInitializeTestComponent);
            fixture.detectChanges();

            const instance = fixture.componentInstance.slider;
            const editElement = fixture.debugElement.query(By.css(THUMB_TO_CLASS)).nativeElement;

            expect(instance.getEditElement()).toBe(editElement);
        });

        it('Should return correct edit element (range)', () => {
            const fixture = TestBed.createComponent(SliderInitializeTestComponent);
            const instance = fixture.componentInstance.slider;
            instance.type = SliderType.RANGE;
            fixture.detectChanges();

            const editElement = fixture.debugElement.query(By.css(THUMB_FROM_CLASS)).nativeElement;

            expect(instance.getEditElement()).toBe(editElement);
        });
    });

    function panRight(element, elementHeight, elementWidth, duration) {
        const panOptions = {
            deltaX: elementWidth * 0.6,
            deltaY: 0,
            duration,
            pos: [element.offsetLeft, elementHeight * 0.5]
        };

        return new Promise((resolve, reject) => {
            Simulator.gestures.pan(element, panOptions, () => {
                resolve();
            });
        });
    }
});
@Component({
    selector: 'igx-slider-test-component',
    template: `<igx-slider #slider>
    </igx-slider>`
})
class SliderInitializeTestComponent {
    @ViewChild(IgxSliderComponent) public slider: IgxSliderComponent;
}

@Component({
    template: `
        <igx-slider [minValue]='minValue' [maxValue]='maxValue'></igx-slider>
    `
})
export class SliderMinMaxComponent {
    @ViewChild(IgxSliderComponent) public slider: IgxSliderComponent;

    public minValue = 150;
    public maxValue = 300;
}

@Component({
    selector: 'igx-slider-test-component',
    template: `<div>
                    <igx-slider #slider [minValue]="minValue"
                                        [maxValue]="maxValue"
                                        [type]="type">
                    </igx-slider>
                </div>`
})
class SliderTestComponent {
    @ViewChild(IgxSliderComponent) public slider: IgxSliderComponent;

    minValue = 0;
    maxValue = 10;
    type = SliderType.SLIDER;

    changeMinValue(val: number) {
        this.minValue = val;
    }

    changeMaxValue(val: number) {
        this.maxValue = val;
    }
}

@Component({
    template: `
    <igx-slider [labels]="['Winter', 'Spring', 'Summer', 'Autumn']">
    </igx-slider> `
})
class SliderWithLabelsComponent {
    @ViewChild(IgxSliderComponent) public slider: IgxSliderComponent;
}

@Component({
    template: `
    <igx-slider [(ngModel)]='label' [type]="type"
        [labels]="['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']">
    </igx-slider> `
})
class RangeSliderWithLabelsComponent {
    @ViewChild(IgxSliderComponent) public slider: IgxSliderComponent;
    public label;
    public type = SliderType.RANGE;
}

@Component({
    template: `
    <igx-slider [(ngModel)]='label' [type]="type"
        [labels]="['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']">
        <ng-template igxSliderThumbFrom let-value let-labels="labels">
            <span class="custom"> Lower {{ labels[value.lower] }}</span>
        </ng-template>
        <ng-template igxSliderThumbTo let-value let-labels="labels">
            <span class="custom"> Upper {{ labels[value.upper] }}</span>
        </ng-template>
    </igx-slider>
    `

})
class RangeSliderWithCustomTemplateComponent {
    @ViewChild(IgxSliderComponent) public slider: IgxSliderComponent;
    public type = SliderType.RANGE;
}
