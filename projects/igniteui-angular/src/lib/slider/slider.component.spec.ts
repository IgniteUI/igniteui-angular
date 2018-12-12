import { Component, ViewChild } from '@angular/core';
import { async, TestBed, ComponentFixture, fakeAsync, tick, flush } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { IgxSliderComponent, IgxSliderModule, IRangeSliderValue, SliderType } from './slider.component';
import { UIInteractions, wait } from '../test-utils/ui-interactions.spec';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { configureTestSuite } from '../test-utils/configure-suite';

declare var Simulator: any;

describe('IgxSlider', () => {
    configureTestSuite();
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                SliderInitializeTestComponent,
                SliderMinMaxComponent,
                SliderTestComponent
            ],
            imports: [
                IgxSliderModule, NoopAnimationsModule
            ]
        }).compileComponents();
    }));

    describe('Base tests', () => {
        configureTestSuite();
        let fixture: ComponentFixture<SliderInitializeTestComponent>;
        let slider: IgxSliderComponent;

        beforeEach(() => {
            fixture = TestBed.createComponent(SliderInitializeTestComponent);
            slider = fixture.componentInstance.slider;
            fixture.detectChanges();
        });

        it('should have lower bound equal to min value when lower bound is not set', () => {
            const domSlider = fixture.debugElement.query(By.css('igx-slider')).nativeElement;

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

            const fromThumb = fixture.nativeElement.querySelector('.igx-slider__thumb-to');
            fromThumb.focus();
            UIInteractions.triggerKeyDownEvtUponElem('ArrowRight', fromThumb, true);

            fixture.detectChanges();
            expect(Math.round(slider.value as number)).toBe(61);
        });

        it('should change value from 60 to 59 when left arrow is pressed and slider is SLIDER', () => {
            slider.value = 60;
            fixture.detectChanges();

            const toThumb = fixture.nativeElement.querySelector('.igx-slider__thumb-to');
            toThumb.focus();
            UIInteractions.triggerKeyDownEvtUponElem('ArrowLeft', toThumb, true);

            fixture.detectChanges();
            expect(Math.round(slider.value as number)).toBe(59);
        });

        it('should not move thumb slider and value should remain the same when slider is disabled', fakeAsync(() => {
            slider.disabled = true;
            slider.value = 30;
            tick();
            fixture.detectChanges();

            const sliderElement = fixture.nativeElement.querySelector('.igx-slider');
            panRight(sliderElement, sliderElement.offsetHeight, sliderElement.offsetWidth, 200);
            tick(1000);
            fixture.detectChanges();
            expect(Math.round(slider.value as number)).toBe(30);
        }));

        xit('should move thumb slider to value 60', (async () => {
            slider.value = 30;
            fixture.detectChanges();
            expect(Math.round(slider.value as number)).toBe(30);

            const sliderElement = fixture.nativeElement.querySelector('.igx-slider');
            await panRight(sliderElement, sliderElement.offsetHeight, sliderElement.offsetWidth, 200);
            await wait(100);

            expect(Math.round(slider.value as number)).toBe(60);
        }));

        it('Value should remain to the max one if it exceeds.', () => {
            const fix = TestBed.createComponent(SliderMinMaxComponent);
            fix.detectChanges();

            const slider = fix.componentInstance.slider;
            let expectedVal = 150;
            let expectedMax = 300;

            expect(slider.value).toEqual(expectedVal);
            expect(slider.maxValue).toEqual(expectedMax);

            expectedVal = 250;
            expectedMax = 200;
            slider.maxValue = expectedMax;
            slider.value = expectedVal;
            fix.detectChanges();

            expect(slider.value).not.toEqual(expectedVal);
            expect(slider.value).toEqual(expectedMax);
            expect(slider.maxValue).toEqual(expectedMax);
        });

        function panRight(element, elementHeight, elementWidth, duration) {
            const panOptions = {
                deltaX: elementWidth * 0.6,
                deltaY: 0,
                duration,
                pos: [element.offsetLeft, elementHeight * 0.5]
            };

            return new Promise((resolve, reject) => {
                // force touch (https://github.com/hammerjs/hammer.js/issues/1065)
                Simulator.setType('touch');
                Simulator.gestures.pan(element, panOptions, () => {
                    resolve();
                });
            });
        }
    });

    describe('RANGE slider Base tests', () => {
        configureTestSuite();
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

        it('should switch from left thumb to be focused upper when lower value is near upper', () => {
            slider.value = {
                lower: 59,
                upper: 60
            };

            fixture.detectChanges();

            const fromThumb = fixture.nativeElement.querySelector('.igx-slider__thumb-from');
            fromThumb.dispatchEvent(new Event('focus'));
            UIInteractions.triggerKeyDownEvtUponElem('ArrowRight', fromThumb, true);
            fixture.detectChanges();

            expect((slider.value as IRangeSliderValue).lower).toBe(59);
            expect((slider.value as IRangeSliderValue).upper).toBe(60);
            expect(document.activeElement).toBe(fixture.nativeElement.querySelector('.igx-slider__thumb-to'));
        });

        it('should switch from right thumb to be focused lower when upper value is near lower', () => {
            slider.value = {
                lower: 59,
                upper: 60
            };
            fixture.detectChanges();

            const toThumb = fixture.nativeElement.querySelector('.igx-slider__thumb-to');
            toThumb.dispatchEvent(new Event('focus'));
            UIInteractions.triggerKeyDownEvtUponElem('ArrowLeft', toThumb, true);
            fixture.detectChanges();

            expect((slider.value as IRangeSliderValue).lower).toBe(59);
            expect((slider.value as IRangeSliderValue).upper).toBe(60);
            expect(document.activeElement).toBe(fixture.nativeElement.querySelector('.igx-slider__thumb-from'));
        });

        it('should not change value if different key from arrows is pressed and slider is RANGE', () => {
            slider.value = {
                lower: 50,
                upper: 60
            };
            fixture.detectChanges();

            const toThumb = fixture.nativeElement.querySelector('.igx-slider__thumb-to');
            toThumb.focus();
            UIInteractions.triggerKeyDownEvtUponElem('A', toThumb, true);
            fixture.detectChanges();

            expect((slider.value as IRangeSliderValue).lower).toBe(50);
            expect((slider.value as IRangeSliderValue).upper).toBe(60);
            expect(document.activeElement).toBe(fixture.nativeElement.querySelector('.igx-slider__thumb-to'));
        });

        it('should increment lower value when lower thumb is focused ' +
            'if right arrow is pressed and slider is RANGE', fakeAsync(() => {
                slider.value = {
                    lower: 50,
                    upper: 60
                };

                fixture.detectChanges();
                flush();

                const fromThumb = fixture.nativeElement.querySelector('.igx-slider__thumb-from');

                fromThumb.dispatchEvent(new Event('focus'));
                UIInteractions.triggerKeyDownEvtUponElem('ArrowRight', fromThumb, true);
                flush();
                fixture.detectChanges();

                expect((slider.value as IRangeSliderValue).lower).toBe(51);
                expect((slider.value as IRangeSliderValue).upper).toBe(60);
            }));

        it('should increment upper value when upper thumb is focused' +
            'if right arrow is pressed and slider is RANGE', fakeAsync(() => {
                slider.value = {
                    lower: 50,
                    upper: 60
                };
                flush();
                fixture.detectChanges();

                const toThumb = fixture.nativeElement.querySelector('.igx-slider__thumb-to');
                toThumb.focus();

                UIInteractions.triggerKeyDownEvtUponElem('ArrowRight', toThumb, true);
                flush();
                fixture.detectChanges();
                expect((slider.value as IRangeSliderValue).lower).toBe(50);
                expect((slider.value as IRangeSliderValue).upper).toBe(61);
            }));

        it('should not increment upper value when slider is disabled', fakeAsync(() => {
            slider.disabled = true;
            slider.value = {
                lower: 50,
                upper: 60
            };
            flush();
            fixture.detectChanges();

            const toThumb = fixture.nativeElement.querySelector('.igx-slider__thumb-to');
            toThumb.focus();

            UIInteractions.triggerKeyDownEvtUponElem('ArrowRight', toThumb, true);
            flush();
            fixture.detectChanges();
            expect((slider.value as IRangeSliderValue).lower).toBe(50);
            expect((slider.value as IRangeSliderValue).upper).toBe(60);
        }));
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
    })

    describe('EditorProvider', () => {
        it('Should return correct edit element (single)', () => {
            const fixture = TestBed.createComponent(SliderInitializeTestComponent);
            fixture.detectChanges();

            const instance = fixture.componentInstance.slider;
            const editElement = fixture.debugElement.query(By.css('.igx-slider__thumb-to')).nativeElement;

            expect(instance.getEditElement()).toBe(editElement);
        });

        it('Should return correct edit element (range)', () => {
            const fixture = TestBed.createComponent(SliderInitializeTestComponent);
            const instance = fixture.componentInstance.slider;
            instance.type = SliderType.RANGE;
            fixture.detectChanges();

            const editElement = fixture.debugElement.query(By.css('.igx-slider__thumb-from')).nativeElement;

            expect(instance.getEditElement()).toBe(editElement);
        });
    });
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
