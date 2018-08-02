import { Component, ViewChild } from '@angular/core';
import { async, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {IgxSliderComponent, IgxSliderModule, IRangeSliderValue, SliderType} from './slider.component';

declare var Simulator: any;

describe('IgxSlider', () => {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                SliderInitializeTestComponent,
                SliderMinMaxComponent,
                SliderTestComponent
            ],
            imports: [
                IgxSliderModule
            ]
        }).compileComponents();
    }));

    afterEach(() => {

    });

    it('should have lower bound equal to min value when lower bound is not set', () => {
        const fixture = TestBed.createComponent(SliderInitializeTestComponent);
        fixture.detectChanges();
        const domSlider = fixture.debugElement.query(By.css('igx-slider')).nativeElement;

        expect(fixture.componentInstance.slider.id).toContain('igx-slider-');
        expect(domSlider.id).toContain('igx-slider-');
        expect(fixture.componentInstance.slider.lowerBound)
            .toBe(fixture.componentInstance.slider.minValue);
    });

    it('should have upper bound equal to max value when upper bound is not set', () => {
        const fixture = TestBed.createComponent(SliderInitializeTestComponent);
        fixture.detectChanges();

        expect(fixture.componentInstance.slider.upperBound)
            .toBe(fixture.componentInstance.slider.maxValue);
    });

    it(`should have lower value equal to lower bound when
        lower value is not set and slider type is RANGE`, () => {
        const fixture = TestBed.createComponent(SliderInitializeTestComponent);
        fixture.componentInstance.slider.type = SliderType.RANGE;
        fixture.detectChanges();

        expect((fixture.componentInstance.slider.value as IRangeSliderValue).lower)
            .toBe(fixture.componentInstance.slider.lowerBound);
    });

    it(`should have upper value equal to upper bound when
        lower value is not set and slider type is RANGE`, () => {
        const fixture = TestBed.createComponent(SliderInitializeTestComponent);
        fixture.componentInstance.slider.type = SliderType.RANGE;
        fixture.detectChanges();

        expect((fixture.componentInstance.slider.value as IRangeSliderValue).upper)
            .toBe(fixture.componentInstance.slider.upperBound);
    });

    it(`should have upper value equal to lower bound when
        lower value is not set and slider type is SLIDER`, () => {
        const fixture = TestBed.createComponent(SliderInitializeTestComponent);
        fixture.componentInstance.slider.type = SliderType.SLIDER;
        fixture.detectChanges();

        expect(fixture.componentInstance.slider.value)
            .toBe(fixture.componentInstance.slider.lowerBound);
    });

    it('should change minValue', () => {
        const fixture = TestBed.createComponent(SliderInitializeTestComponent);
        const expectedMinValue = 3;
        fixture.componentInstance.slider.minValue = expectedMinValue;

        fixture.detectChanges();

        expect(fixture.componentInstance.slider.minValue).toBe(expectedMinValue);
    });

    it('should change maxValue', () => {
        const fixture = TestBed.createComponent(SliderInitializeTestComponent);
        const expectedMaxValue = 15;
        fixture.componentInstance.slider.maxValue = expectedMaxValue;

        fixture.detectChanges();

        expect(fixture.componentInstance.slider.maxValue).toBe(expectedMaxValue);
    });

    it('should reduce minValue when greater than maxValue', () => {
        const fixture = TestBed.createComponent(SliderInitializeTestComponent);
        fixture.componentInstance.slider.maxValue = 6;
        fixture.componentInstance.slider.minValue = 10;

        const expectedMinValue = fixture.componentInstance.slider.maxValue - 1;
        fixture.detectChanges();

        expect(fixture.componentInstance.slider.minValue).toBe(expectedMinValue);
        expect(fixture.componentInstance.slider.minValue).toBeLessThan(fixture.componentInstance.slider.maxValue);
    });

    it('should increase minValue when greater than maxValue', () => {
        const fixture = TestBed.createComponent(SliderInitializeTestComponent);
        fixture.componentInstance.slider.minValue = 3;
        fixture.componentInstance.slider.maxValue = -5;

        const expectedMaxValue = fixture.componentInstance.slider.minValue + 1;
        fixture.detectChanges();

        expect(fixture.componentInstance.slider.maxValue).toBe(expectedMaxValue);
        expect(fixture.componentInstance.slider.maxValue).toBeGreaterThan(fixture.componentInstance.slider.minValue);
    });

    it('should change lowerBound', () => {
        const fixture = TestBed.createComponent(SliderInitializeTestComponent);
        const expectedLowerBound = 3;
        fixture.componentInstance.slider.lowerBound = expectedLowerBound;
        fixture.componentInstance.slider.upperBound = 20;

        fixture.detectChanges();

        expect(fixture.componentInstance.slider.lowerBound).toBe(expectedLowerBound);
    });

    it('should change upperBound', () => {
        const fixture = TestBed.createComponent(SliderInitializeTestComponent);
        const expectedUpperBound = 40;
        fixture.componentInstance.slider.upperBound = expectedUpperBound;
        fixture.componentInstance.slider.lowerBound = 2;

        fixture.detectChanges();

        expect(fixture.componentInstance.slider.upperBound).toBe(expectedUpperBound);
    });

    it('should set lowerBound to be same as minValue if exceeds upperBound', () => {
        const fixture = TestBed.createComponent(SliderInitializeTestComponent);
        fixture.componentInstance.slider.upperBound = 20;
        fixture.componentInstance.slider.lowerBound = 40;

        fixture.detectChanges();

        expect(fixture.componentInstance.slider.lowerBound).toBe(fixture.componentInstance.slider.minValue);
        expect(fixture.componentInstance.slider.lowerBound).toBeLessThan(fixture.componentInstance.slider.upperBound);
    });

    it('should set upperBound to be same as maxValue if exceeds lowerBound', () => {
        const fixture = TestBed.createComponent(SliderInitializeTestComponent);
        fixture.componentInstance.slider.lowerBound = 40;
        fixture.componentInstance.slider.upperBound = 20;

        fixture.detectChanges();

        expect(fixture.componentInstance.slider.upperBound).toBe(fixture.componentInstance.slider.maxValue);
        expect(fixture.componentInstance.slider.upperBound)
            .toBeGreaterThan(fixture.componentInstance.slider.lowerBound);
    });

    it('should set upperBound to be same as maxValue if exceeds lowerBound', () => {
        const fixture = TestBed.createComponent(SliderInitializeTestComponent);
        fixture.componentInstance.slider.lowerBound = 40;
        fixture.componentInstance.slider.upperBound = 20;

        fixture.detectChanges();

        expect(fixture.componentInstance.slider.upperBound).toBe(fixture.componentInstance.slider.maxValue);
        expect(fixture.componentInstance.slider.upperBound)
            .toBeGreaterThan(fixture.componentInstance.slider.lowerBound);
    });

    it('should not set upper value outside bounds slider when slider is SLIDER', () => {
        const fixture = TestBed.createComponent(SliderInitializeTestComponent);
        fixture.componentInstance.slider.lowerBound = 10;
        fixture.componentInstance.slider.upperBound = 40;

        fixture.detectChanges();

        fixture.componentInstance.slider.value = 20;

        fixture.detectChanges();

        fixture.componentInstance.slider.value = 45;

        expect(fixture.componentInstance.slider.value).toBe(20);
    });

    it('should not set upper value to outside bounds slider when slider is RANGE', () => {
        const fixture = TestBed.createComponent(SliderInitializeTestComponent);
        fixture.componentInstance.slider.lowerBound = 10;
        fixture.componentInstance.slider.upperBound = 40;
        fixture.componentInstance.slider.type = SliderType.RANGE;

        fixture.detectChanges();

        fixture.componentInstance.slider.value = {
            lower: 20,
            upper: 30
        };

        fixture.detectChanges();

        fixture.componentInstance.slider.value = {
            lower: 20,
            upper: 50
        };

        expect(fixture.componentInstance.slider.value.lower).toBe(20);
        expect(fixture.componentInstance.slider.value.upper).toBe(30);
    });

    it('should not set value upper when is less than lower value when slider is RANGE', () => {
        const fixture = TestBed.createComponent(SliderInitializeTestComponent);
        fixture.componentInstance.slider.lowerBound = 10;
        fixture.componentInstance.slider.upperBound = 40;
        fixture.componentInstance.slider.type = SliderType.RANGE;

        fixture.detectChanges();

        fixture.componentInstance.slider.value = {
            lower: 20,
            upper: 30
        };

        fixture.detectChanges();

        fixture.componentInstance.slider.value = {
            lower: 20,
            upper: 15
        };

        expect(fixture.componentInstance.slider.value.lower).toBe(20);
        expect(fixture.componentInstance.slider.value.upper).toBe(30);
    });

    it('should not set lower value outside bounds slider when slider is RANGE', () => {
        const fixture = TestBed.createComponent(SliderInitializeTestComponent);
        fixture.componentInstance.slider.lowerBound = 10;
        fixture.componentInstance.slider.upperBound = 40;
        fixture.componentInstance.slider.type = SliderType.RANGE;

        fixture.detectChanges();

        fixture.componentInstance.slider.value = {
            lower: 20,
            upper: 30
        };

        fixture.detectChanges();

        fixture.componentInstance.slider.value = {
            lower: 5,
            upper: 30
        };

        expect(fixture.componentInstance.slider.value.lower).toBe(20);
        expect(fixture.componentInstance.slider.value.upper).toBe(30);
    });

    it('should not set value lower when is more than upper value when slider is RANGE', () => {
        const fixture = TestBed.createComponent(SliderInitializeTestComponent);
        fixture.componentInstance.slider.lowerBound = 10;
        fixture.componentInstance.slider.upperBound = 40;
        fixture.componentInstance.slider.type = SliderType.RANGE;

        fixture.detectChanges();

        fixture.componentInstance.slider.value = {
            lower: 20,
            upper: 30
        };

        fixture.detectChanges();

        fixture.componentInstance.slider.value = {
            lower: 35,
            upper: 30
        };

        expect(fixture.componentInstance.slider.value.lower).toBe(20);
        expect(fixture.componentInstance.slider.value.upper).toBe(30);
    });

    it('should set upperBound to be same as maxValue if exceeds lowerBound', () => {
        const fixture = TestBed.createComponent(SliderInitializeTestComponent);
        fixture.componentInstance.slider.lowerBound = 40;
        fixture.componentInstance.slider.upperBound = 20;

        fixture.detectChanges();

        expect(fixture.componentInstance.slider.upperBound).toBe(fixture.componentInstance.slider.maxValue);
        expect(fixture.componentInstance.slider.upperBound)
            .toBeGreaterThan(fixture.componentInstance.slider.lowerBound);
    });

    it('should set slider width', () => {
        const fixture = TestBed.createComponent(SliderInitializeTestComponent);
        fixture.detectChanges();

        // fixture.componentInstance.slider.w
        expect(fixture.componentInstance.slider.upperBound).toBe(fixture.componentInstance.slider.maxValue);
        expect(fixture.componentInstance.slider.upperBound)
            .toBeGreaterThan(fixture.componentInstance.slider.lowerBound);
    });

    xit('should move thumb slider to value 60', (done) => {
        let fixture;
        let slider: IgxSliderComponent;
        TestBed.compileComponents().then(() => {
            fixture = TestBed.createComponent(SliderInitializeTestComponent);
            slider = fixture.componentInstance.slider;
            fixture.detectChanges();

            return fixture.whenStable();
        }).then(() => {
            const sliderElement = fixture.nativeElement.querySelector('.igx-slider');
            return panRight(sliderElement,
                sliderElement.offsetHeight,
                sliderElement.offsetWidth,
                200);
        }).then(() => {
            expect(Math.round(slider.value as number)).toBe(60);
            done();
        });
    }, 5000);

    it('should not move thumb slider and value should remain the same when slider is disabled', (done) => {
        let fixture;
        let slider: IgxSliderComponent;
        TestBed.compileComponents().then(() => {
            fixture = TestBed.createComponent(SliderInitializeTestComponent);
            slider = fixture.componentInstance.slider;
            slider.disabled = true;
            slider.value = 30;

            fixture.detectChanges();

            return fixture.whenStable();
        }).then(() => {
            const sliderElement = fixture.nativeElement.querySelector('.igx-slider');
            return panRight(sliderElement,
                sliderElement.offsetHeight,
                sliderElement.offsetWidth,
                200);
        }).then(() => {
            expect(Math.round(slider.value as number)).toBe(30);
            done();
        });
    }, 5000);

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

    it('should change value from 60 to 61 when right arrow is pressed and slider is SLIDER', (done) => {
        let fixture;
        let slider: IgxSliderComponent;
        TestBed.compileComponents().then(() => {
            fixture = TestBed.createComponent(SliderInitializeTestComponent);
            slider = fixture.componentInstance.slider;
            fixture.detectChanges();

            slider.value = 60;

            return fixture.whenStable();
        }).then(() => {
            const fromThumb = fixture.nativeElement.querySelector('.igx-slider__thumb-to');
            fromThumb.focus();
            return simulateKeyDown(fromThumb, 'ArrowRight');
        }).then(() => {
            expect(Math.round(slider.value as number)).toBe(61);
            done();
        });
    }, 5000);

    it('should change value from 60 to 59 when left arrow is pressed and slider is SLIDER', (done) => {
        let fixture;
        let slider: IgxSliderComponent;
        TestBed.compileComponents().then(() => {
            fixture = TestBed.createComponent(SliderInitializeTestComponent);
            slider = fixture.componentInstance.slider;
            fixture.detectChanges();

            slider.value = 60;

            return fixture.whenStable();
        }).then(() => {
            const toThumb = fixture.nativeElement.querySelector('.igx-slider__thumb-to');
            toThumb.focus();
            return simulateKeyDown(toThumb, 'ArrowLeft');
        }).then(() => {
            expect(Math.round(slider.value as number)).toBe(59);
            done();
        });
    }, 5000);

    it('should switch from left thumb to be focused upper when lower value is near upper' +
        'when slider is RANGE', (done) => {
        let fixture;
        let slider: IgxSliderComponent;
        TestBed.compileComponents().then(() => {
            fixture = TestBed.createComponent(SliderInitializeTestComponent);
            slider = fixture.componentInstance.slider;
            slider.type = SliderType.RANGE;

            fixture.detectChanges();

            slider.value = {
                lower: 59,
                upper: 60
            };

            return fixture.whenStable();
        }).then(() => {
            const fromThumb = fixture.nativeElement.querySelector('.igx-slider__thumb-from');
            fromThumb.focus();
            return simulateKeyDown(fromThumb, 'ArrowRight');
        }).then(() => {
            expect((slider.value as IRangeSliderValue).lower).toBe(59);
            expect((slider.value as IRangeSliderValue).upper).toBe(60);
            expect(document.activeElement).toBe(fixture.nativeElement.querySelector('.igx-slider__thumb-to'));
            done();
        });
    }, 5000);

    it('should switch from right thumb to be focused lower when upper value is near lower' +
        'when slider is RANGE', (done) => {
        let fixture;
        let slider: IgxSliderComponent;
        TestBed.compileComponents().then(() => {
            fixture = TestBed.createComponent(SliderInitializeTestComponent);
            slider = fixture.componentInstance.slider;
            slider.type = SliderType.RANGE;

            fixture.detectChanges();

            slider.value = {
                lower: 59,
                upper: 60
            };

            return fixture.whenStable();
        }).then(() => {
            const toThumb = fixture.nativeElement.querySelector('.igx-slider__thumb-to');
            toThumb.focus();
            return simulateKeyDown(toThumb, 'ArrowLeft');
        }).then(() => {
            expect((slider.value as IRangeSliderValue).lower).toBe(59);
            expect((slider.value as IRangeSliderValue).upper).toBe(60);
            expect(document.activeElement).toBe(fixture.nativeElement.querySelector('.igx-slider__thumb-from'));
            done();
        });
    }, 5000);

    it('should not change value if different key from arrows is pressed and slider is SLIDER', (done) => {
        let fixture;
        let slider: IgxSliderComponent;
        TestBed.compileComponents().then(() => {
            fixture = TestBed.createComponent(SliderInitializeTestComponent);
            slider = fixture.componentInstance.slider;
            slider.type = SliderType.RANGE;

            fixture.detectChanges();

            slider.value = {
                lower: 50,
                upper: 60
            };

            return fixture.whenStable();
        }).then(() => {
            const toThumb = fixture.nativeElement.querySelector('.igx-slider__thumb-to');
            toThumb.focus();
            return simulateKeyDown(toThumb, 'A');
        }).then(() => {
            expect((slider.value as IRangeSliderValue).lower).toBe(50);
            expect((slider.value as IRangeSliderValue).upper).toBe(60);
            expect(document.activeElement).toBe(fixture.nativeElement.querySelector('.igx-slider__thumb-to'));
            done();
        });
    }, 5000);

    it('should increment lower value when lower thumb is focused' +
        'if right arrow is pressed and slider is RANGE', (done) => {
        let fixture;
        let slider: IgxSliderComponent;
        TestBed.compileComponents().then(() => {
            fixture = TestBed.createComponent(SliderInitializeTestComponent);
            slider = fixture.componentInstance.slider;
            slider.type = SliderType.RANGE;

            fixture.detectChanges();

            slider.value = {
                lower: 50,
                upper: 60
            };

            return fixture.whenStable();
        }).then(() => {
            const fromThumb = fixture.nativeElement.querySelector('.igx-slider__thumb-from');
            fromThumb.focus();

            return simulateKeyDown(fromThumb, 'ArrowRight');
        }).then(() => {
            expect((slider.value as IRangeSliderValue).lower).toBe(51);
            expect((slider.value as IRangeSliderValue).upper).toBe(60);
            done();
        });
    }, 5000);

    it('should increment upper value when upper thumb is focused' +
        'if right arrow is pressed and slider is RANGE', (done) => {
        let fixture;
        let slider: IgxSliderComponent;
        TestBed.compileComponents().then(() => {
            fixture = TestBed.createComponent(SliderInitializeTestComponent);
            slider = fixture.componentInstance.slider;
            slider.type = SliderType.RANGE;

            fixture.detectChanges();

            slider.value = {
                lower: 50,
                upper: 60
            };

            return fixture.whenStable();
        }).then(() => {
            const toThumb = fixture.nativeElement.querySelector('.igx-slider__thumb-to');
            toThumb.focus();

            return simulateKeyDown(toThumb, 'ArrowRight');
        }).then(() => {
            expect((slider.value as IRangeSliderValue).lower).toBe(50);
            expect((slider.value as IRangeSliderValue).upper).toBe(61);
            done();
        });
    }, 5000);

    it('should not increment upper value when slider is disabled', (done) => {
        let fixture;
        let slider: IgxSliderComponent;
        TestBed.compileComponents().then(() => {
            fixture = TestBed.createComponent(SliderInitializeTestComponent);
            slider = fixture.componentInstance.slider;
            slider.type = SliderType.RANGE;
            slider.disabled = true;

            fixture.detectChanges();

            slider.value = {
                lower: 50,
                upper: 60
            };

            return fixture.whenStable();
        }).then(() => {
            const toThumb = fixture.nativeElement.querySelector('.igx-slider__thumb-to');
            toThumb.focus();

            return simulateKeyDown(toThumb, 'ArrowRight');
        }).then(() => {
            expect((slider.value as IRangeSliderValue).lower).toBe(50);
            expect((slider.value as IRangeSliderValue).upper).toBe(60);
            done();
        });
    }, 5000);

    function simulateKeyDown(element, key) {
        const keyOptions: KeyboardEventInit = {
            key
        };

        const keypressEvent = new KeyboardEvent('keydown', keyOptions);

        return new Promise((resolve, reject) => {
            element.dispatchEvent(keypressEvent);
            resolve();
        });
    }

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

        fixture.componentInstance.slider.lowerBound = 3;
        fixture.componentInstance.slider.upperBound = 8;
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
