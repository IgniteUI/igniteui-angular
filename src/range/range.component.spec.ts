import { Component, ViewChild } from "@angular/core";
import { async, TestBed } from "@angular/core/testing";
import {IDualSliderValue, IgxRange, IgxRangeModule, SliderType} from "./range.component";

declare var Simulator: any;

describe("IgxRange", () => {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                RangeIntializeTestComponent
            ],
            imports: [
                IgxRangeModule
            ]
        }).compileComponents();
    }));

    afterEach(() => {

    });

    it("should have lower bound equal to min value when lower bound is not set", () => {
        const fixture = TestBed.createComponent(RangeIntializeTestComponent);
        fixture.detectChanges();

        expect(fixture.componentInstance.range.lowerBound)
            .toBe(fixture.componentInstance.range.minValue);
    });

    it("should have upper bound equal to max value when upper bound is not set", () => {
        const fixture = TestBed.createComponent(RangeIntializeTestComponent);
        fixture.detectChanges();

        expect(fixture.componentInstance.range.upperBound)
            .toBe(fixture.componentInstance.range.maxValue);
    });

    it(`should have lower value equal to lower bound when
        lower value is not set and slider type is DOUBLE_HORIZONTAL`, () => {
        const fixture = TestBed.createComponent(RangeIntializeTestComponent);
        fixture.componentInstance.range.type = SliderType.DOUBLE_HORIZONTAL;
        fixture.detectChanges();

        expect((fixture.componentInstance.range.value as IDualSliderValue).lower)
            .toBe(fixture.componentInstance.range.lowerBound);
    });

    it(`should have upper value equal to upper bound when
        lower value is not set and slider type is DOUBLE_HORIZONTAL`, () => {
        const fixture = TestBed.createComponent(RangeIntializeTestComponent);
        fixture.componentInstance.range.type = SliderType.DOUBLE_HORIZONTAL;
        fixture.detectChanges();

        expect((fixture.componentInstance.range.value as IDualSliderValue).upper)
            .toBe(fixture.componentInstance.range.upperBound);
    });

    it(`should have upper value equal to lower bound when
        lower value is not set and slider type is SINGLE_HORIZONTAL`, () => {
        const fixture = TestBed.createComponent(RangeIntializeTestComponent);
        fixture.componentInstance.range.type = SliderType.SINGLE_HORIZONTAL;
        fixture.detectChanges();

        expect(fixture.componentInstance.range.value)
            .toBe(fixture.componentInstance.range.lowerBound);
    });

    it("should change minValue", () => {
        const fixture = TestBed.createComponent(RangeIntializeTestComponent);
        const expectedMinValue = 3;
        fixture.componentInstance.range.minValue = expectedMinValue;

        fixture.detectChanges();

        expect(fixture.componentInstance.range.minValue).toBe(expectedMinValue);
    });

    it("should change maxValue", () => {
        const fixture = TestBed.createComponent(RangeIntializeTestComponent);
        const expectedMaxValue = 15;
        fixture.componentInstance.range.maxValue = expectedMaxValue;

        fixture.detectChanges();

        expect(fixture.componentInstance.range.maxValue).toBe(expectedMaxValue);
    });

    it("should reduce minValue when greater than maxValue", () => {
        const fixture = TestBed.createComponent(RangeIntializeTestComponent);
        fixture.componentInstance.range.maxValue = 6;
        fixture.componentInstance.range.minValue = 10;

        const expectedMinValue = fixture.componentInstance.range.maxValue - 1;
        fixture.detectChanges();

        expect(fixture.componentInstance.range.minValue).toBe(expectedMinValue);
        expect(fixture.componentInstance.range.minValue).toBeLessThan(fixture.componentInstance.range.maxValue);
    });

    it("should increase minValue when greater than maxValue", () => {
        const fixture = TestBed.createComponent(RangeIntializeTestComponent);
        fixture.componentInstance.range.minValue = 3;
        fixture.componentInstance.range.maxValue = -5;

        const expectedMaxValue = fixture.componentInstance.range.minValue + 1;
        fixture.detectChanges();

        expect(fixture.componentInstance.range.maxValue).toBe(expectedMaxValue);
        expect(fixture.componentInstance.range.maxValue).toBeGreaterThan(fixture.componentInstance.range.minValue);
    });

    it("should change lowerBound", () => {
        const fixture = TestBed.createComponent(RangeIntializeTestComponent);
        const expectedLowerBound = 3;
        fixture.componentInstance.range.lowerBound = expectedLowerBound;
        fixture.componentInstance.range.upperBound = 20;

        fixture.detectChanges();

        expect(fixture.componentInstance.range.lowerBound).toBe(expectedLowerBound);
    });

    it("should change upperBound", () => {
        const fixture = TestBed.createComponent(RangeIntializeTestComponent);
        const expectedUpperBound = 40;
        fixture.componentInstance.range.upperBound = expectedUpperBound;
        fixture.componentInstance.range.lowerBound = 2;

        fixture.detectChanges();

        expect(fixture.componentInstance.range.upperBound).toBe(expectedUpperBound);
    });

    it("should set lowerBound to be same as minValue if exceeds upperBound", () => {
        const fixture = TestBed.createComponent(RangeIntializeTestComponent);
        fixture.componentInstance.range.upperBound = 20;
        fixture.componentInstance.range.lowerBound = 40;

        fixture.detectChanges();

        expect(fixture.componentInstance.range.lowerBound).toBe(fixture.componentInstance.range.minValue);
        expect(fixture.componentInstance.range.lowerBound).toBeLessThan(fixture.componentInstance.range.upperBound);
    });

    it("should set upperBound to be same as maxValue if exceeds lowerBound", () => {
        const fixture = TestBed.createComponent(RangeIntializeTestComponent);
        fixture.componentInstance.range.lowerBound = 40;
        fixture.componentInstance.range.upperBound = 20;

        fixture.detectChanges();

        expect(fixture.componentInstance.range.upperBound).toBe(fixture.componentInstance.range.maxValue);
        expect(fixture.componentInstance.range.upperBound).toBeGreaterThan(fixture.componentInstance.range.lowerBound);
    });

    it("should set upperBound to be same as maxValue if exceeds lowerBound", () => {
        const fixture = TestBed.createComponent(RangeIntializeTestComponent);
        fixture.componentInstance.range.lowerBound = 40;
        fixture.componentInstance.range.upperBound = 20;

        fixture.detectChanges();

        expect(fixture.componentInstance.range.upperBound).toBe(fixture.componentInstance.range.maxValue);
        expect(fixture.componentInstance.range.upperBound).toBeGreaterThan(fixture.componentInstance.range.lowerBound);
    });

    it("should not set upper value outside bounds range when slider is SINGLE_HORIZONTAL", () => {
        const fixture = TestBed.createComponent(RangeIntializeTestComponent);
        fixture.componentInstance.range.lowerBound = 10;
        fixture.componentInstance.range.upperBound = 40;

        fixture.detectChanges();

        fixture.componentInstance.range.value = 20;

        fixture.detectChanges();

        fixture.componentInstance.range.value = 45;

        expect(fixture.componentInstance.range.value).toBe(20);
    });

    it("should not set upper value to outside bounds range when slider is DOUBLE_HORIZONTAL", () => {
        const fixture = TestBed.createComponent(RangeIntializeTestComponent);
        fixture.componentInstance.range.lowerBound = 10;
        fixture.componentInstance.range.upperBound = 40;
        fixture.componentInstance.range.type = SliderType.DOUBLE_HORIZONTAL;

        fixture.detectChanges();

        fixture.componentInstance.range.value = {
            lower: 20,
            upper: 30
        };

        fixture.detectChanges();

        fixture.componentInstance.range.value = {
            lower: 20,
            upper: 50
        };

        expect(fixture.componentInstance.range.value.lower).toBe(20);
        expect(fixture.componentInstance.range.value.upper).toBe(30);
    });

    it("should not set value upper when is less than lower value when slider is DOUBLE_HORIZONTAL", () => {
        const fixture = TestBed.createComponent(RangeIntializeTestComponent);
        fixture.componentInstance.range.lowerBound = 10;
        fixture.componentInstance.range.upperBound = 40;
        fixture.componentInstance.range.type = SliderType.DOUBLE_HORIZONTAL;

        fixture.detectChanges();

        fixture.componentInstance.range.value = {
            lower: 20,
            upper: 30
        };

        fixture.detectChanges();

        fixture.componentInstance.range.value = {
            lower: 20,
            upper: 15
        };

        expect(fixture.componentInstance.range.value.lower).toBe(20);
        expect(fixture.componentInstance.range.value.upper).toBe(30);
    });

    it("should not set lower value outside bounds range when slider is DOUBLE_HORIZONTAL", () => {
        const fixture = TestBed.createComponent(RangeIntializeTestComponent);
        fixture.componentInstance.range.lowerBound = 10;
        fixture.componentInstance.range.upperBound = 40;
        fixture.componentInstance.range.type = SliderType.DOUBLE_HORIZONTAL;

        fixture.detectChanges();

        fixture.componentInstance.range.value = {
            lower: 20,
            upper: 30
        };

        fixture.detectChanges();

        fixture.componentInstance.range.value = {
            lower: 5,
            upper: 30
        };

        expect(fixture.componentInstance.range.value.lower).toBe(20);
        expect(fixture.componentInstance.range.value.upper).toBe(30);
    });

    it("should not set value lower when is more than upper value when slider is DOUBLE_HORIZONTAL", () => {
        const fixture = TestBed.createComponent(RangeIntializeTestComponent);
        fixture.componentInstance.range.lowerBound = 10;
        fixture.componentInstance.range.upperBound = 40;
        fixture.componentInstance.range.type = SliderType.DOUBLE_HORIZONTAL;

        fixture.detectChanges();

        fixture.componentInstance.range.value = {
            lower: 20,
            upper: 30
        };

        fixture.detectChanges();

        fixture.componentInstance.range.value = {
            lower: 35,
            upper: 30
        };

        expect(fixture.componentInstance.range.value.lower).toBe(20);
        expect(fixture.componentInstance.range.value.upper).toBe(30);
    });

    it("should set upperBound to be same as maxValue if exceeds lowerBound", () => {
        const fixture = TestBed.createComponent(RangeIntializeTestComponent);
        fixture.componentInstance.range.lowerBound = 40;
        fixture.componentInstance.range.upperBound = 20;

        fixture.detectChanges();

        expect(fixture.componentInstance.range.upperBound).toBe(fixture.componentInstance.range.maxValue);
        expect(fixture.componentInstance.range.upperBound).toBeGreaterThan(fixture.componentInstance.range.lowerBound);
    });

    it("should set slider width", () => {
        const fixture = TestBed.createComponent(RangeIntializeTestComponent);
        fixture.detectChanges();

        // fixture.componentInstance.range.w
        expect(fixture.componentInstance.range.upperBound).toBe(fixture.componentInstance.range.maxValue);
        expect(fixture.componentInstance.range.upperBound).toBeGreaterThan(fixture.componentInstance.range.lowerBound);
    });

    it("should move thumb range to value 60", (done) => {
        let fixture;
        let range: IgxRange;
        TestBed.compileComponents().then(() => {
            fixture = TestBed.createComponent(RangeIntializeTestComponent);
            range = fixture.componentInstance.range;
            fixture.detectChanges();

            return fixture.whenStable();
        }).then(() => {
            const rangeElement = fixture.nativeElement.querySelector(".igx-range");
            return panRight(rangeElement,
                rangeElement.offsetHeight,
                rangeElement.offsetWidth,
                200);
        }).then(() => {
            expect(Math.round(range.value as number)).toBe(60);
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

    it("should change value from 60 to 61 when right arrow is pressed and range is SINGLE_HORIZONTAL", (done) => {
        let fixture;
        let range: IgxRange;
        TestBed.compileComponents().then(() => {
            fixture = TestBed.createComponent(RangeIntializeTestComponent);
            range = fixture.componentInstance.range;
            fixture.detectChanges();

            range.value = 60;

            return fixture.whenStable();
        }).then(() => {
            const fromThumb = fixture.nativeElement.querySelector(".igx-range__thumb-to");
            fromThumb.focus();
            return simulateKeyDown(fromThumb, "ArrowRight");
        }).then(() => {
            expect(Math.round(range.value as number)).toBe(61);
            done();
        });
    }, 5000);

    it("should change value from 60 to 59 when left arrow is pressed and range is SINGLE_HORIZONTAL", (done) => {
        let fixture;
        let range: IgxRange;
        TestBed.compileComponents().then(() => {
            fixture = TestBed.createComponent(RangeIntializeTestComponent);
            range = fixture.componentInstance.range;
            fixture.detectChanges();

            range.value = 60;

            return fixture.whenStable();
        }).then(() => {
            const toThumb = fixture.nativeElement.querySelector(".igx-range__thumb-to");
            toThumb.focus();
            return simulateKeyDown(toThumb, "ArrowLeft");
        }).then(() => {
            expect(Math.round(range.value as number)).toBe(59);
            done();
        });
    }, 5000);

    it("should switch from left thumb to be focused upper when lower value is near upper" +
        "when range is DOUBLE_HORIZONTAL", (done) => {
        let fixture;
        let range: IgxRange;
        TestBed.compileComponents().then(() => {
            fixture = TestBed.createComponent(RangeIntializeTestComponent);
            range = fixture.componentInstance.range;
            range.type = SliderType.DOUBLE_HORIZONTAL;

            fixture.detectChanges();

            range.value = {
                lower: 59,
                upper: 60
            };

            return fixture.whenStable();
        }).then(() => {
            const fromThumb = fixture.nativeElement.querySelector(".igx-range__thumb-from");
            fromThumb.focus();
            return simulateKeyDown(fromThumb, "ArrowRight");
        }).then(() => {
            expect((range.value as IDualSliderValue).lower).toBe(59);
            expect((range.value as IDualSliderValue).upper).toBe(60);
            expect(document.activeElement).toBe(fixture.nativeElement.querySelector(".igx-range__thumb-to"));
            done();
        });
    }, 5000);

    it("should switch from right thumb to be focused lower when upper value is near lower" +
        "when range is DOUBLE_HORIZONTAL", (done) => {
        let fixture;
        let range: IgxRange;
        TestBed.compileComponents().then(() => {
            fixture = TestBed.createComponent(RangeIntializeTestComponent);
            range = fixture.componentInstance.range;
            range.type = SliderType.DOUBLE_HORIZONTAL;

            fixture.detectChanges();

            range.value = {
                lower: 59,
                upper: 60
            };

            return fixture.whenStable();
        }).then(() => {
            const toThumb = fixture.nativeElement.querySelector(".igx-range__thumb-to");
            toThumb.focus();
            return simulateKeyDown(toThumb, "ArrowLeft");
        }).then(() => {
            expect((range.value as IDualSliderValue).lower).toBe(59);
            expect((range.value as IDualSliderValue).upper).toBe(60);
            expect(document.activeElement).toBe(fixture.nativeElement.querySelector(".igx-range__thumb-from"));
            done();
        });
    }, 5000);

    it("should not change value if different key from arrows is pressed and slider is SINGLE_HORIZONTAL", (done) => {
        let fixture;
        let range: IgxRange;
        TestBed.compileComponents().then(() => {
            fixture = TestBed.createComponent(RangeIntializeTestComponent);
            range = fixture.componentInstance.range;
            range.type = SliderType.DOUBLE_HORIZONTAL;

            fixture.detectChanges();

            range.value = {
                lower: 50,
                upper: 60
            };

            return fixture.whenStable();
        }).then(() => {
            const toThumb = fixture.nativeElement.querySelector(".igx-range__thumb-to");
            toThumb.focus();
            return simulateKeyDown(toThumb, "A");
        }).then(() => {
            expect((range.value as IDualSliderValue).lower).toBe(50);
            expect((range.value as IDualSliderValue).upper).toBe(60);
            expect(document.activeElement).toBe(fixture.nativeElement.querySelector(".igx-range__thumb-to"));
            done();
        });
    }, 5000);

    it("should increment lower value when lower thumb is focused" +
        "if right arrow is pressed and slider is DOUBLE_HORIZONTAL", (done) => {
        let fixture;
        let range: IgxRange;
        TestBed.compileComponents().then(() => {
            fixture = TestBed.createComponent(RangeIntializeTestComponent);
            range = fixture.componentInstance.range;
            range.type = SliderType.DOUBLE_HORIZONTAL;

            fixture.detectChanges();

            range.value = {
                lower: 50,
                upper: 60
            };

            return fixture.whenStable();
        }).then(() => {
            const fromThumb = fixture.nativeElement.querySelector(".igx-range__thumb-from");
            fromThumb.focus();

            return simulateKeyDown(fromThumb, "ArrowRight");
        }).then(() => {
            expect((range.value as IDualSliderValue).lower).toBe(51);
            expect((range.value as IDualSliderValue).upper).toBe(60);
            done();
        });
    }, 5000);

    it("should increment upper value when upper thumb is focused" +
        "if right arrow is pressed and slider is DOUBLE_HORIZONTAL", (done) => {
        let fixture;
        let range: IgxRange;
        TestBed.compileComponents().then(() => {
            fixture = TestBed.createComponent(RangeIntializeTestComponent);
            range = fixture.componentInstance.range;
            range.type = SliderType.DOUBLE_HORIZONTAL;

            fixture.detectChanges();

            range.value = {
                lower: 50,
                upper: 60
            };

            return fixture.whenStable();
        }).then(() => {
            const toThumb = fixture.nativeElement.querySelector(".igx-range__thumb-to");
            toThumb.focus();

            return simulateKeyDown(toThumb, "ArrowRight");
        }).then(() => {
            expect((range.value as IDualSliderValue).lower).toBe(50);
            expect((range.value as IDualSliderValue).upper).toBe(61);
            done();
        });
    }, 5000);

    function simulateKeyDown(element, key) {
        const keyOptioins: KeyboardEventInit = {
            key
        };

        const keypressEvent = new KeyboardEvent("keydown", keyOptioins);

        return new Promise((resolve, reject) => {
            element.dispatchEvent(keypressEvent);
            resolve();
        });
    }

    it("should draw tick marks", () => {
        const fixture = TestBed.createComponent(RangeIntializeTestComponent);
        const ticks = fixture.nativeElement.querySelector(".igx-range__track-ticks");

            // Range steps <= 1. No marks should be drawn;
        expect(ticks.style.background).toBeFalsy();

            // Range steps > 1. Should draw tick marks;
        fixture.componentInstance.range.stepRange = 10;
        fixture.detectChanges();

        expect(ticks.style.background).toBeTruthy();
    });
});
@Component({
    selector: "range-test-component",
    template: `<igx-range #range>
                </igx-range>`
})
class RangeIntializeTestComponent {
    @ViewChild(IgxRange) public range: IgxRange;
}
