import { TestBed, async } from '@angular/core/testing';
import { IgxRange, IgxRangeModule, SliderType } from './range.component';
import { Component, ViewChild } from "@angular/core";

declare var Simulator: any;

describe('IgxRange', () => {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [
                IgxRangeModule
            ],
            declarations: [
                RangeIntializeTestComponent
            ]
        }).compileComponents();
    }));

    afterEach(() => {

    });

    it("should have lower bound equal to min value when lower bound is not set", () => {
        let fixture = TestBed.createComponent(RangeIntializeTestComponent);
        fixture.detectChanges();

        expect(fixture.componentInstance.range.lowerBound)
            .toBe(fixture.componentInstance.range.minValue);
    });

    it("should have upper boybd equal to max value when upper bound is not set", () => {
        let fixture = TestBed.createComponent(RangeIntializeTestComponent);
        fixture.detectChanges();

        expect(fixture.componentInstance.range.upperBound)
            .toBe(fixture.componentInstance.range.maxValue);
    });

    it("should have lower value equal to lower bound when lower value is not set and slider type is DOUBLE_HORIZONTAL", () => {
        let fixture = TestBed.createComponent(RangeIntializeTestComponent);
        fixture.componentInstance.range.type = SliderType.DOUBLE_HORIZONTAL;
        fixture.detectChanges();

        expect(fixture.componentInstance.range.lowerValue)
            .toBe(fixture.componentInstance.range.lowerBound);
    });

    it("should have upper value equal to upper bound when lower value is not set and slider type is DOUBLE_HORIZONTAL", () => {
        let fixture = TestBed.createComponent(RangeIntializeTestComponent);
        fixture.componentInstance.range.type = SliderType.DOUBLE_HORIZONTAL;
        fixture.detectChanges();

        expect(fixture.componentInstance.range.upperValue)
            .toBe(fixture.componentInstance.range.upperBound);
    });

    it("should have upper value equal to lower bound when lower value is not set and slider type is SINGLE_HORIZONTAL", () => {
        let fixture = TestBed.createComponent(RangeIntializeTestComponent);
        fixture.componentInstance.range.type = SliderType.SINGLE_HORIZONTAL;
        fixture.detectChanges();

        expect(fixture.componentInstance.range.upperValue)
            .toBe(fixture.componentInstance.range.lowerBound);
    });

    it("should change minValue", () => {
        let fixture = TestBed.createComponent(RangeIntializeTestComponent),
            expectedMinValue = 3;
        fixture.componentInstance.range.minValue = expectedMinValue;

        fixture.detectChanges();

        expect(fixture.componentInstance.range.minValue).toBe(expectedMinValue);
    });

    it("should change maxValue", () => {
        let fixture = TestBed.createComponent(RangeIntializeTestComponent),
            expectedMaxValue = 15;
        fixture.componentInstance.range.maxValue = expectedMaxValue;

        fixture.detectChanges();

        expect(fixture.componentInstance.range.maxValue).toBe(expectedMaxValue);
    });

    it("should reduce minValue when greater than maxValue", () => {
        let fixture = TestBed.createComponent(RangeIntializeTestComponent);
        fixture.componentInstance.range.maxValue = 6;
        fixture.componentInstance.range.minValue = 10;

        let expectedMinValue = fixture.componentInstance.range.maxValue - 1;
        fixture.detectChanges();

        expect(fixture.componentInstance.range.minValue).toBe(expectedMinValue);
        expect(fixture.componentInstance.range.minValue).toBeLessThan(fixture.componentInstance.range.maxValue);
    });

    it("should increase minValue when greater than maxValue", () => {
        let fixture = TestBed.createComponent(RangeIntializeTestComponent);
        fixture.componentInstance.range.minValue = 3;
        fixture.componentInstance.range.maxValue = -5;

        let expectedMaxValue = fixture.componentInstance.range.minValue + 1;
        fixture.detectChanges();

        expect(fixture.componentInstance.range.maxValue).toBe(expectedMaxValue);
        expect(fixture.componentInstance.range.maxValue).toBeGreaterThan(fixture.componentInstance.range.minValue);
    });

    it("should change lowerBound", () => {
        let fixture = TestBed.createComponent(RangeIntializeTestComponent),
            expectedLowerBound = 3;
        fixture.componentInstance.range.lowerBound = expectedLowerBound;
        fixture.componentInstance.range.upperBound = 20;

        fixture.detectChanges();

        expect(fixture.componentInstance.range.lowerBound).toBe(expectedLowerBound);
    });

    it("should change upperBound", () => {
        let fixture = TestBed.createComponent(RangeIntializeTestComponent),
            expectedUpperBound = 40;
        fixture.componentInstance.range.upperBound = expectedUpperBound;
        fixture.componentInstance.range.lowerBound = 2;

        fixture.detectChanges();

        expect(fixture.componentInstance.range.upperBound).toBe(expectedUpperBound);
    });

    it("should set lowerBound to be same as minValue if exceeds upperBound", () => {
        let fixture = TestBed.createComponent(RangeIntializeTestComponent);
        fixture.componentInstance.range.upperBound = 20;
        fixture.componentInstance.range.lowerBound = 40;

        fixture.detectChanges();

        expect(fixture.componentInstance.range.lowerBound).toBe(fixture.componentInstance.range.minValue);
        expect(fixture.componentInstance.range.lowerBound).toBeLessThan(fixture.componentInstance.range.upperBound);
    });

    it("should set upperBound to be same as maxValue if exceeds lowerBound", () => {
        let fixture = TestBed.createComponent(RangeIntializeTestComponent);
        fixture.componentInstance.range.lowerBound = 40;
        fixture.componentInstance.range.upperBound = 20;

        fixture.detectChanges();

        expect(fixture.componentInstance.range.upperBound).toBe(fixture.componentInstance.range.maxValue);
        expect(fixture.componentInstance.range.upperBound).toBeGreaterThan(fixture.componentInstance.range.lowerBound);
    });

    it("should set upperBound to be same as maxValue if exceeds lowerBound", () => {
        let fixture = TestBed.createComponent(RangeIntializeTestComponent);
        fixture.componentInstance.range.lowerBound = 40;
        fixture.componentInstance.range.upperBound = 20;

        fixture.detectChanges();

        expect(fixture.componentInstance.range.upperBound).toBe(fixture.componentInstance.range.maxValue);
        expect(fixture.componentInstance.range.upperBound).toBeGreaterThan(fixture.componentInstance.range.lowerBound);
    });

    it("should set upperBound to be same as maxValue if exceeds lowerBound", () => {
        let fixture = TestBed.createComponent(RangeIntializeTestComponent);
        fixture.componentInstance.range.lowerBound = 40;
        fixture.componentInstance.range.upperBound = 20;

        fixture.detectChanges();

        expect(fixture.componentInstance.range.upperBound).toBe(fixture.componentInstance.range.maxValue);
        expect(fixture.componentInstance.range.upperBound).toBeGreaterThan(fixture.componentInstance.range.lowerBound);
    });

    it("should set slider width", () => {
        let fixture = TestBed.createComponent(RangeIntializeTestComponent);
        fixture.detectChanges();

        // fixture.componentInstance.range.w
        expect(fixture.componentInstance.range.upperBound).toBe(fixture.componentInstance.range.maxValue);
        expect(fixture.componentInstance.range.upperBound).toBeGreaterThan(fixture.componentInstance.range.lowerBound);
    });

    it('should move thumb range to value 60', (done) => {
        let fixture,
            range: IgxRange;
        TestBed.compileComponents().then(() => {
            fixture = TestBed.createComponent(RangeIntializeTestComponent);
            range = fixture.componentInstance.range;
            fixture.detectChanges();

            return fixture.whenStable();
        }).then(() => {
            let rangeElement = fixture.nativeElement.querySelector(".igx-range");
            return panRight(rangeElement,
                rangeElement.offsetHeight,
                rangeElement.offsetWidth,
                200);
        }).then(() => {
            expect(Math.round(range.upperValue)).toBe(60);
            done();
        });
    }, 5000);

    function panRight(element, elementHeight, elementWidth, duration) {
        var panOptions = {
            pos: [element.offsetLeft, elementHeight * 0.5],
            duration: duration,
            deltaX: elementWidth * 0.6,
            deltaY: 0
        };

        return new Promise(function (resolve, reject) {
            Simulator.gestures.pan(element, panOptions, function () {
                resolve();
            });
        });
    }

    it('should draw tick marks', () => {
        let fixture = TestBed.createComponent(RangeIntializeTestComponent),
            ticks = fixture.nativeElement.querySelector('.igx-range__track-ticks');
            
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
    @ViewChild(IgxRange) range: IgxRange;
}